import './Profile.css';
import createProfileLayout from './ProfileLayout';
import { profileStore, escapeHtml } from './ProfileData';
import { onAuthStateChange } from '../../services/authService';
import { getUser } from '../../services/userService';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_ABOUT_LENGTH = 300;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const PENCIL_ICON = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>`;

interface AccountDetailsProps {
    navigate: (path: string) => void;
}

export default function createAccountDetailsPage({ navigate }: AccountDetailsProps): HTMLElement {
    const { profile, volunteer } = profileStore;
    const accountType = volunteer.active ? 'Support Seeker + Student Volunteer' : 'Support Seeker';

    const content = document.createElement('div');
    content.className = 'profile-content';
    content.innerHTML = `
        <section class="profile-card profile-summary">
            <div class="avatar-wrap">
                <img class="avatar-image" src="${profile.avatarUrl}" alt="Your profile picture" />
                <button type="button" class="avatar-edit" aria-label="Change profile picture">${PENCIL_ICON}</button>
                <input id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp" hidden />
            </div>
            <div class="summary-text">
                <h2 class="summary-name">${escapeHtml(profile.fullName)}</h2>
                <p class="summary-muted">${escapeHtml(profile.studentId)}</p>
                <p class="summary-muted">${escapeHtml(profile.universityEmail)}</p>
                <p class="summary-muted summary-academic">${escapeHtml(profile.faculty)}<br />${escapeHtml(profile.programme)}</p>
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
                        <dt>Student ID:</dt><dd>${escapeHtml(profile.studentId)}</dd>
                        <dt>Faculty:</dt><dd class="profile-faculty">${escapeHtml(profile.faculty)}</dd>
                        <dt>Programme:</dt><dd class="profile-program">${escapeHtml(profile.programme)}</dd>
                    </dl>
                </div>
            </section>

            <section class="profile-section">
                <h3 class="profile-section-title">Account Information</h3>
                <div class="profile-card info-card">
                    <dl>
                        <dt>Account Type:</dt><dd>${accountType}</dd>
                        <dt>University Email:</dt><dd>${escapeHtml(profile.universityEmail)}</dd>
                    </dl>
                </div>
            </section>
        </div>
    `;

    const avatarImage = content.querySelector<HTMLImageElement>('.avatar-image')!;
    const avatarEditButton = content.querySelector<HTMLButtonElement>('.avatar-edit')!;
    const avatarFileInput = content.querySelector<HTMLInputElement>('#avatarFile')!;

    const aboutText = content.querySelector<HTMLElement>('.about-text')!;
    const aboutEditButton = content.querySelector<HTMLButtonElement>('.about-edit')!;
    const aboutForm = content.querySelector<HTMLFormElement>('.about-form')!;
    const aboutTextarea = content.querySelector<HTMLTextAreaElement>('#aboutMe')!;
    const aboutCount = content.querySelector<HTMLElement>('.about-count')!;
    const aboutCancelButton = content.querySelector<HTMLButtonElement>('.about-cancel')!;
    const summaryAcademic = content.querySelector<HTMLElement>('.summary-academic')!;
    const facultyValue = content.querySelector<HTMLElement>('.profile-faculty')!;
    const programValue = content.querySelector<HTMLElement>('.profile-program')!;

    const stopAuthListener = onAuthStateChange((authUser) => {
        stopAuthListener();
        if (!authUser) return;

        void getUser(authUser.uid)
            .then((user) => {
                if (!user) return;
                profile.faculty = user.faculty ?? '';
                profile.programme = user.program ?? '';
                summaryAcademic.replaceChildren();
                summaryAcademic.append(document.createTextNode(profile.faculty));
                if (profile.faculty && profile.programme) {
                    summaryAcademic.appendChild(document.createElement('br'));
                }
                summaryAcademic.append(document.createTextNode(profile.programme));
                facultyValue.textContent = profile.faculty;
                programValue.textContent = profile.programme;
            })
            .catch((error: unknown) => {
                console.error('Failed to load registered faculty and program for the profile:', error);
            });
    });

    // ----- Profile picture -----
    avatarEditButton.addEventListener('click', () => avatarFileInput.click());

    avatarFileInput.addEventListener('change', () => {
        const file = avatarFileInput.files?.[0];
        if (!file) return;

        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            avatarFileInput.value = '';
            alert('Profile picture must be a JPG, PNG or WebP image.');
            return;
        }

        if (file.size > MAX_AVATAR_BYTES) {
            avatarFileInput.value = '';
            alert('Profile picture must be 5 MB or smaller.');
            return;
        }

        // TODO (API): upload the file here and use the URL the server returns.
        if (profile.avatarUrl.startsWith('blob:')) {
            URL.revokeObjectURL(profile.avatarUrl);
        }
        profile.avatarUrl = URL.createObjectURL(file);
        avatarImage.src = profile.avatarUrl;
        // Keep the navbar avatar in sync.
        document.querySelectorAll<HTMLImageElement>('.navbar__avatar-img').forEach((image) => {
            image.src = profile.avatarUrl;
        });
        avatarFileInput.value = '';
    });

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

    aboutForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // TODO (API): save the new "About me" text here.
        profile.aboutMe = aboutTextarea.value.trim();
        renderAbout();
        setEditingAbout(false);
    });

    return createProfileLayout({ activeTab: 'account', navigate, content });
}