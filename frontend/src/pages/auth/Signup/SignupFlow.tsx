import './SignupSteps/signup.css';
import createSignupStep from './SignupSteps/signup.tsx';
import type { SignupInfoData } from './SignupSteps/signup.tsx';
import createVolunteerCategoryStep from '../VolunteerSignup/VolunteerSteps/volunteer-category';
import createVolunteerSkillsStep from '../VolunteerSignup/VolunteerSteps/volunteer-skills';
import createVolunteerAvailabilityStep from '../VolunteerSignup/VolunteerSteps/volunteer-availability';
import createVolunteerModeStep from '../VolunteerSignup/VolunteerSteps/volunteer-mode';
import { getAvailableSkills } from '../VolunteerSignup/Voluteer.ts';
import type { VolunteerRegistrationData } from '../VolunteerSignup/Voluteer.ts';
import createTwoFactorStep from './SignupSteps/signup-2fa.tsx';
import createSetPasswordStep from './SignupSteps/signup-password.tsx';
import createConfirmationStep from './SignupSteps/signup-confirmation.tsx';

interface SignupFlowProps {
    initialData?: Partial<SignupInfoData>;
}
 
type StepId =
    | 'signup'
    | 'category'
    | 'skills'
    | 'availability'
    | 'mode'
    | '2fa'
    | 'password'
    | 'confirmation';
 
// These four only appear when "Become A Volunteer" is ticked on the sign up step.
const VOLUNTEER_STEPS: StepId[] = ['category', 'skills', 'availability', 'mode'];
 
export default function createSignupFlow({ initialData }: SignupFlowProps = {}): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-page';
 
    const navigate = (path: string) => {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
    };
 
    const state: {
        signupInfo: SignupInfoData;
        volunteer: VolunteerRegistrationData;
        otp: string;
    } = {
        signupInfo: {
            studentId: initialData?.studentId ?? '',
            fullName: initialData?.fullName ?? '',
            studentEmail: initialData?.studentEmail ?? '',
            volunteer: initialData?.volunteer ?? false,
        },
        volunteer: {
            categoryInfo: { categories: [] },
            skillsInfo: { selectedSkills: [], customSkills: [] },
            availabilityInfo: {
                schedule: {
                    mon: [],
                    tue: [],
                    wed: [],
                    thu: [],
                    fri: [],
                },
            },
            supportModeInfo: { modes: [] },
        },
        otp: '',
    };
 
    // The order of steps depends on whether the user wants to become a volunteer.
    const getSequence = (): StepId[] => [
        'signup',
        ...(state.signupInfo.volunteer ? VOLUNTEER_STEPS : []),
        '2fa',
        'password',
        'confirmation',
    ];
 
    let currentStep: StepId = 'signup';
 
    const content = document.createElement('main');
    content.className = 'signup-content';
 
    const goTo = (step: StepId) => {
        currentStep = step;
        renderStep();
    };
 
    const goNext = () => {
        const sequence = getSequence();
        const next = sequence[sequence.indexOf(currentStep) + 1];
        if (!next) return;
 
        if (next === '2fa') {
            // TODO (API): request the OTP email here
        }
        goTo(next);
    };
 
    const goBack = () => {
        const sequence = getSequence();
        const previous = sequence[sequence.indexOf(currentStep) - 1];
        if (previous) goTo(previous);
    };
 
    const renderStep = () => {
        content.replaceChildren();
 
        switch (currentStep) {
            case 'signup':
                content.appendChild(createSignupStep({
                    signupInfo: state.signupInfo,
                    setSignupInfo: (info) => {
                        state.signupInfo = info;
                    },
                    onNext: goNext,
                }));
                break;
            case 'category':
                content.appendChild(createVolunteerCategoryStep({
                    categoryInfo: state.volunteer.categoryInfo,
                    setCategoryInfo: (categoryInfo) => {
                        state.volunteer.categoryInfo = categoryInfo;
                        const availableSkills = getAvailableSkills(categoryInfo.categories);
                        state.volunteer.skillsInfo = {
                            ...state.volunteer.skillsInfo,
                            selectedSkills: state.volunteer.skillsInfo.selectedSkills.filter((skill) =>
                                availableSkills.includes(skill),
                            ),
                        };
                    },
                    onReturn: () => goTo('signup'),
                    onNext: goNext,
                }));
                break;
            case 'skills':
                content.appendChild(createVolunteerSkillsStep({
                    categories: state.volunteer.categoryInfo.categories,
                    skillsInfo: state.volunteer.skillsInfo,
                    setSkillsInfo: (skillsInfo) => {
                        state.volunteer.skillsInfo = skillsInfo;
                    },
                    onBack: goBack,
                    onNext: goNext,
                }));
                break;
            case 'availability':
                content.appendChild(createVolunteerAvailabilityStep({
                    availabilityInfo: state.volunteer.availabilityInfo,
                    setAvailabilityInfo: (availabilityInfo) => {
                        state.volunteer.availabilityInfo = availabilityInfo;
                    },
                    onBack: goBack,
                    onNext: goNext,
                }));
                break;
            case 'mode':
                content.appendChild(createVolunteerModeStep({
                    supportModeInfo: state.volunteer.supportModeInfo,
                    setSupportModeInfo: (supportModeInfo) => {
                        state.volunteer.supportModeInfo = supportModeInfo;
                    },
                    onBack: goBack,
                    onNext: goNext,
                }));
                break;
            case '2fa':
                content.appendChild(createTwoFactorStep({
                    onBack: () => goTo('signup'), // "Return to registration"
                    onResend: async (): Promise<boolean> => {
                        // TODO (API): resend the OTP email here
                        return true;
                    },
                    onNext: (otp) => {
                        // TODO (API): verify the OTP here (currently accepts any 6 digits)
                        state.otp = otp;
                        goNext();
                    },
                }));
                break;
            case 'password':
                content.appendChild(createSetPasswordStep({
                    onBack: () => goTo('signup'), // "Return to registration"
                    onNext: () => {
                        // TODO (API): create the account with the password here.
                        // If state.signupInfo.volunteer is true, also send state.volunteer
                        // (categories, skills + customSkills, availability, supportModes).
                        goNext();
                    },
                }));
                break;
            case 'confirmation':
                content.appendChild(createConfirmationStep({
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