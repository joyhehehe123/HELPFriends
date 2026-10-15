import { type MouseEvent } from 'react';
import { formatInputDate, formatTime12h } from '../utils/dateTime';
import './PickerInput.css';

interface PickerInputProps {
    id: string;
    type: 'date' | 'time';
    value: string; // Format: "YYYY-MM-DD" or "HH:mm"
    onChange: (value: string) => void;
    placeholder: string;
    min?: string;
    max?: string;
    invalid?: boolean;
    describedBy?: string;
}

function CalendarIcon() {
    return (
        <svg className="picker-input__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg className="picker-input__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

const openPicker = (event: MouseEvent<HTMLInputElement>) => {
    try {
        event.currentTarget.showPicker();
    } catch {
        // Older browsers: the input still works by typing
    }
};

export default function PickerInput({
    id,
    type,
    value,
    onChange,
    placeholder,
    min,
    max,
    invalid = false,
    describedBy,
}: PickerInputProps) {
    const shownValue = type === 'date' ? formatInputDate(value) : formatTime12h(value);

    return (
        <div className={invalid ? 'picker-input picker-input--invalid' : 'picker-input'}>
            <input
                id={id}
                className="picker-input__field"
                type={type}
                value={value}
                min={min}
                max={max}
                onChange={(event) => onChange(event.target.value)}
                onClick={openPicker}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
            />
            <span
                className={value ? 'picker-input__text' : 'picker-input__text picker-input__text--placeholder'}
                aria-hidden="true"
            >
                {value ? shownValue : placeholder}
            </span>
            {type === 'date' ? <CalendarIcon /> : <ClockIcon />}
        </div>
    );
}
