import { useState } from 'react';
import { toDateInputValue, toTimeInputValue } from '../../utils/dateTime';
import { createEmptyDraft } from './constants';
import SupportRequestForm from './SupportRequestForm';
import { type SupportRequestDraft, type SupportRequestRecord, type ValidSupportRequestDraft } from './types';
import useCurrentUserId from './useCurrentUserId';
import VolunteerMatching from './VolunteerMatching';
import './RequestSupportPage.css';

interface RequestSupportPageProps {
    startFrom?: SupportRequestRecord; // Rejected request ("Find another volunteer")
    onRequestSent: (record: SupportRequestRecord) => void; // Shows it under Support Requests (Figma)
}

type Step = { name: 'form' } | { name: 'matching'; request: ValidSupportRequestDraft };

// Copies a sent request back into the form (times that have passed are left out)
const toDraft = (record: SupportRequestRecord): ValidSupportRequestDraft => {
    const now = Date.now();
    const futureSlots = record.proposedTimeSlots.filter((slot) => slot.getTime() > now);

    return {
        category: record.category,
        supportTitle: record.supportTitle,
        description: record.description,
        supportMode: record.supportMode,
        proposedTimeSlots: futureSlots.length === 0
            ? createEmptyDraft().proposedTimeSlots
            : futureSlots.map((slot, index) => ({
                id: `slot-copy-${index}`,
                date: toDateInputValue(slot),
                time: toTimeInputValue(slot),
            })),
    };
};

// Matching if all proposed times are still ahead, otherwise the form to pick new times
const getRetryStep = (record: SupportRequestRecord): Step => {
    const allTimesAhead = record.proposedTimeSlots.every((slot) => slot.getTime() > Date.now());
    return allTimesAhead ? { name: 'matching', request: toDraft(record) } : { name: 'form' };
};

// Request a Support: form -> volunteer matching
export default function RequestSupportPage({ startFrom, onRequestSent }: RequestSupportPageProps) {
    const currentUserId = useCurrentUserId();
    const [draft, setDraft] = useState<SupportRequestDraft>(() => (startFrom ? toDraft(startFrom) : createEmptyDraft()));
    const [step, setStep] = useState<Step>(() => (startFrom ? getRetryStep(startFrom) : { name: 'form' }));

    const goTo = (nextStep: Step) => {
        setStep(nextStep);
        window.scrollTo({ top: 0 });
    };

    const handleFormSubmit = (request: ValidSupportRequestDraft) => {
        setDraft(request); // Keep answers when going back
        goTo({ name: 'matching', request });
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
                    onRequestSent={onRequestSent}
                />
            )}
        </div>
    );
}
