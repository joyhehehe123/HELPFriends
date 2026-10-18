import { Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChange } from "./services/authService.ts";
import { ProtectedRoute } from "./ProtectedRoute.tsx";
import { ToastProvider } from "./components/toast/Toast.tsx";
import { ConfirmProvider } from "./components/confirm/confirm-context.tsx";
import "./App.css";

import Navbar from "./components/MainNavbar";
// import AppNavbar from "./components/Navbar";
import AppNavbar from "./components/navbar/app-navbar";

import Index from "./pages/index/index";
import Login from './pages/auth/Login/LoginFlow.tsx';
import ResetPassword from './pages/auth/Login-ForgotPassword/ResetPasswordFlow';
import Profile from './pages/profiles/AccountDetails';
import VolunteerProfile from './pages/profiles/VolunteerDetails.tsx';
import Signup from './pages/auth/Signup/SignupFlow.tsx';
import Dashboard from './pages/dashboard/Dashboard.tsx';

import SupportSessionsMenu from "./pages/support-sessions/support-sessions-menu/support-sessions-menu.tsx";
import SupportSessions from "./pages/support-sessions/sessions-display/support-sessions.tsx";
import SessionDetails from "./pages/support-sessions/session-details/session-details.tsx";

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

function AppShell() {
  return (
    <>
      <AppNavbar />
      <Outlet />
    </>
  )
}

// const SUPPORT_NAV_LINKS = [
//   { label: "Dashboard", href: "/dashboard" },
//   { label: "Request a Support", href: "/support-request-form" },
//   { label: "Support Requests", href: "/support-requests" },
//   { label: "Support Sessions", href: "/support-sessions" },
// ];

// function SupportRoutesShell() {
//   const navigate = useNavigate();
//   const { pathname } = useLocation();

//   return (
//     <>
//       <AppNavbar
//         links={SUPPORT_NAV_LINKS}
//         notificationsHref="/notifications"
//         activeHref={
//           pathname.startsWith("/support-sessions")
//             ? "/support-sessions"
//             : pathname === "/request-support"
//               ? "/support-request-form"
//               : pathname
//         }
//         userName="Mr.Balls"
//         onNavigate={navigate}
//       />
//       <Outlet />
//     </>
//   )
// }

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

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
      <ToastProvider>
        <ConfirmProvider>
          <Routes>

            {/* <Route path='/support-request-form' element={<SupportShell />} />
            <Route path='/support-requests' element={<SupportShell />} />
            <Route path='/support-sessions' element={<SupportShell />} />
            <Route path='/notifications' element={<SupportShell />} /> */}

            <Route element={<LoginShell />}>
              <Route path='/' element={<Index />} />
              <Route path='/signup' element={<SignupPage />} />
              <Route path='/login' element={<LoginPage />} />
              <Route path='/reset-password' element={<ResetPasswordPage />} />
            </Route>

            <Route element={<ProtectedRoute  isAuthenticated={isAuthenticated} isLoading={isLoading} />}>
              <Route element={<AppShell />}>
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/profile' element={<ProfilePage />} />
                <Route path='/profile/volunteer-profile' element={<VolunteerProfilePage />} />

                <Route path='/support-request-form' element={<RequestSupportRoute/>} />
                <Route path='/support-requests' element={<SupportRequestsRoute />} />
                <Route path='/notifications' element={<NotificationsRoute />} />

                <Route path="/support-sessions" element={<SupportSessionsMenu />} />
                <Route path="/support-sessions/active" element={<SupportSessions status="Active" />} /> 
                <Route path="/support-sessions/completed" element={<SupportSessions status="Completed" />} /> 
                <Route path="/support-sessions/cancelled" element={<SupportSessions status="Cancelled" />} />
                <Route path="/support-sessions/active/:sessionId" element={<SessionDetails />} />
                <Route path="/support-sessions/completed/:sessionId" element={<SessionDetails />} /> 
                <Route path="/support-sessions/cancelled/:sessionId" element={<SessionDetails />} />
              </Route>
            </Route>
          </Routes>
        </ConfirmProvider>
      </ToastProvider>
    </>
  )
}

export default App;
