import { Routes, Route, Outlet } from 'react-router-dom'
import { type ReactNode } from 'react';
import './App.css'

import Navbar from './components/navbar/navbar';
import SupportSessionsMenu from './pages/support-sessions/my-support-sessions';
import SupportSessions from './pages/support-sessions/support-sessions';

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
          <Route path='/support-sessions' element={<SupportSessionsMenu />} />
          <Route path='/support-sessions/active' element={<SupportSessions status='Active' />} /> 
          <Route path='/support-sessions/completed' element={<SupportSessions status='Completed' />} /> 
          <Route path='/support-sessions/cancelled' element={<SupportSessions status='Cancelled' />} /> 
        </Route>
      </Routes>
    </>
  )
}

export default App;
