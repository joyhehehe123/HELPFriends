import './VolunteerSteps/volunteer.css';
import createCategoryStep from './VolunteerSteps/volunteer-category';
import createSkillsStep from './VolunteerSteps/volunteer-skills';
import createAvailabilityStep from './VolunteerSteps/volunteer-availability';
import createSupportModeStep from './VolunteerSteps/volunteer-mode';
import { getAvailableSkills } from './Voluteer';
import type { DayKey as RegistrationDayKey, SupportCategory as RegistrationCategory, SupportMode as RegistrationMode, VolunteerRegistrationData } from './Voluteer';
import { getCurrentUid } from '../../../services/authService';
import { registerVolunteer } from '../../../services/volunteerService';
import type { Day, SupportCategory } from '../../../types/constants';

const DAY_NAMES: Record<RegistrationDayKey, Day> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
};

const CATEGORY_NAMES: Record<RegistrationCategory, SupportCategory> = {
    academic: 'Academic',
    technology: 'Technology',
    newStudent: 'New Student',
    general: 'General Student',
};

interface MultiStepFormProps {
    initialData?: Partial<VolunteerRegistrationData>;
    navigate: (path: string) => void;
}

export default function createVolunteerMultiStepForm({ initialData, navigate }: MultiStepFormProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'vol-page';

    const body = document.createElement('main');
    body.className = 'vol-page-body';

    const state: VolunteerRegistrationData = {
        categoryInfo: {
            categories: initialData?.categoryInfo?.categories ?? [],
        },
        skillsInfo: {
            selectedSkills: initialData?.skillsInfo?.selectedSkills ?? [],
            customSkills: initialData?.skillsInfo?.customSkills ?? [],
        },
        availabilityInfo: {
            schedule: {
                mon: initialData?.availabilityInfo?.schedule?.mon ?? [],
                tue: initialData?.availabilityInfo?.schedule?.tue ?? [],
                wed: initialData?.availabilityInfo?.schedule?.wed ?? [],
                thu: initialData?.availabilityInfo?.schedule?.thu ?? [],
                fri: initialData?.availabilityInfo?.schedule?.fri ?? [],
            },
        },
        supportModeInfo: {
            modes: initialData?.supportModeInfo?.modes ?? [],
        },
    };

    const totalSteps = 4;
    let currentStep = 1;

    // ---------- Progress ----------
    const progress = document.createElement('div');
    progress.className = 'vol-progress';
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '1');
    progress.setAttribute('aria-valuemax', String(totalSteps));

    for (let step = 1; step <= totalSteps; step++) {
        if (step > 1) {
            const line = document.createElement('div');
            line.className = 'vol-progress-line';
            progress.appendChild(line);
        }
        const dot = document.createElement('div');
        dot.className = 'vol-progress-dot';
        progress.appendChild(dot);
    }

    const progressLabel = document.createElement('p');
    progressLabel.className = 'vol-progress-label';

    const title = document.createElement('h1');
    title.className = 'vol-title';
    title.textContent = 'Become a Volunteer';

    const card = document.createElement('div');
    card.className = 'vol-card';

    const content = document.createElement('div');
    content.className = 'step-content';
    card.appendChild(content);

    const updateProgress = (): void => {
        const dots = progress.querySelectorAll('.vol-progress-dot');
        const lines = progress.querySelectorAll('.vol-progress-line');
        dots.forEach((dot, index) => dot.classList.toggle('is-active', index + 1 <= currentStep));
        lines.forEach((line, index) => line.classList.toggle('is-filled', index + 1 < currentStep));
        progress.setAttribute('aria-valuenow', String(currentStep));
        progressLabel.textContent = `Step ${currentStep} of ${totalSteps}`;
    };

    const goTo = (step: number): void => {
        currentStep = step;
        renderStep();
    };

    const renderStep = (): void => {
        content.replaceChildren();
        updateProgress();

        switch (currentStep) {
            case 1:
                content.appendChild(createCategoryStep({
                    categoryInfo: state.categoryInfo,
                    setCategoryInfo: (info) => {
                        state.categoryInfo = info;

                        // Skills depend on the chosen categories, so remove any that no longer apply.
                        const available = getAvailableSkills(info.categories);
                        state.skillsInfo = {
                            ...state.skillsInfo,
                            selectedSkills: state.skillsInfo.selectedSkills.filter((skill) => available.includes(skill)),
                        };
                    },
                    onReturn: () => navigate('/profile/volunteer-profile'),
                    onNext: () => goTo(2),
                }));
                break;
            case 2:
                content.appendChild(createSkillsStep({
                    categories: state.categoryInfo.categories,
                    skillsInfo: state.skillsInfo,
                    setSkillsInfo: (info) => {
                        state.skillsInfo = info;
                    },
                    onBack: () => goTo(1),
                    onNext: () => goTo(3),
                }));
                break;
            case 3:
                content.appendChild(createAvailabilityStep({
                    availabilityInfo: state.availabilityInfo,
                    setAvailabilityInfo: (info) => {
                        state.availabilityInfo = info;
                    },
                    onBack: () => goTo(2),
                    onNext: () => goTo(4),
                }));
                break;
            case 4:
                content.appendChild(createSupportModeStep({
                    supportModeInfo: state.supportModeInfo,
                    setSupportModeInfo: (info) => {
                        state.supportModeInfo = info;
                    },
                    onBack: () => goTo(3),
                    onNext: async (): Promise<boolean> => {
                        try {
                            const uid = getCurrentUid();
                            if (!uid) {
                                throw new Error('Your session has expired. Please sign in again.');
                            }

                            const modes: RegistrationMode[] = state.supportModeInfo.modes;
                            const preferredMode = modes.length === 2
                                ? 'Both'
                                : modes[0] === 'virtual' ? 'Virtual' : 'Physical';
                            const availability = (Object.entries(state.availabilityInfo.schedule) as [
                                RegistrationDayKey,
                                VolunteerRegistrationData['availabilityInfo']['schedule'][RegistrationDayKey],
                            ][]).flatMap(([day, timeSlots]) => timeSlots.length > 0
                                ? [{ day: DAY_NAMES[day], timeSlots }]
                                : []);

                            await registerVolunteer(uid, {
                                preferredMode,
                                supportCategories: state.categoryInfo.categories.map(
                                    (category) => CATEGORY_NAMES[category],
                                ),
                                skills: [...new Set([
                                    ...state.skillsInfo.selectedSkills,
                                    ...state.skillsInfo.customSkills,
                                ])],
                                availability,
                            });
                            navigate('/profile/volunteer-profile');
                            return true;
                        } catch (error) {
                            console.error('Volunteer registration failed', error);
                            throw error;
                        }
                    },
                }));
                break;
            default:
                break;
        }
    };

    renderStep();

    body.append(progress, progressLabel, title, card);
    container.append(body);
    return container;
}