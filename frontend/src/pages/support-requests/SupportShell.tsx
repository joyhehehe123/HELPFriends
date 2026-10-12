import { useEffect, useState } from 'react';
import AppNavbar from '../../components/AppNavbar';
import NotificationsPage from '../notifications/NotificationsPage';
import { MOCK_CURRENT_USER } from './mockRequests';
import RequestSupportPage from './RequestSupportPage';
import SupportRequestsPage from './SupportRequestsPage';
import { type SupportRequestRecord } from './types';
import './RequestSupportPage.css';
import './SupportShell.css';

// Temporary: my pages with my navbar until the team router is in main
// TODO: replace with routes in App.tsx

const PATHS = {
    request: '/support-request-form',
    requests: '/support-requests',
    sessions: '/support-sessions',
    notifications: '/notifications',
};

// Labels from the Figma navbar
const NAV_LINKS = [
    { label: 'Request a Support', href: PATHS.request },
    { label: 'Support Requests', href: PATHS.requests },
    { label: 'Support Sessions', href: PATHS.sessions },
];

interface Visit {
    count: number;                    // New number = the page starts fresh
    startFrom?: SupportRequestRecord; // "Find another volunteer"
    openRequestId?: string;           // Request to show first under Support Requests
}

export default function SupportShell() {
    const [path, setPath] = useState(() => window.location.pathname);
    const [visit, setVisit] = useState<Visit>({ count: 0 });

    // Browser back / forward buttons
    useEffect(() => {
        const handlePopState = () => {
            setPath(window.location.pathname);
            setVisit((current) => ({ count: current.count + 1 }));
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const navigate = (href: string, details: Omit<Visit, 'count'> = {}) => {
        if (href !== window.location.pathname) window.history.pushState(null, '', href);
        setPath(href);
        setVisit((current) => ({ count: current.count + 1, ...details }));
        window.scrollTo({ top: 0 });
    };

    const renderPage = () => {
        if (path === PATHS.requests) {
            return (
                <SupportRequestsPage
                    key={visit.count}
                    initialRequestId={visit.openRequestId}
                    onNewRequest={() => navigate(PATHS.request)}
                    onFindAnotherVolunteer={(request) => navigate(PATHS.request, { startFrom: request })}
                    onSchedule={() => navigate(PATHS.sessions)}
                />
            );
        }
        if (path === PATHS.notifications) {
            return (
                <NotificationsPage
                    key={visit.count}
                    onViewRequest={(requestId) => navigate(PATHS.requests, { openRequestId: requestId })}
                    onViewSessions={() => navigate(PATHS.sessions)}
                />
            );
        }
        if (path === PATHS.sessions) {
            return (
                <div className="request-support">
                    <main className="request-support__body">
                        <h1 className="support-shell__title">Support Sessions</h1>
                        <p>Joy's Support Sessions pages (including scheduling) will open here when the team pages are merged.</p>
                    </main>
                </div>
            );
        }
        return (
            <RequestSupportPage
                key={visit.count}
                startFrom={visit.startFrom}
                onRequestSent={(record) => navigate(PATHS.requests, { openRequestId: record.requestId })}
            />
        );
    };

    const knownPaths = Object.values(PATHS);

    return (
        <div className="support-shell">
            <AppNavbar
                links={NAV_LINKS}
                notificationsHref={PATHS.notifications}
                activeHref={knownPaths.includes(path) ? path : PATHS.request}
                userName={MOCK_CURRENT_USER.fullName}
                userPhoto={MOCK_CURRENT_USER.profilePic}
                onNavigate={(href) => navigate(href)}
            />
            {renderPage()}
        </div>
    );
}
