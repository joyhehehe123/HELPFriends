import { useEffect, useRef } from 'react'
import createLoginFlow from './Login/LoginFlow'
import createResetPasswordFlow from './Login-ForgotPassword/ResetPasswordFlow'
import createAccountDetailsPage from './Profile/AccountDetails'
import createVolunteerDetailsPage from './Profile/VolunteerDetails'
import createSignupFlow from './Signup/SignupFlow'

export default function SignupRoute() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const navigate = (path: string) => {
      window.history.pushState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }

    const mountAuthFlow = () => {
      const currentPath = window.location.pathname

      container.replaceChildren()

      if (currentPath === '/login') {
        container.appendChild(createLoginFlow())
        return
      }

      if (currentPath === '/forgot-password') {
        container.appendChild(createResetPasswordFlow())
        return
      }

      if (currentPath === '/profile') {
        container.appendChild(createAccountDetailsPage({ navigate }))
        return
      }

      if (currentPath === '/profile/volunteer') {
        container.appendChild(createVolunteerDetailsPage({ navigate }))
        return
      }

      container.appendChild(createSignupFlow())
    }

    mountAuthFlow()
    window.addEventListener('popstate', mountAuthFlow)

    return () => {
      window.removeEventListener('popstate', mountAuthFlow)
      container.replaceChildren()
    }
  }, [])

  return <div ref={containerRef} className="signup-route" />
}
