import { type Notification } from '../../types/notification';

// One notification on the page (category values come from the team type)
export type NotificationItem = Pick<Notification, 'title' | 'message' | 'category' | 'isRead' | 'userId' | 'referenceId'> & {
    notificationId: string;
    createdAt: Date;
};
