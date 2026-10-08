import './SignupSteps/signup.css';
import { createNavbar } from '../../components/MainNavbar.tsx';
import type { NavigateCallback } from '../../components/MainNavbar.tsx';
import createSignupStep from './SignupSteps/signup.tsx';
import type { SignupInfoData } from './SignupSteps/signup.tsx';
import createTwoFactorStep from './SignupSteps/signup-2fa.tsx';
import createSetPasswordStep from './SignupSteps/signup-password.tsx';
import createConfirmationStep from './SignupSteps/signup-confirmation.tsx';

interface SignupFlowProps {
    initialData?: Partial<SignupInfoData>;
}

export default function createSignupFlow({ initialData }: SignupFlowProps = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-page';

    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };

    const navbar = createNavbar('/signup', navigate as NavigateCallback);

    const state: { signupInfo: SignupInfoData; otp: string } = {
        signupInfo: {
            studentId: initialData?.studentId ?? '',
            fullName: initialData?.fullName ?? '',
            studentEmail: initialData?.studentEmail ?? '',
            volunteer: initialData?.volunteer ?? false,
        },
        otp: '',
    };

    // 1 = Sign up, 2 = Two-factor authentication, 3 = Set password, 4 = Confirmation
    let currentStep = 1;

    const content = document.createElement('main');
    content.className = 'signup-content';

    const renderStep = () => {
        content.replaceChildren();

        switch (currentStep) {
            case 1:
                content.appendChild(createSignupStep({
                    signupInfo: state.signupInfo,
                    setSignupInfo: (info) => {
                        state.signupInfo = info;
                    },
                    onNext: () => {
                        // TODO (API): request the OTP email here
                        currentStep = 2;
                        renderStep();
                    },
                }));
                break;
            case 2:
                content.appendChild(createTwoFactorStep({
                    onBack: () => {
                        currentStep = 1;
                        renderStep();
                    },
                    onResend: async (): Promise<boolean> => {
                        // TODO (API): resend the OTP email here
                        return true;
                    },
                    onNext: (otp) => {
                        // TODO (API): verify the OTP here (currently accepts any 6 digits)
                        state.otp = otp;
                        currentStep = 3;
                        renderStep();
                    },
                }));
                break;
            case 3:
                content.appendChild(createSetPasswordStep({
                    onBack: () => {
                        currentStep = 1;
                        renderStep();
                    },
                    onNext: () => {
                        // TODO (API): create the account with the password here
                        currentStep = 4;
                        renderStep();
                    },
                }));
                break;
            case 4:
                content.appendChild(createConfirmationStep({
                    onLogin: () => navigate('/login'),
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