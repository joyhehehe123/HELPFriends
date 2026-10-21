type AuthField = HTMLInputElement | HTMLSelectElement;

export function setAuthFieldError(field: AuthField, message: string): void {
    const container = field.closest<HTMLElement>('.signup-field');
    if (!container) {
        throw new Error(`Missing field container for ${field.id}.`);
    }

    let error = container.querySelector<HTMLElement>('.auth-field-error');
    if (message) {
        if (!error) {
            error = document.createElement('p');
            error.className = 'auth-field-error';
            error.id = `${field.id}-error`;
            error.setAttribute('aria-live', 'polite');
            container.appendChild(error);
        }
        error.textContent = message;
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', error.id);
        return;
    }

    error?.remove();
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
}

export function scrollToFirstInvalidField(fields: AuthField[]): void {
    const firstInvalid = fields.find((field) => field.getAttribute('aria-invalid') === 'true');
    if (!firstInvalid) return;

    const navbar = document.querySelector<HTMLElement>('.app-navbar');
    const navbarStyle = navbar ? window.getComputedStyle(navbar) : undefined;
    const navbarOffset = navbar && navbarStyle && ['sticky', 'fixed'].includes(navbarStyle.position)
        ? navbar.getBoundingClientRect().height + 16
        : 16;

    firstInvalid.focus({ preventScroll: true });
    window.scrollTo({
        top: Math.max(0, firstInvalid.getBoundingClientRect().top + window.scrollY - navbarOffset),
        behavior: 'smooth',
    });
}
