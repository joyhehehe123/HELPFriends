import { type SupportRequest } from '../../types/supportRequest';

// Same values as SupportRequest
export type SupportCategory = SupportRequest['category'];
export type SupportMode = SupportRequest['supportMode'];

// ───────────────────────────────────── Form ──────────────────────────────────────

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

// ─────────────────────────────────── Matching ────────────────────────────────────

export interface VolunteerFilters {
    skill: string; // '' = any skill
    from: string;  // "YYYY-MM-DD", '' = any date
    to: string;    // "YYYY-MM-DD", '' = same as from
    mode: SupportMode;
}

// ─────────────────────────────────── Requests ────────────────────────────────────

// Same values as RequestStatus in Joy's types/constants.ts
export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled' | 'Scheduled';

// Who is looking at the request
export type RequestRole = 'Seeker' | 'Volunteer';

export interface PersonSummary {
    userId: string;
    fullName: string;
    profilePic: string;
}

// Saved request with the names to show (Firestore has no joins)
export interface SupportRequestRecord {
    requestId: string;
    category: SupportCategory;
    supportTitle: string;
    description: string;
    supportMode: SupportMode;
    proposedTimeSlots: Date[];
    duration: number;     // Minutes
    status: RequestStatus;
    createdAt: Date;
    respondedAt?: Date;   // Accepted or rejected
    cancelledAt?: Date;
    scheduledAt?: Date;
    seeker: PersonSummary;
    volunteer: PersonSummary;
}
