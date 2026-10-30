import { type RequestStatus, type Role, type SupportCategory, type SupportMode } from '../../types/constants';

export type { RequestStatus, SupportCategory, SupportMode };

// ─── Form ──────────────────────────────────────────────────────────────────────

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

// ─── Matching ──────────────────────────────────────────────────────────────────

export interface VolunteerFilters {
    skill: string; // '' = any skill
}

// ─── Requests ──────────────────────────────────────────────────────────────────

// Who is looking at the request
export type RequestRole = Role;

export interface PersonSummary {
    userId: string;
    fullName: string;
    profilePic: string | null;
}

// Saved request with the names to show (Firestore has no joins)
export interface SupportRequestRecord {
    requestId: string;
    category: SupportCategory;
    supportTitle: string;
    description: string;
    supportMode: SupportMode;
    proposedTimeSlots: Date[];
    duration: number; // Duration in minutes
    status: RequestStatus;
    createdAt: Date;
    respondedAt?: Date; // Accepted, Rejected
    cancelledAt?: Date;
    scheduledAt?: Date;
    seeker: PersonSummary;
    volunteer: PersonSummary;
}