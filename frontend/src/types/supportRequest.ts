import { Timestamp } from 'firebase/firestore';
import { 
    type SupportCategory, 
    type SupportMode, 
    type RequestStatus
} from "./constants";

export interface SupportRequest {
    uid: string;
    category: SupportCategory;
    title: string;
    description: string;
    supportMode: SupportMode;
    proposedTimeSlots: Timestamp[];
    status: RequestStatus;
    createdAt: Timestamp;
    respondedAt?: Timestamp; // Accepted, Rejected
    scheduledAt: Timestamp; // Only accepted request can be scheduled
    cancelAt: Timestamp; // Only peendding and accepted requests can be cancelled
    cancelReason?: string;
    seekerId: string; // Reference to the student who created the support request
    volunteerId: string; // Reference to the volunteer who accepted the support request
}