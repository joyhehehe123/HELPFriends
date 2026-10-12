import './profile.css';
import createProfileLayout from './ProfileLayout';
import { DAYS, profileStore, escapeHtml } from './ProfileData';
import type { DayKey, SupportMode, VolunteerData } from './ProfileData';

const ICON_PLUS = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const ICON_COPY = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`;
const ICON_PLUS_BIG = `<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>`;
const ICON_MONITOR = `<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="12" rx="2"/><path d="M12 15.5V20M8 20h8"/></svg>`;
const ICON_BUILDING = `<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="9" height="14" rx="1"/><rect x="12" y="3" width="9" height="18" rx="1"/><path d="M6.5 11h2M6.5 15h2M15.5 7h2M15.5 11h2M15.5 15h2"/></svg>`;

const MAX_SKILL_LENGTH = 30;

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function toMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function addOneHour(time: string): string {
    const total = Math.min(toMinutes(time) + 60, 23 * 60 + 59);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

interface VolunteerDetailsProps {
    navigate: (path: string) => void;
}

export default function createVolunteerDetailsPage({ navigate }: VolunteerDetailsProps): HTMLElement {
    // Work on a copy; it is only written to the store when the user presses Save.
    const draft: VolunteerData = clone(profileStore.volunteer);
    let copyOpenDay: DayKey | null = null;
    let addingSkill = false;

    const ratingValue = draft.rating > 0 ? draft.rating.toFixed(1) : '–';
    const stars = [0, 1, 2, 3, 4]
        .map((index) => {
            const fill = Math.max(0, Math.min(1, draft.rating - index)) * 100;
            return `<span class="star">★<span class="star-fill" style="width:${fill}%">★</span></span>`;
        })
        .join('');

    const content = document.createElement('div');
    content.className = 'profile-content';
    content.innerHTML = `
        <div class="profile-card profile-card--pill toggle-row">
            <label for="activeToggle">Activate Volunteer Account</label>
            <span class="switch"><input id="activeToggle" type="checkbox" role="switch" /></span>
        </div>

        <div class="profile-card profile-card--pill rating-row">
            <span>My Current Ratings</span>
            <span class="rating-display" aria-label="Rating ${ratingValue} out of 5">
                <span class="stars" aria-hidden="true">${stars}</span>
                <span class="rating-value">${ratingValue}</span>
            </span>
        </div>

        <div class="volunteer-sections">
            <div class="volunteer-grid">
                <section class="profile-section">
                    <h3 class="profile-section-title">Availability</h3>
                    <div id="availability" class="profile-card availability-card"></div>
                </section>

                <section class="profile-section">
                    <h3 class="profile-section-title">Support Mode</h3>
                    <div id="supportModes" class="profile-card mode-card">
                        <button type="button" class="mode-option" data-mode="online">
                            ${ICON_MONITOR}
                            <span class="mode-title">Online</span>
                            <span class="mode-sub">Meet virtually</span>
                        </button>
                        <button type="button" class="mode-option" data-mode="physical">
                            ${ICON_BUILDING}
                            <span class="mode-title">Physical</span>
                            <span class="mode-sub">Meet in person</span>
                        </button>
                    </div>
                </section>
            </div>

            <section class="profile-section">
                <h3 class="profile-section-title">Skills</h3>
                <div id="skills" class="profile-card profile-card--pill skills-card"></div>
            </section>
        </div>

        <div class="profile-actions">
            <button type="button" id="saveButton" class="profile-save-button">Save</button>
        </div>
    `;

    const activeToggle = content.querySelector<HTMLInputElement>('#activeToggle')!;
    const sections = content.querySelector<HTMLElement>('.volunteer-sections')!;
    const availabilityEl = content.querySelector<HTMLElement>('#availability')!;
    const supportModesEl = content.querySelector<HTMLElement>('#supportModes')!;
    const skillsEl = content.querySelector<HTMLElement>('#skills')!;
    const saveButton = content.querySelector<HTMLButtonElement>('#saveButton')!;

    // ----- Activate toggle -----
    const renderActive = () => {
        activeToggle.checked = draft.active;
        sections.classList.toggle('is-inactive', !draft.active);
    };

    activeToggle.addEventListener('change', () => {
        draft.active = activeToggle.checked;
        renderActive();
    });

    // ----- Availability -----
    const renderAvailability = () => {
        availabilityEl.innerHTML = DAYS.map((day) => {
            const slots = draft.availability[day.key];

            const slotRows = slots.length === 0
                ? `<div class="slot-row">
                        <span class="unavailable-text">Unavailable</span>
                        <button type="button" class="icon-btn" data-action="add" data-day="${day.key}" data-index="-1" aria-label="Add a time slot for ${day.label}">${ICON_PLUS}</button>
                   </div>`
                : slots.map((slot, index) => `
                    <div class="slot-row">
                        <input type="time" class="time-input" value="${slot.start}" data-day="${day.key}" data-index="${index}" data-field="start" aria-label="${day.label} start time" />
                        <span class="time-dash" aria-hidden="true"></span>
                        <input type="time" class="time-input" value="${slot.end}" data-day="${day.key}" data-index="${index}" data-field="end" aria-label="${day.label} end time" />
                        <button type="button" class="icon-btn" data-action="remove" data-day="${day.key}" data-index="${index}" aria-label="Remove this time slot">${ICON_X}</button>
                        <button type="button" class="icon-btn" data-action="add" data-day="${day.key}" data-index="${index}" aria-label="Add another time slot for ${day.label}">${ICON_PLUS}</button>
                        <button type="button" class="icon-btn" data-action="copy" data-day="${day.key}" aria-label="Copy ${day.label}'s times to other days">${ICON_COPY}</button>
                    </div>`).join('');

            const popover = copyOpenDay === day.key
                ? `<div class="copy-popover" role="dialog" aria-label="Copy times to other days">
                        <strong>Copy ${day.label}'s times to:</strong>
                        ${DAYS.filter((other) => other.key !== day.key).map((other) => `
                            <label class="copy-option"><input type="checkbox" data-copy-target="${other.key}" /> ${other.label}</label>`).join('')}
                        <div class="copy-actions">
                            <button type="button" class="profile-button profile-button--ghost" data-action="copy-cancel">Cancel</button>
                            <button type="button" class="profile-button" data-action="copy-apply" data-day="${day.key}">Copy</button>
                        </div>
                   </div>`
                : '';

            return `
                <div class="day-row">
                    <span class="day-circle" title="${day.label}">${day.letter}</span>
                    <div class="day-slots">${slotRows}</div>
                    ${popover}
                </div>`;
        }).join('');
    };

    availabilityEl.addEventListener('click', (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action]');
        if (!target) return;

        const action = target.dataset.action;
        const dayKey = target.dataset.day as DayKey | undefined;
        const index = Number(target.dataset.index);

        if (action === 'copy-cancel') {
            copyOpenDay = null;
            renderAvailability();
            return;
        }

        if (!dayKey) return;
        const slots = draft.availability[dayKey];

        if (action === 'add') {
            const last = slots[slots.length - 1];
            const start = last ? last.end : '09:00';
            slots.splice(index + 1, 0, { start, end: addOneHour(start) });
        } else if (action === 'remove') {
            slots.splice(index, 1);
        } else if (action === 'copy') {
            copyOpenDay = copyOpenDay === dayKey ? null : dayKey;
        } else if (action === 'copy-apply') {
            const popover = target.closest('.copy-popover')!;
            popover.querySelectorAll<HTMLInputElement>('input[data-copy-target]:checked').forEach((checkbox) => {
                draft.availability[checkbox.dataset.copyTarget as DayKey] = clone(slots);
            });
            copyOpenDay = null;
        }

        renderAvailability();
    });

    availabilityEl.addEventListener('change', (event) => {
        const input = event.target as HTMLInputElement;
        if (!input.classList.contains('time-input')) return;

        const slot = draft.availability[input.dataset.day as DayKey][Number(input.dataset.index)];
        if (slot) {
            slot[input.dataset.field as 'start' | 'end'] = input.value;
        }
    });

    // ----- Support mode -----
    const renderSupportModes = () => {
        supportModesEl.querySelectorAll<HTMLButtonElement>('.mode-option').forEach((button) => {
            const selected = draft.supportModes.includes(button.dataset.mode as SupportMode);
            button.setAttribute('aria-pressed', String(selected));
        });
    };

    supportModesEl.addEventListener('click', (event) => {
        const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.mode-option');
        if (!button) return;

        const mode = button.dataset.mode as SupportMode;
        draft.supportModes = draft.supportModes.includes(mode)
            ? draft.supportModes.filter((existing) => existing !== mode)
            : [...draft.supportModes, mode];
        renderSupportModes();
    });

    // ----- Skills -----
    const renderSkills = () => {
        const chips = draft.skills.map((skill, index) => `
            <span class="skill-chip">
                <button type="button" class="skill-remove" data-skill-remove="${index}" aria-label="Remove ${escapeHtml(skill)}">${ICON_X}</button>
                ${escapeHtml(skill)}
            </span>`).join('');

        skillsEl.innerHTML = `
            <div class="skills-list">
                ${chips}
                ${addingSkill ? `<input id="skillInput" class="skill-input" type="text" maxlength="${MAX_SKILL_LENGTH}" placeholder="Type a skill, press Enter" />` : ''}
            </div>
            <button type="button" class="skill-add" data-action="skill-add" aria-label="Add a skill">${ICON_PLUS_BIG}</button>
        `;

        if (addingSkill) {
            skillsEl.querySelector<HTMLInputElement>('#skillInput')?.focus();
        }
    };

    const commitSkill = () => {
        const input = skillsEl.querySelector<HTMLInputElement>('#skillInput');
        const name = input?.value.trim() ?? '';
        if (!name) {
            addingSkill = false;
            renderSkills();
            return;
        }

        // TODO (API): you may want to pick from a predefined skills list instead of free text.
        if (draft.skills.some((skill) => skill.toLowerCase() === name.toLowerCase())) {
            alert('You have already added that skill.');
            return;
        }

        draft.skills.push(name);
        addingSkill = false;
        renderSkills();
    };

    skillsEl.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        const removeButton = target.closest<HTMLElement>('[data-skill-remove]');
        if (removeButton) {
            draft.skills.splice(Number(removeButton.dataset.skillRemove), 1);
            renderSkills();
            return;
        }

        if (target.closest('[data-action="skill-add"]')) {
            if (addingSkill) {
                commitSkill();
            } else {
                addingSkill = true;
                renderSkills();
            }
        }
    });

    skillsEl.addEventListener('keydown', (event) => {
        if (!(event.target as HTMLElement).matches('#skillInput')) return;

        if (event.key === 'Enter') {
            event.preventDefault();
            commitSkill();
        } else if (event.key === 'Escape') {
            addingSkill = false;
            renderSkills();
        }
    });

    // ----- Save -----
    saveButton.addEventListener('click', () => {
        if (draft.active && draft.supportModes.length === 0) {
            alert('Please choose at least one support mode (Online or Physical).');
            return;
        }

        for (const day of DAYS) {
            const slots = [...draft.availability[day.key]].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

            for (let i = 0; i < slots.length; i += 1) {
                if (!slots[i].start || !slots[i].end || toMinutes(slots[i].start) >= toMinutes(slots[i].end)) {
                    alert(`${day.label}: each time slot needs an end time after its start time.`);
                    return;
                }
                if (i > 0 && toMinutes(slots[i].start) < toMinutes(slots[i - 1].end)) {
                    alert(`${day.label}: time slots can't overlap.`);
                    return;
                }
            }
        }

        // TODO (API): send the draft to the backend here.
        profileStore.volunteer = { ...clone(draft), rating: profileStore.volunteer.rating };
        alert('Volunteer details saved.');
    });

    renderActive();
    renderAvailability();
    renderSupportModes();
    renderSkills();

    return createProfileLayout({ activeTab: 'volunteer', navigate, content });
}