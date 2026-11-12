import { type RequestStatus, type Role, type SupportCategory, type SupportMode } from '../../types/constants';

export type { RequestStatus, SupportCategory, SupportMode };

// ─── Form ──────────────────────────────────────────────────────────────────────

export interface ProposedSlotInput {
    id: string;
    date: string;
    time: string;
}

export interface SupportRequestDraft {
    category: SupportCategory | '';
    supportTitle: string;
    description: string;
    proposedTimeSlots: ProposedSlotInput[];
    supportMode: SupportMode | '';
}

export interface ValidSupportRequestDraft extends SupportRequestDraft {
    category: SupportCategory;
    supportMode: SupportMode;
}

// ─── Matching ──────────────────────────────────────────────────────────────────

export interface VolunteerFilters {
    skill: string;
}

// ─── Requests ──────────────────────────────────────────────────────────────────

export type RequestRole = Role;

export interface PersonSummary {
    userId: string;
    fullName: string;
}

export interface SupportRequestRecord {
    requestId: string;
    category: SupportCategory;
    supportTitle: string;
    description: string;
    supportMode: SupportMode;
    proposedTimeSlots: Date[];
    duration: number;
    status: RequestStatus;
    createdAt: Date;
    respondedAt?: Date;
    cancelledAt?: Date;
    scheduledAt?: Date;
    seeker: PersonSummary;
    volunteer: PersonSummary;
}