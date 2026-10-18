import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import "./Toast.css";

type ToastContextType = { showToast: (message: string) => void };
const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState('');
    const [visible, setVisible] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    const showToast = useCallback((msg: string) => {
        window.clearTimeout(timer.current);   // a new toast restarts the timer
        setMessage(msg);
        setVisible(true);
        timer.current = window.setTimeout(() => setVisible(false), 3000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={`toast ${visible ? 'toast-visible' : ''}`} role='status' aria-live='polite'>
                {message}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used inside ToastProvider');
    return ctx;
}