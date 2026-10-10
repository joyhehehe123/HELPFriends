import { Route, Routes } from "react-router-dom";
import { type ReactNode } from "react";

import Navbar from "./components/MainNavbar";
import Index from "./pages/index/index";
import PageRoute from "./pages/Route";

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
      <Route path="/signup" element={<AppShell><PageRoute /></AppShell>} />
      <Route path="/register" element={<AppShell><PageRoute /></AppShell>} />
      <Route path="/login" element={<AppShell><PageRoute /></AppShell>} />
      <Route path="/forgot-password" element={<AppShell><PageRoute /></AppShell>} />
      <Route path="/profile" element={<PageRoute />} />
      <Route path="/profile/volunteer" element={<PageRoute />} />
      <Route path="/" element={<AppShell><Index /></AppShell>} />
    </Routes>
  );
}

export default App;