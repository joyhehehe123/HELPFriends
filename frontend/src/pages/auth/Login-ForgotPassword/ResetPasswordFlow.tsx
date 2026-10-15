import './ResetPasswordSteps/ResetPassword.css';
import createForgotPasswordStep from './ResetPasswordSteps/ForgotPassword';
import createResetPasswordConfirmationStep from './ResetPasswordSteps/ResetPasswordConfirmation';
import { resetPassword } from '../../../services/authService';

interface ResetPasswordFlowProps {
    initialEmail?: string;
}

export default function createResetPasswordFlow({
    initialEmail = '',
}: ResetPasswordFlowProps = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-page';

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const state = { email: initialEmail };

    let currentStep: 1 | 2 = 1;

    const content = document.createElement('main');
    content.className = 'signup-content';

    const renderStep = () => {
        content.replaceChildren();

        switch (currentStep) {
            case 1:
                content.appendChild(createForgotPasswordStep({
                    email: state.email,
                    setEmail: (email) => {
                        state.email = email;
                    },
                    onBack: () => navigate('/login'),
                    onNext: async () => {
                        await resetPassword(state.email);
                        currentStep = 2;
                        renderStep();
                        return true;
                    },
                }));
                break;
            case 2:
                content.appendChild(createResetPasswordConfirmationStep({
                    onLogin: () => navigate('/login'),
                }));
                break;
            default:
                break;
        }
    };

    renderStep();

    container.append(content);
    return container;
}