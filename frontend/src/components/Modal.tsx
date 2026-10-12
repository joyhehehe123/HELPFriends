import { useEffect, useRef, type ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
    labelledBy: string;    // id of the dialog title
    onClose: () => void;
    children: ReactNode;
    dismissible?: boolean; // false = can't close (e.g. while saving)
    className?: string;
}

// Uses <dialog>, so the browser handles focus and the Esc key
export default function Modal({ labelledBy, onClose, children, dismissible = true, className = '' }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        // No cleanup needed, the dialog closes when it is removed
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            className={`app-modal ${className}`.trim()}
            aria-labelledby={labelledBy}
            onCancel={(event) => {
                // Esc key
                event.preventDefault();
                if (dismissible) onClose();
            }}
            onClose={onClose} // If the browser closes it anyway
            onClick={(event) => {
                // Backdrop click
                if (dismissible && event.target === event.currentTarget) onClose();
            }}
        >
            <div className="app-modal__content">{children}</div>
        </dialog>
    );
}
