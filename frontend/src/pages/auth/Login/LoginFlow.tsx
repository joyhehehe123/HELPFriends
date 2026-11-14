import './LoginSteps/login.css';
import createLoginStep from './LoginSteps/login';
import type { LoginInfoData } from './LoginSteps/login';
import createLoginTwoFactorStep from './LoginSteps/login-2fa';
import { login, logout } from '../../../services/authService';
import {
    sendLoginOtp,
    verifyLoginOtp,
    clearLoginOtp
} from '../../../services/otpService';

interface LoginFlowProps {
    initialData?: Partial<LoginInfoData>;
}

export default function createLoginFlow({ initialData }: LoginFlowProps = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-page';

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };


    const state: { loginInfo: LoginInfoData } = {
        loginInfo: {
            email: initialData?.email ?? '',
            password: initialData?.password ?? '',
        },
    };

    let loginUserName = '';
    const content = document.createElement('main');
    content.className = 'signup-content';

    const renderLoginStep = () => {
        content.replaceChildren();

        content.appendChild(createLoginStep({
            loginInfo: state.loginInfo,

            setLoginInfo: (info) => {
                state.loginInfo = info;
            },

            onForgotPassword: () => navigate('/reset-password'),

            onRegister: () => navigate('/signup'),

            onNext: async () => {
                let authenticated = false;

                try {
                    // Step 1: Authenticate using Firebase
                    const user = await login(
                        state.loginInfo.email,
                        state.loginInfo.password
                    );

                    authenticated = true;

                    // Step 2: Save the student's name
                    loginUserName =
                        user.displayName ||
                        state.loginInfo.email.split('@')[0];

                    // Step 3: Send OTP
                    const sent = await sendLoginOtp(
                        state.loginInfo.email,
                        loginUserName
                    );

                    if (!sent) {
                        throw new Error(
                            'Unable to send the verification code. Please try again.'
                        );
                    }

                    // Step 4: Show OTP screen
                    renderTwoFactorStep();
                    return true;

                } catch (error) {
                    console.error('Login failed:', error);

                    if (authenticated) {
                        clearLoginOtp();
                        await logout();
                    }

                    throw error;
                }
            }
        }));
    };

    const renderTwoFactorStep = () => {
        content.replaceChildren();

        content.appendChild(createLoginTwoFactorStep({

            // Back to login
            onBack: async () => {
                clearLoginOtp();
                await logout();
                renderLoginStep();
            },

            // Resend OTP
            onResend: async () => {
                return await sendLoginOtp(
                    state.loginInfo.email,
                    loginUserName
                );
            },

            // Verify OTP
            onNext: async (otp: string) => {
                const verified = verifyLoginOtp(otp);

                if (!verified) {
                    return false;
                }

                navigate('/dashboard');
                return true;
            }
        }));
    };

    renderLoginStep();

    container.append(content);
    return container;
}