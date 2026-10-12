import Button from '../../components/Button';
import { StatusDate, StatusPill } from './RequestBadges';
import { type SupportRequestRecord } from './types';
import './RequestCard.css';

interface RequestCardProps {
    request: SupportRequestRecord;
    view: 'sent' | 'received';
    onViewDetails: (requestId: string) => void;
}

// One request in the Sent / Received list (Figma: Support Requests)
export default function RequestCard({ request, view, onViewDetails }: RequestCardProps) {
    const titleId = `request-card-${request.requestId}`;
    // Figma: sent requests say "To:" until the volunteer answers, then "From:"
    const hasAnswer = request.status !== 'Pending' && request.status !== 'Cancelled';
    const person = view === 'received'
        ? `From: ${request.seeker.fullName}`
        : `${hasAnswer ? 'From' : 'To'}: ${request.volunteer.fullName}`;

    return (
        <article className="request-card" aria-labelledby={titleId}>
            <div className="request-card__top">
                <span className="category-chip">{request.category} Support</span>
                <StatusDate request={request} view={view} />
                <span className="request-card__status">
                    <StatusPill status={request.status} />
                </span>
            </div>

            <div className="request-card__body">
                <div className="request-card__info">
                    <h3 id={titleId} className="request-card__title">{request.supportTitle}</h3>
                    <p className="request-card__meta">{person} • {request.supportMode}</p>
                </div>
                <Button
                    className="request-card__button"
                    onClick={() => onViewDetails(request.requestId)}
                    aria-label={`View details of ${request.supportTitle} (${request.requestId})`}
                >
                    View details
                </Button>
            </div>
        </article>
    );
}
