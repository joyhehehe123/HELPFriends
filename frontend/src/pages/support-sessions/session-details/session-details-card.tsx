import { useState, useEffect } from "react";
import type { Role, SessionStatus } from "../../../types/constants";
import type { SupportSession } from "../../../types/supportSession";
import type { Feedback } from "../../../types/feedback";
import { getFeedbackBySession } from "../../../services/feedbackService";
import { getUser } from "../../../services/userService";
import { Clock, CircleX, CircleCheckBig, Star } from "lucide-react";
import getStatusMessage from "../functions/status-msg";
import defaultProfilePic from "../../../assets/hamster.jpg";
import "./session-details-card.css"
import Button from "../../../components/Button";

type Props = { session: SupportSession, role: Role, status: SessionStatus};

function SessionDetailsCard({ session, role, status }: Props) {
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [otherName, setOtherName] = useState<string>();
    const [otherProfilePic, SetOtherProfilePic] = useState<string>(defaultProfilePic);

    const otherRole = role === "Support Seeker" ? "Volunteer" : "Support Seeker";
    const myId = role === "Support Seeker" ? session.seekerId : session.volunteerId;
    const cancelledBy = session.cancelledBy === myId ? "You" : `${otherName} (${otherRole})`;

    const sessionDate = session.dateTime.toDate();
    const timeDiff = Math.round((+sessionDate - Date.now()) / (1000 * 60));

    const date = sessionDate.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
    const day = sessionDate.toLocaleDateString("en-US", { weekday: "short" });
    const time = sessionDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const cancelledDate = session.cancelledAt?.toDate()
        .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

    useEffect(() => {
        if (status === 'Completed') {
            getFeedbackBySession(session.uid)
                .then(setFeedback)
                .catch(console.error);
        }

        getUser(otherRole === "Volunteer" ? session.volunteerId : session.seekerId)
            .then((user) => setOtherName(user?.fullName))
            .catch(console.error);

        getUser(otherRole === "Volunteer" ? session.volunteerId : session.seekerId)
            .then((user) => SetOtherProfilePic(user?.profilePic ?? defaultProfilePic));
    }, [session, role, status])

    return (
        <div className="details-card">
            {/* Card chips */}
            <div className="chips">
                <div className="support-cat-and-role">
                    <p className="support-category">{session.category.toUpperCase()} SUPPORT</p>
                    <p className={role === "Support Seeker" ? "seeker role" : "volunteer role"}>{role.toUpperCase()}</p>
                </div>
                <div className="status-and-msg">
                    {status === 'Active' && (
                        <div className="status-msg"><Clock/><p>{getStatusMessage(timeDiff)}</p></div>
                    )}
                    {status === 'Completed' && (feedback
                        ? <div className="status-msg"><CircleCheckBig/><p>Feedback provided</p></div>
                        : <div className="status-msg"><Clock/><p>Waiting for feedback</p></div>
                    )}
                    {status === "Cancelled" && (
                        <div className="status-msg cancelled-msg"><CircleX/><p>Cancelled on {cancelledDate}</p></div>
                    )}

                    <p className={status === "Cancelled" ? "status-cancelled" : "status"}>
                        {session.status}
                    </p>
                </div>
            </div>

            {/* Support session details with grid layout*/}
            <p className="support-title">{session.title}</p>
            <div className="grid">
                <div className="session-details" id="session-id">
                    <p className="element">SESSION ID</p>
                    <p>{session.uid}</p>
                </div>
                <div className="session-details" id="date">
                    <p className="element">DATE</p>
                    <p>{date} ({day})</p>
                </div>
                <div className="session-details" id="time">
                    <p className="element">TIME</p>
                    <p>{time}</p>
                </div>
                <div className="session-details" id="duration">
                    <p className="element">DURATION</p>
                    <p>{session.duration} minutes</p>
                </div>
                <div className="session-details" id ="mode">
                    <p className="element">SUPPORT MODE</p>
                    <p>{session.supportMode}</p>
                </div>
                <div className="session-details" id="other-role">
                    <p className="element">{otherRole}</p>
                    <div id="other-role-details">
                        <img src={otherProfilePic} alt="Profile Picture" id="profile-pic"/>
                        <p>{otherName}</p>
                    </div>
                </div>
            </div>
            <div className="support-description">
                <p className="element">DESCRIPTION</p>
                <p>{session.description}</p>
            </div>

            {/* No feedback */}
            {(status === "Completed" && role === "Volunteer" && !feedback) && (
                <p id="no-feedback-msg">No feedback has been provided yet.</p>
            )}

            {/* Feedback rating and optional comments */}
            {(status === "Completed" && feedback) && (
                <div className="feedback">
                    <div className="rating-container">
                        <p className="element">{role === "Support Seeker" ? "YOUR RATING" : "RATING"}</p>
                        <div className="star-rating">
                            <div className="stars">
                                {Array.from({ length: 5}, () => (
                                    <Star fill="#d5d5d5" strokeWidth={0} size={40} />
                                ))}
                            </div>
                            <div className="stars rating">
                                {Array.from({ length: feedback.rating}, () => (
                                    <Star fill="yellow" strokeWidth={0} size={40} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <hr/>
                    <div className="comments">
                        <p className="element">{role === "Support Seeker" ? "YOUR COMMENTS" : "COMMENTS"}</p>
                        {feedback.comments
                            ? <p className="has-comments">{feedback.comments}</p>
                            : <p className="no-comment">
                                {role === "Support Seeker" 
                                    ? "You did not provide any comment." 
                                    : "The student did not provide any comment."
                                }
                            </p>
                        }
                    </div>
                </div>
            )}

            {/* Cancel information */}
            {status === "Cancelled" && (
                <div className="cancel-info">
                    <div className="cancelled-by">
                        <p className="element">CANCELLED BY:</p>
                        <p>{cancelledBy}</p>
                    </div>
                    <div className="cancel-reason">
                        <p className="element">REASON:</p>
                        {session.cancelledReason 
                            ? <p className="has-reason">{session.cancelledReason}</p>
                            : <p className="no-reason">No cancel reason provided.</p>
                        }
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {(status === "Active" && timeDiff > 0) && (timeDiff > 120
                ? <Button size="sm" className="card-button action-button">Cancel</Button>
                : <Button size="sm" className="card-button action-button" disabled>Cancel</Button>
            )}
            {(status === "Active" && timeDiff < 0) && (Math.abs(timeDiff) > session.duration
                ? <Button size="sm" className="card-button action-button">Mark As Completed</Button>
                : <Button size="sm" className="card-button action-button" disabled>Mark As Completed</Button>
            )}
            {(status === "Completed" && role === "Support Seeker") && (feedback
                ? <Button size="sm" className="card-button action-button">Edit Feedback</Button>
                : <Button size="sm" className="card-button action-button">Rate</Button>
            )}
        </div>
    )
}

export default SessionDetailsCard;