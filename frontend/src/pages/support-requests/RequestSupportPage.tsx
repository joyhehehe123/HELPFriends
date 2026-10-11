import { useEffect, useState } from 'react';
import { onAuthChange } from '../../services/authService';
import { type VolunteerProfile } from '../../types/volunteerProfile';
import { createEmptyDraft } from './constants';
import RequestSentConfirmation from './RequestSentConfirmation';
import SupportRequestForm from './SupportRequestForm';
import { type SupportRequestDraft, type ValidSupportRequestDraft } from './types';
import VolunteerMatching from './VolunteerMatching';
import './RequestSupportPage.css';

type Step =
    | { name: 'form' }
    | { name: 'matching'; request: ValidSupportRequestDraft }
    | { name: 'sent'; request: ValidSupportRequestDraft; volunteer: VolunteerProfile; sentAt: Date };

// TODO: use the team's auth hook when login is ready
function useCurrentUserId(): string | null {
    const [userId, setUserId] = useState<string | null>(null);
    useEffect(() => onAuthChange((user) => setUserId(user?.uid ?? null)), []);
    return userId;
}

// Request a Support: form -> matching -> sent
export default function RequestSupportPage() {
    const currentUserId = useCurrentUserId();
    const [draft, setDraft] = useState<SupportRequestDraft>(createEmptyDraft);
    const [step, setStep] = useState<Step>({ name: 'form' });

    const goTo = (nextStep: Step) => {
        setStep(nextStep);
        window.scrollTo({ top: 0 });
    };

    const handleFormSubmit = (request: ValidSupportRequestDraft) => {
        setDraft(request); // Keep answers when going back
        goTo({ name: 'matching', request });
    };

    const startNewRequest = () => {
        setDraft(createEmptyDraft());
        goTo({ name: 'form' });
    };

    return (
        <div className="request-support">
            {step.name === 'form' && (
                <SupportRequestForm initialDraft={draft} onSubmit={handleFormSubmit} />
            )}

            {step.name === 'matching' && (
                <VolunteerMatching
                    request={step.request}
                    currentUserId={currentUserId}
                    onBack={() => goTo({ name: 'form' })}
                    onRequestSent={(volunteer, sentAt) =>
                        goTo({ name: 'sent', request: step.request, volunteer, sentAt })}
                />
            )}

            {step.name === 'sent' && (
                <RequestSentConfirmation
                    request={step.request}
                    volunteer={step.volunteer}
                    sentAt={step.sentAt}
                    onNewRequest={startNewRequest}
                />
            )}
        </div>
    );
}
