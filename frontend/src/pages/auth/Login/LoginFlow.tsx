import './LoginSteps/login.css';
import createLoginStep from './LoginSteps/login';
import type { LoginInfoData } from './LoginSteps/login';
import createLoginTwoFactorStep from './LoginSteps/login-2fa';
import { login, logout } from '../../../services/authService';

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
                await login(state.loginInfo.email, state.loginInfo.password);
                renderTwoFactorStep();
                return true;
            },
        }));
    };

    const renderTwoFactorStep = () => {
        content.replaceChildren();
        content.appendChild(createLoginTwoFactorStep({
            onBack: async () => {
                await logout();
                renderLoginStep();
            },
            onResend: async () => true,
            onNext: async () => {
                navigate('/dashboard');
                return true;
            },
        }));
    };

    renderLoginStep();

    container.append(content);
    return container;
}