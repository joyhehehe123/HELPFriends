import type { Timestamp } from "firebase/firestore";

export interface Feedback {
    uid: string;
    rating: number;
    comments: string | null;
    createdAt: Timestamp;
    sessionId: string; // Reference to the associated SupportSession
}