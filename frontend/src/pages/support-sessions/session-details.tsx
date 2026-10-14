import { useLocation } from "react-router-dom";
import type { Role, SessionStatus } from "../../types/constants";
import type { SupportSession } from "../../types/supportSession";
import { ChevronLeft } from "lucide-react";
import SessionDetailsCard from "./session-details-card";
import BackButton from "../../components/back-button";
import './session-details.css'

type Props = { session: SupportSession, role: Role, status: SessionStatus };

function SessionDetails() {
    const { state } = useLocation();
    const { session, role, status } = state as Props;

    return (
        <section id="session-content">
            <BackButton/>
            <div className="card-wrapper">
                <SessionDetailsCard key={session.uid} session={session} role={role} status={status} />
            </div>
        </section>
    )
}

export default SessionDetails;