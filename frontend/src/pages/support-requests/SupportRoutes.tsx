import { useEffect } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import NotificationsPage from '../notifications/NotificationsPage';
import { REQUEST_FORM_PATH, SUPPORT_REQUESTS_PATH, VOLUNTEER_MATCHING_PATH } from './constants';
import RequestSupportPage from './RequestSupportPage';
import SupportRequestsPage from './SupportRequestsPage';
import { type SupportRequestRecord } from './types';

interface PageState {
    startFrom?: SupportRequestRecord;
    visitKey?: string; // Set when moving inside the same page
}

function usePageVisit() {
    const location = useLocation();
    const navigationType = useNavigationType();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.key]);

    const locationState = (location.state ?? {}) as PageState;
    const state = navigationType === 'POP' ? {} : locationState;
    return { key: locationState.visitKey ?? location.key, state };
}

export function RequestSupportRoute() {
    const navigate = useNavigate();
    const { key, state } = usePageVisit();

    return (
        <RequestSupportPage
            key={key}
            visitKey={key}
            startFrom={state.startFrom}
            onRequestSent={(record) => navigate(`${SUPPORT_REQUESTS_PATH}/${record.requestId}`)}
        />
    );
}

export function SupportRequestsRoute() {
    const navigate = useNavigate();
    const { key } = usePageVisit();

    return (
        <SupportRequestsPage
            key={key}
            visitKey={key}
            onNewRequest={() => navigate(REQUEST_FORM_PATH)}
            onFindAnotherVolunteer={(request) => navigate(VOLUNTEER_MATCHING_PATH, { state: { startFrom: request } })}
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
            onViewRequest={(requestId) => navigate(`${SUPPORT_REQUESTS_PATH}/${requestId}`)}
            onViewSessions={() => navigate('/support-sessions')}
        />
    );
}