// feedback-form.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../components/toast/Toast";
import type { SupportSession } from "../../../types/supportSession";
import type { Feedback } from "../../../types/feedback";
import { createFeedback, updateFeedback } from "../../../services/feedbackService";
import { Star } from "lucide-react";
import Button from "../../../components/Button";
import "./feedback-form.css";

type Props = { session: SupportSession, feedback: Feedback | null };

export default function FeedbackForm({ session, feedback }: Props) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [rating, setRating] = useState(feedback?.rating ?? 0);
    const [comment, setComment] = useState(feedback?.comments ?? "");
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // if the feedback loads after the form appears
        setRating(feedback?.rating ?? 0);
        setComment(feedback?.comments ?? "");
    }, [feedback]);

    const handleSubmit = async () => {
        if (rating < 1) {
            setShowError(true);
            return;
        }

        const comments = comment.trim() === "" ? null : comment.trim();

        try {
            if (!feedback) {
                await createFeedback({ rating: rating, comments: comments, sessionId: session.uid });
            } else {
                await updateFeedback(feedback.uid, { rating: rating, comments: comments });
            }
            showToast("Feedback saved.");
            navigate(`/support-sessions/${session.status.toLowerCase()}/${session.uid}`);
        } catch (error) {
            console.log("Could not save feedback: ", error);
        }
    }

    return (
        <div className="card-wrapper">
            <div className="feedback-form-wrapper">
                <div className="feedback-card">
                    <p className="support-title details-card-support-title">Session Feedback — {session.title}</p>
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