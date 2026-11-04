import { Timestamp } from 'firebase/firestore';
import {
    createSupportRequestWithId,
    getSupportRequest,
    getSupportRequestsByStudent,
    updateSupportRequestStatus,
} from '../../services/supportRequestService';
import { createSupportSession, getSupportSessionsByStudentAndStatus } from '../../services/supportSessionService';
import { getUser } from '../../services/userService';
import { getAllVolunteers, getVolunteer } from '../../services/volunteerService';
import { type SupportRequest } from '../../types/supportRequest';
import { type SupportSession } from '../../types/supportSession';
import { type User } from '../../types/user';
import { type Volunteer } from '../../types/volunteer';
import { type DayAvailability, type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime, WEEK_DAYS } from '../../utils/dateTime';
import { addNotification } from '../notifications/notificationApi';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { isFreeAt } from './filterVolunteers';
import {
    type PersonSummary,
    type RequestStatus,
    type SupportCategory,
    type SupportRequestRecord,
    type ValidSupportRequestDraft,
} from './types';

const newestFirst = (a: SupportRequestRecord, b: SupportRequestRecord) => b.createdAt.getTime() - a.createdAt.getTime();

// ─── Volunteers ────────────────────────────────────────────────────────────────

const toVolunteerProfile = (volunteer: Volunteer, user: User): VolunteerProfile => ({
    volunteerId: volunteer.uid,
    fullName: user.fullName,
    studentId: user.studentId,
    faculty: user.faculty,
    program: user.program,
    bio: user.bio,
    preferredMode: volunteer.preferredMode,
    rating: volunteer.rating,
    isActive: volunteer.isActive,
    supportCategories: volunteer.supportCategories,
    skills: volunteer.skills,
    availability: volunteer.availability.filter((entry): entry is DayAvailability =>
        WEEK_DAYS.some((day) => day === entry.day)),
});

export const fetchVolunteerProfiles = async (category: SupportCategory): Promise<VolunteerProfile[]> => {
    const volunteers = (await getAllVolunteers()).filter((volunteer) => volunteer.supportCategories.includes(category));
    const users = await Promise.all(volunteers.map((volunteer) => getUser(volunteer.uid)));
    return volunteers.flatMap((volunteer, index) => {
        const user = users[index];
        return user ? [toVolunteerProfile(volunteer, user)] : [];
    });
};

// ─── Support Requests ──────────────────────────────────────────────────────────

const toPerson = (userId: string, user: User | null): PersonSummary => ({
    userId,
    fullName: user?.fullName ?? 'Unknown student',
});

const getPeople = async (userIds: string[]): Promise<Record<string, PersonSummary>> => {
    const uniqueIds = [...new Set(userIds)];
    const users = await Promise.all(uniqueIds.map((id) => getUser(id)));
    return Object.fromEntries(uniqueIds.map((id, index) => [id, toPerson(id, users[index])]));
};

const toRequestRecord = (request: SupportRequest, people: Record<string, PersonSummary>): SupportRequestRecord => ({
    requestId: request.uid,
    category: request.category,
    supportTitle: request.title,
    description: request.description,
    supportMode: request.supportMode,
    proposedTimeSlots: request.proposedTimeSlots.map((slot) => slot.toDate()),
    duration: DEFAULT_DURATION_MINUTES,
    status: request.status,
    createdAt: request.createdAt.toDate(),
    respondedAt: request.respondedAt?.toDate(),
    cancelledAt: request.cancelledAt?.toDate(),
    scheduledAt: request.scheduledAt?.toDate(),
    seeker: people[request.seekerId],
    volunteer: people[request.volunteerId],
});

export const fetchSupportRequests = async (
    userId: string,
): Promise<{ sent: SupportRequestRecord[]; received: SupportRequestRecord[] }> => {
    const [sent, received] = await Promise.all([
        getSupportRequestsByStudent(userId, false),
        getSupportRequestsByStudent(userId, true),
    ]);

    const people = await getPeople([...sent, ...received].flatMap((request) => [request.seekerId, request.volunteerId]));

    return {
        sent: sent.map((request) => toRequestRecord(request, people)).sort(newestFirst),
        received: received.map((request) => toRequestRecord(request, people)).sort(newestFirst),
    };
};

export const fetchIsVolunteer = async (userId: string): Promise<boolean> =>
    (await getUser(userId))?.isVolunteer ?? false;

