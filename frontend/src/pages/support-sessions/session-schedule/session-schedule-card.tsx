import { Timestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConfirm } from "../../../components/confirm/confirm-context";
import { useToast } from "../../../components/toast/Toast";
import type { User } from "../../../types/user";
import type { Volunteer } from "../../../types/volunteer";
import type { SupportRequest } from "../../../types/supportRequest";
import { getUser } from "../../../services/userService";
import { getVolunteer } from "../../../services/volunteerService";
import { createSupportSession, getSupportSessionByRequestId } from "../../../services/supportSessionService";
import Button from "../../../components/Button";
import { ChevronDown } from "lucide-react";
import "./session-schedule-card.css";
import { setRequestAsScheduled } from "../../../services/supportRequestService";

type Props = { request: SupportRequest };

export default function SessionScheduleCard({ request }: Props) {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { showToast } = useToast();
    const [volunteer, setVolunteer] = useState<User | null>(null);
    const [volunteerData, setVolunteerData] = useState<Volunteer | null>(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [duration, setDuration] = useState(0);
    const [showError, setShowError] = useState(false);
    const durations = [30, 60, 90, 120];
    const TZ = "Asia/Kuala_Lumpur";
    const STEP = 30;

    const toMin = (hhmm: string) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };
    const pad = (n: number) => String(n).padStart(2, "0");
    const weekdayOf = (dateStr: string) =>
        new Date(`${dateStr}T12:00:00+08:00`).toLocaleDateString("en-US", { weekday: "long", timeZone: TZ });

    useEffect(() => {
        getUser(request.volunteerId)
            .then((user) => setVolunteer(user ?? null))
            .catch(console.error);

        getVolunteer(request.volunteerId)
            .then((volunteerData) => setVolunteerData(volunteerData ?? null))
            .catch(console.error);
    }, [request, request.volunteerId]);

    // 1. Dates: from proposed slots, upcoming, and on a day the volunteer works
    const availability = volunteerData?.availability ?? [];
    const dateOptions = [...new Set(
        request.proposedTimeSlots.map((t) => t.toDate().toLocaleDateString("en-CA", { timeZone: TZ }))
    )].filter((d) =>
        d >= new Date().toLocaleDateString("en-CA", { timeZone: TZ }) &&
        availability.some((a) => a.day === weekdayOf(d))
    ).sort();

    // 2. Times: from the volunteer's availability on the chosen date
    const timeOptions: { iso: string; label: string }[] = [];
    if (date && duration > 0) {
        const entry = availability.find((a) => a.day === weekdayOf(date));
        for (const range of entry?.timeSlots ?? []) {
            for (let t = toMin(range.start); t + duration <= toMin(range.end); t += STEP) {
                const start = new Date(`${date}T${pad(Math.floor(t / 60))}:${pad(t % 60)}:00+08:00`);
                if (start <= new Date()) continue;
                timeOptions.push({
                    iso: start.toISOString(),
                    label: start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ }),
                });
            }
        }
    }

    const saveSession = async (): Promise<boolean> => {
        try {
            const dateTime = Timestamp.fromDate(new Date(time));
            await createSupportSession(request, { dateTime, duration });
            showToast("Session scheduled.");
            return true;
        } catch (error) {
            showToast(error instanceof Error ? error.message : "Could not schedule session.");
            return false;
        }
    }

    const handleSubmit = async () => {
        if (!date || !time || duration === 0) {
            setShowError(true);
            return;
        };

        const { confirmed } = await confirm({
            title: "Confirm to schedule session?",
            message: `Do you want to schedule session for the support request "${request.title}"?`,
            confirmText: "Schedule Session",
            cancelText: "Continue Editing"
        });

        if (!confirmed) return;

        if (await saveSession()) {
            await setRequestAsScheduled(request.uid);
            const session = await getSupportSessionByRequestId(request.uid);
            navigate(`/support-sessions/${session?.status.toLowerCase()}/${session?.uid}`);
        }
    }

    return (
        <div className="card-wrapper" id="schedule-card-outer-wrapper">
            <div className="schedule-card-wrapper">
                <div className="schedule-card">
                    <div className="schedule-card-details">
                        <div className="schedule-card-header">
                            <div className="schedule-card-header-main">
                                <p className="schedule-card-title">Session Scheduling</p>
                                <p className="schedule-card-subtitle">{request.title}</p>
                            </div>
                            <p className="schedule-card-note"><em>Note: The available dates below are based on the preferred time slots you proposed in your request and the available times are based on the volunteer's availability.</em></p>
                            {showError && (<p className="error-msg schedule-error-msg">Please select duration, date, and time.</p>)}
                        </div>
                        <div className="schedule-card-info">
                            <div className="schedule-card-info-row">
                                <p className="schedule-card-element">VOLUNTEER</p>
                                <p className="schedule-card-info-right">{volunteer?.fullName ?? "Loading..."}</p>
                            </div>
                            <div className="schedule-card-info-row">
                                <p className="schedule-card-element">SUPPORT MODE</p>
                                <p className="schedule-card-info-right">{request.supportMode}</p>
                            </div>
                            <div className="schedule-card-info-row">
                                <p className="schedule-card-element">DURATION</p>
                                <div className="schedule-card-info-right schedule-card-select">
                                    <select 
                                        className="select-drop-down" 
                                        id="date" 
                                        value={duration} 
                                        onChange={(e) => {
                                            setDuration(Number(e.target.value));
                                        }}
                                    >
                                        <option value="">— Select duration—</option>
                                        {durations.map((d) => (
                                            <option key={d} value={d}>{d} min</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="drop-down"/>
                                </div>
                            </div>
                            <div className="schedule-card-info-row">
                                <p className="schedule-card-element">DATE</p>
                                <div className="schedule-card-info-right schedule-card-select">
                                    <select 
                                        className="select-drop-down" 
                                        id="date" 
                                        value={date} 
                                        onChange={(e) => {
                                            setDate(e.target.value);
                                            setTime("");
                                        }}
                                    >
                                        <option value="">— Select a date —</option>
                                        {dateOptions.map((d) => (
                                            <option key={d} value={d}>
                                                {new Date(`${d}T00:00:00+08:00`).toLocaleDateString("en-GB", {
                                                    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", timeZone: TZ,
                                                })}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="drop-down"/>
                                </div>
                            </div>
                            {date && duration !== 0 && (
                                <div className="schedule-card-info-row">
                                    <p className="schedule-card-element">TIME</p>
                                    <div className="schedule-card-info-right schedule-card-select">
                                        <select 
                                            className="select-drop-down" 
                                            id="time" 
                                            value={time} 
                                            disabled={!date}
                                            onChange={(e) => {
                                                setTime(e.target.value);
                                                setShowError(false);
                                            }}
                                        >
                                            <option value="">— Select a time —</option>
                                            {timeOptions.map((s) => (
                                                <option key={s.iso} value={s.iso}>
                                                    {new Date(s.iso).toLocaleTimeString("en-US", {
                                                        hour: "numeric", minute: "2-digit", hour12: true, timeZone: TZ,
                                                    })}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="drop-down" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="schedule-card-button">
                        <Button size="sm" className="card-button action-button" onClick={handleSubmit}>
                            Confirm Schedule
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};