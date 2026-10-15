import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import "./App.css";

import Navbar from "./components/MainNavbar";
import AppNavbar from "./components/navbar/navbar";

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

// import SupportShell from './pages/support-requests/SupportShell'

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


function App() {
  return (
    <>
      <Routes>

        {/* <Route path='/support-request-form' element={<SupportShell />} />
        <Route path='/support-requests' element={<SupportShell />} />
        <Route path='/support-sessions' element={<SupportShell />} />
        <Route path='/notifications' element={<SupportShell />} /> */}

        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/profile' element={<ProfilePage />} />

        <Route element={<LoginShell />}>
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/' element={<Index />} />
          <Route path='/profile/volunteer-profile' element={<VolunteerProfilePage />} />
        </Route>

          <Route element={<AppShell />}>
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
