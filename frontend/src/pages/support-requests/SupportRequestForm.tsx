import { useState, type FormEvent } from 'react';
import Button from '../../components/Button';
import PickerInput from '../../components/PickerInput';
import { toDateInputValue } from '../../utils/dateTime';
import { MAX_TIME_SLOTS, SUPPORT_CATEGORIES, SUPPORT_MODES } from './constants';
import { type ProposedSlotInput, type SupportRequestDraft, type ValidSupportRequestDraft } from './types';
import { hasErrors, validateSupportRequest, type SupportRequestErrors } from './validateSupportRequest';
import './SupportRequestForm.css';

interface SupportRequestFormProps {
    initialDraft: SupportRequestDraft;
    onSubmit: (request: ValidSupportRequestDraft) => void;
}

let slotCounter = 0;

const createSlot = (): ProposedSlotInput => {
    slotCounter += 1;
    return { id: `slot-${slotCounter}`, date: '', time: '' };
};

// Find the first field with an error
const getFirstErrorFieldId = (errors: SupportRequestErrors, draft: SupportRequestDraft): string | null => {
    if (errors.category) return 'category-0';
    if (errors.supportTitle) return 'support-title';
    if (errors.description) return 'support-description';

    const slotWithError = draft.proposedTimeSlots.find((slot) => errors.slots?.[slot.id]);
    if (slotWithError) {
        const isOnlyTimeMissing = slotWithError.date !== '' && slotWithError.time === '';
        return isOnlyTimeMissing ? `slot-time-${slotWithError.id}` : `slot-date-${slotWithError.id}`;
    }

    if (errors.proposedTimeSlots) return 'add-time-slot';
    if (errors.supportMode) return 'mode-0';
    return null;
};

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;
    return <p id={id} className="support-form__error">{message}</p>;
}

