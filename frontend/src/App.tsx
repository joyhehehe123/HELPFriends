import { Route, Routes, useNavigate } from "react-router-dom";
import { type ReactNode, useEffect, useRef } from "react";

import Navbar from "./components/MainNavbar";
import Index from "./pages/index/index";
import Login from './pages/auth/Login/LoginFlow.tsx'
import ResetPassword from './pages/auth/Login-ForgotPassword/ResetPasswordFlow'
import Profile from './pages/profiles/AccountDetails'
import VolunteerProfile from './pages/profiles/VolunteerDetails'
import Signup from './pages/auth/Signup/SignupFlow.tsx'

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

function AppShell({children}: {children: ReactNode}) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/signup" element={<AppShell><SignupPage /></AppShell>} />
      <Route path="/register" element={<AppShell><SignupPage /></AppShell>} />
      <Route path="/login" element={<AppShell><LoginPage /></AppShell>} />
      <Route path="/forgot-password" element={<AppShell><ResetPasswordPage /></AppShell>} />
      <Route path="/profile" element={<AppShell><ProfilePage /></AppShell>} />
      <Route path="/profile/volunteer" element={<AppShell><VolunteerProfilePage /></AppShell>} />
      <Route path="/" element={<AppShell><Index /></AppShell>} />
    </Routes>
  );
}

export default App;