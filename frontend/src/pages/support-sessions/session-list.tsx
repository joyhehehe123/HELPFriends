import { useState, useEffect } from "react";
import { getCurrentUid } from "../../services/authService";
import { getSupportSessionsByStudentAndStatus } from "../../services/supportSessionService";
import type { SupportSession } from "../../types/supportSession";
import type { Role, SessionStatus } from "../../types/constants";
import SessionCards from "./session-card";
import sillycat from "../../assets/sillycat.png"
import "./session-list.css"

type Props = { role: Role, status: SessionStatus };

function SessionList({ role, status }: Props) {
    const [sessions, setSessions] = useState<SupportSession[]>([]);

    const sessionContent = (sessions.length === 0)
        ? <>
            <img src={sillycat} alt="Silly Cat" />
            <p>No {status.toLowerCase()} sessions found</p>
        </>
        : sessions.map((s) => (<SessionCards key={s.uid} session={s} role={role} status={status} />))

    useEffect(() => {
        const uid = getCurrentUid();
        // const uid = "poFo7wbZjvcORzhO9sz4EaMxwQv2";
        // const uid = "n66jreETszcSgvbor2ETABZ5VW33";
        if (!uid) return;

        const fetch = (role === "Volunteer" )
            ? getSupportSessionsByStudentAndStatus(uid, true, status)
            : getSupportSessionsByStudentAndStatus(uid, false, status)

        fetch.then(setSessions).catch(console.error);
    }, [role, status]);

    return (
        <div className={sessions.length === 0 ? "no-data" : "card-list"}>
            {sessionContent}
        </div>
    );
}

export default SessionList;