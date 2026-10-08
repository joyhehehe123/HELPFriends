import '../Signup/SignupSteps/signup.css';
import './LoginSteps/login.css';
import { createNavbar } from '../../components/MainNavbar.tsx';
import type { NavigateCallback } from '../../components/MainNavbar.tsx';
import createLoginStep from './LoginSteps/login';
import type { LoginInfoData } from './LoginSteps/login';
import createLoginTwoFactorStep from './LoginSteps/login-2fa';

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

    const navbar = createNavbar('/login', navigate as NavigateCallback);

    const state: { loginInfo: LoginInfoData; otp: string } = {
        loginInfo: {
            email: initialData?.email ?? '',
            password: initialData?.password ?? '',
        },
        otp: '',
    };

    // 1 = Login, 2 = Two-factor authentication
    let currentStep = 1;

    const content = document.createElement('main');
    content.className = 'signup-content';

    const renderStep = () => {
        content.replaceChildren();

        switch (currentStep) {
            case 1:
                content.appendChild(createLoginStep({
                    loginInfo: state.loginInfo,
                    setLoginInfo: (info) => {
                        state.loginInfo = info;
                    },
                    onForgotPassword: () => navigate('/forgot-password'),
                    onRegister: () => navigate('/signup'),
                    onNext: () => {
                        // TODO (API): check the email/password and send the OTP email here
                        currentStep = 2;
                        renderStep();
                    },
                }));
                break;
            case 2:
                content.appendChild(createLoginTwoFactorStep({
                    onBack: () => {
                        currentStep = 1;
                        renderStep();
                    },
                    onResend: async (): Promise<boolean> => {
                        // TODO (API): resend the OTP email here
                        return true;
                    },
                    onNext: (otp) => {
                        // TODO (API): verify the OTP and start the session here (currently accepts any 6 digits)
                        state.otp = otp;
                        navigate('/'); // TODO: change to your post-login page
                    },
                }));
                break;
            default:
                break;
        }
    };

    renderStep();

    container.append(navbar, content);
    return container;
}