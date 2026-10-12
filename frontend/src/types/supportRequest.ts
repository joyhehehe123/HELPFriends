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
    scheduledAt?: Timestamp; // Only accepted request can be scheduled
    cancelledAt?: Timestamp; // Only pending and accepted requests can be cancelled
    cancelledReason?: string;
    seekerId: string; // Reference to the student who created the support request
    volunteerId: string; // Reference to the volunteer who accepted the support request
}