export default function SupportRequestForm({ initialDraft, onSubmit }: SupportRequestFormProps) {
    const [draft, setDraft] = useState<SupportRequestDraft>(initialDraft);
    const [showErrors, setShowErrors] = useState(false);
    const [today] = useState(() => toDateInputValue(new Date())); // Min date for the date picker

    // Show errors only after the first submit
    const errors: SupportRequestErrors = showErrors ? validateSupportRequest(draft) : {};
    const canAddSlot = draft.proposedTimeSlots.length < MAX_TIME_SLOTS;

    const updateField = <Field extends keyof SupportRequestDraft>(field: Field, value: SupportRequestDraft[Field]) => {
        setDraft((current) => ({ ...current, [field]: value }));
    };

    const updateSlot = (slotId: string, part: 'date' | 'time', value: string) => {
        setDraft((current) => ({
            ...current,
            proposedTimeSlots: current.proposedTimeSlots.map((slot) =>
                slot.id === slotId ? { ...slot, [part]: value } : slot),
        }));
    };

    const addSlot = () => {
        if (!canAddSlot) return;
        const newSlot = createSlot();
        setDraft((current) => ({ ...current, proposedTimeSlots: [...current.proposedTimeSlots, newSlot] }));
        requestAnimationFrame(() => document.getElementById(`slot-date-${newSlot.id}`)?.focus());
    };

    const removeSlot = (slotId: string) => {
        setDraft((current) => ({
            ...current,
            proposedTimeSlots: current.proposedTimeSlots.filter((slot) => slot.id !== slotId),
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const validationErrors = validateSupportRequest(draft);

        if (hasErrors(validationErrors) || !draft.category || !draft.supportMode) {
            setShowErrors(true);
            const fieldId = getFirstErrorFieldId(validationErrors, draft);
            if (fieldId) document.getElementById(fieldId)?.focus();
            return;
        }

        onSubmit({
            ...draft,
            category: draft.category,
            supportMode: draft.supportMode,
            supportTitle: draft.supportTitle.trim(),
            description: draft.description.trim(),
        });
    };

    return (
        <main className="request-support__body">
            <h1 className="visually-hidden">Request a Support</h1>

            <form className="support-form" onSubmit={handleSubmit} noValidate>
                <fieldset
                    className="support-form__group"
                    aria-describedby={errors.category ? 'category-error' : undefined}
                >
                    <legend className="support-form__label">Support Category</legend>
                    <div className="choice-grid choice-grid--4">
                        {SUPPORT_CATEGORIES.map((category, index) => (
                            <label key={category} className="choice">
                                <input
                                    id={`category-${index}`}
                                    className="choice__input"
                                    type="radio"
                                    name="support-category"
                                    value={category}
                                    checked={draft.category === category}
                                    onChange={() => updateField('category', category)}
                                />
                                <span className="choice__label"><span>{category}</span></span>
                            </label>
                        ))}
                    </div>
                    <FieldError id="category-error" message={errors.category} />
                </fieldset>

                <div className="support-form__group">
                    <label htmlFor="support-title" className="support-form__label">Title</label>
                    <input
                        id="support-title"
                        className="support-form__input"
                        type="text"
                        placeholder="Enter your support title"
                        autoComplete="off"
                        value={draft.supportTitle}
                        onChange={(event) => updateField('supportTitle', event.target.value)}
                        aria-invalid={errors.supportTitle ? true : undefined}
                        aria-describedby={errors.supportTitle ? 'title-error' : undefined}
                    />
                    <FieldError id="title-error" message={errors.supportTitle} />
                </div>

                <div className="support-form__group">
                    <label htmlFor="support-description" className="support-form__label">Description</label>
                    <textarea
                        id="support-description"
                        className="support-form__input support-form__textarea"
                        placeholder="Enter your support description"
                        rows={2}
                        value={draft.description}
                        onChange={(event) => updateField('description', event.target.value)}
                        aria-invalid={errors.description ? true : undefined}
                        aria-describedby={errors.description ? 'description-error' : undefined}
                    />
                    <FieldError id="description-error" message={errors.description} />
                </div>

                <fieldset className="support-form__group">
                    <legend className="support-form__label">Preferred Dates &amp; Times</legend>
                    <ul className="slot-list">
                        {draft.proposedTimeSlots.map((slot, index) => {
                            const slotError = errors.slots?.[slot.id];
                            const errorId = `slot-error-${slot.id}`;
                            return (
                                <li key={slot.id}>
                                    <div className="slot-list__row">
                                        <label className="visually-hidden" htmlFor={`slot-date-${slot.id}`}>
                                            Preferred date {index + 1}
                                        </label>
                                        <PickerInput
                                            id={`slot-date-${slot.id}`}
                                            type="date"
                                            placeholder="Select Date"
                                            min={today}
                                            value={slot.date}
                                            onChange={(value) => updateSlot(slot.id, 'date', value)}
                                            invalid={Boolean(slotError)}
                                            describedBy={slotError ? errorId : undefined}
                                        />
                                        <label className="visually-hidden" htmlFor={`slot-time-${slot.id}`}>
                                            Preferred time {index + 1}
                                        </label>
                                        <PickerInput
                                            id={`slot-time-${slot.id}`}
                                            type="time"
                                            placeholder="Select Time"
                                            value={slot.time}
                                            onChange={(value) => updateSlot(slot.id, 'time', value)}
                                            invalid={Boolean(slotError)}
                                            describedBy={slotError ? errorId : undefined}
                                        />
                                        {draft.proposedTimeSlots.length > 1 && (
                                            <button
                                                type="button"
                                                className="slot-list__remove"
                                                onClick={() => removeSlot(slot.id)}
                                                aria-label={`Remove preferred date and time ${index + 1}`}
                                            >
                                                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                                                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor"
                                                        strokeWidth="2.2" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <FieldError id={errorId} message={slotError} />
                                </li>
                            );
                        })}
                    </ul>

                    {canAddSlot && (
                        <button
                            id="add-time-slot"
                            type="button"
                            className="slot-list__add"
                            onClick={addSlot}
                            aria-label={`Add another preferred date and time (up to ${MAX_TIME_SLOTS})`}
                        >
                            <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                                <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                            </svg>
                        </button>
                    )}
                    <FieldError id="slots-error" message={errors.proposedTimeSlots} />
                </fieldset>

                <fieldset
                    className="support-form__group"
                    aria-describedby={errors.supportMode ? 'mode-error' : undefined}
                >
                    <legend className="support-form__label">Support Mode</legend>
                    <div className="choice-grid choice-grid--2">
                        {SUPPORT_MODES.map((mode, index) => (
                            <label key={mode} className="choice">
                                <input
                                    id={`mode-${index}`}
                                    className="choice__input"
                                    type="radio"
                                    name="support-mode"
                                    value={mode}
                                    checked={draft.supportMode === mode}
                                    onChange={() => updateField('supportMode', mode)}
                                />
                                <span className="choice__label"><span>{mode}</span></span>
                            </label>
                        ))}
                    </div>
                    <FieldError id="mode-error" message={errors.supportMode} />
                </fieldset>

                <Button type="submit" fullWidth className="support-form__submit">Submit</Button>
            </form>
        </main>
    );
}
