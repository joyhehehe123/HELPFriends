import { Timestamp } from 'firebase/firestore';
import { 
    type SupportCategory, 
    type SupportMode, 
    type RequestStatus
} from "./constants";

export interface SupportRequest {
    uid: string;
    category: SupportCategory;
    supportTitle: string;
    description: string;
    supportMode: SupportMode;
    proposedTimeSlots: Timestamp[];
    status: RequestStatus;
    cancelReason?: string;
    seekerId: string; // Reference to the student who created the support request
    volunteerId: string; // Reference to the volunteer who accepted the support request
}