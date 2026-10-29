import './Profile.css';
import createProfileLayout from './ProfileLayout';
import { profileStore } from './ProfileData';
import { getCurrentUid } from '../../services/authService';
import { getUser, updateUser } from '../../services/userService';
import { DEFAULT_AVATAR } from './DefaultAvatar';

const MAX_ABOUT_LENGTH = 300;

const PENCIL_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>`;

interface AccountDetailsProps {
    navigate: (path: string) => void;
}

export default function createAccountDetailsPage({ navigate }: AccountDetailsProps): HTMLElement {
    const { profile } = profileStore;

    const content = document.createElement('div');
    content.className = 'profile-content';
    content.innerHTML = `
        <p class="profile-feedback" role="status">Loading profile...</p>
        <section class="profile-card profile-summary">
            <div class="avatar-wrap">
                <img class="avatar-image" src="${profile.avatarUrl}" alt="Your profile picture" />
            </div>
            <div class="summary-text">
                <h2 class="summary-name"></h2>
                <p class="summary-muted summary-student-id"></p>
                <p class="summary-muted summary-email"></p>
                <p class="summary-muted summary-academic"></p>
            </div>
        </section>

        <section class="profile-section">
            <h3 class="profile-section-title">About Me</h3>
            <div class="profile-card about-card">
                <p class="about-text"></p>
                <button type="button" class="about-edit" aria-label="Edit about me">${PENCIL_ICON}</button>
                <form class="about-form" hidden>
                    <textarea id="aboutMe" class="about-textarea" rows="4" maxlength="${MAX_ABOUT_LENGTH}" placeholder="Tell others a bit about yourself"></textarea>
                    <div class="about-actions">
                        <span class="about-count"></span>
                        <button type="button" class="profile-button profile-button--ghost about-cancel">Cancel</button>
                        <button type="submit" class="profile-button">Save</button>
                    </div>
                </form>
            </div>
        </section>

        <div class="info-grid">
            <section class="profile-section">
                <h3 class="profile-section-title">Student Information</h3>
                <div class="profile-card info-card">
                    <dl>
                    <dt>Student ID:</dt><dd class="profile-student-id"></dd>
                    <dt>Faculty:</dt><dd class="profile-faculty"></dd>
                    <dt>Programme:</dt><dd class="profile-program"></dd>
                    </dl>
                </div>
            </section>

            <section class="profile-section">
                <h3 class="profile-section-title">Account Information</h3>
                <div class="profile-card info-card">
                    <dl>
                    <dt>Account Type:</dt><dd class="profile-account-type"></dd>
                    <dt>University Email:</dt><dd class="profile-account-email"></dd>
                    </dl>
                </div>
            </section>
        </div>
    `;

    const avatarImage = content.querySelector<HTMLImageElement>('.avatar-image')!;

    const aboutText = content.querySelector<HTMLElement>('.about-text')!;
    const aboutEditButton = content.querySelector<HTMLButtonElement>('.about-edit')!;
    const aboutForm = content.querySelector<HTMLFormElement>('.about-form')!;
    const aboutTextarea = content.querySelector<HTMLTextAreaElement>('#aboutMe')!;
    const aboutCount = content.querySelector<HTMLElement>('.about-count')!;
    const aboutCancelButton = content.querySelector<HTMLButtonElement>('.about-cancel')!;
    const summaryAcademic = content.querySelector<HTMLElement>('.summary-academic')!;
    const summaryName = content.querySelector<HTMLElement>('.summary-name')!;
    const summaryStudentId = content.querySelector<HTMLElement>('.summary-student-id')!;
    const summaryEmail = content.querySelector<HTMLElement>('.summary-email')!;
    const studentIdValue = content.querySelector<HTMLElement>('.profile-student-id')!;
    const facultyValue = content.querySelector<HTMLElement>('.profile-faculty')!;
    const programValue = content.querySelector<HTMLElement>('.profile-program')!;
    const accountTypeValue = content.querySelector<HTMLElement>('.profile-account-type')!;
    const accountEmailValue = content.querySelector<HTMLElement>('.profile-account-email')!;
    const feedback = content.querySelector<HTMLElement>('.profile-feedback')!;

    const setFeedback = (message: string, isError = false) => {
        feedback.textContent = message;
        feedback.hidden = !message;
        feedback.classList.toggle('profile-feedback--error', isError);
    };

    const renderUser = (user: NonNullable<Awaited<ReturnType<typeof getUser>>>) => {
        profile.fullName = user.fullName;
        profile.studentId = user.studentId;
        profile.universityEmail = user.email;
        profile.faculty = user.faculty ?? '';
        profile.programme = user.program ?? '';
        profile.aboutMe = user.bio ?? '';
        profile.avatarUrl = user.profilePic ?? DEFAULT_AVATAR;

        summaryName.textContent = profile.fullName;
        summaryStudentId.textContent = profile.studentId;
        summaryEmail.textContent = profile.universityEmail;
        summaryAcademic.replaceChildren();
        summaryAcademic.append(document.createTextNode(profile.faculty));
        if (profile.faculty && profile.programme) {
            summaryAcademic.appendChild(document.createElement('br'));
        }
        summaryAcademic.append(document.createTextNode(profile.programme));
        studentIdValue.textContent = profile.studentId;
        facultyValue.textContent = profile.faculty;
        programValue.textContent = profile.programme;
        accountTypeValue.textContent = user.isVolunteer
            ? 'Support Seeker + Student Volunteer'
            : 'Support Seeker';
        accountEmailValue.textContent = profile.universityEmail;
        avatarImage.src = profile.avatarUrl;
        renderAbout();
    };

    const uid = getCurrentUid();
    if (!uid) {
        setFeedback('Unable to load your profile. Please sign in again.', true);
    } else {
        void getUser(uid)
            .then((user) => {
                if (!user) {
                    setFeedback('Your account profile could not be found.', true);
                    return;
                }
                renderUser(user);
                setFeedback('');
            })
            .catch((error: unknown) => {
                console.error('Failed to load the account profile:', error);
                setFeedback('Unable to load your profile. Please try again later.', true);
            });
    }

    // ----- About me -----
    const renderAbout = () => {
        aboutText.textContent = profile.aboutMe || 'Tell others a bit about yourself.';
        aboutText.classList.toggle('is-empty', !profile.aboutMe);
    };

    const updateAboutCount = () => {
        aboutCount.textContent = `${aboutTextarea.value.length}/${MAX_ABOUT_LENGTH}`;
    };

    const setEditingAbout = (editing: boolean) => {
        aboutForm.hidden = !editing;
        aboutText.hidden = editing;
        aboutEditButton.hidden = editing;
        if (editing) {
            aboutTextarea.value = profile.aboutMe;
            updateAboutCount();
            aboutTextarea.focus();
        }
    };

    renderAbout();

    aboutEditButton.addEventListener('click', () => setEditingAbout(true));
    aboutCancelButton.addEventListener('click', () => setEditingAbout(false));
    aboutTextarea.addEventListener('input', updateAboutCount);

    aboutForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const currentUid = getCurrentUid();
        if (!currentUid) {
            setFeedback('Unable to save your profile. Please sign in again.', true);
            return;
        }

        const saveButton = aboutForm.querySelector<HTMLButtonElement>('button[type="submit"]')!;
        saveButton.disabled = true;
        setFeedback('Saving profile...');
        const aboutMe = aboutTextarea.value.trim();
        try {
            await updateUser(currentUid, { bio: aboutMe || null });
            profile.aboutMe = aboutMe;
            renderAbout();
            setEditingAbout(false);
            setFeedback('Profile updated.');
        } catch (error) {
            console.error('Failed to save the profile description:', error);
            setFeedback('Unable to save your profile. Please try again.', true);
        } finally {
            saveButton.disabled = false;
        }
    });

    return createProfileLayout({ activeTab: 'account', navigate, content });
}