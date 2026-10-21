import './login.css';
import { createAuthFeedback, getAuthErrorMessage } from '../../auth-feedback';
import { configurePasswordToggle } from '../../password-toggle';
import { scrollToFirstInvalidField, setAuthFieldError } from '../../auth-validation';

export interface LoginInfoData {
    email: string;
    password: string;
}

interface LoginProps {
    loginInfo: LoginInfoData;
    setLoginInfo: (info: LoginInfoData) => void;
    onForgotPassword: () => void;
    onRegister: () => void;
    onNext: () => void | Promise<boolean>;
}

export default function createLoginStep({
    loginInfo,
    setLoginInfo,
    onForgotPassword,
    onRegister,
    onNext,
}: LoginProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card login-card';
    container.innerHTML = `
        <div class="login-header">
            <h2>Login</h2>
        </div>

        <form class="signup-form" novalidate>
            <div class="signup-field">
                <label for="loginEmail">Student Email</label>
                <input id="loginEmail" type="email" autocomplete="email" required />
            </div>

            <div class="signup-field">
                <label for="loginPassword">Password</label>
                <div class="password-input-wrapper">
                    <input id="loginPassword" type="password" autocomplete="current-password" required />
                    <button type="button" class="password-toggle" aria-label="Show password" aria-pressed="false"></button>
                </div>
            </div>

            <button type="button" class="forgot-link">Forgot Password?</button>

            <div class="signup-actions">
                <button type="submit" class="signup-button login-button">Login</button>
            </div>

            <p class="login-register">
                Don't have an account?
                <button type="button" class="register-link">Register now</button>
            </p>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const emailInput = container.querySelector<HTMLInputElement>('#loginEmail')!;
    const passwordInput = container.querySelector<HTMLInputElement>('#loginPassword')!;
    const passwordToggle = container.querySelector<HTMLButtonElement>('.password-toggle')!;
    const forgotButton = container.querySelector<HTMLButtonElement>('.forgot-link')!;
    const registerButton = container.querySelector<HTMLButtonElement>('.register-link')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.login-button')!;
    const showFeedback = createAuthFeedback(form);
    const fields = [emailInput, passwordInput];
    const touchedFields = new Set<HTMLInputElement>();
    let hasSubmitted = false;

    const validateEmail = () => {
        const value = emailInput.value.trim();
        const message = !value
            ? 'Enter your email address.'
            : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? ''
                : 'Enter a valid email address.';
        setAuthFieldError(emailInput, message);
        return !message;
    };

    const validatePassword = () => {
        const message = passwordInput.value ? '' : 'Enter your password.';
        setAuthFieldError(passwordInput, message);
        return !message;
    };

    configurePasswordToggle(passwordToggle, passwordInput, 'password');

    emailInput.value = loginInfo.email;
    passwordInput.value = loginInfo.password;

    // Local copy so successive updates don't spread the stale `loginInfo`
    // captured when this step's DOM was created (typing email then password
    // would otherwise reset the email in the flow state).
    const currentInfo: LoginInfoData = { ...loginInfo };

    const updateLoginInfo = (field: keyof LoginInfoData, value: string) => {
        currentInfo[field] = value;
        setLoginInfo({ ...currentInfo });
    };

    emailInput.addEventListener('input', (event) => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(emailInput)) validateEmail();
        updateLoginInfo('email', (event.target as HTMLInputElement).value);
    });

    passwordInput.addEventListener('input', (event) => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(passwordInput)) validatePassword();
        updateLoginInfo('password', (event.target as HTMLInputElement).value);
    });

    fields.forEach((field) => {
        field.addEventListener('blur', () => {
            touchedFields.add(field);
            if (field === emailInput) validateEmail();
            else validatePassword();
        });
    });

    forgotButton.addEventListener('click', () => {
        onForgotPassword();
    });

    registerButton.addEventListener('click', () => {
        onRegister();
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;
        hasSubmitted = true;

        const currentInfo: LoginInfoData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
        };

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        if (!isEmailValid || !isPasswordValid) {
            scrollToFirstInvalidField(fields);
            return;
        }

        setLoginInfo(currentInfo);
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        try {
            const result = await onNext();
            if (result === false) {
                submitButton.disabled = false;
                submitButton.textContent = 'Login';
            }
        } catch (error) {
            showFeedback(getAuthErrorMessage(error, 'Unable to log in.'));
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    return container;
}