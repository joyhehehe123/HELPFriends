import { useState, useEffect } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import type { SupportRequest } from "../../../types/supportRequest";
import { getSupportRequest } from "../../../services/supportRequestService";
import SessionScheduleCard from "./session-schedule-card";
import BackLink from "../../../components/BackLink";

export default function SessionSchedulePage() {
    const navigate = useNavigate();
    const [request, setRequest] = useState<SupportRequest | null>(null);
    const { requestId } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!requestId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getSupportRequest(requestId)
            .then(setRequest)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [requestId]);

    if (loading) return <p>Loading...</p>;
    if (!request) return <Navigate to="/support-sessions" replace />;   // bad or missing ID

    return (
        <section id="session-content">
            <div className="back-container">
                <BackLink 
                    className="back-button" 
                    onClick={() => {navigate(-1)}} 
                />
            </div>
            <SessionScheduleCard key={requestId} request={request} />
        </section>
    );
};