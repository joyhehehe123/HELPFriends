import { createNotification, getNotificationByUser } from '../../services/notificationService';
import { type Notification } from '../../types/notification';
import { type NotificationItem } from './types';

export { markNotificationAsRead } from '../../services/notificationService';

const toNotificationItem = (notification: Notification): NotificationItem => ({
    notificationId: notification.uid,
    title: notification.title,
    message: notification.message,
    category: notification.category,
    isRead: notification.isRead,
    userId: notification.userId,
    referenceId: notification.referenceId,
    createdAt: notification.createdAt.toDate(),
});

export const fetchNotifications = async (userId: string): Promise<NotificationItem[]> =>
    (await getNotificationByUser(userId))
        .map(toNotificationItem)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

export const addNotification = async (
    notification: Omit<NotificationItem, 'notificationId' | 'isRead' | 'createdAt'>,
): Promise<void> => {
    try {
        await createNotification(notification);
    } catch (error) {
        console.error('Error sending notification: ', error);
    }
};