import './signup.css';
import '../../auth-feedback.css';
import { createAuthFeedback } from '../../auth-feedback';
import { scrollToFirstInvalidField, setAuthFieldError } from '../../auth-validation';

export interface SignupInfoData {
    studentId: string;
    fullName: string;
    studentEmail: string;
    faculty: string;
    program: string;
    volunteer: boolean;
}

const FACULTY_PROGRAMS = {
    'Faculty of Business, Economics and Accounting (FBEA)': [
        'Diploma in Business',
        'Bachelor in Accounting (Honours)',
        'Bachelor in International Business (Honours)',
        'Bachelor of Marketing (Honours)',
        'Bachelor of Business (Entrepreneurship) (Honours)',
        'Bachelor of Business (Finance) (Honours)',
        'Bachelor of Business (Human Resource Management) (Honours)',
        'Bachelor of Business Analytics (Honours)',
        'Bachelor of Business Psychology (Honours)',
        'Bachelor of Economics (Honours)',
        'Bachelor of Management (Honours)',
    ],
    'Faculty of Computing and Digital Technology (FCDT)': [
        'Diploma in Information Technology',
        'Bachelor of Information Technology (Honours)',
        'Bachelor in Information Technology (Data Analytics) (Honours)',
        'Bachelor of Computer Science (Honours)',
        'Master of Data Science',
        'Master in Artificial Intelligence',
        'Master in Cybersecurity',
    ],
    'Faculty of Behavioural Sciences': [
        'Bachelor of Psychology (Honours)',
        'Master of Clinical Psychology',
        'Master in Counselling',
        'Master of Philosophy (Psychology)',
        'Doctor of Philosophy (Psychology)',
    ],
    'Faculty of Communication, Media and Creative Industries': [
        'Diploma in Communication',
        'Bachelor of Communication (Public Relations) (Honours)',
        'Bachelor of Communication (Marketing Communication) (Honours)',
        'Bachelor in Communication (Media Studies) (Honours)',
        'Master in Communication and Creative Industries',
    ],
    'Faculty of Law and Government': [
        'Bachelor of Laws (Honours)',
        'UK Degree Transfer Programme (Law)',
        'Master of Cyber Law',
    ],
    'Faculty of University Foundation Studies': [
        'Foundation in Arts',
        'Foundation in Science',
    ],
} as const;

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

            <div class="signup-field">
                <label for="faculty">Faculty</label>
                <select id="faculty" required>
                    <option value="" disabled>Select Faculty</option>
                    ${Object.keys(FACULTY_PROGRAMS).map((faculty) => `<option value="${faculty}">${faculty}</option>`).join('')}
                </select>
            </div>

            <div class="signup-field">
                <label for="program">Program</label>
                <select id="program" required disabled>
                    <option value="" disabled selected>Select Program</option>
                </select>
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
    const facultySelect = container.querySelector<HTMLSelectElement>('#faculty')!;
    const programSelect = container.querySelector<HTMLSelectElement>('#program')!;
    const volunteerInput = container.querySelector<HTMLInputElement>('#volunteer')!;
    const submitButton = container.querySelector<HTMLButtonElement>('.signup-button')!;
    const showFeedback = createAuthFeedback(form);
    const fields = [studentIdInput, fullNameInput, studentEmailInput, facultySelect, programSelect];
    const touchedFields = new Set<HTMLInputElement | HTMLSelectElement>();
    let hasSubmitted = false;

    const validateStudentId = () => {
    let message = '';
    const studentId = studentIdInput.value.trim();

    if (studentId === '') {
        message = 'Enter your student ID.';
    } else if (!/^B\d{7}$/.test(studentId)) {
        message = 'Student ID must start with B followed by 7 digits.';
    } else {
        message = '';
    }

    setAuthFieldError(studentIdInput, message);

    if (message === '') {
        return true;
    } else {
        return false;
    }
};
    const validateFullName = () => {
        const message = fullNameInput.value.trim() ? '' : 'Enter your full name.';
        setAuthFieldError(fullNameInput, message);
        return !message;
    };

    const validateEmail = () => {
        const value = studentEmailInput.value.trim();
        const message = !value
            ? 'Enter your student email.'
            : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? ''
                : 'Enter a valid email address.';
        setAuthFieldError(studentEmailInput, message);
        return !message;
    };

    const validateFaculty = () => {
        const message = facultySelect.value ? '' : 'Select your faculty.';
        setAuthFieldError(facultySelect, message);
        return !message;
    };

    const validateProgram = () => {
        const message = programSelect.value ? '' : 'Select your program.';
        setAuthFieldError(programSelect, message);
        return !message;
    };

    const validateField = (field: typeof fields[number]) => {
        if (field === studentIdInput) return validateStudentId();
        if (field === fullNameInput) return validateFullName();
        if (field === studentEmailInput) return validateEmail();
        if (field === facultySelect) return validateFaculty();
        return validateProgram();
    };

    let currentSignupInfo = { ...signupInfo };
    studentIdInput.value = signupInfo.studentId;
    fullNameInput.value = signupInfo.fullName;
    studentEmailInput.value = signupInfo.studentEmail;
    facultySelect.value = signupInfo.faculty;
    volunteerInput.checked = signupInfo.volunteer;

    const renderPrograms = (faculty: string, selectedProgram = '') => {
        programSelect.replaceChildren();
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = 'Select Program';
        placeholder.disabled = true;
        placeholder.selected = true;
        programSelect.appendChild(placeholder);

        const programs = Object.entries(FACULTY_PROGRAMS)
            .find(([facultyName]) => facultyName === faculty)?.[1] ?? [];
        for (const program of programs) {
            const option = document.createElement('option');
            option.value = program;
            option.textContent = program;
            programSelect.appendChild(option);
        }

        programSelect.disabled = !faculty;
        programSelect.value = programs.some((program) => program === selectedProgram) ? selectedProgram : '';
    };

    const updateSignupInfo = (updates: Partial<SignupInfoData>) => {
        currentSignupInfo = { ...currentSignupInfo, ...updates };
        setSignupInfo(currentSignupInfo);
    };

    renderPrograms(signupInfo.faculty, signupInfo.program);

    studentIdInput.addEventListener('input', (event) => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(studentIdInput)) validateStudentId();
        updateSignupInfo({ studentId: (event.target as HTMLInputElement).value });
    });

    fullNameInput.addEventListener('input', (event) => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(fullNameInput)) validateFullName();
        updateSignupInfo({ fullName: (event.target as HTMLInputElement).value });
    });

    studentEmailInput.addEventListener('input', (event) => {
        showFeedback('');
        if (hasSubmitted || touchedFields.has(studentEmailInput)) validateEmail();
        updateSignupInfo({ studentEmail: (event.target as HTMLInputElement).value });
    });

    facultySelect.addEventListener('change', () => {
        showFeedback('');
        renderPrograms(facultySelect.value);
        updateSignupInfo({ faculty: facultySelect.value, program: '' });
        if (hasSubmitted || touchedFields.has(facultySelect)) validateFaculty();
        if (hasSubmitted || touchedFields.has(programSelect)) validateProgram();
    });

    programSelect.addEventListener('change', () => {
        showFeedback('');
        updateSignupInfo({ program: programSelect.value });
        if (hasSubmitted || touchedFields.has(programSelect)) validateProgram();
    });

    fields.forEach((field) => {
        field.addEventListener('blur', () => {
            touchedFields.add(field);
            validateField(field);
        });
    });

    volunteerInput.addEventListener('change', (event) => {
        updateSignupInfo({ volunteer: (event.target as HTMLInputElement).checked });
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (submitButton.disabled) return;
        hasSubmitted = true;

        const currentInfo: SignupInfoData = {
            studentId: studentIdInput.value.trim(),
            fullName: fullNameInput.value.trim(),
            studentEmail: studentEmailInput.value.trim(),
            faculty: facultySelect.value,
            program: programSelect.value,
            volunteer: volunteerInput.checked,
        };

        const valid = fields.map(validateField).every(Boolean);
        if (!valid) {
            scrollToFirstInvalidField(fields);
            return;
        }

        currentSignupInfo = currentInfo;
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