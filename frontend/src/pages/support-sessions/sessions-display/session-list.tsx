import { useState, useEffect } from "react";
import { getCurrentUid } from "../../../services/authService";
import { getSupportSessionsByStudentAndStatus } from "../../../services/supportSessionService";
import type { SupportSession } from "../../../types/supportSession";
import type { Role, SessionStatus } from "../../../types/constants";
import SessionCards from "./session-preview-card";
import sillycat from "../../../assets/sillycat.png"
import "./session-list.css"

type Props = { role: Role, status: SessionStatus, refreshKey: number, onUpdated: () => void };

function SessionList({ role, status, refreshKey, onUpdated }: Props) {
    const [sessions, setSessions] = useState<SupportSession[]>([]);
    // const [refreshKey, setRefreshKey] = useState(0);
    // const refresh = () => setRefreshKey((k) => k + 1);

    const sessionContent = (sessions.length === 0)
        ? <>
            <img src={sillycat} alt="Silly Cat" />
            <p>No {status.toLowerCase()} sessions found</p>
        </>
        : sessions.map((s) => (<SessionCards key={s.uid} session={s} role={role} status={status} onUpdated={onUpdated}/>))

    useEffect(() => {
        const uid = getCurrentUid();
        if (!uid) return;

        const fetch = (role === "Volunteer" )
            ? getSupportSessionsByStudentAndStatus(uid, true, status)
            : getSupportSessionsByStudentAndStatus(uid, false, status)

        fetch.then(setSessions).catch(console.error);
    }, [role, status, refreshKey]);

    return (
        <div className={sessions.length === 0 ? "no-data" : "card-list"}>
            {sessionContent}
        </div>
    );
}

export default SessionList;