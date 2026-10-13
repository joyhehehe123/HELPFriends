import './signup.css';

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
            <p>Enter a 6-digit code to continue. Email delivery and code verification are not connected yet; any 6 digits will work.</p>
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

    backButton.addEventListener('click', () => {
        onBack?.();
    });

    resendButton.addEventListener('click', async () => {
        resendButton.disabled = true;
        const sent = await onResend();
        if (!sent) resendButton.disabled = false;
    });

    otpInput.addEventListener('input', () => {
        otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, 6);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const otp = otpInput.value.trim();
        if (!/^\d{6}$/.test(otp)) {
            alert('Please enter a 6-digit code.');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Verifying...';
        const verified = await onNext(otp);
        if (verified === false) {
            submitButton.disabled = false;
            submitButton.textContent = 'Verify';
        }
    });

    return container;
}
