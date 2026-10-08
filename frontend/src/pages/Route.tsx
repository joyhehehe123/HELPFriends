import { useEffect, useRef } from 'react'
import createLoginFlow from './Login/LoginFlow'
import createResetPasswordFlow from './Login-ForgotPassword/ResetPasswordFlow'
import createSignupFlow from './Signup/SignupFlow'

export default function SignupRoute() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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
