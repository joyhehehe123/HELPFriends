import { type SupportRequest } from '../../types/supportRequest';
import { type DayName } from '../../types/volunteerProfile';

// Same values as SupportRequest
export type SupportCategory = SupportRequest['category'];
export type SupportMode = SupportRequest['supportMode'];

// One date/time row in the form
export interface ProposedSlotInput {
    id: string;
    date: string; // Format: "YYYY-MM-DD"
    time: string; // Format: "HH:mm"
}

// Form values (not saved yet)
export interface SupportRequestDraft {
    category: SupportCategory | '';
    supportTitle: string;
    description: string;
    proposedTimeSlots: ProposedSlotInput[];
    supportMode: SupportMode | '';
}

// Draft after validation
export interface ValidSupportRequestDraft extends SupportRequestDraft {
    category: SupportCategory;
    supportMode: SupportMode;
}

export interface VolunteerFilters {
    skill: string;   // '' = any skill
    days: DayName[]; // [] = any day
    mode: SupportMode;
}
