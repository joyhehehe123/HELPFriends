import { createMockNotifications } from './mockNotifications';
import { type NotificationItem } from './types';

// Uses mock data for now. Only this file changes when Firestore is connected.

const simulateNetworkDelay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let mockNotifications: NotificationItem[] = createMockNotifications();
let nextNotificationNumber = 1006; // Ids like "N1006"

// TODO: getNotificationByUser(userId)
export const fetchNotifications = async (userId: string): Promise<NotificationItem[]> => {
    await simulateNetworkDelay(300);
    return mockNotifications
        .filter((item) => item.userId === userId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// TODO: markNotificationAsRead(notificationId)
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await simulateNetworkDelay(200);
    mockNotifications = mockNotifications.map((item) =>
        item.notificationId === notificationId ? { ...item, isRead: true } : item);
};

// TODO: createNotification() for the student who should see it
export const addNotification = (notification: Omit<NotificationItem, 'notificationId' | 'isRead' | 'createdAt'>) => {
    const newNotification: NotificationItem = {
        ...notification,
        notificationId: `N${nextNotificationNumber}`,
        isRead: false,
        createdAt: new Date(),
    };
    nextNotificationNumber += 1;
    mockNotifications = [newNotification, ...mockNotifications];
};
