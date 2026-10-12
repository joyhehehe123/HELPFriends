import { formatClockTime, formatShortDate } from '../../utils/dateTime';
import { daysFromToday, MOCK_CURRENT_USER } from '../support-requests/mockRequests';
import { type NotificationItem } from './types';

// Test data until Firestore is connected (Figma: Notifications)
export const createMockNotifications = (): NotificationItem[] => {
    const sessionTime = daysFromToday(-1, '13:00');
    const session = `Your support session “Python Tutorial” at ${formatClockTime(sessionTime)} on ${formatShortDate(sessionTime)} with support volunteer Waka Waka`;

    return [
        {
            notificationId: 'N1005',
            title: 'Support Session Reminder',
            message: `${session} is starting now.`,
            category: 'Support Session',
            isRead: false,
            userId: MOCK_CURRENT_USER.userId,
            createdAt: daysFromToday(-1, '13:00'),
            referenceId: 'S1001',
        },
        {
            notificationId: 'N1004',
            title: 'Support Session Reminder',
            message: `${session} is starting in 15 minutes.`,
            category: 'Support Session',
            isRead: false,
            userId: MOCK_CURRENT_USER.userId,
            createdAt: daysFromToday(-1, '12:45'),
            referenceId: 'S1001',
        },
        {
            notificationId: 'N1003',
            title: 'Support Session Reminder',
            message: `${session} is starting in 2 hours. You are no longer allowed to cancel the session.`,
            category: 'Support Session',
            isRead: true,
            userId: MOCK_CURRENT_USER.userId,
            createdAt: daysFromToday(-1, '11:00'),
            referenceId: 'S1001',
        },
        {
            notificationId: 'N1002',
            title: 'Support Request Accepted',
            message: 'Your support request “Python Tutorial” was accepted by Waka Waka. You can now schedule the session.',
            category: 'Support Request',
            isRead: true,
            userId: MOCK_CURRENT_USER.userId,
            createdAt: daysFromToday(-6, '14:12'),
            referenceId: 'R1009',
        },
        {
            notificationId: 'N1001',
            title: 'Support Request Submitted',
            message: 'Your support request “Python Tutorial” was sent to Waka Waka. We will let you know when Waka Waka replies.',
            category: 'Support Request',
            isRead: true,
            userId: MOCK_CURRENT_USER.userId,
            createdAt: daysFromToday(-6, '13:25'),
            referenceId: 'R1009',
        },
    ];
};
