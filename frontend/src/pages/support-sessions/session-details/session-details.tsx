import { Timestamp } from "firebase/firestore";
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import type { Role, SessionStatus } from "../../../types/constants";
import type { SupportSession } from "../../../types/supportSession";
import SessionDetailsCard from "./session-details-card";
// import BackButton from "../../../components/back-button";
import BackLink from "../../../components/BackLink";
import "./session-details.css";

type Props = { session: SupportSession, role: Role, status: SessionStatus };

function SessionDetails() {
    const { state } = useLocation();
    const navigate = useNavigate();
    
    if (!state) return <Navigate to="/support-sessions" />;
    const { session: raw, role, status } = state as Props;
    const toTs = (t: any) => t && new Timestamp(t.seconds, t.nanoseconds);
    const session: SupportSession = {
        ...raw,
        dateTime: toTs(raw.dateTime),
        cancelledAt: toTs(raw.cancelledAt),
        completedAt: toTs(raw.completedAt),
    };

    return (
        <section id="session-content">
            <div className="back-container">
                <BackLink className="back-button" onClick={() => { navigate(-1) }} />
            </div>
            <div className="card-wrapper">
                <SessionDetailsCard key={session.uid} session={session} role={role} status={status} />
            </div>
        </section>
    )
}

export default SessionDetails;