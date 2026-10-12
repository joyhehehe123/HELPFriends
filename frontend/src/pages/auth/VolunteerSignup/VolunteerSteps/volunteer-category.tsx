import './volunteer.css';
import { icons } from './icons';
import type { CategoryInfoData, SupportCategory } from '../Voluteer';

interface CategoryProps {
    categoryInfo: CategoryInfoData;
    setCategoryInfo: (info: CategoryInfoData) => void;
    onReturn?: () => void;
    onNext: () => void;
}

const categoryTiles: { value: SupportCategory; label: string; icon: string }[] = [
    { value: 'academic', label: 'Academic', icon: icons.cap },
    { value: 'technology', label: 'Technology', icon: icons.monitor },
    { value: 'newStudent', label: 'New Student', icon: icons.userPlus },
    { value: 'general', label: 'General Student', icon: icons.sparkles },
];

export default function createCategoryStep({
    categoryInfo,
    setCategoryInfo,
    onReturn,
    onNext,
}: CategoryProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'step-container';
    container.innerHTML = `
        <div class="vol-step-header">
            <h2>Select your support category</h2>
            <p>Select one or more categories.</p>
        </div>

        <form class="vol-form">
            <div class="vol-tile-grid" role="group" aria-label="Support categories">
                ${categoryTiles.map((tile) => `
                    <button type="button" class="vol-tile" data-value="${tile.value}" aria-pressed="false">
                        ${tile.icon}
                        <span>${tile.label}</span>
                    </button>
                `).join('')}
            </div>

            <div class="vol-actions">
                <button type="button" class="vol-return-link">&#9664; Return to registration</button>
                <button type="submit" class="vol-btn vol-btn--primary next-button" disabled>Next</button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const tiles = Array.from(container.querySelectorAll<HTMLButtonElement>('.vol-tile'));
    const returnButton = container.querySelector<HTMLButtonElement>('.vol-return-link')!;
    const nextButton = container.querySelector<HTMLButtonElement>('.next-button')!;

    const selected = new Set<SupportCategory>(categoryInfo.categories);

    const sync = (): void => {
        tiles.forEach((tile) => {
            const isSelected = selected.has(tile.dataset.value as SupportCategory);
            tile.classList.toggle('is-selected', isSelected);
            tile.setAttribute('aria-pressed', String(isSelected));
        });
        nextButton.disabled = selected.size === 0;
    };

    const currentCategories = (): SupportCategory[] =>
        categoryTiles.map((tile) => tile.value).filter((value) => selected.has(value));

    tiles.forEach((tile) => {
        tile.addEventListener('click', () => {
            const value = tile.dataset.value as SupportCategory;
            if (selected.has(value)) {
                selected.delete(value);
            } else {
                selected.add(value);
            }
            sync();
            setCategoryInfo({ categories: currentCategories() });
        });
    });

    returnButton.addEventListener('click', () => {
        onReturn?.();
    });

    sync();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const categories = currentCategories();
        if (categories.length === 0) {
            alert('Please select at least one support category.');
            return;
        }

        setCategoryInfo({ categories });
        onNext();
    });

    return container;
}