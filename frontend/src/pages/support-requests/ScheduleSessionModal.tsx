import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { formatDuration, formatSlot } from '../../utils/dateTime';
import { DEFAULT_DURATION_MINUTES } from './constants';
import { fetchFreeTimeSlots, scheduleSession } from './supportRequestApi';
import { type SupportRequestRecord } from './types';
import './ScheduleSessionModal.css';

interface ScheduleSessionModalProps {
    request: SupportRequestRecord;
    otherName: string;
    onClose: () => void;
    onScheduled: (request: SupportRequestRecord) => void;
}

type LoadStatus = 'loading' | 'error' | 'ready';

export default function ScheduleSessionModal({ request, otherName, onClose, onScheduled }: ScheduleSessionModalProps) {
    const [freeSlots, setFreeSlots] = useState<Date[]>([]);
    const [status, setStatus] = useState<LoadStatus>('loading');
    const [reloadCount, setReloadCount] = useState(0);
    const [pickedTime, setPickedTime] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState('');

    const titleId = `schedule-${request.requestId}-title`;
    const hiddenCount = request.proposedTimeSlots.length - freeSlots.length;

    useEffect(() => {
        let isLatestLoad = true;
        fetchFreeTimeSlots(request)
            .then((slots) => {
                if (!isLatestLoad) return;
                setFreeSlots(slots);
                setStatus('ready');
            })
            .catch((error) => {
                console.error('Error checking free times: ', error);
                if (isLatestLoad) setStatus('error');
            });
        return () => {
            isLatestLoad = false;
        };
    }, [request, reloadCount]);

    const retryLoading = () => {
        setStatus('loading');
        setReloadCount((count) => count + 1);
    };

    const confirm = async () => {
        if (pickedTime === null) return;
        setIsSaving(true);
        setSaveError('');
        try {
            onScheduled(await scheduleSession(request.requestId, new Date(pickedTime)));
        } catch (error) {
            console.error('Error scheduling session: ', error);
            setSaveError("We couldn't schedule this session. Please try again.");
            setIsSaving(false);
        }
    };

    return (
        <Modal labelledBy={titleId} onClose={onClose} dismissible={!isSaving} className="schedule-modal">
            <h2 id={titleId} className="schedule-modal__title">Schedule Session</h2>
            <p className="schedule-modal__subtitle">{request.supportTitle} with {otherName}</p>

            {status === 'loading' && (
                <p className="schedule-modal__status" role="status">Checking which times are still free...</p>
            )}

            {status === 'error' && (
                <p className="schedule-modal__error" role="alert">We couldn't check the times. Please try again.</p>
            )}

            {status === 'ready' && freeSlots.length === 0 && (
                <p className="schedule-modal__status">
                    None of the proposed times are free anymore. You can cancel this request and send a new one.
                </p>
            )}

            {status === 'ready' && freeSlots.length > 0 && (
                <fieldset className="schedule-modal__times">
                    <legend className="schedule-modal__label">
                        Pick a time ({formatDuration(DEFAULT_DURATION_MINUTES)})
                    </legend>
                    {freeSlots.map((slot) => (
                        <label key={slot.getTime()} className="schedule-option">
                            <input
                                type="radio"
                                name="session-time"
                                className="schedule-option__input"
                                checked={pickedTime === slot.getTime()}
                                onChange={() => setPickedTime(slot.getTime())}
                                disabled={isSaving}
                            />
                            <span className="schedule-option__label">{formatSlot(slot)}</span>
                        </label>
                    ))}
                    {hiddenCount > 0 && (
                        <p className="schedule-modal__note">Times that have passed or are already booked are not shown.</p>
                    )}
                </fieldset>
            )}

            {saveError && <p className="schedule-modal__error" role="alert">{saveError}</p>}

            <div className="schedule-modal__actions">
                <Button size="sm" variant="outline" shape="pill" onClick={onClose} disabled={isSaving}>Cancel</Button>
                {status === 'error' ? (
                    <Button size="sm" shape="pill" onClick={retryLoading}>Try again</Button>
                ) : (
                    <Button size="sm" shape="pill" onClick={confirm} disabled={pickedTime === null || isSaving}>
                        {isSaving ? 'Scheduling...' : 'Confirm'}
                    </Button>
                )}
            </div>
        </Modal>
    );
}