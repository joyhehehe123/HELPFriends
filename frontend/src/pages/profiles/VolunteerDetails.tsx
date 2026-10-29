import './Profile.css';
import createProfileLayout from './ProfileLayout';
import { DAYS, profileStore, escapeHtml } from './ProfileData';
import type { DayKey, SupportMode, VolunteerData } from './ProfileData';
import { getCurrentUid } from '../../services/authService';
import { getVolunteer, updateVolunteer } from '../../services/volunteerService';
import type { Day } from '../../types/constants';
import type { Volunteer } from '../../types/volunteer';
import { showDomToast } from '../../components/toast/domToast';

const ICON_PLUS = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>`;
const ICON_X = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;
const ICON_COPY = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>`;
const ICON_PLUS_BIG = `<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 4v16M4 12h16"/></svg>`;
const ICON_MONITOR = `<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="12" rx="2"/><path d="M12 15.5V20M8 20h8"/></svg>`;
const ICON_BUILDING = `<svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="9" height="14" rx="1"/><rect x="12" y="3" width="9" height="18" rx="1"/><path d="M6.5 11h2M6.5 15h2M15.5 7h2M15.5 11h2M15.5 15h2"/></svg>`;

const MAX_SKILL_LENGTH = 30;

const WEEKDAY_NAMES: Record<DayKey, Day> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
};

function clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
}

function toProfileVolunteer(volunteer: Volunteer): VolunteerData {
    const availability: VolunteerData['availability'] = {
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
    };

    volunteer.availability.forEach(({ day, timeSlots }) => {
        const key = DAYS.find((weekday) => weekday.label === day)?.key;
        if (key) availability[key] = clone(timeSlots);
    });

    return {
        active: volunteer.isActive,
        rating: volunteer.rating,
        availability,
        supportModes: volunteer.preferredMode === 'Both'
            ? ['online', 'physical']
            : volunteer.preferredMode === 'Virtual' ? ['online'] : ['physical'],
        skills: [...volunteer.skills],
    };
}

