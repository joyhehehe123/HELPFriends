import './auth-feedback.css';

export type FeedbackKind = 'error' | 'info';

export function createAuthFeedback(form: HTMLFormElement): (message: string, kind?: FeedbackKind) => void {
    const feedback = document.createElement('p');
    feedback.className = 'auth-feedback';
    feedback.hidden = true;
    form.before(feedback);

    return (message, kind = 'error') => {
        feedback.textContent = message;
        feedback.classList.toggle('auth-feedback--info', kind === 'info');
        feedback.setAttribute('role', kind === 'error' ? 'alert' : 'status');
        feedback.setAttribute('aria-live', kind === 'error' ? 'assertive' : 'polite');
        feedback.hidden = !message;
    };
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
    let currentError: unknown = error;
    let code = '';

    while (typeof currentError === 'object' && currentError !== null) {
        if ('code' in currentError) {
            code = String(currentError.code);
            break;
        }
        currentError = 'cause' in currentError ? currentError.cause : null;
    }

    switch (code) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Try logging in or resetting your password.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/weak-password':
            return 'Choose a stronger password with at least 8 characters.';
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
            return 'The email or password is incorrect.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please wait a while and try again.';
        default:
            return currentError instanceof Error
                ? currentError.message
                : error instanceof Error ? error.message : fallback;
    }
}
