import Button from '../../components/Button';
import PageHeader from '../../components/PageHeader';
import UserAvatar from '../../components/UserAvatar';
import { type VolunteerProfile } from '../../types/volunteerProfile';
import { formatShortDate } from '../../utils/dateTime';
import RequestSummary from './RequestSummary';
import { type ValidSupportRequestDraft } from './types';
import './RequestSentConfirmation.css';

interface RequestSentConfirmationProps {
    request: ValidSupportRequestDraft;
    volunteer: VolunteerProfile;
    sentAt: Date;
    onNewRequest: () => void;
}

// Shown after the request is sent (status: Pending)
export default function RequestSentConfirmation({ request, volunteer, sentAt, onNewRequest }: RequestSentConfirmationProps) {
    const volunteerFirstName = volunteer.fullName.split(' ')[0];

    return (
        <>
            <PageHeader title="Request a Support" breadcrumb={['Request a Support', 'Request Sent']} />

            <main className="request-support__body">
                <article className="request-sent" aria-labelledby="request-sent-title">
                    <div className="request-sent__banner" role="status">
                        <svg className="request-sent__icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
                            <circle cx="12" cy="12" r="11" fill="#37cc96" />
                            <path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="#ffffff" strokeWidth="2.4"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div>
                            <h2 id="request-sent-title" className="request-sent__title">
                                Request sent to {volunteer.fullName}
                            </h2>
                            <p className="request-sent__text">
                                You'll get a notification when {volunteerFirstName} accepts or rejects it.
                            </p>
                        </div>
                    </div>

                    <div className="request-sent__meta">
                        <span className="request-sent__date">Requested on {formatShortDate(sentAt)}</span>
                        <span className="status-pill status-pill--pending">Pending</span>
                    </div>

                    <div className="request-sent__volunteer">
                        <UserAvatar name={volunteer.fullName} photoUrl={volunteer.profilePic} />
                        <div>
                            <p className="request-sent__label">Volunteer</p>
                            <p className="request-sent__name">{volunteer.fullName}</p>
                        </div>
                    </div>

                    <RequestSummary request={request} />

                    <div className="request-sent__actions">
                        <Button variant="outline" onClick={onNewRequest}>Submit another request</Button>
                    </div>
                </article>
            </main>
        </>
    );
}
