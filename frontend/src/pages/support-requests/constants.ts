import { type SupportCategory, type SupportMode, type SupportRequestDraft } from './types';

export const SUPPORT_CATEGORIES: SupportCategory[] = ['Academic', 'Technology', 'New Student', 'General Student'];
export const SUPPORT_MODES: SupportMode[] = ['Virtual', 'Physical'];

export const TITLE_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 255;

export const MAX_TIME_SLOTS = 5;

// The form has no duration field, so the shortest session is used
export const DEFAULT_DURATION_MINUTES = 30;

// Empty form with one date/time row
export const createEmptyDraft = (): SupportRequestDraft => ({
    category: '',
    supportTitle: '',
    description: '',
    proposedTimeSlots: [{ id: 'slot-initial', date: '', time: '' }],
    supportMode: '',
});
