import { type SupportRequest } from '../../types/supportRequest';
import { type DayName } from '../../types/volunteerProfile';

// Re-use the literal types from the shared SupportRequest model so both stay in sync.
export type SupportCategory = SupportRequest['category'];
export type SupportMode = SupportRequest['supportMode'];

/** One "Preferred Dates & Times" row in the form. Values come straight from the date/time inputs. */
export interface ProposedSlotInput {
    id: string;   // Only used as a React key and element id
    date: string; // Format: "YYYY-MM-DD"
    time: string; // Format: "HH:mm"
}

/** What the student has entered in the Support Request form (not saved to Firestore yet). */
export interface SupportRequestDraft {
    category: SupportCategory | '';
    supportTitle: string;
    description: string;
    proposedTimeSlots: ProposedSlotInput[];
    supportMode: SupportMode | '';
}

/** A draft that passed validation, so category and supportMode are always set. */
export interface ValidSupportRequestDraft extends SupportRequestDraft {
    category: SupportCategory;
    supportMode: SupportMode;
}

/** Filters on the Volunteers Matching page. */
export interface VolunteerFilters {
    skill: string;   // Free text, '' = any skill
    days: DayName[]; // [] = any day
    mode: SupportMode;
}
