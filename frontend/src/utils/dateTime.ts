import { type DayAvailability, type DayName } from '../types/volunteerProfile';

// ───────────────────────────────────── Days ──────────────────────────────────────

export const WEEK_DAYS: DayName[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// getDay() starts from Sunday
const DAYS_BY_JS_INDEX: DayName[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getDayName = (date: Date): DayName => DAYS_BY_JS_INDEX[date.getDay()];

export const shortDayName = (day: DayName): string => day.slice(0, 3);

// ───────────────────────────────────── Times ─────────────────────────────────────

// "13:30" -> "1:30 PM"
export const formatTime12h = (time: string): string => {
    const [hourText, minutes] = time.split(':');
    const hour = Number(hourText);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minutes} ${suffix}`;
};

export const formatTimeRange = (start: string, end: string): string =>
    `${formatTime12h(start)} - ${formatTime12h(end)}`;

// ───────────────────────────────────── Dates ─────────────────────────────────────

// Local date for <input type="date"> (toISOString uses UTC)
export const toDateInputValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Returns null if date or time is empty
export const combineDateAndTime = (date: string, time: string): Date | null => {
    if (!date || !time) return null;
    const result = new Date(`${date}T${time}`);
    return Number.isNaN(result.getTime()) ? null : result;
};

// "Tue, 20 Oct 2026"
export const formatLongDate = (date: Date): string =>
    date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

// "Tue 20 Oct"
export const formatDayAndDate = (date: Date): string =>
    date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// "20/10/2026"
export const formatShortDate = (date: Date): string => date.toLocaleDateString('en-GB');

// "Tue, 20 Oct 2026, 1:00 PM"
export const formatDateTime = (date: string, time: string): string => {
    const dateTime = combineDateAndTime(date, time);
    return dateTime ? `${formatLongDate(dateTime)}, ${formatTime12h(time)}` : `${date} ${time}`;
};

// ───────────────────────────────── Availability ──────────────────────────────────

// Monday to Sunday, skips days with no time slots
export const sortAvailability = (availability: DayAvailability[]): DayAvailability[] =>
    availability
        .filter((entry) => entry.timeSlots.length > 0)
        .sort((a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day));

// "Mon 10:00 AM - 11:30 AM, Wed 9:00 AM - 12:00 PM"
export const summariseAvailability = (availability: DayAvailability[]): string =>
    sortAvailability(availability)
        .flatMap((entry) =>
            entry.timeSlots.map((slot) => `${shortDayName(entry.day)} ${formatTimeRange(slot.start, slot.end)}`))
        .join(', ');
