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

// Local time for <input type="time">
export const toTimeInputValue = (date: Date): string =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

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

// "2026-10-20" -> "20/10/2026"
export const formatInputDate = (value: string): string => {
    const [year, month, day] = value.split('-');
    return year && month && day ? `${day}/${month}/${year}` : value;
};

// "2026-10-20" -> "20/10"
export const formatDayMonth = (value: string): string => formatInputDate(value).slice(0, 5);

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

// "1:00 PM"
export const formatClockTime = (date: Date): string => formatTime12h(toTimeInputValue(date));

// "16/09/2026 (Wed)"
export const formatDateWithDay = (date: Date): string =>
    `${formatShortDate(date)} (${date.toLocaleDateString('en-GB', { weekday: 'short' })})`;

// "Wed 16/09/2026 1:00 PM"
export const formatDayDateTime = (date: Date): string =>
    `${date.toLocaleDateString('en-GB', { weekday: 'short' })} ${formatShortDate(date)} ${formatClockTime(date)}`;

// "Wed, 16/09/2026 1:00 PM"
export const formatSlot = (date: Date): string => {
    const day = date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${day} ${formatClockTime(date)}`;
};

// 30 -> "30 minutes", 90 -> "1 hour 30 minutes", 120 -> "2 hours"
export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    const hourText = hours === 1 ? '1 hour' : `${hours} hours`;
    const minuteText = `${rest} minutes`;
    if (hours === 0) return minuteText;
    return rest === 0 ? hourText : `${hourText} ${minuteText}`;
};

// Days of the week from one "YYYY-MM-DD" date to another (only one date = that day)
export const getDaysInRange = (from: string, to: string): DayName[] => {
    const start = combineDateAndTime(from || to, '00:00');
    const end = combineDateAndTime(to || from, '00:00');
    if (!start || !end || end < start) return [];

    const days = new Set<DayName>();
    for (const date = new Date(start); date <= end && days.size < 7; date.setDate(date.getDate() + 1)) {
        days.add(getDayName(date));
    }
    return WEEK_DAYS.filter((day) => days.has(day));
};

// ───────────────────────────────── Availability ──────────────────────────────────

// Monday to Sunday, skips days with no time slots
export const sortAvailability = (availability: DayAvailability[]): DayAvailability[] =>
    availability
        .filter((entry) => entry.timeSlots.length > 0)
        .sort((a, b) => WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day));

// "Mon 10:00 AM - 11:30 AM, 3:00 PM - 4:00 PM, Wed 9:00 AM - 12:00 PM"
export const summariseAvailability = (availability: DayAvailability[]): string =>
    sortAvailability(availability)
        .map((entry) => {
            const times = entry.timeSlots.map((slot) => formatTimeRange(slot.start, slot.end)).join(', ');
            return `${shortDayName(entry.day)} ${times}`;
        })
        .join(', ');
