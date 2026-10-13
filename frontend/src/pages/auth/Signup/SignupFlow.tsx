import './SignupSteps/signup.css';
import createSignupStep from './SignupSteps/signup.tsx';
import type { SignupInfoData } from './SignupSteps/signup.tsx';
import { doc, writeBatch } from 'firebase/firestore';
import { deleteUser, type User as AuthUser } from 'firebase/auth';
import { db } from '../../../firebase';
import { signUp } from '../../../services/authService';
import type { User } from '../../../types/user';
import type { Volunteer } from '../../../types/volunteer';
import createVolunteerCategoryStep from '../VolunteerSignup/VolunteerSteps/volunteer-category';
import createVolunteerSkillsStep from '../VolunteerSignup/VolunteerSteps/volunteer-skills';
import createVolunteerAvailabilityStep from '../VolunteerSignup/VolunteerSteps/volunteer-availability';
import createVolunteerModeStep from '../VolunteerSignup/VolunteerSteps/volunteer-mode';
import '../VolunteerSignup/VolunteerSteps/volunteer.css';
import { getAvailableSkills } from '../VolunteerSignup/Voluteer.ts';
import type { DayKey, SupportCategory, VolunteerRegistrationData } from '../VolunteerSignup/Voluteer.ts';
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
 
        goTo(next);
    };
 
    const goBack = () => {
        const sequence = getSequence();
        const previous = sequence[sequence.indexOf(currentStep) - 1];
        if (previous) goTo(previous);
    };
 
    const renderStep = () => {
        content.replaceChildren();
        const isVolunteerStep = VOLUNTEER_STEPS.includes(currentStep);
        const stepContent = document.createElement('div');

        if (isVolunteerStep) {
            container.className = 'signup-page vol-page';
            content.className = 'vol-page-body';

            const progress = document.createElement('div');
            progress.className = 'vol-progress';
            progress.setAttribute('role', 'progressbar');
            progress.setAttribute('aria-valuemin', '1');
            progress.setAttribute('aria-valuemax', String(VOLUNTEER_STEPS.length));
            const activeStep = VOLUNTEER_STEPS.indexOf(currentStep) + 1;
            progress.setAttribute('aria-valuenow', String(activeStep));

            VOLUNTEER_STEPS.forEach((_, index) => {
                if (index > 0) {
                    const line = document.createElement('div');
                    line.className = `vol-progress-line${index < activeStep ? ' is-filled' : ''}`;
                    progress.appendChild(line);
                }

                const dot = document.createElement('div');
                dot.className = `vol-progress-dot${index < activeStep ? ' is-active' : ''}`;
                progress.appendChild(dot);
            });

            const progressLabel = document.createElement('p');
            progressLabel.className = 'vol-progress-label';
            progressLabel.textContent = `Step ${activeStep} of ${VOLUNTEER_STEPS.length}`;

            const title = document.createElement('h1');
            title.className = 'vol-title';
            title.textContent = 'Become a Volunteer';

            const card = document.createElement('div');
            card.className = 'vol-card';
            card.appendChild(stepContent);
            content.append(progress, progressLabel, title, card);
        } else {
            container.className = 'signup-page';
            content.className = 'signup-content';
            content.appendChild(stepContent);
        }

        switch (currentStep) {
            case 'signup':
                stepContent.appendChild(createSignupStep({
                    signupInfo: state.signupInfo,
                    setSignupInfo: (info) => {
                        state.signupInfo = info;
                    },
                    onNext: goNext,
                }));
                break;
            case 'category':
                stepContent.appendChild(createVolunteerCategoryStep({
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
                stepContent.appendChild(createVolunteerSkillsStep({
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
                stepContent.appendChild(createVolunteerAvailabilityStep({
                    availabilityInfo: state.volunteer.availabilityInfo,
                    setAvailabilityInfo: (availabilityInfo) => {
                        state.volunteer.availabilityInfo = availabilityInfo;
                    },
                    onBack: goBack,
                    onNext: goNext,
                }));
                break;
            case 'mode':
                stepContent.appendChild(createVolunteerModeStep({
                    supportModeInfo: state.volunteer.supportModeInfo,
                    setSupportModeInfo: (supportModeInfo) => {
                        state.volunteer.supportModeInfo = supportModeInfo;
                    },
                    onBack: goBack,
                    onNext: goNext,
                }));
                break;
            case '2fa':
                stepContent.appendChild(createTwoFactorStep({
                    onBack: goBack,
                    onResend: async () => {
                        alert('Email code delivery is not connected yet.');
                        return false;
                    },
                    onNext: () => {
                        goNext();
                    },
                }));
                break;
            case 'password':
                stepContent.appendChild(createSetPasswordStep({
                    onBack: () => goTo('signup'), // "Return to registration"
                    onNext: async (password) => {
                        let createdUser: AuthUser | undefined;

                        try {
                            createdUser = await signUp(state.signupInfo.studentEmail, password);

                            const batch = writeBatch(db);
                            const userProfile: Omit<User, 'uid'> = {
                                email: state.signupInfo.studentEmail,
                                fullName: state.signupInfo.fullName,
                                studentId: state.signupInfo.studentId,
                                isVolunteer: state.signupInfo.volunteer,
                                faculty: null,
                                program: null,
                                bio: null,
                                profilePic: null,
                            };

                            batch.set(doc(db, 'users', createdUser.uid), {
                                ...userProfile,
                                uid: createdUser.uid,
                            });

                            if (state.signupInfo.volunteer) {
                                const categoryNames: Record<SupportCategory, Volunteer['supportCategories'][number]> = {
                                    academic: 'Academic',
                                    technology: 'Technology',
                                    newStudent: 'New Student',
                                    general: 'General Student',
                                };
                                const dayNames: Record<DayKey, Volunteer['availability'][number]['day']> = {
                                    mon: 'Monday',
                                    tue: 'Tuesday',
                                    wed: 'Wednesday',
                                    thu: 'Thursday',
                                    fri: 'Friday',
                                };
                                const modes = state.volunteer.supportModeInfo.modes;
                                const preferredMode: Volunteer['preferredMode'] = modes.length === 2
                                    ? 'Both'
                                    : modes[0] === 'virtual' ? 'Virtual' : 'Physical';

                                const volunteerProfile: Omit<Volunteer, 'uid' | 'rating' | 'isActive'> = {
                                    preferredMode,
                                    supportCategories: state.volunteer.categoryInfo.categories.map(
                                        (category) => categoryNames[category],
                                    ),
                                    skills: [
                                        ...new Set([
                                            ...state.volunteer.skillsInfo.selectedSkills,
                                            ...state.volunteer.skillsInfo.customSkills,
                                        ]),
                                    ],
                                    availability: (Object.entries(state.volunteer.availabilityInfo.schedule) as [
                                        DayKey,
                                        typeof state.volunteer.availabilityInfo.schedule[DayKey],
                                    ][]).flatMap(([day, timeSlots]) =>
                                        timeSlots.length > 0
                                            ? [{ day: dayNames[day], timeSlots }]
                                            : [],
                                    ),
                                };

                                batch.set(doc(db, 'volunteers', createdUser.uid), {
                                    ...volunteerProfile,
                                    uid: createdUser.uid,
                                    rating: 0,
                                    isActive: true,
                                });
                            }

                            await batch.commit();
                            goNext();
                            return true;
                        } catch (error) {
                            if (createdUser) {
                                try {
                                    await deleteUser(createdUser);
                                } catch (cleanupError) {
                                    console.error('Failed to remove Firebase account after signup error:', cleanupError);
                                    alert('Signup did not complete and the new account could not be cleaned up. Please contact support before trying again.');
                                    return false;
                                }
                            }

                            alert(error instanceof Error ? error.message : 'Unable to create your account.');
                            return false;
                        }
                    },
                }));
                break;
            case 'confirmation':
                stepContent.appendChild(createConfirmationStep({
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