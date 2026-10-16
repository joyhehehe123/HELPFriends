import { useState, useEffect } from "react";
import { getCurrentUid } from "../../services/authService";
import { getSupportSessionsByStudentAndStatus } from "../../services/supportSessionService";
import type { SessionStatus, Role } from "../../types/constants";
import SessionList from "./session-list";
import "./support-sessions.css";

type Props = { status: SessionStatus };

function SupportSessions({ status }: Props) {
    const [activeTab, setActiveTab] = useState<Role>("Support Seeker");
    const [seekerSessionsCount, setSeekerSessionsCount] = useState<number>(0);
    const [volunteerSessionsCount, setVolunteerSessionsCount] = useState<number>(0);

    useEffect(() => {
        // const uid = "poFo7wbZjvcORzhO9sz4EaMxwQv2"; // getCurrentUid();
        const uid = "n66jreETszcSgvbor2ETABZ5VW33"; // getCurrentUid();
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
    }, [status])

    return (
        <section className="content">
            <div className="header">
                <h1>{status.toUpperCase()} SESSIONS</h1>
                <div className="tabs">
                    <button className={activeTab === "Support Seeker" ? "active-tab" : "tab"} onClick={() => setActiveTab("Support Seeker")}>
                        As a Support Seeker ({seekerSessionsCount})
                    </button>
                    <button className={activeTab === "Volunteer" ? "active-tab" : "tab"} onClick={() => setActiveTab("Volunteer")}>
                        As a Volunteer ({volunteerSessionsCount})
                    </button>
                </div>
            </div>

            <SessionList role={activeTab} status={status}/>
        </section>
    );
}

export default SupportSessions;