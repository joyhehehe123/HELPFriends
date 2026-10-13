import { Routes, Route, Outlet, useNavigate } from 'react-router-dom'
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

function AppShell() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}

function App() {
  return (
    <>
      <Routes>
        
        <Route element={<AppShell />}>
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/' element={<Index />} />
          <Route path='/volunteer-profile' element={<VolunteerProfilePage />} />

        </Route>
      </Routes>
    </>
  )
}

          /*<Route path='/support-sessions' element={<SupportSessionsMenu />} />
          <Route path='/support-sessions/active' element={<SupportSessions status='Active' />} /> 
          <Route path='/support-sessions/completed' element={<SupportSessions status='Completed' />} /> 
          <Route path='/support-sessions/cancelled' element={<SupportSessions status='Cancelled' />} /> */
          // this is for the support sessions menu, but i didnt import it yet - haiqal.


export default App;
