import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUid } from "../../../services/authService";
import { getSupportSessionsByStudentAndStatus } from "../../../services/supportSessionService";
import type { SessionStatus, Role } from "../../../types/constants";
import SessionList from "./session-list";
import "./support-sessions.css";

type Props = { status: SessionStatus };

function SupportSessions({ status }: Props) {
    const navigate = useNavigate();

    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey((k) => k + 1);

    const [activeTab, setActiveTab] = useState<Role>("Support Seeker");
    const [seekerSessionsCount, setSeekerSessionsCount] = useState<number>(0);
    const [volunteerSessionsCount, setVolunteerSessionsCount] = useState<number>(0);

    const chevronLeftDisabled = status === "Active";
    const chevronRightDisabled = status === "Cancelled";

    let chevronLeftNavigateTo: string;
    if (status !== "Active") {
        chevronLeftNavigateTo = status === "Completed" ? "/support-sessions/active" : "/support-sessions/completed";
    }

    let chevronRightNavigateTo: string;
    if (status !== "Cancelled") {
        chevronRightNavigateTo = status === "Completed" ? "/support-sessions/cancelled" : "/support-sessions/completed";
    }

    useEffect(() => {        
        const uid = getCurrentUid();
        // const uid = "poFo7wbZjvcORzhO9sz4EaMxwQv2";
        // const uid = "n66jreETszcSgvbor2ETABZ5VW33";
        if (!uid) return;

        const fetchSessions = async () => {
            try {
                const ssCount = (await getSupportSessionsByStudentAndStatus(uid, false, status)).length;
                const vsCount = (await getSupportSessionsByStudentAndStatus(uid, true, status)).length;

                setSeekerSessionsCount(ssCount);
                setVolunteerSessionsCount(vsCount);
            } catch (error) {
                console.log(error);
            }
        }
        fetchSessions();
    }, [status, refreshKey])

    return (
        <section className="content">
            <div className="header">
                <div className="status-heading">
                    <ChevronLeft 
                        size={30} strokeWidth={4} 
                        className="chevron" 
                        aria-disabled={chevronLeftDisabled} 
                        onClick={() => {
                            if (!chevronLeftDisabled && chevronLeftNavigateTo) navigate(chevronLeftNavigateTo)
                        }} 
                    />
                    <h1>{status.toUpperCase()} SESSIONS</h1>
                    <ChevronRight 
                        size={30} 
                        strokeWidth={4} 
                        className="chevron" 
                        aria-disabled={chevronRightDisabled}
                        onClick={() => {
                            if (!chevronRightDisabled && chevronRightNavigateTo) navigate(chevronRightNavigateTo)
                        }} />
                </div>
                <div className="tabs">
                    <button className={activeTab === "Support Seeker" ? "active-tab" : "tab"} onClick={() => setActiveTab("Support Seeker")}>
                        As a Support Seeker ({seekerSessionsCount})
                    </button>
                    <button className={activeTab === "Volunteer" ? "active-tab" : "tab"} onClick={() => setActiveTab("Volunteer")}>
                        As a Volunteer ({volunteerSessionsCount})
                    </button>
                </div>
            </div>

            <SessionList role={activeTab} status={status} refreshKey={refreshKey} onUpdated={refresh}/>
        </section>
    );
}

export default SupportSessions;