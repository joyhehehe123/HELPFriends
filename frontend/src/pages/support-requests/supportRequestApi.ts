import { getSupportRequestsByStudent } from '../../services/supportRequestService';
import { getUser } from '../../services/userService';
import { getAllVolunteers } from '../../services/volunteerService';
import { type SupportRequest } from '../../types/supportRequest';
import { type User } from '../../types/user';
import { type Volunteer } from '../../types/volunteer';
import { type DayAvailability, type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime, WEEK_DAYS } from '../../utils/dateTime';
import { addNotification } from '../notifications/notificationApi';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { createMockRequests, MOCK_CURRENT_USER } from './mockRequests';
import {
    type PersonSummary,
    type RequestStatus,
    type SupportCategory,
    type SupportRequestRecord,
    type ValidSupportRequestDraft,
} from './types';

// Sending a request and changing its status still use mock data until Firestore is connected

const simulateNetworkDelay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let mockRequests: SupportRequestRecord[] = createMockRequests();
let nextRequestNumber = 1014; // Ids like "R1014"

const findRequest = (requestId: string): SupportRequestRecord => {
    const request = mockRequests.find((item) => item.requestId === requestId);
    if (!request) throw new Error(`Support request ${requestId} not found`);
    return request;
};

const saveRequest = (updated: SupportRequestRecord): SupportRequestRecord => {
    mockRequests = mockRequests.map((item) => (item.requestId === updated.requestId ? updated : item));
    return updated;
};

const newestFirst = (a: SupportRequestRecord, b: SupportRequestRecord) => b.createdAt.getTime() - a.createdAt.getTime();

// ─── Volunteers ────────────────────────────────────────────────────────────────

// Team Volunteer and User in the shape the matching page uses
const toVolunteerProfile = (volunteer: Volunteer, user: User): VolunteerProfile => ({
    volunteerId: volunteer.uid,
    fullName: user.fullName,
    studentId: user.studentId,
    faculty: user.faculty,
    program: user.program,
    bio: user.bio,
    profilePic: user.profilePic,
    preferredMode: volunteer.preferredMode,
    rating: volunteer.rating,
    isActive: volunteer.isActive,
    supportCategories: volunteer.supportCategories,
    skills: volunteer.skills,
    availability: volunteer.availability.filter((entry): entry is DayAvailability =>
        WEEK_DAYS.some((day) => day === entry.day)),
});

// Get volunteers of a category with their user details
export const fetchVolunteerProfiles = async (category: SupportCategory): Promise<VolunteerProfile[]> => {
    const volunteers = (await getAllVolunteers()).filter((volunteer) => volunteer.supportCategories.includes(category));
    const users = await Promise.all(volunteers.map((volunteer) => getUser(volunteer.uid)));
    return volunteers.flatMap((volunteer, index) => {
        const user = users[index];
        return user ? [toVolunteerProfile(volunteer, user)] : [];
    });
};

// ─── Support Requests ──────────────────────────────────────────────────────────

// Name and picture to show (placeholder if the user was deleted)
const toPerson = (userId: string, user: User | null): PersonSummary => ({
    userId,
    fullName: user?.fullName ?? 'Unknown student',
    profilePic: user?.profilePic ?? null,
});

// Firestore request in the shape the pages use
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

// Get the requests the student sent and received, newest first
export const fetchSupportRequests = async (
    userId: string,
): Promise<{ sent: SupportRequestRecord[]; received: SupportRequestRecord[] }> => {
    const [sent, received] = await Promise.all([
        getSupportRequestsByStudent(userId, false),
        getSupportRequestsByStudent(userId, true),
    ]);

    // Names and pictures of everyone in these requests
    const userIds = [...new Set([...sent, ...received].flatMap((request) => [request.seekerId, request.volunteerId]))];
    const users = await Promise.all(userIds.map((id) => getUser(id)));
    const people = Object.fromEntries(userIds.map((id, index) => [id, toPerson(id, users[index])]));

    return {
        sent: sent.map((request) => toRequestRecord(request, people)).sort(newestFirst),
        received: received.map((request) => toRequestRecord(request, people)).sort(newestFirst),
    };
};

// TODO: save with createSupportRequest() and createNotification()
export const submitSupportRequest = async (
    request: ValidSupportRequestDraft,
    volunteer: VolunteerProfile,
    seekerId: string = MOCK_CURRENT_USER.userId,
): Promise<SupportRequestRecord> => {
    await simulateNetworkDelay(600);

    const newRequest: SupportRequestRecord = {
        requestId: `R${nextRequestNumber}`,
        category: request.category,
        supportTitle: request.supportTitle,
        description: request.description,
        supportMode: request.supportMode,
        proposedTimeSlots: request.proposedTimeSlots
            .map((slot) => combineDateAndTime(slot.date, slot.time))
            .filter((date): date is Date => date !== null),
        duration: DEFAULT_DURATION_MINUTES,
        status: 'Pending',
        createdAt: new Date(),
        seeker: { ...MOCK_CURRENT_USER, userId: seekerId },
        volunteer: { userId: volunteer.volunteerId, fullName: volunteer.fullName, profilePic: volunteer.profilePic },
    };
    nextRequestNumber += 1;
    mockRequests = [newRequest, ...mockRequests];

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

// Tell the seeker when the volunteer answers
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

// TODO: save with updateSupportRequest() and createNotification()
export const updateRequestStatus = async (requestId: string, action: RequestAction): Promise<SupportRequestRecord> => {
    await simulateNetworkDelay(500);
    const request = findRequest(requestId);
    if (!ALLOWED_FROM[action].includes(request.status)) {
        throw new Error(`Can't ${action} a request that is ${request.status}`);
    }

    const now = new Date();
    if (action === 'cancel') return saveRequest({ ...request, status: 'Cancelled', cancelledAt: now });

    const answered = saveRequest({ ...request, status: action === 'accept' ? 'Accepted' : 'Rejected', respondedAt: now });
    notifySeeker(answered);
    return answered;
};