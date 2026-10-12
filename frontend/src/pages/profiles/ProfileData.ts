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

// TODO (API): replace this sample data with the logged-in user's data from the backend.
// Both profile pages read from and write to this object, so changes survive switching tabs
// (but not a page refresh until you save to an API).
export const profileStore: { profile: ProfileData; volunteer: VolunteerData } = {
    profile: {
        fullName: 'Mr. Balls',
        studentId: 'B23xxxxx',
        universityEmail: 'B23xxxxx@helplive.edu.my',
        faculty: 'Faculty of Computing & Digital Technology',
        programme: 'Bachelor of IT in Data Analytics (Honours)',
        aboutMe: "I'm a student interested in technology, data and helping other students through the HELPFriends community.",
        avatarUrl: DEFAULT_AVATAR,
    },
    volunteer: {
        active: true,
        rating: 4.5,
        availability: {
            mon: [],
            tue: [{ start: '09:00', end: '11:00' }, { start: '14:00', end: '16:00' }],
            wed: [],
            thu: [],
            fri: [{ start: '14:00', end: '15:00' }],
        },
        supportModes: ['online'],
        skills: ['Mathematics'],
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