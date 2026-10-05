import { Timestamp } from "firebase/firestore";

export interface Notification {
    uid: string;
    title: string;
    message: string;
    category: 'Support Request' | 'Support Session' | 'Feedback' | 'General';
    isRead: boolean;
    createdAt: Timestamp;
    userId: string; // Reference to the user who should receive the notification
    referenceId?: string; // Reference to the associated entity (SupportRequest, SupportSession, Feedback)
}