export const submitSupportRequest = async (
    request: ValidSupportRequestDraft,
    volunteer: VolunteerProfile,
    seekerId?: string,
): Promise<SupportRequestRecord> => {
    if (!seekerId) throw new Error('No logged-in student to send the request');

    const saved: Omit<SupportRequest, 'uid' | 'status'> = {
        category: request.category,
        title: request.supportTitle,
        description: request.description,
        supportMode: request.supportMode,
        proposedTimeSlots: request.proposedTimeSlots
            .map((slot) => combineDateAndTime(slot.date, slot.time))
            .filter((date): date is Date => date !== null)
            .map((date) => Timestamp.fromDate(date)),
        createdAt: Timestamp.now(),
        seekerId,
        volunteerId: volunteer.volunteerId,
    };
    const requestId = await createSupportRequestWithId(saved);
    const newRequest = toRequestRecord({ ...saved, uid: requestId, status: 'Pending' }, await getPeople([seekerId, volunteer.volunteerId]));

    addNotification({
        userId: seekerId,
        title: 'Support Request Submitted',
        message: `Your support request “${newRequest.supportTitle}” was sent to ${volunteer.fullName}. `
            + `We will let you know when ${volunteer.fullName} replies.`,
        category: 'Support Request',
        referenceId: newRequest.requestId,
    });
    return newRequest;
};

export type RequestAction = 'accept' | 'reject' | 'cancel';

const ALLOWED_FROM: Record<RequestAction, RequestStatus[]> = {
    accept: ['Pending'],
    reject: ['Pending'],
    cancel: ['Pending', 'Accepted'],
};

const NEW_STATUS: Record<RequestAction, RequestStatus> = {
    accept: 'Accepted',
    reject: 'Rejected',
    cancel: 'Cancelled',
};

const notifySeeker = (request: SupportRequestRecord) => {
    const nextStep = request.status === 'Accepted'
        ? 'You can now schedule the session.'
        : 'You can find another volunteer from your support requests.';
    addNotification({
        userId: request.seeker.userId,
        title: `Support Request ${request.status}`,
        message: `Your support request “${request.supportTitle}” was ${request.status.toLowerCase()} `
            + `by ${request.volunteer.fullName}. ${nextStep}`,
        category: 'Support Request',
        referenceId: request.requestId,
    });
};

export const updateRequestStatus = async (requestId: string, action: RequestAction): Promise<SupportRequestRecord> => {
    const request = await getSupportRequest(requestId);
    if (!request) throw new Error(`Support request ${requestId} not found`);
    if (!ALLOWED_FROM[action].includes(request.status)) {
        throw new Error(`Can't ${action} a request that is ${request.status}`);
    }

    const now = Timestamp.now();
    const changes = action === 'cancel' ? { cancelledAt: now } : { respondedAt: now };
    await updateSupportRequestStatus(requestId, NEW_STATUS[action], changes);

    const updated = toRequestRecord(
        { ...request, ...changes, status: NEW_STATUS[action] },
        await getPeople([request.seekerId, request.volunteerId]),
    );
    if (action !== 'cancel') notifySeeker(updated);
    return updated;
};

// ─── Scheduling ────────────────────────────────────────────────────────────────

const overlaps = (start: Date, session: SupportSession): boolean => {
    const end = start.getTime() + DEFAULT_DURATION_MINUTES * 60_000;
    const sessionStart = session.dateTime.toMillis();
    const sessionEnd = sessionStart + session.duration * 60_000;
    return start.getTime() < sessionEnd && sessionStart < end;
};

export const fetchFreeTimeSlots = async (request: SupportRequestRecord): Promise<Date[]> => {
    const studentIds = [request.seeker.userId, request.volunteer.userId];
    const [volunteer, sessionLists] = await Promise.all([
        getVolunteer(request.volunteer.userId),
        Promise.all(studentIds.flatMap((id) => [
            getSupportSessionsByStudentAndStatus(id, false, 'Active'),
            getSupportSessionsByStudentAndStatus(id, true, 'Active'),
        ])),
    ]);
    const sessions = sessionLists.flat();
    const now = Date.now();

    return request.proposedTimeSlots.filter((slot) =>
        slot.getTime() > now &&
        volunteer !== null && isFreeAt(volunteer.availability, slot) &&
        !sessions.some((session) => overlaps(slot, session)));
};

export const scheduleSession = async (requestId: string, dateTime: Date): Promise<SupportRequestRecord> => {
    const request = await getSupportRequest(requestId);
    if (!request) throw new Error(`Support request ${requestId} not found`);
    if (request.status !== 'Accepted') throw new Error(`Can't schedule a request that is ${request.status}`);

    await createSupportSession(request, { dateTime: Timestamp.fromDate(dateTime), duration: DEFAULT_DURATION_MINUTES });
    const scheduledAt = Timestamp.now();
    await updateSupportRequestStatus(requestId, 'Scheduled', { scheduledAt });

    return toRequestRecord(
        { ...request, scheduledAt, status: 'Scheduled' },
        await getPeople([request.seekerId, request.volunteerId]),
    );
};