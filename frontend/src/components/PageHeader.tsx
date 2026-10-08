import './PageHeader.css';

interface PageHeaderProps {
    title: string;
    breadcrumb?: string[]; // e.g. ['Request a Support', 'Volunteers Matching']
    onBack?: () => void;   // Shows a back arrow when provided
    backLabel?: string;    // Screen reader text for the back arrow
}

/** White bar under the navbar with the page title, optional breadcrumb and back arrow (Figures 20, 21, 25). */
export default function PageHeader({ title, breadcrumb, onBack, backLabel = 'Go back' }: PageHeaderProps) {
    return (
        <header className="page-header">
            {onBack && (
                <button type="button" className="page-header__back" onClick={onBack} aria-label={backLabel}>
                    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                        <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.5"
                            strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            )}
            <div>
                <h1 className="page-header__title">{title}</h1>
                {breadcrumb && breadcrumb.length > 0 && (
                    <nav aria-label="Breadcrumb">
                        <ol className="page-header__breadcrumb">
                            {breadcrumb.map((item, index) => (
                                <li key={item} aria-current={index === breadcrumb.length - 1 ? 'page' : undefined}>
                                    {item}
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}
            </div>
        </header>
    );
}
