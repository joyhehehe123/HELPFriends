import { type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime } from '../../utils/dateTime';
import { addNotification } from '../notifications/notificationApi';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { createMockRequests, MOCK_CURRENT_USER } from './mockRequests';
import { MOCK_VOLUNTEERS } from './mockVolunteers';
import {
    type RequestStatus,
    type SupportCategory,
    type SupportRequestRecord,
    type ValidSupportRequestDraft,
} from './types';

// Uses mock data for now. Only this file changes when Firestore is connected.

const simulateNetworkDelay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let mockRequests: SupportRequestRecord[] = createMockRequests();
let nextRequestNumber = 1014; // Joy's counter makes ids like "R1014"

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

// ────────────────────────────────── Volunteers ───────────────────────────────────

// TODO: get from Firestore (volunteers + users)
export const fetchVolunteerProfiles = async (category: SupportCategory): Promise<VolunteerProfile[]> => {
    await simulateNetworkDelay(400);
    return MOCK_VOLUNTEERS.filter((volunteer) => volunteer.supportCategories.includes(category));
};

// ─────────────────────────────── Support requests ────────────────────────────────

// TODO: getSupportRequestsByStudent(userId, false) and (userId, true)
export const fetchSupportRequests = async (
    userId: string,
): Promise<{ sent: SupportRequestRecord[]; received: SupportRequestRecord[] }> => {
    await simulateNetworkDelay(400);
    return {
        sent: mockRequests.filter((request) => request.seeker.userId === userId).sort(newestFirst),
        received: mockRequests.filter((request) => request.volunteer.userId === userId).sort(newestFirst),
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

// The seeker is told when the volunteer answers (Epic 4)
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
