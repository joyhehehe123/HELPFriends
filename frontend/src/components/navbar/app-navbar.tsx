import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import type { User } from "../../types/user";
import { getCurrentUid } from "../../services/authService";
import { getUser } from "../../services/userService";
import { Bell } from "lucide-react";
import defaultProfilePic from "../../../public/profilePics/hamster.jpg";
import "./app-navbar.css";

function AppNavbar() {
    const { pathname } = useLocation();
    const [user, setUser] = useState<User | null>(null);
    const [profilePic, setProfilePic] = useState(defaultProfilePic);

    useEffect(() => {
        const uid = getCurrentUid();
        if (!uid) return;
        getUser(uid).then(setUser).catch(console.error);

        setProfilePic(user?.profilePic ?? defaultProfilePic);
    }, [user]);

    return (
        <nav className="app-navbar-main">
            <Link to="/dashboard" className="logo link">
                <span id="logo-help">HELP</span>
                <span id="logo-friends">Friends</span>
            </Link>
            <div id="nav-links">
                <Link 
                    to="/dashboard" 
                    className={`nav-link link ${pathname.startsWith("/dashboard") ? "active-nav-link" : ""}`} 
                ><p>Dashboard</p></Link>
                <Link 
                    to="/support-request-form" 
                    className={`nav-link link ${pathname.startsWith("/support-request-form") ? "active-nav-link" : ""}`} 
                ><p>Request a Support</p></Link>
                <Link 
                    to="/support-requests" 
                    className={`nav-link link ${pathname.startsWith("/support-requests") ? "active-nav-link" : ""}`}
                ><p>My Support Requests</p></Link>
                <Link 
                    to="/support-sessions" 
                    className={`nav-link link ${pathname.startsWith("/support-sessions") ? "active-nav-link" : ""}`}
                ><p>My Support Sessions</p></Link>
            </div>
            <div id="bell-and-profile">
                <Link 
                    to="/notifications" id="bell" 
                    className={`bell link ${pathname.startsWith("/notifications") ? "active-nav-link" : ""}`}
                ><Bell /></Link>
                <Link to="/profile" id="profile" className="link"><img src={profilePic} /></Link>
            </div>
        </nav>
    )
}

export default AppNavbar;