import { useEffect, useState } from 'react';
import sillyCat from '../../assets/sillycat.png';
import Button from '../../components/Button';
import { formatDayDateTime } from '../../utils/dateTime';
import { MOCK_CURRENT_USER } from '../support-requests/mockRequests';
import useCurrentUserId from '../support-requests/useCurrentUserId';
import { fetchNotifications, markNotificationAsRead } from './notificationApi';
import { type NotificationItem } from './types';
import '../support-requests/RequestSupportPage.css';
import './NotificationsPage.css';

interface NotificationsPageProps {
    onViewRequest: (requestId: string) => void;
    onViewSessions: () => void;
}

type LoadStatus = 'loading' | 'error' | 'ready';

function ArrowIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

// Notifications list and details (Figma: Notifications, No Notification Selected)
export default function NotificationsPage({ onViewRequest, onViewSessions }: NotificationsPageProps) {
    const currentUserId = useCurrentUserId() ?? MOCK_CURRENT_USER.userId;
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [reloadCount, setReloadCount] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        let isLatestLoad = true; // Ignore old responses
        fetchNotifications(currentUserId)
            .then((result) => {
                if (!isLatestLoad) return;
                setItems(result);
                setStatus('ready');
            })
            .catch((error) => {
                console.error('Error loading notifications: ', error);
                if (isLatestLoad) setStatus('error');
            });
        return () => {
            isLatestLoad = false;
        };
    }, [currentUserId, reloadCount]);

    const retryLoading = () => {
        setStatus('loading');
        setReloadCount((count) => count + 1);
    };

    const select = (item: NotificationItem) => {
        setSelectedId(item.notificationId);
        if (item.isRead) return;
        setItems((current) => current.map((other) =>
            other.notificationId === item.notificationId ? { ...other, isRead: true } : other));
        markNotificationAsRead(item.notificationId).catch((error) => {
            console.error('Error marking notification as read: ', error);
        });
    };

    const selected = items.find((item) => item.notificationId === selectedId);
    const referenceId = selected?.referenceId;

    return (
        <div className="request-support">
            <main className="notifications-page">
                <section className="notifications" aria-labelledby="notifications-title">
                    <h1 id="notifications-title" className="notifications__header">Notifications</h1>

                    <div className="notifications__content">
                        <div className="notifications__list-wrap">
                            {status === 'loading' && (
                                <p className="notifications__status" role="status">Loading notifications...</p>
                            )}
                            {status === 'error' && (
                                <div className="notifications__status" role="alert">
                                    <p>We couldn't load your notifications.</p>
                                    <Button size="sm" onClick={retryLoading}>Try again</Button>
                                </div>
                            )}
                            {status === 'ready' && items.length === 0 && (
                                <p className="notifications__status">You have no notifications yet.</p>
                            )}
                            {status === 'ready' && items.length > 0 && (
                                <ul className="notifications__list">
                                    {items.map((item) => (
                                        <li key={item.notificationId}>
                                            <button
                                                type="button"
                                                className={item.isRead ? 'notification-item' : 'notification-item notification-item--unread'}
                                                aria-current={item.notificationId === selectedId ? 'true' : undefined}
                                                onClick={() => select(item)}
                                            >
                                                <span className="notification-item__date">{formatDayDateTime(item.createdAt)}</span>
                                                <span className="notification-item__title">
                                                    {item.title}
                                                    {!item.isRead && <span className="visually-hidden"> (unread)</span>}
                                                </span>
                                                <span className="notification-item__preview">{item.message}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="notifications__detail" aria-live="polite">
                            {selected ? (
                                <>
                                    <p className="notifications__date">{formatDayDateTime(selected.createdAt)}</p>
                                    <h2 className="notifications__title">{selected.title}</h2>
                                    <p className="notifications__message">{selected.message}</p>
                                    {selected.category === 'Support Session' && (
                                        <Button className="notifications__button" onClick={onViewSessions}>
                                            View session details <ArrowIcon />
                                        </Button>
                                    )}
                                    {selected.category === 'Support Request' && referenceId && (
                                        <Button className="notifications__button" onClick={() => onViewRequest(referenceId)}>
                                            View request details <ArrowIcon />
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <div className="notifications__empty">
                                    <img className="notifications__empty-image" src={sillyCat} alt="" />
                                    <p className="notifications__empty-text">No notification selected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
