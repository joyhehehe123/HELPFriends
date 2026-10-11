import { Timestamp } from "firebase/firestore";
import { 
    type SessionStatus,
    type SupportCategory,
    type SupportMode
} from "./constants";

export interface SupportSession {
    uid: string;
    category: SupportCategory;
    title: string;
    description: string;
    supportMode: SupportMode;
    dateTime: Timestamp;
    duration: number; // Duration in minutes
    status: SessionStatus;
    respondedAt:Timestamp;
    cancelAt: Timestamp;
    cancelReason?: string;
    requestId: string; // Reference to the associated SupportRequest
    seekerId: string;
    volunteerId: string;
}