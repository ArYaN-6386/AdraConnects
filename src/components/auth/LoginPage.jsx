import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Icon from '../common/Icon.jsx'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleGoogle() {
    setError('')
    setBusy(true)
    try {
      await signInWithGoogle('/')
    } catch (err) {
      setError(err.message ?? 'Sign in failed')
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-mark">
            <Icon name="chat" size={26} strokeWidth={2.2} />
          </span>
          AdraConnects
        </div>
        <p className="auth-tagline">Agile Development · Robust Automations</p>

        <button className="btn-google" onClick={handleGoogle} disabled={busy}>
          <Icon name="google" size={18} />
          {busy ? 'Redirecting to Google…' : 'Continue with Google'}
        </button>
        {error && <div className="auth-error auth-error-center">{error}</div>}

        <p className="auth-note">
          Sign in with your college Google account. New accounts are created automatically on first
          sign-in.
        </p>
        <p className="auth-switch">
          Teacher or HOD? <Link to="/faculty">Faculty gateway</Link>
        </p>
      </div>
    </div>
  )
}
