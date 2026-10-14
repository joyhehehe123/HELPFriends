import './signup.css';
import '../../auth-feedback.css';
import { createAuthFeedback } from '../../auth-feedback';

export interface SignupInfoData {
    studentId: string;
    fullName: string;
    studentEmail: string;
    volunteer: boolean;
}

interface SignupProps {
    signupInfo: SignupInfoData;
    setSignupInfo: (info: SignupInfoData) => void;
    onNext: () => void | Promise<boolean>;
}

export default function createSignupStep({
    signupInfo,
    setSignupInfo,
    onNext,
}: SignupProps): HTMLElement {
    const container = document.createElement('div');
    container.className = 'signup-card';
    container.innerHTML = `
        <div class="signup-header">
            <h2>Sign Up</h2>
        </div>

        <form class="signup-form" novalidate>
            <div class="signup-field">
                <label for="studentId">Student ID</label>
                <input id="studentId" type="text" autocomplete="off" required />
            </div>

            <div class="signup-field">
                <label for="fullName">Full Name</label>
                <input id="fullName" type="text" autocomplete="name" required />
            </div>

            <div class="signup-field">
                <label for="studentEmail">Student Email</label>
                <input id="studentEmail" type="email" autocomplete="email" required />
            </div>

            <label class="volunteer-card" for="volunteer">
                <input id="volunteer" type="checkbox" />
                <span class="volunteer-text">
                    <span class="volunteer-title">Become A Volunteer</span>
                    <span class="volunteer-description">Help other students by providing support through HELPFriends.</span>
                </span>
            </label>

            <div class="signup-actions">
                <button type="submit" class="signup-button">Confirm</button>
            </div>
        </form>
    `;

    const form = container.querySelector<HTMLFormElement>('form')!;
    const studentIdInput = container.querySelector<HTMLInputElement>('#studentId')!;
    const fullNameInput = container.querySelector<HTMLInputElement>('#fullName')!;
    const studentEmailInput = container.querySelector<HTMLInputElement>('#studentEmail')!;
    const volunteerInput = container.querySelector<HTMLInputElement>('#volunteer')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const showFeedback = createAuthFeedback(form);

    studentIdInput.value = signupInfo.studentId;
    fullNameInput.value = signupInfo.fullName;
    studentEmailInput.value = signupInfo.studentEmail;
    volunteerInput.checked = signupInfo.volunteer;

    const updateSignupInfo = (field: keyof SignupInfoData, value: string | boolean) => {
        setSignupInfo({
            ...signupInfo,
            [field]: value,
        });
    };

    studentIdInput.addEventListener('input', (event) => {
        showFeedback('');
        updateSignupInfo('studentId', (event.target as HTMLInputElement).value);
    });

    fullNameInput.addEventListener('input', (event) => {
        showFeedback('');
        updateSignupInfo('fullName', (event.target as HTMLInputElement).value);
    });

    studentEmailInput.addEventListener('input', (event) => {
        showFeedback('');
        updateSignupInfo('studentEmail', (event.target as HTMLInputElement).value);
    });

    volunteerInput.addEventListener('change', (event) => {
        updateSignupInfo('volunteer', (event.target as HTMLInputElement).checked);
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;

        const currentInfo: SignupInfoData = {
            studentId: studentIdInput.value.trim(),
            fullName: fullNameInput.value.trim(),
            studentEmail: studentEmailInput.value.trim(),
            volunteer: volunteerInput.checked,
        };

        if (!currentInfo.studentId || !currentInfo.fullName || !currentInfo.studentEmail) {
            showFeedback('Please fill in all fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentInfo.studentEmail)) {
            showFeedback('Please enter a valid email address.');
            return;
        }

        setSignupInfo(currentInfo);
        submitButton.disabled = true;
        submitButton.textContent = 'Sending code...';
        const submitted = await onNext();
        if (submitted === false) {
            submitButton.disabled = false;
            submitButton.textContent = 'Confirm';
        }
    });

    return container;
}