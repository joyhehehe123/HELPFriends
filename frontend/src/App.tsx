import { Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { onAuthStateChange } from "./services/authService.ts";
import "./App.css";

import Navbar from "./components/MainNavbar";
import AppNavbar from "./components/AppNavbar";

import Index from "./pages/index/index";
import Login from './pages/auth/Login/LoginFlow.tsx';
import ResetPassword from './pages/auth/Login-ForgotPassword/ResetPasswordFlow';
import Profile from './pages/profiles/AccountDetails';
import VolunteerProfile from './pages/profiles/VolunteerDetails.tsx';
import Signup from './pages/auth/Signup/SignupFlow.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';

import SupportSessionsMenu from "./pages/support-sessions/my-support-sessions";
import SupportSessions from "./pages/support-sessions/support-sessions";
import SessionDetails from "./pages/support-sessions/session-details";
import {
  NotificationsRoute,
  RequestSupportRoute,
  SupportRequestsRoute,
} from "./pages/support-requests/SupportRoutes";

function LegacyDomRenderer({ render }: { render: () => HTMLElement | null }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = render();

    if (ref.current && element) {
      ref.current.replaceChildren(element);
    }

    return () => {
      if (element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [render]);

  return <div ref={ref} />;
}

function SignupPage() {
  return <LegacyDomRenderer render={() => Signup({})} />;
}

function LoginPage() {
  return <LegacyDomRenderer render={() => Login({})} />;
}

function ResetPasswordPage() {
  return <LegacyDomRenderer render={() => ResetPassword({})} />;
}

function ProfilePage() {
  const navigate = useNavigate();
  return <LegacyDomRenderer render={() => Profile({ navigate })} />;
}

function VolunteerProfilePage() {
  const navigate = useNavigate();
  return <LegacyDomRenderer render={() => VolunteerProfile({ navigate })} />;
}

function LoginShell() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

const SUPPORT_NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Request a Support", href: "/support-request-form" },
  { label: "Support Requests", href: "/support-requests" },
  { label: "Support Sessions", href: "/support-sessions" },
];

function SupportRoutesShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <>
      <AppNavbar
        links={SUPPORT_NAV_LINKS}
        notificationsHref="/notifications"
        activeHref={
          pathname.startsWith("/support-sessions")
            ? "/support-sessions"
            : pathname === "/request-support"
              ? "/support-request-form"
              : pathname
        }
        userName="Mr.Balls"
        onNavigate={navigate}
      />
      <Outlet />
    </>
  )
}


function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (user) {
        console.log(`Current user UID: ${user.uid}`);
        console.log(`Current user email: ${user.email}`);
      } else {
        console.log("No user is logged in");
      }
    })
    return () => unsubscribe();
  }, [])

  return (
    <>
      <Routes>

        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<ProfilePage />} />

        <Route element={<LoginShell />}>
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/' element={<Index />} />
          <Route path='/profile/volunteer-profile' element={<VolunteerProfilePage />} />
        </Route>

        <Route element={<SupportRoutesShell />}>
          <Route path="/request-support" element={<RequestSupportRoute />} />
          <Route path="/support-request-form" element={<RequestSupportRoute />} />
          <Route path="/support-requests" element={<SupportRequestsRoute />} />
          <Route path="/notifications" element={<NotificationsRoute />} />
          <Route path="/support-sessions" element={<SupportSessionsMenu />} />
          <Route path="/support-sessions/active" element={<SupportSessions status="Active" />} /> 
          <Route path="/support-sessions/completed" element={<SupportSessions status="Completed" />} /> 
          <Route path="/support-sessions/cancelled" element={<SupportSessions status="Cancelled" />} />
          <Route path="/support-sessions/active/:sessionId" element={<SessionDetails />} />
          <Route path="/support-sessions/completed/:sessionId" element={<SessionDetails />} /> 
          <Route path="/support-sessions/cancelled/:sessionId" element={<SessionDetails />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
