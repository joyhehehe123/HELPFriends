import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import type { User } from "../../types/user";
import { getCurrentUid } from "../../services/authService";
import { getUser } from "../../services/userService";
import { Bell } from "lucide-react";
import "./app-navbar.css";
import UserAvatar from "../UserAvatar.tsx";

function AppNavbar() {
    const { pathname } = useLocation();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const uid = getCurrentUid();
        if (!uid) return;

        let cancelled = false;
        getUser(uid)
            .then((profile) => {
                if (!cancelled) setUser(profile);
            })
            .catch((error: unknown) => {
                console.error("Failed to load navbar user profile:", error);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const userName = user?.fullName ?? "User";

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
                    className={`link icon-link ${pathname.startsWith("/notifications") ? "active-icon-link" : ""}`}
                >
                    <Bell />
                </Link>
                <Link 
                    to="/profile" 
                    className="profile link"
                    aria-label={`View profile for ${userName}`}
                >
                    <span className="app-navbar__user" role="img" aria-label={`Signed in as ${userName}`}>
                        <UserAvatar name={userName} size="sm" />
                    </span>
                </Link>
            </div>
            <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
                <defs>
                    <linearGradient id="icon-link-gradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#52d5ff" />
                        <stop offset="100%" stopColor="#37cc96" />
                    </linearGradient>
                </defs>
            </svg>
        </nav>
    )
}

export default AppNavbar;