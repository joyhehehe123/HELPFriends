import '../../Signup/SignupSteps/signup.css';
import './ResetPassword.css';

interface ResetPasswordProps {
    onBack?: () => void;
    onNext: (password: string) => void | Promise<boolean>;
}

const MIN_PASSWORD_LENGTH = 8;

export default function createResetPasswordStep({
    onBack,
    onNext,
}: ResetPasswordProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card reset-card';
    container.innerHTML = `
        <div class="signup-header">
            <h2>Reset Password</h2>
            <p>Enter your new password below to change your password.</p>
        </div>

        <form class="signup-form">
            <div class="signup-field">
                <label for="newPassword">Enter New Password</label>
                <input id="newPassword" type="password" autocomplete="new-password" minlength="${MIN_PASSWORD_LENGTH}" required />
            </div>

            <div class="signup-field">
                <label for="confirmNewPassword">Re-enter Password</label>
                <input id="confirmNewPassword" type="password" autocomplete="new-password" required />
            </div>

            <div class="signup-actions">
                <button type="submit" class="signup-button">Reset Password</button>
            </div>

            <div class="signup-links">
                <button type="button" class="back-link">
                    <span class="back-arrow" aria-hidden="true"></span>Return to login
                </button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const passwordInput = container.querySelector<HTMLInputElement>('#newPassword')!;
    const confirmPasswordInput = container.querySelector<HTMLInputElement>('#confirmNewPassword')!;
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
        submitButton.textContent = 'Resetting...';
        const result = await onNext(password);
        if (result === false) {
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });

    return container;
}