import './ResetPasswordSteps/ResetPassword.css';
import createForgotPasswordStep from './ResetPasswordSteps/ForgotPassword';
import createResetPasswordStep from './ResetPasswordSteps/ResetPassword';
import createResetPasswordConfirmationStep from './ResetPasswordSteps/ResetPasswordConfirmation';

interface ResetPasswordFlowProps {
    initialEmail?: string;
    /**
     * 1 = enter email, 2 = enter new password.
     * Once you have an API, the emailed link should open the page with initialStep: 2
     * (and read the reset token from the URL).
     */
    initialStep?: 1 | 2 | 3;
}

export default function createResetPasswordFlow({
    initialEmail = '',
    initialStep = 1,
}: ResetPasswordFlowProps = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-page';

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const state = { email: initialEmail };

    let currentStep: 1 | 2 | 3 = initialStep;

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
                    onNext: () => {
                        alert('If an account exists for this email, a reset link has been sent.');
                        currentStep = 2;
                        renderStep();
                    },
                }));
                break;
            case 2:
                content.appendChild(createResetPasswordStep({
                    onBack: () => navigate('/login'),
                    onNext: () => {
                        currentStep = 3;
                        renderStep();
                    },
                }));
                break;
            case 3:
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