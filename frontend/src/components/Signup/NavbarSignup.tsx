import './NavbarSignup.css';

export type NavigateCallback = (path: string) => void;

export function createNavbar(currentPath: string, onNavigate: NavigateCallback): HTMLElement {
    const navbar = document.createElement('header');
    navbar.className = 'navbar';
    navbar.innerHTML = `
        <a class="navbar-logo" href="/" aria-label="HELPFriends home">
            <span class="navbar-logo-help">HELP</span><span class="navbar-logo-friends">Friends</span>
        </a>

        <nav class="navbar-actions">
            <a class="navbar-login" href="/login">Login</a>
        </nav>
    `;

    const logo = navbar.querySelector<HTMLAnchorElement>('.navbar-logo')!;
    const loginLink = navbar.querySelector<HTMLAnchorElement>('.navbar-login')!;

    // Hide the Login button when the user is already on the login page.
    if (currentPath === '/login') {
        loginLink.hidden = true;
    }

    const handleLinkClick = (event: MouseEvent, path: string) => {
        // Let the browser handle ctrl/cmd/shift-click and middle-click (open in new tab).
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        onNavigate(path);
    };

    logo.addEventListener('click', (event) => handleLinkClick(event, '/'));
    loginLink.addEventListener('click', (event) => handleLinkClick(event, '/login'));

    return navbar;
}