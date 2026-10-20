const eyeIcon = `
    <svg class="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
    </svg>`;

const eyeOffIcon = `
    <svg class="password-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="m3 3 18 18" />
        <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
        <path d="M16.68 16.68A10.9 10.9 0 0 1 12 17.75c-5 0-8.27-3.11-9.94-5.4a1 1 0 0 1 0-.7A11.8 11.8 0 0 1 6.1 6.1" />
        <path d="M9.88 5.24A10.9 10.9 0 0 1 12 5c5 0 8.27 3.11 9.94 5.4a1 1 0 0 1 0 .7 11.8 11.8 0 0 1-2.08 2.9" />
    </svg>`;

export function configurePasswordToggle(
    button: HTMLButtonElement,
    input: HTMLInputElement,
    fieldName: string,
): void {
    const updateIcon = (isVisible: boolean) => {
        button.innerHTML = isVisible ? eyeOffIcon : eyeIcon;
        button.setAttribute('aria-label', `${isVisible ? 'Hide' : 'Show'} ${fieldName}`);
        button.setAttribute('aria-pressed', String(isVisible));
    };

    updateIcon(false);
    button.addEventListener('click', () => {
        const isVisible = input.type !== 'text';
        input.type = isVisible ? 'text' : 'password';
        updateIcon(isVisible);
    });
}
