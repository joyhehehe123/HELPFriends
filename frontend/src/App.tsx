import { useEffect, useState } from 'react'
import Navbar from './components/MainNavbar'
import catMascot from './assets/Cat_Index.png'
import Route from './pages/Route'
import './App.css'

function App() {
  const [routePath, setRoutePath] = useState(() => window.location.pathname)

  useEffect(() => {
    const handleRouteChange = () => setRoutePath(window.location.pathname)

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  if (routePath === '/signup' || routePath === '/register' || routePath === '/login' || routePath === '/forgot-password') {
    return <Route />
  }

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-main">
        <section className="home-hero" aria-labelledby="home-title">
          <h1 id="home-title" className="home-hero__logo">
            <span className="home-hero__logo-help">HELP</span>Friends
          </h1>

          <p className="home-hero__tagline">
            <span className="home-hero__accent">Help</span> each other,{' '}
            <span className="home-hero__accent">Friends</span> forever
          </p>

          <p className="home-hero__text">
            Welcome to HELPFriends — a platform where HELP University students can look for help
            and to help others.
          </p>
        </section>

        <div className="home-actions">
          <div className="home-actions__buttons">
            <a className="home-cta" href="/signup">
              <span className="home-cta__label">Register now</span>
            </a>
            <a className="home-cta" href="/login">
              <span className="home-cta__label">Login</span>
            </a>
          </div>

          {/* Decorative: the cat's arms hold up the two buttons */}
          <img className="home-mascot" src={catMascot} alt="" aria-hidden="true" />
        </div>
      </main>
    </div>
  )
}

export default App
