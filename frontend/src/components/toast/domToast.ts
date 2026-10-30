/**
 * domToast.ts
 *
 * Vanilla-DOM (non-React) toast helper used by the legacy profile pages
 * (Account Details / Volunteer Details). These pages cannot use the React
 * `useToast()` hook because they manage their own DOM via `document.createElement`.
 *
 * It reuses the existing `.toast` / `.toast-visible` classes from
 * `components/toast/Toast.css` so every toast in the app looks identical,
 * plus an optional `.toast--error` variant.
 */

const TOAST_DURATION_MS = 3000;

let toastEl: HTMLElement | null = null;
let hideTimer: number | undefined;

function ensureToast(): HTMLElement {
    if (toastEl && toastEl.parentNode) {
        return toastEl;
    }

    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    toastEl = el;
    return el;
}

function removeToast() {
    if (toastEl && toastEl.parentNode) {
        toastEl.parentNode.removeChild(toastEl);
    }
    toastEl = null;
}

/**
 * Show a toast notification.
 *
 * @param message - Text to show in the toast.
 * @param type - 'success' (default, primary brand colour) or 'error' (red).
 */
export function showDomToast(message: string, type: 'success' | 'error' = 'success'): void {
    const el = ensureToast();

    el.textContent = message;
    el.className = 'toast';
    if (type === 'error') {
        el.classList.add('toast--error');
    }

    // Force reflow so the enter transition runs even if a toast is already showing.
    void el.offsetHeight;
    el.classList.add('toast-visible');

    // Auto-dismiss after the duration with a fade-out.
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
        el.classList.remove('toast-visible');
        setTimeout(() => {
            if (!el.classList.contains('toast-visible')) {
                removeToast();
            }
        }, 400); // match the CSS transition duration
    }, TOAST_DURATION_MS);
}
