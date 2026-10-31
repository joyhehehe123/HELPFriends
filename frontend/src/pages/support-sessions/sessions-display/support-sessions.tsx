import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentUid } from "../../../services/authService";
import { getUser } from "../../../services/userService";
import { getSupportSessionsByStudentAndStatus } from "../../../services/supportSessionService";
import type { SessionStatus, Role } from "../../../types/constants";
import SessionList from "./session-list";
import "./support-sessions.css";
import Button from "../../../components/Button";

type Props = { status: SessionStatus };

function SupportSessions({ status }: Props) {
    const navigate = useNavigate();

    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey((k) => k + 1);

    const [uid, setUid] = useState("");
    const [isVolunteer, setIsVolunteer] = useState<boolean>(true)
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
        if (!uid) return;
        setUid(uid);

        const setVolunteer = async () => {
            try {
                const isVolunteer = (await getUser(uid))?.isVolunteer;
                setIsVolunteer(isVolunteer ?? true);
            } catch (error) {
                console.log(error);
            }
        }
        setVolunteer();

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
    }, [uid, status, refreshKey])

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
                {(isVolunteer || volunteerSessionsCount!== 0) && (<div className="tabs">
                    <Button 
                        size="sm" 
                        upperCase={false} 
                        className={`tab ${activeTab === "Support Seeker" ? "active-tab" : ""}`} 
                        onClick={() => setActiveTab("Support Seeker")}
                    >
                        As a Support Seeker ({seekerSessionsCount})
                    </Button>
                    <Button 
                        size="sm" 
                        upperCase={false}
                        disabled={!isVolunteer && volunteerSessionsCount === 0}
                        className={`tab ${(activeTab === "Volunteer" ? "active-tab" : "")}`}
                        onClick={() => setActiveTab("Volunteer")}
                    >
                        As a Volunteer ({volunteerSessionsCount})
                    </Button>
                </div>)}
            </div>

            <SessionList role={activeTab} status={status} refreshKey={refreshKey} onUpdated={refresh}/>
        </section>
    );
}

export default SupportSessions;