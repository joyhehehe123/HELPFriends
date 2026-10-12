import './volunteer.css';
import { icons } from './icons';
import type { AvailabilityInfoData, DayKey, TimeSlot, WeeklySchedule } from '../Voluteer';

interface AvailabilityProps {
    availabilityInfo: AvailabilityInfoData;
    setAvailabilityInfo: (info: AvailabilityInfoData) => void;
    onBack?: () => void;
    onNext: () => void;
}

const days: { key: DayKey; letter: string; label: string }[] = [
    { key: 'mon', letter: 'M', label: 'Monday' },
    { key: 'tue', letter: 'T', label: 'Tuesday' },
    { key: 'wed', letter: 'W', label: 'Wednesday' },
    { key: 'thu', letter: 'T', label: 'Thursday' },
    { key: 'fri', letter: 'F', label: 'Friday' },
];

const DEFAULT_SLOT: TimeSlot = { start: '09:00', end: '11:00' };
const LAST_TIME = '23:30';

const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const toTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

const toLabel = (time: string): string => {
    const [hours, minutes] = time.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

// 12:00 AM to 11:30 PM in 30-minute steps
const timeOptions: string[] = Array.from({ length: 48 }, (_, index) => toTime(index * 30));

const optionsHtml = (selected: string): string =>
    timeOptions
        .map((time) => `<option value="${time}"${time === selected ? ' selected' : ''}>${toLabel(time)}</option>`)
        .join('');

const cloneSchedule = (schedule: WeeklySchedule): WeeklySchedule => ({
    mon: schedule.mon.map((slot) => ({ ...slot })),
    tue: schedule.tue.map((slot) => ({ ...slot })),
    wed: schedule.wed.map((slot) => ({ ...slot })),
    thu: schedule.thu.map((slot) => ({ ...slot })),
    fri: schedule.fri.map((slot) => ({ ...slot })),
});

export default function createAvailabilityStep({
    availabilityInfo,
    setAvailabilityInfo,
    onBack,
    onNext,
}: AvailabilityProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'step-container';
    container.innerHTML = `
        <div class="vol-step-header">
            <h2>Set Your Availability</h2>
            <p>Please set your availability weekly</p>
        </div>

        <form class="vol-form">
            <div class="vol-day-list" id="dayList"></div>

            <div class="vol-actions">
                ${onBack ? '<button type="button" class="vol-btn vol-btn--secondary back-button">Back</button>' : '<span></span>'}
                <button type="submit" class="vol-btn vol-btn--primary next-button">Next</button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-button');
    const dayList = container.querySelector<HTMLElement>('#dayList')!;

    const schedule = cloneSchedule(availabilityInfo.schedule);

    const commit = (): void => {
        setAvailabilityInfo({ schedule: cloneSchedule(schedule) });
    };

    const render = (): void => {
        dayList.innerHTML = days.map((day) => {
            const slots = schedule[day.key];

            const body = slots.length === 0
                ? `
                    <div class="vol-unavailable">
                        <span>Unavailable</span>
                        <button type="button" class="vol-icon-btn" data-action="add" data-day="${day.key}" data-index="-1" aria-label="Add availability on ${day.label}">${icons.plusCircle}</button>
                    </div>
                `
                : slots.map((slot, index) => `
                    <div class="vol-slot">
                        <select class="vol-time-select" data-field="start" data-day="${day.key}" data-index="${index}" aria-label="${day.label} start time ${index + 1}">${optionsHtml(slot.start)}</select>
                        <span class="vol-slot-dash" aria-hidden="true"></span>
                        <select class="vol-time-select" data-field="end" data-day="${day.key}" data-index="${index}" aria-label="${day.label} end time ${index + 1}">${optionsHtml(slot.end)}</select>
                        <div class="vol-slot-actions">
                            <button type="button" class="vol-icon-btn" data-action="remove" data-day="${day.key}" data-index="${index}" aria-label="Remove this time on ${day.label}">${icons.close}</button>
                            <button type="button" class="vol-icon-btn" data-action="add" data-day="${day.key}" data-index="${index}" aria-label="Add another time on ${day.label}">${icons.plusCircle}</button>
                            <button type="button" class="vol-icon-btn" data-action="copy" data-day="${day.key}" data-index="${index}" aria-label="Copy ${day.label}'s times to all other days">${icons.copy}</button>
                        </div>
                    </div>
                `).join('');

            return `
                <div class="vol-day-row">
                    <div class="vol-day-badge" title="${day.label}" aria-label="${day.label}">${day.letter}</div>
                    <div class="vol-day-slots">${body}</div>
                </div>
            `;
        }).join('');
    };

    dayList.addEventListener('click', (event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
        if (!button) return;

        const dayKey = button.dataset.day as DayKey;
        const index = Number(button.dataset.index);
        const action = button.dataset.action;
        const dayLabel = days.find((day) => day.key === dayKey)!.label;
        const slots = schedule[dayKey];

        if (action === 'remove') {
            slots.splice(index, 1);
        }

        if (action === 'add') {
            if (slots.length === 0) {
                slots.push({ ...DEFAULT_SLOT });
            } else {
                const previousEnd = toMinutes(slots[index].end);
                if (previousEnd >= toMinutes(LAST_TIME)) {
                    alert(`There is no time left after ${toLabel(slots[index].end)} on ${dayLabel}.`);
                    return;
                }
                const newEnd = Math.min(previousEnd + 120, toMinutes(LAST_TIME));
                slots.splice(index + 1, 0, { start: toTime(previousEnd), end: toTime(newEnd) });
            }
        }

        if (action === 'copy') {
            if (!confirm(`Copy ${dayLabel}'s times to all other days? This replaces their current availability.`)) {
                return;
            }
            const source = slots.map((slot) => ({ ...slot }));
            days.forEach((day) => {
                if (day.key !== dayKey) {
                    schedule[day.key] = source.map((slot) => ({ ...slot }));
                }
            });
        }

        render();
        commit();
    });

    dayList.addEventListener('change', (event) => {
        const select = (event.target as HTMLElement).closest<HTMLSelectElement>('select[data-field]');
        if (!select) return;

        const dayKey = select.dataset.day as DayKey;
        const index = Number(select.dataset.index);
        const field = select.dataset.field as 'start' | 'end';
        schedule[dayKey][index][field] = select.value;
        commit();
    });

    backButton?.addEventListener('click', () => {
        onBack?.();
    });

    render();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const hasAvailability = days.some((day) => schedule[day.key].length > 0);
        if (!hasAvailability) {
            alert('Please add your availability for at least one day.');
            return;
        }

        for (const day of days) {
            const sorted = [...schedule[day.key]].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

            for (let i = 0; i < sorted.length; i++) {
                if (toMinutes(sorted[i].end) <= toMinutes(sorted[i].start)) {
                    alert(`On ${day.label}, the end time must be after the start time.`);
                    return;
                }
                if (i > 0 && toMinutes(sorted[i].start) < toMinutes(sorted[i - 1].end)) {
                    alert(`On ${day.label}, your time slots overlap. Please adjust them.`);
                    return;
                }
            }
        }

        commit();
        onNext();
    });

    return container;
}