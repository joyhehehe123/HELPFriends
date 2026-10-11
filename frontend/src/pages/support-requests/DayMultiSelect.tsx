import { useEffect, useId, useRef, useState } from 'react';
import { type DayName } from '../../types/volunteerProfile';
import { shortDayName, WEEK_DAYS } from '../../utils/dateTime';
import './DayMultiSelect.css';

interface DayMultiSelectProps {
    selectedDays: DayName[];
    onChange: (days: DayName[]) => void;
}

function CalendarIcon() {
    return (
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

// Availability filter (Figure 21, 23)
export default function DayMultiSelect({ selectedDays, onChange }: DayMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
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

    const toggleDay = (day: DayName) => {
        const nextDays = selectedDays.includes(day)
            ? selectedDays.filter((selected) => selected !== day)
            : [...selectedDays, day];
        onChange(WEEK_DAYS.filter((weekDay) => nextDays.includes(weekDay))); // Keep Mon-Sun order
    };

    const summary = selectedDays.map(shortDayName).join(', ');

    return (
        <div className="day-select" ref={containerRef}>
            <button
                type="button"
                className={summary ? 'day-select__trigger day-select__trigger--active' : 'day-select__trigger'}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`Availability: ${summary || 'any day'}`}
                onClick={() => setIsOpen((open) => !open)}
            >
                <span className="day-select__value">{summary || 'Availability'}</span>
                <CalendarIcon />
            </button>

            {isOpen && (
                <div id={panelId} className="day-select__panel" role="group" aria-label="Volunteer is available on">
                    {WEEK_DAYS.map((day) => (
                        <label key={day} className="day-select__option">
                            <input
                                type="checkbox"
                                checked={selectedDays.includes(day)}
                                onChange={() => toggleDay(day)}
                            />
                            {day}
                        </label>
                    ))}
                    {selectedDays.length > 0 && (
                        <button type="button" className="day-select__clear" onClick={() => onChange([])}>
                            Clear days
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
