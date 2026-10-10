import './profile.css';
import { createNavbar } from '../../components/Navbar';
import type { NavigateCallback } from '../../components/Navbar';
import { profileStore } from './ProfileData';

export type ProfileTab = 'account' | 'volunteer';

interface ProfileLayoutProps {
    activeTab: ProfileTab;
    navigate: (path: string) => void;
    content: HTMLElement;
}

const TABS: { id: ProfileTab; label: string; path: string }[] = [
    { id: 'account', label: 'Account Details', path: '/profile' },
    { id: 'volunteer', label: 'Volunteer Details', path: '/profile/volunteer' },
];

export default function createProfileLayout({
    activeTab,
    navigate,
    content,
}: ProfileLayoutProps): HTMLElement {
    const page = document.createElement('div');
    page.className = 'profile-page';

    const navbar = createNavbar('/profile', navigate as NavigateCallback, {
        user: { avatarUrl: profileStore.profile.avatarUrl },
    });

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

    const main = document.createElement('main');
    main.className = 'profile-main';
    main.appendChild(content);

    body.append(sidebar, main);
    page.append(navbar, body);
    return page;
}