function toPreferredMode(modes: SupportMode[], current: Volunteer['preferredMode']): Volunteer['preferredMode'] {
    if (modes.length === 2) return 'Both';
    if (modes[0] === 'online') return 'Virtual';
    if (modes[0] === 'physical') return 'Physical';
    return current;
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
    let draft: VolunteerData = clone(profileStore.volunteer);
    let savedVolunteer: Volunteer | null = null;
    let profileReady = false;
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
        <section id="registerPrompt" class="profile-card volunteer-register-prompt" hidden>
            <h2>Become a Volunteer</h2>
            <p>Register to support other students and share your skills.</p>
            <button type="button" id="registerButton" class="profile-save-button">Register as a Volunteer</button>
        </section>

        <div id="volunteerDetails" hidden>
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
        </div>
    `;

    const activeToggle = content.querySelector<HTMLInputElement>('#activeToggle')!;
    const sections = content.querySelector<HTMLElement>('.volunteer-sections')!;
    const availabilityEl = content.querySelector<HTMLElement>('#availability')!;
    const supportModesEl = content.querySelector<HTMLElement>('#supportModes')!;
    const skillsEl = content.querySelector<HTMLElement>('#skills')!;
    const saveButton = content.querySelector<HTMLButtonElement>('#saveButton')!;
    const volunteerDetails = content.querySelector<HTMLElement>('#volunteerDetails')!;
    const registerPrompt = content.querySelector<HTMLElement>('#registerPrompt')!;
    const registerButton = content.querySelector<HTMLButtonElement>('#registerButton')!;
    saveButton.disabled = true;
    saveButton.hidden = true;

    const setSaveStatus = (message: string, isError = false) => {
        if (!message) return;
        showDomToast(message, isError ? 'error' : 'success');
    };

    const hasChanges = () => {
        if (!savedVolunteer) return false;
        return JSON.stringify(draft) !== JSON.stringify(toProfileVolunteer(savedVolunteer));
    };

    const updateSaveButtonVisibility = () => {
        const changed = hasChanges();
        saveButton.hidden = !changed;
        saveButton.disabled = !changed;
    };

    registerButton.addEventListener('click', () => navigate('/profile/volunteer-registration'));

    // ----- Activate toggle -----
    const renderActive = () => {
        activeToggle.checked = draft.active;
        sections.classList.toggle('is-inactive', !draft.active);
    };

    activeToggle.addEventListener('change', () => {
        draft.active = activeToggle.checked;
        renderActive();
        updateSaveButtonVisibility();
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
        updateSaveButtonVisibility();
    });

    availabilityEl.addEventListener('change', (event) => {
        const input = event.target as HTMLInputElement;
        if (!input.classList.contains('time-input')) return;

        const slot = draft.availability[input.dataset.day as DayKey][Number(input.dataset.index)];
        if (slot) {
            slot[input.dataset.field as 'start' | 'end'] = input.value;
        }

        updateSaveButtonVisibility();
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
        updateSaveButtonVisibility();
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

        if (draft.skills.some((skill) => skill.toLowerCase() === name.toLowerCase())) {
            showDomToast('You have already added that skill.', 'error');
            return;
        }

        draft.skills.push(name);
        addingSkill = false;
        renderSkills();
        updateSaveButtonVisibility();
    };

    skillsEl.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;

        const removeButton = target.closest<HTMLElement>('[data-skill-remove]');
        if (removeButton) {
            draft.skills.splice(Number(removeButton.dataset.skillRemove), 1);
            renderSkills();
            updateSaveButtonVisibility();
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
            updateSaveButtonVisibility();
        }
    });

    // ----- Save -----
    saveButton.addEventListener('click', async () => {
        if (!profileReady || !savedVolunteer) {
            setSaveStatus('Your volunteer profile is not available to save.', true);
            return;
        }

        if (draft.active && draft.supportModes.length === 0) {
            showDomToast('Please choose at least one support mode (Online or Physical).', 'error');
            return;
        }

        for (const day of DAYS) {
            const slots = [...draft.availability[day.key]].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

            for (let i = 0; i < slots.length; i += 1) {
                if (!slots[i].start || !slots[i].end || toMinutes(slots[i].start) >= toMinutes(slots[i].end)) {
                    showDomToast(`${day.label}: each time slot needs an end time after its start time.`, 'error');
                    return;
                }
                if (i > 0 && toMinutes(slots[i].start) < toMinutes(slots[i - 1].end)) {
                    showDomToast(`${day.label}: time slots can't overlap.`, 'error');
                    return;
                }
            }
        }

        const uid = getCurrentUid();
        if (!uid) {
            setSaveStatus('Unable to save your volunteer profile. Please sign in again.', true);
            return;
        }

        const availability = [
            ...savedVolunteer.availability.filter(
                ({ day }) => !DAYS.some((weekday) => weekday.label === day),
            ),
            ...DAYS.flatMap(({ key }) => draft.availability[key].length > 0
                ? [{
                    day: WEEKDAY_NAMES[key],
                    timeSlots: [...draft.availability[key]]
                        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start)),
                }]
                : []),
        ];
        const preferredMode = toPreferredMode(draft.supportModes, savedVolunteer.preferredMode);
        saveButton.disabled = true;
        setSaveStatus('Saving volunteer profile...');

        try {
            await updateVolunteer(uid, {
                isActive: draft.active,
                preferredMode,
                skills: [...draft.skills],
                availability,
            });
            savedVolunteer = {
                ...savedVolunteer,
                isActive: draft.active,
                preferredMode,
                skills: [...draft.skills],
                availability,
            };
            profileStore.volunteer = clone(draft);
            updateSaveButtonVisibility();
            setSaveStatus('Volunteer details saved.');
        } catch (error) {
            console.error('Failed to save volunteer details:', error);
            setSaveStatus('Unable to save volunteer details. Please try again.', true);
        } finally {
            saveButton.disabled = false;
            updateSaveButtonVisibility();
        }
    });

    renderActive();
    renderAvailability();
    renderSupportModes();
    renderSkills();

    const uid = getCurrentUid();
    if (!uid) {
        setSaveStatus('Unable to load your volunteer profile. Please sign in again.', true);
    } else {
        void getVolunteer(uid)
            .then((volunteer) => {
                if (!volunteer) {
                    volunteerDetails.hidden = true;
                    registerPrompt.hidden = false;
                    setSaveStatus('');
                    return;
                }

                savedVolunteer = volunteer;
                draft = toProfileVolunteer(volunteer);
                profileStore.volunteer = clone(draft);
                profileReady = true;
                registerPrompt.hidden = true;
                volunteerDetails.hidden = false;
                renderActive();
                renderAvailability();
                renderSupportModes();
                renderSkills();
                updateSaveButtonVisibility();

                const rating = draft.rating > 0 ? draft.rating.toFixed(1) : '–';
                const ratingDisplay = content.querySelector<HTMLElement>('.rating-display')!;
                const stars = [0, 1, 2, 3, 4]
                    .map((index) => {
                        const fill = Math.max(0, Math.min(1, draft.rating - index)) * 100;
                        return `<span class="star">★<span class="star-fill" style="width:${fill}%">★</span></span>`;
                    })
                    .join('');
                ratingDisplay.setAttribute('aria-label', `Rating ${rating} out of 5`);
                ratingDisplay.innerHTML = `<span class="stars" aria-hidden="true">${stars}</span><span class="rating-value">${rating}</span>`;
                saveButton.disabled = false;
                setSaveStatus('');
            })
            .catch((error: unknown) => {
                console.error('Failed to load volunteer details:', error);
                volunteerDetails.hidden = true;
                registerPrompt.hidden = true;
                setSaveStatus('Unable to load volunteer details. Please try again later.', true);
            });
    }

    return createProfileLayout({ activeTab: 'volunteer', navigate, content });
}