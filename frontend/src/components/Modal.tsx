import { useEffect, useRef, type ReactNode } from 'react';
import './Modal.css';

interface ModalProps {
    labelledBy: string; // Id of the dialog title
    onClose: () => void;
    children: ReactNode;
    dismissible?: boolean; // False while saving, so it can't be closed
    className?: string;
}

export default function Modal({ labelledBy, onClose, children, dismissible = true, className = '' }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
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
            onClose={onClose}
            onClick={(event) => {
                // Backdrop click
                if (dismissible && event.target === event.currentTarget) onClose();
            }}
        >
            <div className="app-modal__content">{children}</div>
        </dialog>
    );
}
