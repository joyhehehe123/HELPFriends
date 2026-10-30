import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { SupportSession } from "../../../types/supportSession";
import type { Role, SessionStatus } from "../../../types/constants";
import { getUser } from "../../../services/userService";
import { getFeedbackBySession } from "../../../services/feedbackService";
import { markAsCompleted, cancelSession } from "../../../services/supportSessionService";
import Button from "../../../components/Button";
import { Clock, CircleCheckBig, CircleX } from "lucide-react";
import { useToast } from "../../../components/toast/Toast";
import { useConfirm } from "../../../components/confirm/confirm-context";
import getStatusMessage from "../functions/status-msg";
import "./session-preview-card.css";
import type { Feedback } from "../../../types/feedback";

type Props = { session: SupportSession, role: Role, status: SessionStatus, onUpdated?: () => void };

function SessionCards({ session, role, status, onUpdated }: Props) {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { showToast } = useToast();

    const [otherName, setOtherName] = useState<string>();
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    const sessionDate = session.dateTime.toDate();
    const timeDiff = Math.round((+sessionDate - Date.now()) / (1000 * 60));

    const date = sessionDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const day = sessionDate.toLocaleDateString("en-US", { weekday: "short" });
    const time = sessionDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const cancelledDateTime = session.cancelledAt?.toDate();
    const cancelledDate = cancelledDateTime?.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

    const otherRole = role === "Support Seeker" ? "Volunteer" : "Seeker";
    const myId = role === "Support Seeker" ? session.seekerId : session.volunteerId;
    const cancelledBy = session.cancelledBy === myId ? "you" : `${otherName} (${otherRole})`;

    const hoursPassed = feedback?.createdAt
        ? (Date.now() - feedback.createdAt.toDate().getTime()) / (1000 * 60 * 60)
        : null;
    const feedbackisExpired = hoursPassed !== null && hoursPassed >= 48;

    const handleCancel = async () => {
        const { confirmed, reason } = await confirm({
            title: "Confirm to cancel session?",
            message: `Do you want to cancel session "${session.title}"? This cannot be undone.`,
            confirmText: "Cancel session",
            cancelText: "Keep session",
            askReason: true
        });

        if (!confirmed) return;
        try {
            await cancelSession(session.uid, reason);      // reason from your dialog or input
            showToast("Session cancelled successfully.");
            onUpdated?.();                                 // the list re-fetches, and this card moves out
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Could not cancel the session");
        }
    };

    const handleComplete = async () => {
        try {
            await markAsCompleted(session.uid);
            showToast("Session marked as completed");
            onUpdated?.();
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Could not complete the session");
        }
    };

    useEffect(() => {
        getUser(role === "Volunteer" ? session.seekerId : session.volunteerId)
            .then((user) => setOtherName(user?.fullName))
            .catch(console.error);

        if (status === "Completed") {
            getFeedbackBySession(session.uid)
                .then(setFeedback)
                .catch(console.error);
        }
    }, [session, role, status])

    return (
        <div className="session-card-wrapper">
            <div className="session-card">
                <div className="card-brief-details">
                    <div className="card-chips">
                        <p className="support-category">{(session.category).toUpperCase()} SUPPORT</p>
                        {status === "Active" 
                            && <div className="status-msg"> <Clock /><p>{getStatusMessage(timeDiff)}</p></div>
                        }
                        {status === "Completed" && (feedback
                            ? <div className="status-msg"><CircleCheckBig /><p>Feedback provided</p></div>
                            : <div className="status-msg"><Clock /><p>Waiting for feedback</p></div>
                        )}
                        {status === "Cancelled" 
                            && <div className="status-msg cancelled-msg"><CircleX /><p>Cancelled on {cancelledDate}</p></div>
                        }
                    </div>
                    <div className="session-brief-details">
                        <p className="support-title">{session.title}</p>
                        {status !== "Cancelled" && <p>{date} ({day}) {time}, {session.duration} minutes</p>}
                        {status !== "Cancelled" && (role === "Support Seeker" 
                            ? <p>Volunteer: {otherName}</p>
                            : <p>Support Seeker: {otherName}</p>
                        )}
                        {status === "Cancelled" && <p>Cancelled by {cancelledBy}</p>}
                        {status === "Cancelled"
                            ? <p>Reason: {session.cancelledReason}</p>
                            : <p>Mode: {session.supportMode}</p>
                        }
                    </div>
                </div>
                <div className="card-buttons">
                    <Button 
                        size="sm" 
                        className="card-button" 
                        onClick={() => navigate(`/support-sessions/${status.toLowerCase()}/${session.uid}`)}
                    >
                        View Details
                    </Button>

                    {(status === "Active" && timeDiff > 0) && (timeDiff > 120
                        ? <Button size="sm" className="card-button" onClick={handleCancel}>Cancel</Button>
                        : <Button size="sm" className="card-button" disabled>Cancel</Button>
                    )}
                    {(status === "Active" && role === "Volunteer" && timeDiff < 0) && (Math.abs(timeDiff) > session.duration
                        ? <Button size="sm" className="card-button" onClick={handleComplete}>Mark As Completed</Button>
                        : <Button size="sm" className="card-button" disabled>Mark As Completed</Button>
                    )}
                    {(status === "Completed" && role === "Support Seeker" && !feedbackisExpired) && 
                        <Button size="sm" className="card-button"
                            onClick={() => {navigate(`/support-sessions/completed/${session.uid}/feedback`)}}
                        >
                            {feedback ? "Edit Feedback" : "Rate"}
                        </Button>
                    }
                </div>
            </div>
        </div>
    );
}

export default SessionCards;