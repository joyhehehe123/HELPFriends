import { useState, type ReactNode } from 'react';
import BackLink from '../../components/BackLink';
import Button from '../../components/Button';
import UserAvatar from '../../components/UserAvatar';
import { formatClockTime, formatDateWithDay, formatDuration, formatSlot } from '../../utils/dateTime';
import { RoleChip, StatusDate, StatusPill } from './RequestBadges';
import { updateRequestStatus, type RequestAction } from './supportRequestApi';
import { type PersonSummary, type RequestRole, type SupportRequestRecord } from './types';
import './RequestDetails.css';

interface RequestDetailsProps {
    request: SupportRequestRecord;
    role: RequestRole;
    onBack: () => void;
    backLabel?: string;
    onChange: (request: SupportRequestRecord) => void;
    onNewRequest: () => void;
    onViewMyRequests: () => void;
    onFindAnotherVolunteer: (request: SupportRequestRecord) => void;
    onSchedule: (request: SupportRequestRecord) => void;
}

const ACTION_ERRORS: Record<RequestAction, string> = {
    accept: "We couldn't accept this request. Please try again.",
    reject: "We couldn't reject this request. Please try again.",
    cancel: "We couldn't cancel this request. Please try again.",
};

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

function Person({ person }: { person: PersonSummary }) {
    return (
        <span className="request-details__person">
            <UserAvatar name={person.fullName} photoUrl={person.profilePic} size="sm" />
            {person.fullName}
        </span>
    );
}

export default function RequestDetails({
    request,
    role,
    onBack,
    backLabel,
    onChange,
    onNewRequest,
    onViewMyRequests,
    onFindAnotherVolunteer,
    onSchedule,
}: RequestDetailsProps) {
    const [busyAction, setBusyAction] = useState<RequestAction | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const titleId = `request-${request.requestId}-title`;
    const otherPerson = role === 'Volunteer' ? request.seeker : request.volunteer;
    // The seeker's own pending request has a different layout
    const isSentLayout = role === 'Support Seeker' && request.status === 'Pending';
    const firstSlot = request.proposedTimeSlots[0];

    const runAction = async (action: RequestAction) => {
        setBusyAction(action);
        setErrorMessage('');
        try {
            onChange(await updateRequestStatus(request.requestId, action));
        } catch (error) {
            console.error(`Error (${action}) on support request: `, error);
            setErrorMessage(ACTION_ERRORS[action]);
        }
        setBusyAction(null);
    };

    const actionButton = (action: RequestAction, label: string, busyLabel: string, outline = false) => (
        <Button
            variant={outline ? 'outline' : 'primary'}
            shape="pill"
            onClick={() => runAction(action)}
            disabled={busyAction !== null}
        >
            {busyAction === action ? busyLabel : label}
        </Button>
    );

    const cancelButton = actionButton('cancel', 'Cancel', 'Cancelling...', true);
    const scheduleButton = <Button shape="pill" onClick={() => onSchedule(request)}>Schedule</Button>;
    const viewMyRequestsButton = (
        <Button variant="outline" shape="pill" onClick={onViewMyRequests}>View my support requests</Button>
    );

    const renderActions = () => {
        if (role === 'Volunteer') {
            if (request.status === 'Pending') {
                return <>{actionButton('reject', 'Reject', 'Rejecting...', true)}{actionButton('accept', 'Accept', 'Accepting...')}</>;
            }
            if (request.status === 'Accepted') return <>{cancelButton}{scheduleButton}</>;
            return null;
        }

        if (request.status === 'Pending') {
            return <>{cancelButton}<Button shape="pill" onClick={onNewRequest}>Submit a new request</Button></>;
        }
        if (request.status === 'Accepted') return <>{cancelButton}{scheduleButton}</>;
        if (request.status === 'Rejected') {
            return (
                <>
                    {viewMyRequestsButton}
                    <Button shape="pill" onClick={() => onFindAnotherVolunteer(request)}>Find another volunteer</Button>
                </>
            );
        }
        if (request.status === 'Cancelled') {
            return <>{viewMyRequestsButton}<Button shape="pill" onClick={onNewRequest}>Submit a new request</Button></>;
        }
        return null;
    };

    const actions = renderActions();

    return (
        <main>
            <div className="page-top">
                <BackLink onClick={onBack} label={backLabel} />
            </div>

            <div className="request-support__body">
                <article className="request-details" aria-labelledby={titleId}>
                    <div className="request-details__top">
                        <div className="request-details__chips">
                            <span className="category-chip">{request.category} Support</span>
                            <RoleChip role={role} />
                        </div>
                        <div className="request-details__chips">
                            <StatusDate request={request} view="details" icon={isSentLayout ? 'clock' : 'result'} />
                            <StatusPill status={request.status} />
                        </div>
                    </div>

                    <h1 id={titleId} className="request-details__title">{request.supportTitle}</h1>

                    {isSentLayout ? (
                        <dl className="request-details__facts request-details__facts--sent">
                            <Fact label="Session ID">{request.requestId}</Fact>
                            <Fact label="Date">{firstSlot ? formatDateWithDay(firstSlot) : '-'}</Fact>
                            <Fact label="Time">{firstSlot ? formatClockTime(firstSlot) : '-'}</Fact>
                            <Fact label="Duration">{formatDuration(request.duration)}</Fact>
                            <Fact label="Support Mode">{request.supportMode}</Fact>
                            <Fact label="Volunteer"><Person person={otherPerson} /></Fact>
                        </dl>
                    ) : (
                        <>
                            <dl className="request-details__facts">
                                <Fact label="Support ID">{request.requestId}</Fact>
                                <Fact label="Duration">{formatDuration(request.duration)}</Fact>
                                <Fact label="Support Mode">{request.supportMode}</Fact>
                                <Fact label={role === 'Volunteer' ? 'Support Seeker' : 'Volunteer'}>
                                    <Person person={otherPerson} />
                                </Fact>
                            </dl>

                            <section aria-labelledby={`${titleId}-slots`}>
                                <h2 id={`${titleId}-slots`} className="request-details__label">Proposed Time Slots</h2>
                                <ul className="request-details__slots">
                                    {request.proposedTimeSlots.map((slot) => (
                                        <li key={slot.getTime()} className="request-details__slot">{formatSlot(slot)}</li>
                                    ))}
                                </ul>
                            </section>
                        </>
                    )}

                    <section className="request-details__description" aria-labelledby={`${titleId}-description`}>
                        <h2 id={`${titleId}-description`} className="request-details__label">Description</h2>
                        <p>{request.description}</p>
                    </section>

                    {errorMessage && <p className="request-details__error" role="alert">{errorMessage}</p>}

                    {actions && <div className="request-details__actions">{actions}</div>}
                </article>
            </div>
        </main>
    );
}