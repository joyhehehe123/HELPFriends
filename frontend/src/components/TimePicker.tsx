import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { formatTime12h } from '../utils/dateTime';
import './PickerInput.css';
import './TimePicker.css';

interface TimePickerProps {
    id: string;
    value: string; // Format: "HH:mm"
    onChange: (value: string) => void;
    placeholder: string;
    invalid?: boolean;
    describedBy?: string;
}

interface WheelProps {
    id: string;
    label: string;
    options: string[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

type Period = 'AM' | 'PM';

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 30];
const PERIODS: Period[] = ['AM', 'PM'];
const ROW_HEIGHT = 36; // Same as the .time-picker__option height

const twoDigits = (n: number): string => String(n).padStart(2, '0');

const toValue = (hour: number, minute: number, period: Period): string =>
    `${twoDigits((hour % 12) + (period === 'PM' ? 12 : 0))}:${twoDigits(minute)}`;

// Get the next half hour from now, e.g. "15:30" at 3:23 PM
const nextHalfHour = (): string => {
    const now = new Date();
    const minutes = (Math.ceil((now.getHours() * 60 + now.getMinutes()) / 30) * 30) % (24 * 60);
    return `${twoDigits(Math.floor(minutes / 60))}:${twoDigits(minutes % 60)}`;
};

function ClockIcon() {
    return (
        <svg className="picker-input__icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function Wheel({ id, label, options, selectedIndex, onSelect }: WheelProps) {
    const listRef = useRef<HTMLUListElement>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const targetRef = useRef<number | null>(null); // Row the wheel is moving to

    useEffect(() => {
        if (listRef.current && selectedIndex >= 0 && selectedIndex !== targetRef.current) {
            listRef.current.scrollTop = selectedIndex * ROW_HEIGHT;
        }
    }, [selectedIndex]);

    const scrollToIndex = (index: number) => {
        const nextIndex = Math.min(Math.max(index, 0), options.length - 1);
        targetRef.current = nextIndex;
        listRef.current?.scrollTo({ top: nextIndex * ROW_HEIGHT, behavior: 'smooth' });
        if (nextIndex !== selectedIndex) onSelect(nextIndex);
    };

    // Step from the row the wheel is moving to, so quick steps add up
    const scrollByRows = (rows: number) => {
        const current = targetRef.current ?? Math.round((listRef.current?.scrollTop ?? 0) / ROW_HEIGHT);
        scrollToIndex(current + rows);
    };

    // Move one row per mouse wheel notch (a notch scrolls about 3 rows on Windows)
    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const handleWheel = (event: WheelEvent) => {
            if (event.deltaMode === 0 && Math.abs(event.deltaY) < 50) {
                targetRef.current = null; // Let touchpads scroll as usual
                return;
            }
            event.preventDefault();
            scrollByRows(Math.sign(event.deltaY));
        };

        list.addEventListener('wheel', handleWheel, { passive: false });
        return () => list.removeEventListener('wheel', handleWheel);
    });

    // Choose the option in the middle once the wheel stops
    const handleScroll = () => {
        window.clearTimeout(timerRef.current);
        timerRef.current = window.setTimeout(() => {
            const list = listRef.current;
            if (!list) return;
            targetRef.current = null;
            const index = Math.min(Math.max(Math.round(list.scrollTop / ROW_HEIGHT), 0), options.length - 1);
            if (index !== selectedIndex) onSelect(index);
        }, 120);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        scrollByRows(event.key === 'ArrowDown' ? 1 : -1);
    };

    return (
        <ul
            ref={listRef}
            className="time-picker__wheel"
            role="listbox"
            tabIndex={0}
            aria-label={label}
            aria-activedescendant={selectedIndex >= 0 ? `${id}-${selectedIndex}` : undefined}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
        >
            {options.map((option, index) => (
                <li
                    key={option}
                    id={`${id}-${index}`}
                    className="time-picker__option"
                    role="option"
                    aria-selected={index === selectedIndex}
                    onClick={() => scrollToIndex(index)}
                >
                    {option}
                </li>
            ))}
        </ul>
    );
}

export default function TimePicker({ id, value, onChange, placeholder, invalid = false, describedBy }: TimePickerProps) {
    const [open, setOpen] = useState(false);
    const fieldRef = useRef<HTMLInputElement>(null);
    const pickerId = `${id}-picker`;

    const [hours24, minute] = (value || '00:00').split(':').map(Number);
    const hour = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const period: Period = hours24 >= 12 ? 'PM' : 'AM';

    const openPicker = () => {
        if (!value) onChange(nextHalfHour());
        else if (!MINUTES.includes(minute)) onChange(toValue(hour, Math.floor(minute / 30) * 30, period));
        setOpen(true);
    };

    const closePicker = () => {
        setOpen(false);
        fieldRef.current?.focus();
    };

    const handleFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            setOpen(false);
        } else if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
            event.preventDefault(); // Enter would submit the form
            if (open && event.key === 'Enter') setOpen(false);
            else openPicker();
        }
    };

    return (
        <div
            className={invalid ? 'picker-input picker-input--invalid' : 'picker-input'}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
            }}
        >
            <input
                ref={fieldRef}
                id={id}
                className="picker-input__field"
                type="text"
                readOnly
                autoComplete="off"
                value={value ? formatTime12h(value) : ''}
                onClick={() => (open ? setOpen(false) : openPicker())}
                onKeyDown={handleFieldKeyDown}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={open ? pickerId : undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
            />
            <span
                className={value ? 'picker-input__text' : 'picker-input__text picker-input__text--placeholder'}
                aria-hidden="true"
            >
                {value ? formatTime12h(value) : placeholder}
            </span>
            <ClockIcon />

            {open && (
                <div
                    id={pickerId}
                    className="time-picker"
                    role="dialog"
                    aria-label="Choose a time"
                    onMouseDown={(event) => event.preventDefault()} // Keep focus on the field so the picker stays open
                    onKeyDown={(event) => {
                        if (event.key !== 'Escape' && event.key !== 'Enter') return;
                        event.preventDefault();
                        closePicker();
                    }}
                >
                    <span className="time-picker__band" aria-hidden="true" />
                    <Wheel
                        id={`${id}-hour`}
                        label="Hour"
                        options={HOURS.map(twoDigits)}
                        selectedIndex={HOURS.indexOf(hour)}
                        onSelect={(index) => onChange(toValue(HOURS[index], minute, period))}
                    />
                    <Wheel
                        id={`${id}-minute`}
                        label="Minute"
                        options={MINUTES.map(twoDigits)}
                        selectedIndex={MINUTES.indexOf(minute)}
                        onSelect={(index) => onChange(toValue(hour, MINUTES[index], period))}
                    />
                    <Wheel
                        id={`${id}-period`}
                        label="AM or PM"
                        options={PERIODS}
                        selectedIndex={PERIODS.indexOf(period)}
                        onSelect={(index) => onChange(toValue(hour, minute, PERIODS[index]))}
                    />
                </div>
            )}
        </div>
    );
}