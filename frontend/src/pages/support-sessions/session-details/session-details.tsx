import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import type { Role } from "../../../types/constants";
import type { SupportSession } from "../../../types/supportSession";
import { getSupportSession } from "../../../services/supportSessionService";
import { getCurrentUid } from "../../../services/authService";
import SessionDetailsCard from "./session-details-card";
import BackLink from "../../../components/BackLink";
import "./session-details.css";

function SessionDetails() {
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey((k) => k + 1);

    const navigate = useNavigate();
    const { sessionId } = useParams();
    const [session, setSession] = useState<SupportSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getSupportSession(sessionId)
            .then(setSession)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [sessionId, refreshKey]);

    if (loading) return <p>Loading...</p>;
    if (!session) return <Navigate to="/support-sessions" replace />;   // bad or missing ID

    const role: Role = getCurrentUid() === session.seekerId ? "Support Seeker" : "Volunteer";

    return (
        <section id="session-content">
            <div className="back-container">
                <BackLink className="back-button" onClick={() => { navigate(-1) }} />
            </div>
            <SessionDetailsCard key={session.uid} session={session} role={role} status={session.status} onUpdated={refresh} />
        </section>
    )
}

export default SessionDetails;