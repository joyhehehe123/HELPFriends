import { type DayName, type VolunteerProfile } from '../../types/volunteerProfile';
import { type SupportCategory, type SupportMode, type VolunteerFilters } from './types';

// 'Both' matches Virtual and Physical
export const supportsMode = (volunteer: VolunteerProfile, mode: SupportMode): boolean =>
    volunteer.preferredMode === mode || volunteer.preferredMode === 'Both';

// Partial match, e.g. "math" finds "Mathematics"
export const hasSkill = (volunteer: VolunteerProfile, skillSearch: string): boolean => {
    const search = skillSearch.trim().toLowerCase();
    if (!search) return true;
    return volunteer.skills.some((skill) => skill.toLowerCase().includes(search));
};

// Free on at least one of the chosen days
export const isAvailableOnAnyDay = (volunteer: VolunteerProfile, days: DayName[]): boolean => {
    if (days.length === 0) return true;
    return volunteer.availability.some((entry) => days.includes(entry.day) && entry.timeSlots.length > 0);
};

// Skips inactive volunteers and the student themself (FR), highest rating first
export const filterVolunteers = (
    volunteers: VolunteerProfile[],
    category: SupportCategory,
    filters: VolunteerFilters,
    currentUserId: string | null,
): VolunteerProfile[] =>
    volunteers
        .filter((volunteer) =>
            volunteer.isActive &&
            volunteer.volunteerId !== currentUserId &&
            volunteer.supportCategories.includes(category) &&
            supportsMode(volunteer, filters.mode) &&
            hasSkill(volunteer, filters.skill) &&
            isAvailableOnAnyDay(volunteer, filters.days))
        .sort((a, b) => b.rating - a.rating || a.fullName.localeCompare(b.fullName));
