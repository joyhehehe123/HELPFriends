import './Navbar.css';
import type { MouseEvent } from 'react';
import { createRoot } from 'react-dom/client';

export type NavbarButton = 'login' | 'signup';
export type NavigateCallback = (path: string) => void;

export interface NavbarUser {
    avatarUrl: string;
}

/**
 * Which buttons to hide on which page (logged-out navbar only). Keys are pathnames.
 * Edit this map when you decide which pages hide which buttons.
 */
export const HIDDEN_BUTTONS_BY_PAGE: Record<string, NavbarButton[]> = {
    '/login': ['login'],
    '/forgot-password': ['login'],
    '/reset-password': ['login'],
    '/signup': ['signup'],
};

/** Links shown in the logged-in navbar. Adjust the paths to match your routes. */
const NAV_LINKS = [
    { label: 'Request a Support', href: '/request-support' },
    { label: 'Support Requests', href: '/support-requests' },
    { label: 'Support Sessions', href: '/support-sessions' },
];

interface NavbarProps {
    /** Defaults to window.location.pathname. */
    currentPath?: string;
    /** Extra buttons to hide, on top of HIDDEN_BUTTONS_BY_PAGE. */
    hide?: NavbarButton[];
    /** When set, shows the logged-in navbar (links, bell, avatar) instead of Login / Sign Up. */
    user?: NavbarUser;
    homeHref?: string;
    loginHref?: string;
    signUpHref?: string;
    profileHref?: string;
    /** If set, links navigate through this callback (SPA) instead of a full page load. */
    onNavigate?: NavigateCallback;
}

function normalizePath(path: string): string {
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export default function Navbar({
    currentPath,
    hide = [],
    user,
    homeHref = '/',
    loginHref = '/login',
    signUpHref = '/signup',
    profileHref = '/profile',
    onNavigate,
}: NavbarProps) {
    const path = normalizePath(currentPath ?? window.location.pathname);
    const hidden = new Set<NavbarButton>([...(HIDDEN_BUTTONS_BY_PAGE[path] ?? []), ...hide]);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!onNavigate) return;
        // Let the browser handle ctrl/cmd/shift-click and middle-click (open in new tab).
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        onNavigate(href);
    };

    return (
        <header className="navbar">
            <a
                className="navbar__logo"
                href={homeHref}
                aria-label="HELPFriends home"
                onClick={(event) => handleClick(event, homeHref)}
            >
                <span className="navbar__logo-help">HELP</span>Friends
            </a>

            {user ? (
                <>
                    <nav className="navbar__links" aria-label="Main">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.href}
                                className="navbar__link"
                                href={link.href}
                                aria-current={path.startsWith(link.href) ? 'page' : undefined}
                                onClick={(event) => handleClick(event, link.href)}
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    <div className="navbar__actions">
                        <button className="navbar__bell" type="button" aria-label="Notifications">
                            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z" />
                                <path d="M10 20a2 2 0 0 0 4 0" />
                            </svg>
                        </button>
                        <a
                            className="navbar__avatar"
                            href={profileHref}
                            aria-label="Your profile"
                            onClick={(event) => handleClick(event, profileHref)}
                        >
                            <img className="navbar__avatar-img" src={user.avatarUrl} alt="" />
                        </a>
                    </div>
                </>
            ) : (
                <nav className="navbar__actions">
                    {!hidden.has('login') && (
                        <a
                            className="navbar__button"
                            href={loginHref}
                            onClick={(event) => handleClick(event, loginHref)}
                        >
                            Login
                        </a>
                    )}
                    {!hidden.has('signup') && (
                        <a
                            className="navbar__button"
                            href={signUpHref}
                            onClick={(event) => handleClick(event, signUpHref)}
                        >
                            Sign Up
                        </a>
                    )}
                </nav>
            )}
        </header>
    );
}

/**
 * For pages built with document.createElement (the signup/login/profile pages):
 * mounts the React navbar and returns a DOM node you can append.
 */
export function createNavbar(
    currentPath: string,
    onNavigate: NavigateCallback,
    options: { user?: NavbarUser } = {},
): HTMLElement {
    const host = document.createElement('div');
    // display: contents keeps the navbar's `position: sticky` working relative to the page.
    host.style.display = 'contents';
    const root = createRoot(host);
    root.render(<Navbar currentPath={currentPath} onNavigate={onNavigate} user={options.user} />);
    return host;
}