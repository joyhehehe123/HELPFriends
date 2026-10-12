import { useEffect, useState } from 'react';
import sadCat from '../../assets/sadcat.png';
import Button from '../../components/Button';
import { MOCK_CURRENT_USER } from './mockRequests';
import RequestCard from './RequestCard';
import RequestDetails from './RequestDetails';
import { fetchSupportRequests } from './supportRequestApi';
import { type SupportRequestRecord } from './types';
import useCurrentUserId from './useCurrentUserId';
import './RequestSupportPage.css';
import './SupportRequestsPage.css';

interface SupportRequestsPageProps {
    initialRequestId?: string; // Open this request first (e.g. right after sending it)
    onNewRequest: () => void;
    onFindAnotherVolunteer: (request: SupportRequestRecord) => void;
    onSchedule: (request: SupportRequestRecord) => void;
}

type Tab = 'sent' | 'received';
type LoadStatus = 'loading' | 'error' | 'ready';

interface RequestLists {
    sent: SupportRequestRecord[];
    received: SupportRequestRecord[];
}

const EMPTY_TEXT: Record<Tab, string> = {
    sent: "You haven't sent any support requests yet.",
    received: 'No one has sent you a support request yet.',
};

// Sent and received support requests (Figma: Support Requests)
export default function SupportRequestsPage({
    initialRequestId,
    onNewRequest,
    onFindAnotherVolunteer,
    onSchedule,
}: SupportRequestsPageProps) {
    const currentUserId = useCurrentUserId() ?? MOCK_CURRENT_USER.userId;
    const [tab, setTab] = useState<Tab>('sent');
    const [lists, setLists] = useState<RequestLists>({ sent: [], received: [] });
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [reloadCount, setReloadCount] = useState(0);
    const [openRequestId, setOpenRequestId] = useState<string | null>(initialRequestId ?? null);

    useEffect(() => {
        let isLatestLoad = true; // Ignore old responses
        fetchSupportRequests(currentUserId)
            .then((result) => {
                if (!isLatestLoad) return;
                setLists(result);
                setStatus('ready');
            })
            .catch((error) => {
                console.error('Error loading support requests: ', error);
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

    const openRequest = [...lists.sent, ...lists.received].find((item) => item.requestId === openRequestId);

    const openDetails = (requestId: string) => {
        setOpenRequestId(requestId);
        window.scrollTo({ top: 0 });
    };

    // Back to the tab the request is in
    const closeDetails = () => {
        if (openRequest) setTab(openRequest.seeker.userId === currentUserId ? 'sent' : 'received');
        setOpenRequestId(null);
        window.scrollTo({ top: 0 });
    };

    // Show the new status in the list too
    const replaceRequest = (updated: SupportRequestRecord) => {
        const replace = (items: SupportRequestRecord[]) =>
            items.map((item) => (item.requestId === updated.requestId ? updated : item));
        setLists((current) => ({ sent: replace(current.sent), received: replace(current.received) }));
    };

    if (openRequestId && status === 'loading') {
        return <div className="request-support" aria-busy="true" />;
    }

    if (openRequest) {
        return (
            <div className="request-support">
                <RequestDetails
                    request={openRequest}
                    role={openRequest.seeker.userId === currentUserId ? 'Seeker' : 'Volunteer'}
                    onBack={closeDetails}
                    backLabel="Back to support requests"
                    onChange={replaceRequest}
                    onNewRequest={onNewRequest}
                    onViewMyRequests={closeDetails}
                    onFindAnotherVolunteer={onFindAnotherVolunteer}
                    onSchedule={onSchedule}
                />
            </div>
        );
    }

    const shownRequests = lists[tab];

    return (
        <div className="request-support">
            <main className="request-support__body">
                <h1 className="visually-hidden">Support Requests</h1>

                <div className="requests-tabs" role="group" aria-label="Show requests">
                    {(['sent', 'received'] as const).map((name) => (
                        <button
                            key={name}
                            type="button"
                            className="requests-tabs__tab"
                            aria-pressed={tab === name}
                            onClick={() => setTab(name)}
                        >
                            {name === 'sent' ? 'Sent' : 'Received'}
                            {status === 'ready' && ` (${lists[name].length})`}
                        </button>
                    ))}
                </div>

                {status === 'loading' && <p className="requests-status" role="status">Loading support requests...</p>}

                {status === 'error' && (
                    <div className="requests-error" role="alert">
                        <p>We couldn't load your support requests. Please try again.</p>
                        <Button size="sm" onClick={retryLoading}>Try again</Button>
                    </div>
                )}

                {status === 'ready' && shownRequests.length === 0 && (
                    <div className="requests-empty">
                        <img className="requests-empty__image" src={sadCat} alt="" />
                        <p className="requests-empty__text">{EMPTY_TEXT[tab]}</p>
                        {tab === 'sent' && <Button shape="pill" onClick={onNewRequest}>Request a support</Button>}
                    </div>
                )}

                {status === 'ready' && shownRequests.length > 0 && (
                    <ul className="requests-list">
                        {shownRequests.map((request) => (
                            <li key={request.requestId}>
                                <RequestCard request={request} view={tab} onViewDetails={openDetails} />
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
