import '../../Signup/SignupSteps/signup.css';
import './ResetPassword.css';
import '../../auth-feedback.css';
import { createAuthFeedback, getAuthErrorMessage } from '../../auth-feedback';

interface ForgotPasswordProps {
    email: string;
    setEmail: (email: string) => void;
    onBack?: () => void;
    onNext: () => void | Promise<boolean>;
}

export default function createForgotPasswordStep({
    email,
    setEmail,
    onBack,
    onNext,
}: ForgotPasswordProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card reset-card';
    container.innerHTML = `
        <div class="signup-header">
            <h2>Forgot Password</h2>
            <p>Please enter the email used for your account and we’ll send you a link to reset your password.</p>
        </div>

        <form class="signup-form" novalidate>
            <div class="icon-input">
                <svg class="icon-input-icon" viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                    <path d="M3 7l9 6.5L21 7" />
                </svg>
                <input id="resetEmail" type="email" autocomplete="email" placeholder="Enter your email" aria-label="Email" required />
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
    const emailInput = container.querySelector<HTMLInputElement>('#resetEmail')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-link')!;
    const showFeedback = createAuthFeedback(form);

    emailInput.value = email;

    backButton.addEventListener('click', () => {
        onBack?.();
    });

    emailInput.addEventListener('input', () => {
        showFeedback('');
        setEmail(emailInput.value);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const currentEmail = emailInput.value.trim();
        if (!currentEmail) {
            showFeedback('Please enter your email.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentEmail)) {
            showFeedback('Please enter a valid email address.');
            return;
        }

        setEmail(currentEmail);
        submitButton.disabled = true;
        submitButton.textContent = 'Sending link...';
        try {
            const result = await onNext();
            if (result === false) {
                submitButton.disabled = false;
                submitButton.textContent = 'Reset Password';
            }
        } catch (error) {
            showFeedback(getAuthErrorMessage(error, 'Unable to send the password reset email.'));
            submitButton.disabled = false;
            submitButton.textContent = 'Reset Password';
        }
    });

    return container;
}