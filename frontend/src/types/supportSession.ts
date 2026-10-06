import { Timestamp } from "firebase/firestore";

export interface SupportSession {
    sessionId: string;
    sessionDateTime: Timestamp;
    duration: number; // Duration in minutes
    status: 'Active' | 'Completed' | 'Cancelled';
    cancelReason?: string;
    requestId: string; // Reference to the associated SupportRequest
}