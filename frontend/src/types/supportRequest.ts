import { Timestamp } from 'firebase/firestore';
import { 
    type SupportCategory, 
    type SupportMode, 
    type requestStatus
} from "./constants";

export interface SupportRequest {
    requestId: string;
    category: SupportCategory;
    supportTitle: string;
    description: string;
    supportMode: SupportMode;
    proposedTimeSlots: Timestamp[];
    status: requestStatus;
    cancelReason?: string;
    studentId: string; // Reference to the student who created the support request
    volunteerId: string; // Reference to the volunteer who accepted the support request
}