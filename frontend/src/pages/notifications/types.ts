import { type Notification } from '../../types/notification';

// Notification for the page, with a Date instead of a Timestamp
export type NotificationItem = Pick<Notification, 'title' | 'message' | 'category' | 'isRead' | 'userId' | 'referenceId'> & {
    notificationId: string;
    createdAt: Date;
};
