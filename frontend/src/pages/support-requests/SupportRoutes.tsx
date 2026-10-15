import { useEffect } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import NotificationsPage from '../notifications/NotificationsPage';
import RequestSupportPage from './RequestSupportPage';
import SupportRequestsPage from './SupportRequestsPage';
import { type SupportRequestRecord } from './types';

interface PageState {
    startFrom?: SupportRequestRecord;
    openRequestId?: string;
}

// New key on every visit, so the page starts fresh at the top
function usePageVisit() {
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.key]);

    // State from navigate() is used once, not again on Back, Forward or refresh
    const state = navigationType === 'POP' ? {} : ((location.state ?? {}) as PageState);
    return { key: location.key, state };
}

export function RequestSupportRoute() {
    const navigate = useNavigate();
    const { key, state } = usePageVisit();

    return (
        <RequestSupportPage
            key={key}
            startFrom={state.startFrom}
            onRequestSent={(record) => navigate('/support-requests', { state: { openRequestId: record.requestId } })}
        />
    );
}

export function SupportRequestsRoute() {
    const navigate = useNavigate();
    const { key, state } = usePageVisit();

    return (
        <SupportRequestsPage
            key={key}
            initialRequestId={state.openRequestId}
            onNewRequest={() => navigate('/request-support')}
            onFindAnotherVolunteer={(request) => navigate('/request-support', { state: { startFrom: request } })}
            onSchedule={() => navigate('/support-sessions')}
        />
    );
}

export function NotificationsRoute() {
    const navigate = useNavigate();
    const { key } = usePageVisit();

    return (
        <NotificationsPage
            key={key}
            onViewRequest={(requestId) => navigate('/support-requests', { state: { openRequestId: requestId } })}
            onViewSessions={() => navigate('/support-sessions')}
        />
    );
}
