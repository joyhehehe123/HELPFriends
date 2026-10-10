import { type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime } from '../../utils/dateTime';
import { MOCK_VOLUNTEERS } from './mockVolunteers';
import { type SupportCategory, type ValidSupportRequestDraft } from './types';

// Uses mock data for now. Only this file changes when Firestore is connected.

const simulateNetworkDelay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// TODO: get from Firestore (volunteers + users)
export const fetchVolunteerProfiles = async (category: SupportCategory): Promise<VolunteerProfile[]> => {
    await simulateNetworkDelay(400);
    return MOCK_VOLUNTEERS.filter((volunteer) => volunteer.supportCategories.includes(category));
};

// TODO: save with createSupportRequest()
export const submitSupportRequest = async (
    request: ValidSupportRequestDraft,
    volunteer: VolunteerProfile,
): Promise<void> => {
    await simulateNetworkDelay(600);

    // Data to save later
    const newRequest = {
        category: request.category,
        supportTitle: request.supportTitle,
        description: request.description,
        supportMode: request.supportMode,
        proposedTimeSlots: request.proposedTimeSlots.map((slot) => combineDateAndTime(slot.date, slot.time)),
        status: 'Pending',
        volunteerId: volunteer.volunteerId,
    };
    console.info('[mock] Support request to save:', newRequest);
};
