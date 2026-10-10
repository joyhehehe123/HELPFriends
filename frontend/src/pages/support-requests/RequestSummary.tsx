import { formatDateTime } from '../../utils/dateTime';
import { type ValidSupportRequestDraft } from './types';
import './RequestSummary.css';

interface RequestSummaryProps {
    request: ValidSupportRequestDraft;
}

// Used in the send dialog and the sent screen
export default function RequestSummary({ request }: RequestSummaryProps) {
    return (
        <dl className="request-summary">
            <div className="request-summary__row">
                <dt>Category</dt>
                <dd><span className="category-chip">{request.category} Support</span></dd>
            </div>
            <div className="request-summary__row">
                <dt>Title</dt>
                <dd>{request.supportTitle}</dd>
            </div>
            <div className="request-summary__row">
                <dt>Description</dt>
                <dd className="request-summary__description">{request.description}</dd>
            </div>
            <div className="request-summary__row">
                <dt>Preferred times</dt>
                <dd>
                    <ul className="request-summary__times">
                        {request.proposedTimeSlots.map((slot) => (
                            <li key={slot.id}>{formatDateTime(slot.date, slot.time)}</li>
                        ))}
                    </ul>
                </dd>
            </div>
            <div className="request-summary__row">
                <dt>Support mode</dt>
                <dd>{request.supportMode}</dd>
            </div>
        </dl>
    );
}
