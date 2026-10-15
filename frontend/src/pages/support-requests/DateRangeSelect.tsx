import { useEffect, useId, useRef, useState } from 'react';
import PickerInput from '../../components/PickerInput';
import { formatDayMonth, toDateInputValue } from '../../utils/dateTime';
import './DateRangeSelect.css';

interface DateRange {
    from: string; // Format: "YYYY-MM-DD"
    to: string;
}

interface DateRangeSelectProps extends DateRange {
    onChange: (range: DateRange) => void;
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

// Show the range as "20/10 - 29/10"
const describeRange = ({ from, to }: DateRange): string => {
    if (!from && !to) return '';
    if (!from || !to || from === to) return formatDayMonth(from || to);
    return `${formatDayMonth(from)} - ${formatDayMonth(to)}`;
};

export default function DateRangeSelect({ from, to, onChange }: DateRangeSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [today] = useState(() => toDateInputValue(new Date()));
    const containerRef = useRef<HTMLDivElement>(null);
    const panelId = useId();

    // Close on outside click or Esc
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Keep "from" before "to"
    const changeFrom = (value: string) => onChange({ from: value, to: to && value > to ? value : to });
    const changeTo = (value: string) => onChange({ from: from && value && value < from ? value : from, to: value });

    const summary = describeRange({ from, to });

    return (
        <div className="date-range" ref={containerRef}>
            <button
                type="button"
                className="date-range__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`Availability: ${summary || 'any date'}`}
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="date-range__value">{summary || 'Availability'}</span>
                <CalendarIcon />
            </button>

            {isOpen && (
                <div id={panelId} className="date-range__panel" role="group" aria-label="Volunteer is available between">
                    <label className="date-range__label" htmlFor={`${panelId}-from`}>From</label>
                    <PickerInput
                        id={`${panelId}-from`}
                        type="date"
                        placeholder="Select Date"
                        min={today}
                        value={from}
                        onChange={changeFrom}
                    />
                    <label className="date-range__label" htmlFor={`${panelId}-to`}>To</label>
                    <PickerInput
                        id={`${panelId}-to`}
                        type="date"
                        placeholder="Select Date"
                        min={from || today}
                        value={to}
                        onChange={changeTo}
                    />
                    {(from || to) && (
                        <button type="button" className="date-range__clear" onClick={() => onChange({ from: '', to: '' })}>
                            Clear dates
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
