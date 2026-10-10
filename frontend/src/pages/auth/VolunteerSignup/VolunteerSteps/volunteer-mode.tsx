import './Volunteer.css';
import { icons } from './icons';
import type { SupportMode, SupportModeInfoData } from '../Voluteer';

interface SupportModeProps {
    supportModeInfo: SupportModeInfoData;
    setSupportModeInfo: (info: SupportModeInfoData) => void;
    onBack?: () => void;
    onNext: () => void | Promise<boolean>;
}

const modeTiles: { value: SupportMode; label: string; description: string; icon: string }[] = [
    { value: 'virtual', label: 'Virtual', description: 'Meet online', icon: icons.monitor },
    { value: 'physical', label: 'Physical', description: 'Meet in person', icon: icons.building },
];

export default function createSupportModeStep({
    supportModeInfo,
    setSupportModeInfo,
    onBack,
    onNext,
}: SupportModeProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'step-container';
    container.innerHTML = `
        <div class="vol-step-header">
            <h2>Set Your Support Mode</h2>
            <p>Please set your preferred support mode</p>
        </div>

        <form class="vol-form">
            <div class="vol-tile-grid" role="group" aria-label="Support modes">
                ${modeTiles.map((tile) => `
                    <button type="button" class="vol-tile" data-value="${tile.value}" aria-pressed="false">
                        ${tile.icon}
                        <span>${tile.label}</span>
                        <small>${tile.description}</small>
                    </button>
                `).join('')}
            </div>
            <p class="vol-hint" style="text-align:center">You can choose one or both.</p>

            <div class="vol-actions">
                ${onBack ? '<button type="button" class="vol-btn vol-btn--secondary back-button">Back</button>' : '<span></span>'}
                <button type="submit" class="vol-btn vol-btn--primary next-button">Submit</button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-button');
    const tiles = Array.from(container.querySelectorAll<HTMLButtonElement>('.vol-tile'));
    const submitButton = container.querySelector<HTMLButtonElement>('.next-button')!;

    const selected = new Set<SupportMode>(supportModeInfo.modes);

    const currentModes = (): SupportMode[] =>
        modeTiles.map((tile) => tile.value).filter((value) => selected.has(value));

    const sync = (): void => {
        tiles.forEach((tile) => {
            const isSelected = selected.has(tile.dataset.value as SupportMode);
            tile.classList.toggle('is-selected', isSelected);
            tile.setAttribute('aria-pressed', String(isSelected));
        });
    };

    tiles.forEach((tile) => {
        tile.addEventListener('click', () => {
            const value = tile.dataset.value as SupportMode;
            if (selected.has(value)) {
                selected.delete(value);
            } else {
                selected.add(value);
            }
            sync();
            setSupportModeInfo({ modes: currentModes() });
        });
    });

    backButton?.addEventListener('click', () => {
        onBack?.();
    });

    sync();

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const modes = currentModes();
        if (modes.length === 0) {
            alert('Please choose a support mode before continuing.');
            return;
        }

        setSupportModeInfo({ modes });
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        const submitted = await onNext();
        if (submitted !== true) {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        }
    });

    return container;
}