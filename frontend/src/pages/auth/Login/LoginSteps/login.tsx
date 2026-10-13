import './login.css';

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

        <form class="signup-form">
            <div class="signup-field">
                <label for="loginEmail">Student Email</label>
                <input id="loginEmail" type="email" autocomplete="email" required />
            </div>

            <div class="signup-field">
                <label for="loginPassword">Password</label>
                <input id="loginPassword" type="password" autocomplete="current-password" required />
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
    const forgotButton = container.querySelector<HTMLButtonElement>('.forgot-link')!;
    const registerButton = container.querySelector<HTMLButtonElement>('.register-link')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.login-button')!;

    emailInput.value = loginInfo.email;
    passwordInput.value = loginInfo.password;

    const updateLoginInfo = (field: keyof LoginInfoData, value: string) => {
        setLoginInfo({
            ...loginInfo,
            [field]: value,
        });
    };

    emailInput.addEventListener('input', (event) => {
        updateLoginInfo('email', (event.target as HTMLInputElement).value);
    });

    passwordInput.addEventListener('input', (event) => {
        updateLoginInfo('password', (event.target as HTMLInputElement).value);
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

        const currentInfo: LoginInfoData = {
            email: emailInput.value.trim(),
            password: passwordInput.value,
        };

        if (!currentInfo.email || !currentInfo.password) {
            alert('Please enter your email and password.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentInfo.email)) {
            alert('Please enter a valid email address.');
            return;
        }

        setLoginInfo(currentInfo);
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        const result = await onNext();
        if (result === false) {
            submitButton.disabled = false;
            submitButton.textContent = 'Login';
        }
    });

    return container;
}