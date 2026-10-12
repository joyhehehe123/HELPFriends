export type SupportCategory = 'academic' | 'technology' | 'newStudent' | 'general';
export type SupportMode = 'virtual' | 'physical';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

/** Times are stored as 24h "HH:mm" strings, e.g. "09:00", "16:30". */
export interface TimeSlot {
    start: string;
    end: string;
}

export type WeeklySchedule = Record<DayKey, TimeSlot[]>;

export interface CategoryInfoData {
    categories: SupportCategory[];
}

export interface SkillsInfoData {
    selectedSkills: string[];
    customSkills: string[];
}

export interface AvailabilityInfoData {
    schedule: WeeklySchedule;
}

export interface SupportModeInfoData {
    modes: SupportMode[];
}

export interface VolunteerRegistrationData {
    categoryInfo: CategoryInfoData;
    skillsInfo: SkillsInfoData;
    availabilityInfo: AvailabilityInfoData;
    supportModeInfo: SupportModeInfoData;
}

/** Shape sent to the backend. Adjust to match your API. */
export interface VolunteerRegistrationPayload {
    supportCategories: SupportCategory[];
    skills: string[];
    availability: { day: DayKey; startTime: string; endTime: string }[];
    supportModes: SupportMode[];
}

export const CATEGORY_LABELS: Record<SupportCategory, string> = {
    academic: 'Academic Support',
    technology: 'Technology Support',
    newStudent: 'New Student Support',
    general: 'General Student Support',
};

/** Skills shown on the Skills Specification step, depending on the categories picked in step 1. */
export const SKILL_CATALOGUE: Record<SupportCategory, string[]> = {
    academic: ['Study Techniques', 'Assignment Guidance', 'Mathematics', 'Programming'],
    technology: ['Software Installation', 'Basic Computer Support', 'Productivity Tools'],
    newStudent: ['Campus Orientation', 'Navigating University Facilities', 'Student Life Guidance'],
    general: ['General Non-Academic Assistance', 'Peer Guidance'],
};

export function getAvailableSkills(categories: SupportCategory[]): string[] {
    return categories.flatMap((category) => SKILL_CATALOGUE[category]);
}