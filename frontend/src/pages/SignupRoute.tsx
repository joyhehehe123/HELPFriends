import { useEffect, useRef } from 'react'
import createSignupFlow from './SignupFlow'

export default function SignupRoute() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const mountSignupFlow = () => {
      container.replaceChildren()
      container.appendChild(createSignupFlow())
    }

    mountSignupFlow()
    window.addEventListener('popstate', mountSignupFlow)

    return () => {
      window.removeEventListener('popstate', mountSignupFlow)
      container.replaceChildren()
    }
  }, [])

  return <div ref={containerRef} className="signup-route" />
}
