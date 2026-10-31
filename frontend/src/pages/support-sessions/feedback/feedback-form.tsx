// feedback-form.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/toast/Toast";
import { useConfirm } from "../../../components/confirm/confirm-context";
import type { SupportSession } from "../../../types/supportSession";
import type { Feedback } from "../../../types/feedback";
import { createFeedback, updateFeedback } from "../../../services/feedbackService";
import { Star } from "lucide-react";
import Button from "../../../components/Button";
import "./feedback-form.css";

export type FeedbackFormApi = { isDirty: () => boolean; save: () => Promise<boolean> };
type Props = { 
    session: SupportSession, 
    feedback: Feedback | null, 
    apiRef?: { current: FeedbackFormApi | null } 
};

export default function FeedbackForm({ session, feedback, apiRef }: Props) {
    const confirm = useConfirm();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [rating, setRating] = useState(feedback?.rating ?? 0);
    const [comment, setComment] = useState(feedback?.comments ?? "");
    const [showError, setShowError] = useState(false);

    const FEEDBACK_WINDOW_MS = 48 * 60 * 60 * 1000;
    const feedbackExpiresAt = feedback
        ? new Date(feedback.createdAt.toDate().getTime() + FEEDBACK_WINDOW_MS)
        : null;
    const feedbackExpireDate = feedback?feedbackExpiresAt?.toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric" 
    }) : null;
    const feedbackExpireTime = feedback?feedbackExpiresAt?.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit", 
        hour12: true
    }) : null;

    const isDirty =
        rating !== (feedback?.rating ?? 0) ||
        comment.trim() !== (feedback?.comments ?? "");

    const save = async (): Promise<boolean> => {
        if (rating < 1) {
            setShowError(true);
            return false;
        }
        const comments = comment.trim() === "" ? null : comment.trim();
        try {
            if (!feedback) {
                await createFeedback({ rating, comments, sessionId: session.uid });
            } else {
                await updateFeedback(feedback.uid, { rating, comments });
            }
            showToast("Feedback saved.");
            return true;
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Could not save feedback.");
            return false;
        }
    };

    const handleSubmit = async () => {
        if (rating < 1) {
            setShowError(true);
            return;
        }
        
        const { confirmed } = await confirm({
            title: `Confirm to save feedback${feedback ? " changes" : ""}?`,
            message: `Do you want to save feedback ${feedback ? "changes" : ""}for session "${session.title}"?`,
            confirmText: feedback ? "Save Changes" : "Save Feedback",
            cancelText: "Continue Editing"
        });

        if (!confirmed) return;

        if (await save()) {
            navigate(`/support-sessions/${session.status.toLowerCase()}/${session.uid}`);
        }
    }

    useEffect(() => {
        if (!apiRef) return;
        apiRef.current = { isDirty: () => isDirty, save };
        return () => { apiRef.current = null; };
    });

    return (
        <div className="card-wrapper">
            <div className="feedback-form-wrapper">
                <div className="feedback-card">
                    <p className="support-title details-card-support-title">Session Feedback — {session.title}</p>
                    {feedback && <p className="card-msg card-msg-left">
                        You can still edit your feedback before {feedbackExpireDate} {feedbackExpireTime}
                    </p>}
                    <div className="feedback-rating">
                        <div className="feedback-item-box">
                            <label className="element">RATING</label>
                            <div className="star-rating">
                                <div className="stars">
                                    {Array.from({ length: 5 }, (_, i) => (
                                        <Star 
                                            key={i} fill="#ffffff" color="#dbdbdb" strokeWidth={0.5} size={60} 
                                            onClick={() => {
                                                setRating(i + 1);
                                                setShowError(false);
                                            }} 
                                        />
                                    ))}
                                </div>
                                <div className="stars rating">
                                    {Array.from({ length: rating }, (_, i) => (
                                        <Star 
                                            key={i} fill="gold" color="gold" strokeWidth={0.5} size={60} 
                                            onClick={() => {
                                                setRating(i + 1);
                                                setShowError(false);
                                            }} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        {showError && <p className="error-msg">Please select a rating.</p>}
                    </div>
                    <div className="feedback-item-box">
                        <label className="element">COMMENT (OPTIONAL)</label>
                        <textarea 
                            className="comment" 
                            placeholder="Enter your comments here" 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>
                    <Button variant="primary" shape="rounded" size="sm" 
                        className="card-button action-button" onClick={handleSubmit}>
                        {feedback ? "SAVE CHANGES" : "SAVE"}
                    </Button>
                </div>
            </div>
        </div>
    )
}