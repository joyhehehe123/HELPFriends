import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import Button from "../Button";
import "./confirm-context.css";

type ConfirmOptions = {
    title: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    askReason?: boolean;
    destructive?: boolean;
};
type ConfirmResult = { confirmed: boolean; reason: string };
type ConfirmFn = (options: ConfirmOptions) => Promise<ConfirmResult>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const resolver = useRef<((r: ConfirmResult) => void) | null>(null);
    const destructive = options?.destructive ?? false;

    const dismissBtn = (
        <Button size="sm" className="modal-btn" variant={destructive ? "primary" : "outline"} onClick={() => finish(false)}>
            {options?.cancelText ?? "Cancel"}
        </Button>
    )
    const confirmBtn = (
        <Button size="sm" className="modal-btn" variant={destructive ? "outline" : "primary"} onClick={() => finish(true)}>
            {options?.confirmText ?? "Confirm"}
        </Button>
    )

    const confirm = useCallback<ConfirmFn>((opts) => {
        resolver.current?.({ confirmed: false, reason: "" });
        return new Promise<ConfirmResult>((resolve) => {
            resolver.current = resolve;
            setReason("");
            setOptions(opts);
            setOpen(true);
        });
    }, []);

    const finish = useCallback((confirmed: boolean) => {
        resolver.current?.({ confirmed, reason: confirmed ? reason.trim() : "" });
        resolver.current = null;
        setOpen(false);
    }, [reason]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") finish(false); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, finish]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            <div className={open ? "modal-overlay modal-open" : "modal-overlay"} onClick={() => finish(false)}>
                <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                    <h2>{options?.title}</h2>
                    {options?.message && <p>{options.message}</p>}
                    {options?.askReason && (
                        <textarea
                            placeholder="Please provide your reason (optional)"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    )}
                    <div className="modal-actions">
                        {destructive ? <>{confirmBtn}{dismissBtn}</> : <>{dismissBtn}{confirmBtn}</>}
                    </div>
                </div>
            </div>
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm must be used inside ConfirmProvider");
    return ctx;
}