import { type SupportCategory, type SupportMode, type SupportRequestDraft } from './types';

export const SUPPORT_CATEGORIES: SupportCategory[] = ['Academic', 'Technology', 'New Student', 'General Student'];
export const SUPPORT_MODES: SupportMode[] = ['Virtual', 'Physical'];

// Limits from the data dictionary (SupportRequest table)
export const TITLE_MAX_LENGTH = 100;       // supportTitle VARCHAR(100)
export const DESCRIPTION_MAX_LENGTH = 255; // description VARCHAR(255)

export const MAX_TIME_SLOTS = 5;

/** A blank form with one empty date/time row. */
export const createEmptyDraft = (): SupportRequestDraft => ({
    category: '',
    supportTitle: '',
    description: '',
    proposedTimeSlots: [{ id: 'slot-initial', date: '', time: '' }],
    supportMode: '',
});
