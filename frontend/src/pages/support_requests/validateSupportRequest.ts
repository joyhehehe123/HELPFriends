import { combineDateAndTime } from '../../utils/dateTime';
import { DESCRIPTION_MAX_LENGTH, MAX_TIME_SLOTS, TITLE_MAX_LENGTH } from './constants';
import { type ProposedSlotInput, type SupportRequestDraft } from './types';

export interface SupportRequestErrors {
    category?: string;
    supportTitle?: string;
    description?: string;
    proposedTimeSlots?: string;     // Whole list
    slots?: Record<string, string>; // Per row (key = slot id)
    supportMode?: string;
}

const validateSlot = (slot: ProposedSlotInput, now: Date): string | null => {
    if (!slot.date && !slot.time) return 'Choose a date and time.';
    if (!slot.date) return 'Choose a date.';
    if (!slot.time) return 'Choose a time.';

    const dateTime = combineDateAndTime(slot.date, slot.time);
    if (!dateTime) return 'Enter a valid date and time.';
    if (dateTime <= now) return 'This date and time has already passed.';
    return null;
};

// Empty object = no errors
export const validateSupportRequest = (draft: SupportRequestDraft, now: Date = new Date()): SupportRequestErrors => {
    const errors: SupportRequestErrors = {};

    if (!draft.category) errors.category = 'Please choose a support category.';

    const title = draft.supportTitle.trim();
    if (!title) {
        errors.supportTitle = 'Please enter a title.';
    } else if (title.length > TITLE_MAX_LENGTH) {
        errors.supportTitle = `Title must be ${TITLE_MAX_LENGTH} characters or fewer.`;
    }

    const description = draft.description.trim();
    if (!description) {
        errors.description = 'Please describe the help you need.';
    } else if (description.length > DESCRIPTION_MAX_LENGTH) {
        errors.description = `Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`;
    }

    if (draft.proposedTimeSlots.length === 0) {
        errors.proposedTimeSlots = 'Add at least one preferred date and time.';
    } else if (draft.proposedTimeSlots.length > MAX_TIME_SLOTS) {
        errors.proposedTimeSlots = `You can add up to ${MAX_TIME_SLOTS} preferred dates and times.`;
    }

    const slotErrors: Record<string, string> = {};
    const usedDateTimes = new Set<string>();
    for (const slot of draft.proposedTimeSlots) {
        const slotError = validateSlot(slot, now);
        if (slotError) {
            slotErrors[slot.id] = slotError;
            continue;
        }
        const key = `${slot.date}T${slot.time}`;
        if (usedDateTimes.has(key)) slotErrors[slot.id] = 'You already added this date and time.';
        usedDateTimes.add(key);
    }
    if (Object.keys(slotErrors).length > 0) errors.slots = slotErrors;

    if (!draft.supportMode) errors.supportMode = 'Please choose a support mode.';

    return errors;
};

export const hasErrors = (errors: SupportRequestErrors): boolean => Object.keys(errors).length > 0;
