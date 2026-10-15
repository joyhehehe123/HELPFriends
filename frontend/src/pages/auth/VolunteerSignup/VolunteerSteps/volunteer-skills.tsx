import './volunteer.css';
import '../../auth-feedback.css';
import { createAuthFeedback } from '../../auth-feedback';
import { icons } from './icons';
import {
    CATEGORY_LABELS,
    SKILL_CATALOGUE,
    getAvailableSkills,
} from '../Voluteer';
import type { SkillsInfoData, SupportCategory } from '../Voluteer';

interface SkillsProps {
    /** Categories chosen in step 1 – decides which skills are shown. */
    categories: SupportCategory[];
    skillsInfo: SkillsInfoData;
    setSkillsInfo: (info: SkillsInfoData) => void;
    onBack?: () => void;
    onNext: () => void;
}

const MAX_CUSTOM_SKILLS = 5;
const MAX_CUSTOM_LENGTH = 40;

const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function createSkillsStep({
    categories,
    skillsInfo,
    setSkillsInfo,
    onBack,
    onNext,
}: SkillsProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'step-container';

    const availableSkills = getAvailableSkills(categories);
    const showGroupTitles = categories.length > 1;

    const groupsHtml = categories.map((category) => `
        ${showGroupTitles ? `<p class="vol-chip-group-title">${CATEGORY_LABELS[category]}</p>` : ''}
        ${SKILL_CATALOGUE[category].map((skill) => `
            <button type="button" class="vol-chip" data-skill="${escapeHtml(skill)}" aria-pressed="false">${escapeHtml(skill)}</button>
        `).join('')}
    `).join('');

    container.innerHTML = `
        <div class="vol-step-header">
            <h2>Set Your Skills Specification</h2>
            <p>Select the skills you can provide support in.</p>
        </div>

        <form class="vol-form">
            <div class="vol-chip-grid">
                ${groupsHtml}
                <button type="button" class="vol-chip vol-chip--wide" id="othersChip" aria-pressed="false" aria-controls="customPanel">Others</button>

                <div class="vol-custom-panel" id="customPanel" hidden>
                    <div class="vol-custom-input-row">
                        <input id="customSkillInput" type="text" maxlength="${MAX_CUSTOM_LENGTH}" placeholder="e.g., Public Speaking" aria-label="Add your own skill" />
                        <button type="button" class="vol-btn vol-btn--secondary" id="addCustomSkill">Add</button>
                    </div>
                    <p class="vol-hint">Add up to ${MAX_CUSTOM_SKILLS} skills that are not listed above.</p>
                    <div class="vol-custom-list" id="customList"></div>
                </div>
            </div>

            <div class="vol-actions">
                ${onBack ? '<button type="button" class="vol-btn vol-btn--secondary back-button">Back</button>' : '<span></span>'}
                <button type="submit" class="vol-btn vol-btn--primary next-button">Next</button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-button');
    const chips = Array.from(container.querySelectorAll<HTMLButtonElement>('.vol-chip[data-skill]'));
    const othersChip = container.querySelector<HTMLButtonElement>('#othersChip')!;
    const customPanel = container.querySelector<HTMLElement>('#customPanel')!;
    const customInput = container.querySelector<HTMLInputElement>('#customSkillInput')!;
    const addCustomButton = container.querySelector<HTMLButtonElement>('#addCustomSkill')!;
    const customList = container.querySelector<HTMLElement>('#customList')!;
    const showFeedback = createAuthFeedback(form);

    // Drop any skill that no longer belongs to the chosen categories (user went back and changed them).
    const selected = new Set<string>(skillsInfo.selectedSkills.filter((skill) => availableSkills.includes(skill)));
    const customSkills: string[] = [...skillsInfo.customSkills];
    let othersOpen = customSkills.length > 0;

    const commit = (): void => {
        setSkillsInfo({
            selectedSkills: availableSkills.filter((skill) => selected.has(skill)),
            customSkills: [...customSkills],
        });
    };

    const renderCustomList = (): void => {
        customList.innerHTML = customSkills.map((skill, index) => `
            <div class="vol-chip vol-chip--custom is-selected">
                <span>${escapeHtml(skill)}</span>
                <button type="button" data-remove="${index}" aria-label="Remove ${escapeHtml(skill)}">${icons.close}</button>
            </div>
        `).join('');
    };

    const sync = (): void => {
        chips.forEach((chip) => {
            const isSelected = selected.has(chip.dataset.skill!);
            chip.classList.toggle('is-selected', isSelected);
            chip.setAttribute('aria-pressed', String(isSelected));
        });
        othersChip.classList.toggle('is-selected', othersOpen);
        othersChip.setAttribute('aria-pressed', String(othersOpen));
        customPanel.hidden = !othersOpen;
        renderCustomList();
    };

    const addCustomSkill = (): boolean => {
        const value = customInput.value.trim().replace(/\s+/g, ' ');
        if (!value) return false;

        const exists = [...availableSkills, ...customSkills].some((skill) => skill.toLowerCase() === value.toLowerCase());
        if (exists) {
            showFeedback(`"${value}" is already in your list.`);
            return false;
        }
        if (customSkills.length >= MAX_CUSTOM_SKILLS) {
            showFeedback(`You can add up to ${MAX_CUSTOM_SKILLS} extra skills.`);
            return false;
        }

        showFeedback('');
        customSkills.push(value);
        customInput.value = '';
        sync();
        commit();
        return true;
    };

    chips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const skill = chip.dataset.skill!;
            if (selected.has(skill)) {
                selected.delete(skill);
            } else {
                selected.add(skill);
            }
            sync();
            commit();
            showFeedback('');
        });
    });

    othersChip.addEventListener('click', () => {
        othersOpen = !othersOpen;
        sync();
        if (othersOpen) customInput.focus();
    });

    addCustomButton.addEventListener('click', () => {
        addCustomSkill();
        customInput.focus();
    });

    customInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addCustomSkill();
        }
    });

    customList.addEventListener('click', (event) => {
        const removeButton = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-remove]');
        if (!removeButton) return;
        customSkills.splice(Number(removeButton.dataset.remove), 1);
        sync();
        commit();
    });

    backButton?.addEventListener('click', () => {
        onBack?.();
    });

    sync();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // If the user typed a skill but forgot to press Add, include it.
        if (othersOpen && customInput.value.trim()) {
            addCustomSkill();
        }

        if (selected.size === 0 && customSkills.length === 0) {
            showFeedback('Please select at least one skill, or add your own under "Others".');
            return;
        }

        showFeedback('');
        commit();
        onNext();
    });

    return container;
}