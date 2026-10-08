import './MainNavbar.css';
import type { MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

export type NavbarButton = 'login' | 'signup';
export type NavigateCallback = (path: string) => void;

export const HIDDEN_BUTTONS_BY_PAGE: Record<string, NavbarButton[]> = {
    '/login': ['login'],
    '/signup': ['signup'],
};

interface NavbarProps {
    currentPath?: string;
    hide?: NavbarButton[];
    homeHref?: string;
    loginHref?: string;
    signUpHref?: string;
    onNavigate?: NavigateCallback;
}

function normalizePath(path: string): string {
    return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

export default function Navbar({
    currentPath,
    hide = [],
    homeHref = '/',
    loginHref = '/login',
    signUpHref = '/signup',
    onNavigate,
}: NavbarProps) {
    const path = normalizePath(currentPath ?? window.location.pathname);
    const hidden = new Set<NavbarButton>([...(HIDDEN_BUTTONS_BY_PAGE[path] ?? []), ...hide]);

    const handleClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
        if (!onNavigate) return;
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
        </header>
    );
}

export function createNavbar(currentPath: string, onNavigate: NavigateCallback): HTMLElement {
    const host = document.createElement('div');
    // display: contents keeps the navbar's `position: sticky` working relative to the page.
    host.style.display = 'contents';
    const root = createRoot(host);
    flushSync(() => {
        root.render(<Navbar currentPath={currentPath} onNavigate={onNavigate} />);
    });
    return host;
}