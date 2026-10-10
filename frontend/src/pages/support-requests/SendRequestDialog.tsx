import { useState } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { type VolunteerProfile } from '../../types/volunteerProfile';
import RequestSummary from './RequestSummary';
import { submitSupportRequest } from './supportRequestApi';
import { type ValidSupportRequestDraft } from './types';
import './SendRequestDialog.css';

interface SendRequestDialogProps {
    request: ValidSupportRequestDraft;
    volunteer: VolunteerProfile;
    onCancel: () => void;
    onSent: (sentAt: Date) => void;
}

// Confirm before sending
export default function SendRequestDialog({ request, volunteer, onCancel, onSent }: SendRequestDialogProps) {
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async () => {
        setIsSending(true);
        setErrorMessage('');
        try {
            await submitSupportRequest(request, volunteer);
            onSent(new Date());
        } catch (error) {
            console.error('Error sending support request: ', error);
            setErrorMessage("We couldn't send your request. Please try again.");
            setIsSending(false);
        }
    };

    return (
        <Modal labelledBy="send-request-title" onClose={onCancel} dismissible={!isSending} className="send-request">
            <h2 id="send-request-title" className="send-request__title">
                Send your request to {volunteer.fullName}?
            </h2>
            <p className="send-request__text">
                {volunteer.fullName} will be notified and can accept or reject it.
                You can follow its status under Support Requests.
            </p>

            <RequestSummary request={request} />

            {errorMessage && <p className="send-request__error" role="alert">{errorMessage}</p>}

            <div className="send-request__actions">
                <Button size="sm" variant="outline" onClick={onCancel} disabled={isSending}>Cancel</Button>
                <Button size="sm" onClick={handleSend} disabled={isSending}>
                    {isSending ? 'Sending...' : 'Send request'}
                </Button>
            </div>
        </Modal>
    );
}
