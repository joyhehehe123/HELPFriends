import './signup.css';

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

        <form class="signup-form">
            <div class="signup-field">
                <label for="password">Enter Password</label>
                <input id="password" type="password" autocomplete="new-password" minlength="${MIN_PASSWORD_LENGTH}" required />
            </div>

            <div class="signup-field">
                <label for="confirmPassword">Re-enter Password</label>
                <input id="confirmPassword" type="password" autocomplete="new-password" required />
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
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-link')!;

    backButton.addEventListener('click', () => {
        onBack?.();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!password || !confirmPassword) {
            alert('Please fill in both password fields.');
            return;
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            alert(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Setting password...';
        const created = await onNext(password);
        if (created === false) {
            submitButton.disabled = false;
            submitButton.textContent = 'Set Password';
        }
    });

    return container;
}