import { DEFAULT_AVATAR } from './DefaultAvatar';

export interface ProfileData {
    fullName: string;
    studentId: string;
    universityEmail: string;
    faculty: string;
    programme: string;
    aboutMe: string;
    avatarUrl: string;
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export type SupportMode = 'online' | 'physical';

export interface TimeSlot {
    start: string; // 'HH:MM' (24h)
    end: string;
}

export interface VolunteerData {
    active: boolean;
    rating: number; // read-only, comes from the backend
    availability: Record<DayKey, TimeSlot[]>;
    supportModes: SupportMode[];
    skills: string[];
}

// Add { key: 'sat', ... } / { key: 'sun', ... } here (and to DayKey and the data below) to support weekends.
export const DAYS: { key: DayKey; letter: string; label: string }[] = [
    { key: 'mon', letter: 'M', label: 'Monday' },
    { key: 'tue', letter: 'T', label: 'Tuesday' },
    { key: 'wed', letter: 'W', label: 'Wednesday' },
    { key: 'thu', letter: 'T', label: 'Thursday' },
    { key: 'fri', letter: 'F', label: 'Friday' },
];

// Cache the latest profile data while navigating between the profile tabs.
export const profileStore: { profile: ProfileData; volunteer: VolunteerData } = {
    profile: {
        fullName: '',
        studentId: '',
        universityEmail: '',
        faculty: '',
        programme: '',
        aboutMe: '',
        avatarUrl: DEFAULT_AVATAR,
    },
    volunteer: {
        active: false,
        rating: 0,
        availability: {
            mon: [],
            tue: [],
            wed: [],
            thu: [],
            fri: [],
        },
        supportModes: [],
        skills: [],
    },
};

export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}