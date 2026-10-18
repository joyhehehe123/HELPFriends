import './login.css';
import '../../auth-feedback.css';
import { createAuthFeedback } from '../../auth-feedback';

interface LoginTwoFactorProps {
    onBack?: () => void | Promise<void>;
    onResend: () => Promise<boolean>;
    onNext: (otp: string) => void | Promise<boolean>;
}

const RESEND_COOLDOWN_SECONDS = 60;

export default function createLoginTwoFactorStep({
    onBack,
    onResend,
    onNext,
}: LoginTwoFactorProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card login-card';
    container.innerHTML = `
        <div class="signup-header">
            <h2>Two-Factor Authentication</h2>
            <p>Enter the 6-digit code sent to your email to login</p>
        </div>

        <form class="signup-form signup-form--otp">
            <input
                id="loginOtp"
                class="otp-input"
                type="text"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="6"
                placeholder="Enter OTP"
                required
            />

            <div class="signup-actions">
                <button type="submit" class="signup-button">Verify</button>
            </div>

            <div class="signup-links">
                <button type="button" class="back-link">
                    <span class="back-arrow" aria-hidden="true"></span>Return to login
                </button>
                <span class="resend-text">
                    Didn’t see it?
                    <button type="button" class="resend-link">Send again</button>
                </span>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const otpInput = container.querySelector<HTMLInputElement>('#loginOtp')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const backButton = container.querySelector<HTMLButtonElement>('.back-link')!;
    const resendButton = container.querySelector<HTMLButtonElement>('.resend-link')!;
    const showFeedback = createAuthFeedback(form);

    let cooldownTimer: number | undefined;

    const startCooldown = () => {
        let remaining = RESEND_COOLDOWN_SECONDS;
        resendButton.disabled = true;
        resendButton.textContent = `Send again (${remaining}s)`;
        window.clearInterval(cooldownTimer);
        cooldownTimer = window.setInterval(() => {
            remaining -= 1;
            if (remaining <= 0) {
                window.clearInterval(cooldownTimer);
                resendButton.disabled = false;
                resendButton.textContent = 'Send again';
                return;
            }
            resendButton.textContent = `Send again (${remaining}s)`;
        }, 1000);
    };

    startCooldown();

    backButton.addEventListener('click', async () => {
        window.clearInterval(cooldownTimer);
        backButton.disabled = true;
        try {
            await onBack?.();
        } catch (error) {
            showFeedback(error instanceof Error ? error.message : 'Unable to return to login.');
            backButton.disabled = false;
        }
    });

    resendButton.addEventListener('click', async () => {
        if (resendButton.disabled) return;
        resendButton.disabled = true;
        resendButton.textContent = 'Sending...';
        const sent = await onResend();
        if (sent) {
            showFeedback('A new code has been sent to your email.', 'info');
            startCooldown();
        } else {
            showFeedback('Unable to resend the code. Please try again.');
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
            showFeedback('Please enter the 6-digit code sent to your email.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Verifying...';
        try {
            const verified = await onNext(otp);
            if (verified) {
                window.clearInterval(cooldownTimer);
            }
            if (verified === false) {
                submitButton.disabled = false;
                submitButton.textContent = 'Verify';
            }
        } catch (error) {
            showFeedback(error instanceof Error ? error.message : 'Unable to verify the code.');
            submitButton.disabled = false;
            submitButton.textContent = 'Verify';
        }
    });

    return container;
}