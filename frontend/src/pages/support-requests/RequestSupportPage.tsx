import { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { toDateInputValue, toTimeInputValue } from '../../utils/dateTime';
import { createEmptyDraft, REQUEST_FORM_PATH, VOLUNTEER_MATCHING_PATH } from './constants';
import SupportRequestForm from './SupportRequestForm';
import { type SupportRequestDraft, type SupportRequestRecord, type ValidSupportRequestDraft } from './types';
import useCurrentUserId from './useCurrentUserId';
import VolunteerMatching from './VolunteerMatching';
import './RequestSupportPage.css';

interface RequestSupportPageProps {
    visitKey: string; // Same for the form and matching, so the answers are kept
    startFrom?: SupportRequestRecord; // Rejected request to send again
    onRequestSent: (record: SupportRequestRecord) => void;
}

// Copy a sent request back into the form, without past times
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

// Go straight to matching if all proposed times are still ahead
const getRetryRequest = (record: SupportRequestRecord): ValidSupportRequestDraft | null => {
    const allTimesAhead = record.proposedTimeSlots.every((slot) => slot.getTime() > Date.now());
    return allTimesAhead ? toDraft(record) : null;
};

export default function RequestSupportPage({ visitKey, startFrom, onRequestSent }: RequestSupportPageProps) {
    const navigate = useNavigate();
    const currentUserId = useCurrentUserId();
    const [draft, setDraft] = useState<SupportRequestDraft>(() => (startFrom ? toDraft(startFrom) : createEmptyDraft()));
    const [request, setRequest] = useState(() => (startFrom ? getRetryRequest(startFrom) : null));
    const [cameFromForm, setCameFromForm] = useState(false);

    const handleFormSubmit = (submitted: ValidSupportRequestDraft) => {
        setDraft(submitted); // Keep answers when going back
        setRequest(submitted);
        setCameFromForm(true);
        navigate(VOLUNTEER_MATCHING_PATH, { state: { visitKey } });
    };

    // Go back in history after the form, else open the form
    const backToForm = () => {
        if (cameFromForm) navigate(-1);
        else navigate(REQUEST_FORM_PATH, { replace: true, state: { visitKey } });
    };

    return (
        <div className="request-support request-support--flow">
            <Routes>
                <Route index element={<SupportRequestForm initialDraft={draft} onSubmit={handleFormSubmit} />} />
                <Route
                    path="volunteer-matching"
                    element={request ? (
                        <VolunteerMatching
                            request={request}
                            currentUserId={currentUserId}
                            onBack={backToForm}
                            onRequestSent={onRequestSent}
                        />
                    ) : (
                        <Navigate to={REQUEST_FORM_PATH} replace state={{ visitKey }} />
                    )}
                />
                <Route path="*" element={<Navigate to={REQUEST_FORM_PATH} replace />} />
            </Routes>
        </div>
    );
}