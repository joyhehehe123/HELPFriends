import { Timestamp } from "firebase/firestore";
import { type NotificationCategory } from "./constants";

export interface Notification {
    notificationId: string;
    title: string;
    message: string;
    category: NotificationCategory;
    isRead: boolean;
    createdAt: Timestamp;
    userId: string; // Reference to the user who should receive the notification
    referenceId?: string; // Reference to the associated entity (SupportRequest, SupportSession, Feedback)
}