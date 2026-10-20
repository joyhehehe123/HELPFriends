import './Profile.css';
import { profileStore } from './ProfileData';
import { logout } from '../../services/authService';

export type ProfileTab = 'account' | 'volunteer';

interface ProfileLayoutProps {
    activeTab: ProfileTab;
    navigate: (path: string) => void;
    content: HTMLElement;
}

const TABS: { id: ProfileTab; label: string; path: string }[] = [
    { id: 'account', label: 'Account Details', path: '/profile' },
    { id: 'volunteer', label: 'Volunteer Details', path: '/profile/volunteer-profile' },
];

export default function createProfileLayout({
    activeTab,
    navigate,
    content,
}: ProfileLayoutProps): HTMLElement {
    const page = document.createElement('div');
    page.className = 'profile-page';

    const body = document.createElement('div');
    body.className = 'profile-body';

    const sidebar = document.createElement('nav');
    sidebar.className = 'profile-sidebar';
    sidebar.setAttribute('aria-label', 'Profile sections');

    TABS.forEach((tab) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'profile-tab';
        button.textContent = tab.label;
        if (tab.id === activeTab) {
            button.setAttribute('aria-current', 'page');
        } else {
            button.addEventListener('click', () => navigate(tab.path));
        }
        sidebar.appendChild(button);
    });

    const logoutButton = document.createElement('button');
    logoutButton.type = 'button';
    logoutButton.className = 'profile-tab profile-tab--logout';
    logoutButton.textContent = 'Log Out';
    const logoutError = document.createElement('p');
    logoutError.className = 'profile-logout-error';
    logoutError.setAttribute('role', 'alert');
    logoutError.hidden = true;
    sidebar.appendChild(logoutError);

    logoutButton.addEventListener('click', async () => {
        logoutButton.disabled = true;
        logoutError.hidden = true;
        logoutError.textContent = '';

        try {
            await logout();
            navigate('/');
        } catch (cause) {
            console.error('Unable to log out:', cause);
            logoutError.textContent = 'Unable to log out. Please try again.';
            logoutError.hidden = false;
            logoutButton.disabled = false;
        }
    });
    sidebar.appendChild(logoutButton);

    const main = document.createElement('main');
    main.className = 'profile-main';
    main.appendChild(content);

    body.append(sidebar, main);
    page.append(body);
    return page;
}