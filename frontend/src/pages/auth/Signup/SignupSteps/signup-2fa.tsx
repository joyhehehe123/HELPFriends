import './signup.css';
import '../../auth-feedback.css';
import { createAuthFeedback } from '../../auth-feedback';

interface TwoFactorProps {
    onBack?: () => void;
    onResend: () => Promise<boolean>;
    onNext: (otp: string) => void | Promise<boolean>;
}

export default function createTwoFactorStep({
    onBack,
    onResend,
    onNext,
}: TwoFactorProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card signup-card--narrow';
    container.innerHTML = `
        <div class="signup-header">
            <h2>Two-Factor Authentication</h2>
            <p>Enter the 6-digit verification code sent to your email to continue.</p>
        </div>

        <form class="signup-form signup-form--otp">
            <input
                id="otp"
                class="otp-input"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="Enter OTP"
                aria-label="Six-digit verification code"
                required
            />

            <div class="signup-actions">
                <button type="submit" class="signup-button">Verify</button>
            </div>

            <div class="signup-links">
                <button type="button" class="back-link">
                    <span class="back-arrow" aria-hidden="true"></span>Return to registration
                </button>
                <span class="resend-text">
                    Didn’t see it?
                    <button type="button" class="resend-link">Send again</button>
                </span>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const otpInput = container.querySelector<HTMLInputElement>('#otp')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-link')!;
    const resendButton = container.querySelector<HTMLButtonElement>('.resend-link')!;
    const showFeedback = createAuthFeedback(form);

    backButton.addEventListener('click', () => {
        onBack?.();
    });

    resendButton.addEventListener('click', async () => {
        if (resendButton.disabled) return;

        resendButton.disabled = true;
        resendButton.textContent = 'Sending...';

        try {
            const sent = await onResend();

            if (sent) {
                showFeedback(
                    'A new verification code has been sent.',
                    'info'
                );
                resendButton.textContent = 'Send again';
            } else {
                showFeedback('Unable to send the code. Please try again.');
                resendButton.disabled = false;
                resendButton.textContent = 'Send again';
            }
        } catch (error) {
            showFeedback(
                error instanceof Error
                    ? error.message
                    : 'Unable to send the code. Please try again.'
            );
            resendButton.disabled = false;
            resendButton.textContent = 'Send again';
        }
    });

    otpInput.addEventListener('input', () => {
        otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const otp = otpInput.value.trim();
        if (!/^\d{6}$/.test(otp)) {
            showFeedback('Please enter a 6-digit code.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Verifying...';
        try {
            const verified = await onNext(otp);
            if (verified === false) {
                submitButton.disabled = false;
                submitButton.textContent = 'Verify';
                showFeedback(
                    'Incorrect or expired verification code. Please try again.'
                );
            }
            
        } catch (error) {
            showFeedback(error instanceof Error ? error.message : 'Unable to verify the code.');
            submitButton.disabled = false;
            submitButton.textContent = 'Verify';
        }
    });

    return container;
}
