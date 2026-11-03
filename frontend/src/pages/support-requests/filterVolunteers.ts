import { type VolunteerProfile } from '../../types/volunteerProfile';
import { combineDateAndTime, getDayName } from '../../utils/dateTime';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { type ProposedSlotInput, type SupportMode, type ValidSupportRequestDraft, type VolunteerFilters } from './types';

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

export const supportsMode = (volunteer: VolunteerProfile, mode: SupportMode): boolean =>
    volunteer.preferredMode === mode || volunteer.preferredMode === 'Both';

export const hasSkill = (volunteer: VolunteerProfile, skillSearch: string): boolean => {
    const search = skillSearch.trim().toLowerCase();
    if (!search) return true;
    return volunteer.skills.some((skill) => skill.toLowerCase().includes(search));
};

export const isFreeAt = (availability: { day: string; timeSlots: { start: string; end: string }[] }[], date: Date): boolean => {
    const day = getDayName(date);
    const start = date.getHours() * 60 + date.getMinutes();
    const end = start + DEFAULT_DURATION_MINUTES;

    return availability.some((entry) =>
        entry.day === day &&
        entry.timeSlots.some((timeSlot) => toMinutes(timeSlot.start) <= start && end <= toMinutes(timeSlot.end)));
};

export const isAvailableAt = (volunteer: VolunteerProfile, slot: ProposedSlotInput): boolean => {
    const date = combineDateAndTime(slot.date, slot.time);
    return date !== null && isFreeAt(volunteer.availability, date);
};

export const isAvailableAtAnySlot = (volunteer: VolunteerProfile, slots: ProposedSlotInput[]): boolean =>
    slots.some((slot) => isAvailableAt(volunteer, slot));

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