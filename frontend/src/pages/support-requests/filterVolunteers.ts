import { type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime, getDayName } from '../../utils/dateTime';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { type ProposedSlotInput, type SupportMode, type ValidSupportRequestDraft, type VolunteerFilters } from './types';

// Get the minutes from midnight, e.g. "13:30" is 810
const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// 'Both' matches Virtual and Physical
export const supportsMode = (volunteer: VolunteerProfile, mode: SupportMode): boolean =>
    volunteer.preferredMode === mode || volunteer.preferredMode === 'Both';

// Partial match, e.g. "math" finds "Mathematics"
export const hasSkill = (volunteer: VolunteerProfile, skillSearch: string): boolean => {
    const search = skillSearch.trim().toLowerCase();
    if (!search) return true;
    return volunteer.skills.some((skill) => skill.toLowerCase().includes(search));
};

// Free for the whole session, e.g. 10:30 fits 9:00 - 11:00 but 11:00 does not
export const isAvailableAt = (volunteer: VolunteerProfile, slot: ProposedSlotInput): boolean => {
    const date = combineDateAndTime(slot.date, slot.time);
    if (!date) return false;

    const day = getDayName(date);
    const start = toMinutes(slot.time);
    const end = start + DEFAULT_DURATION_MINUTES;

    return volunteer.availability.some((entry) =>
        entry.day === day &&
        entry.timeSlots.some((timeSlot) => toMinutes(timeSlot.start) <= start && end <= toMinutes(timeSlot.end)));
};

// Free at one or more of the chosen dates and times
export const isAvailableAtAnySlot = (volunteer: VolunteerProfile, slots: ProposedSlotInput[]): boolean =>
    slots.some((slot) => isAvailableAt(volunteer, slot));

// Skip inactive volunteers and the student themself
export const filterVolunteers = (
    volunteers: VolunteerProfile[],
    request: ValidSupportRequestDraft,
    filters: VolunteerFilters,
    currentUserId: string | null,
): VolunteerProfile[] =>
    volunteers.filter((volunteer) =>
        volunteer.isActive &&
        volunteer.volunteerId !== currentUserId &&
        volunteer.supportCategories.includes(request.category) &&
        isAvailableAtAnySlot(volunteer, request.proposedTimeSlots) &&
        supportsMode(volunteer, request.supportMode) &&
        hasSkill(volunteer, filters.skill));