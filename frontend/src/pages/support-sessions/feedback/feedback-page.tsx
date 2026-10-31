// feedback-page.tsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useConfirm } from "../../../components/confirm/confirm-context";
import type { SupportSession } from "../../../types/supportSession";
import type { Feedback } from "../../../types/feedback";
import { getSupportSession } from "../../../services/supportSessionService";
import { getFeedbackBySession } from "../../../services/feedbackService";
import FeedbackForm, { type FeedbackFormApi } from "./feedback-form";
import BackLink from "../../../components/BackLink";

export default function FeedbackPage() {
    const formApi = useRef<FeedbackFormApi | null>(null);
    const confirm = useConfirm();
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const [session, setSession] = useState<SupportSession | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loading, setLoading] = useState(true);

    const handleBack = async () => {
        const form = formApi.current;
        if (form?.isDirty()) {
            const { confirmed } = await confirm({
                title: "Save your feedback?",
                message: "You have unsaved changes.",
                confirmText: "Save feedback",
                cancelText: "Discard changes",
            });
            if (confirmed && !(await form.save())) return;   // save failed or no rating: stay here
        }
        navigate(-1);
    };

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
                <BackLink className="back-button" onClick={handleBack} />
            </div>
            <FeedbackForm key={session.uid} session={session} feedback={feedback} apiRef={formApi} />
        </section>
    )
};