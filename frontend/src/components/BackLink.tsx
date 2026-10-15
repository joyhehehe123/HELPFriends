import './BackLink.css';

interface BackLinkProps {
    onClick: () => void;
    variant?: 'plain' | 'pill';
    label?: string; // Name for screen readers
}

export default function BackLink({ onClick, variant = 'plain', label }: BackLinkProps) {
    return (
        <button type="button" className={`hf-back-link hf-back-link--${variant}`} onClick={onClick} aria-label={label}>
            <svg viewBox="0 0 12 20" width="10" height="16" aria-hidden="true">
                <path d="M10 2L2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
        </button>
    );
}
