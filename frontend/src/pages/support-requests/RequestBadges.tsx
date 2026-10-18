import { formatShortDate } from '../../utils/dateTime';
import { type RequestRole, type RequestStatus, type SupportRequestRecord } from './types';

type DateView = 'sent' | 'received' | 'details';

export function StatusPill({ status }: { status: RequestStatus }) {
    return <span className={`status-pill status-pill--${status.toLowerCase()}`}>{status}</span>;
}

export function RoleChip({ role }: { role: RequestRole }) {
    return (
        <span className={`role-chip ${role === 'Volunteer' ? 'role-chip--volunteer' : 'role-chip--seeker'}`}>
            {role}
        </span>
    );
}

function ClockIcon() {
    return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function ResultIcon({ positive }: { positive: boolean }) {
    return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <path
                d={positive
                    ? 'M21.8 10A10 10 0 1 1 17 3.3M9 11l3 3L22 4'
                    : 'M12 2a10 10 0 1 1 0 20a10 10 0 0 1 0-20zM15 9l-6 6M9 9l6 6'}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Get the label and date of the current status
const getStatusDate = (request: SupportRequestRecord, view: DateView): [string, Date] => {
    if (view === 'received') return ['Received', request.createdAt];
    if (request.status === 'Accepted' && request.respondedAt) return ['Accepted', request.respondedAt];
    if (request.status === 'Rejected' && request.respondedAt) return ['Rejected', request.respondedAt];
    if (request.status === 'Cancelled' && request.cancelledAt) return ['Cancelled', request.cancelledAt];
    if (request.status === 'Scheduled' && request.scheduledAt) return ['Scheduled', request.scheduledAt];
    return ['Requested', request.createdAt];
};

interface StatusDateProps {
    request: SupportRequestRecord;
    view: DateView;
    icon?: 'clock' | 'result'; // Clock in lists, tick or cross in details
}

export function StatusDate({ request, view, icon = 'clock' }: StatusDateProps) {
    const [label, date] = getStatusDate(request, view);
    const isNegative = request.status === 'Rejected' || request.status === 'Cancelled';
    const showResult = icon === 'result';

    return (
        <span className={showResult && isNegative ? 'date-chip date-chip--negative' : 'date-chip'}>
            {showResult ? <ResultIcon positive={!isNegative} /> : <ClockIcon />}
            {label} on {formatShortDate(date)}
        </span>
    );
}
