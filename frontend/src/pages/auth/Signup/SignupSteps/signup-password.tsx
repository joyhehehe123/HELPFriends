import './signup.css';
import '../../auth-feedback.css';
import { createAuthFeedback, getAuthErrorMessage } from '../../auth-feedback';
import { configurePasswordToggle } from '../../password-toggle';
import { scrollToFirstInvalidField, setAuthFieldError } from '../../auth-validation';

interface SetPasswordProps {
    onBack?: () => void;
    onNext: (password: string) => void | Promise<boolean>;
}

const MIN_PASSWORD_LENGTH = 8;

export default function createSetPasswordStep({
    onBack,
    onNext,
}: SetPasswordProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card signup-card--password';
    container.innerHTML = `
        <div class="signup-header">
            <h2>Password</h2>
            <p>Enter your password to finalize the registration</p>
        </div>

        <form class="signup-form" novalidate>
            <div class="signup-field">
                <label for="password">Enter Password</label>
                <div class="password-input-wrapper">
                    <input id="password" type="password" autocomplete="new-password" minlength="${MIN_PASSWORD_LENGTH}" required />
                    <button type="button" class="password-toggle" aria-label="Show password" aria-pressed="false"></button>
                </div>
            </div>

            <div class="signup-field">
                <label for="confirmPassword">Re-enter Password</label>
                <div class="password-input-wrapper">
                    <input id="confirmPassword" type="password" autocomplete="new-password" required />
                    <button type="button" class="password-toggle" aria-label="Show confirmation password" aria-pressed="false"></button>
                </div>
            </div>

            <div class="signup-actions">
                <button type="submit" class="signup-button">Set Password</button>
            </div>

            <div class="signup-links">
                <button type="button" class="back-link">
                    <span class="back-arrow" aria-hidden="true"></span>Return to registration
                </button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const passwordInput = container.querySelector<HTMLInputElement>('#password')!;
    const confirmPasswordInput = container.querySelector<HTMLInputElement>('#confirmPassword')!;
    const passwordToggles = container.querySelectorAll<HTMLButtonElement>('.password-toggle');
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-link')!;
    const showFeedback = createAuthFeedback(form);
    const fields = [passwordInput, confirmPasswordInput];
    const touchedFields = new Set<HTMLInputElement>();
    let hasSubmitted = false;

    const validatePassword = () => {
        const message = !passwordInput.value
            ? 'Enter a password.'
            : passwordInput.value.length < MIN_PASSWORD_LENGTH
                ? `Use at least ${MIN_PASSWORD_LENGTH} characters.`
                : '';
        setAuthFieldError(passwordInput, message);
        return !message;
    };

    const validateConfirmation = () => {
        const message = !confirmPasswordInput.value
            ? 'Re-enter your password.'
            : confirmPasswordInput.value !== passwordInput.value
                ? 'Passwords do not match.'
                : '';
        setAuthFieldError(confirmPasswordInput, message);
        return !message;
    };

    configurePasswordToggle(passwordToggles[0], passwordInput, 'password');
    configurePasswordToggle(passwordToggles[1], confirmPasswordInput, 'confirmation password');

    passwordInput.addEventListener('input', () => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(passwordInput)) validatePassword();
        if (hasSubmitted || touchedFields.has(confirmPasswordInput)) validateConfirmation();
    });
    confirmPasswordInput.addEventListener('input', () => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(confirmPasswordInput)) validateConfirmation();
    });

    fields.forEach((field) => {
        field.addEventListener('blur', () => {
            touchedFields.add(field);
            if (field === passwordInput) validatePassword();
            else validateConfirmation();
        });
    });

    backButton.addEventListener('click', () => {
        onBack?.();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;
        hasSubmitted = true;

        const password = passwordInput.value;
        const valid = fields.map((field) => field === passwordInput
            ? validatePassword()
            : validateConfirmation()).every(Boolean);
        if (!valid) {
            scrollToFirstInvalidField(fields);
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Setting password...';
        try {
            const created = await onNext(password);
            if (created === false) {
                submitButton.disabled = false;
                submitButton.textContent = 'Set Password';
            }
        } catch (error) {
            showFeedback(getAuthErrorMessage(error, 'Unable to create your account.'));
            submitButton.disabled = false;
            submitButton.textContent = 'Set Password';
        }
    });

    return container;
}