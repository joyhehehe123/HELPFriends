import { Routes, Route } from 'react-router-dom'
import { type ReactNode } from 'react';
import './App.css'

import Navbar from './components/navbar/navbar';
// import Index from './pages/index/index';
// import SupportRequestForm from './pages/support-requests/support-request-form';
// import SupportRequests from './pages/support-requests/my-support-requests';
import SupportSessions from './pages/support-sessions/my-support-sessions';

function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}

function App() {
  return (
    <>
      <Routes>
        {/* <Route path='/' element={<AppShell><Index /></AppShell>} />
        <Route path='/support-request-form' element={<AppShell><SupportRequestForm /></AppShell>} />
        <Route path='/support-requests' element={<AppShell><SupportRequests /></AppShell>} /> */}
        <Route path='/support-sessions' element={<AppShell><SupportSessions /></AppShell>} />
      </Routes>
    </>
  )
}

export default App;
