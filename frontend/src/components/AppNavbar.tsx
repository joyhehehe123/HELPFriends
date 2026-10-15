import { type MouseEvent } from 'react';
import UserAvatar from './UserAvatar';
import './AppNavbar.css';

export interface NavbarLink {
    label: string;
    href: string;
}

interface AppNavbarProps {
    links: NavbarLink[];
    notificationsHref: string;
    activeHref: string;
    userName: string;
    userPhoto?: string;
    onNavigate: (href: string) => void;
}

function BellIcon() {
    return (
        <svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true">
            <path
                d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// Navbar for my pages (Figma). Will be replaced by the team navbar.
export default function AppNavbar({
    links,
    notificationsHref,
    activeHref,
    userName,
    userPhoto,
    onNavigate,
}: AppNavbarProps) {
    // Ctrl/Cmd + click still opens a new tab
    const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        onNavigate(href);
    };

    return (
        <header className="app-navbar">
            <span className="app-navbar__logo">
                <span className="app-navbar__logo-help">HELP</span>Friends
            </span>

            <nav className="app-navbar__nav" aria-label="Main">
                <ul className="app-navbar__links">
                    {links.map((link) => (
                        <li key={link.href}>
                            <a
                                className="app-navbar__link"
                                href={link.href}
                                aria-current={link.href === activeHref ? 'page' : undefined}
                                onClick={(event) => handleClick(event, link.href)}
                            >
                                <span>{link.label}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="app-navbar__end">
                <a
                    className="app-navbar__bell"
                    href={notificationsHref}
                    aria-label="Notifications"
                    aria-current={notificationsHref === activeHref ? 'page' : undefined}
                    onClick={(event) => handleClick(event, notificationsHref)}
                >
                    <BellIcon />
                </a>
                <span className="app-navbar__user" role="img" aria-label={`Signed in as ${userName}`}>
                    <UserAvatar name={userName} photoUrl={userPhoto} size="md" />
                </span>
            </div>
        </header>
    );
}
