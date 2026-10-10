import { Timestamp } from "firebase/firestore";
import { type SessionStatus } from "./constants";

export interface SupportSession {
    uid: string;
    sessionDateTime: Timestamp;
    duration: number; // Duration in minutes
    status: SessionStatus;
    cancelReason?: string;
    requestId: string; // Reference to the associated SupportRequest
}