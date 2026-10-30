// feedback-page.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import type { SupportSession } from "../../../types/supportSession";
import type { Feedback } from "../../../types/feedback";
import { getSupportSession } from "../../../services/supportSessionService";
import { getFeedbackBySession } from "../../../services/feedbackService";
import FeedbackForm from "./feedback-form";
import BackLink from "../../../components/BackLink";

export default function FeedbackPage() {

    const navigate = useNavigate();
    const { sessionId } = useParams();
    const [session, setSession] = useState<SupportSession | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
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

        getFeedbackBySession(sessionId)
            .then(setFeedback)
            .catch(console.error);
    }, [sessionId]);

    if (loading) return <p>Loading...</p>;
    if (!session) return <Navigate to="/support-sessions" replace />;   // bad or missing ID

    return (
        <section id="session-content">
            <div className="back-container">
                <BackLink 
                    className="back-button" 
                    onClick={() => { 
                        navigate(-1) 
                    }} 
                />
            </div>
            <FeedbackForm key={session.uid} session={session} feedback={feedback} />
        </section>
    )
};