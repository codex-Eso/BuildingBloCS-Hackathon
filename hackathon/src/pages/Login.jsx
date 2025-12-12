import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../SupaBase.js'
import { useAuth } from '../auth/useAuth.js'
import '../css/AuthPages.css'

export function Login() {
  const navigate = useNavigate()
  const { session, role, loading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (loading) return
    if (!session) return
    
    // STRICT: Admin must NEVER be on student login page
    if (role === 'admin') {
      // Sign them out and show error
      supabase.auth.signOut()
      setError('Admins cannot use Student Login. Redirecting to Admin Login...')
      setTimeout(() => navigate('/admin/login', { replace: true }), 1500)
      return
    }
    
    // Student -> student dashboard
    navigate('/Homepage', { replace: true })
  }, [session, role, loading, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    // Check role from user_metadata
    const userRole = data.user?.user_metadata?.role
    
    if (userRole === 'admin') {
      setError('This is an admin account. Please use Admin Login instead.')
      await supabase.auth.signOut()
      setSubmitting(false)
      return
    }

    // Student - redirect will happen via useEffect
    setSubmitting(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5 0 3-.3 4.3-.9" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M17 8c-4 0-6 3-6 6s3 6 6 6 6-3 6-6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
              <path d="M20 5l-3 3" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="auth-logo-text">EcoQuest</span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back!</h1>
          <p className="auth-subtitle">Sign in to continue your eco journey</p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="auth-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button type="submit" disabled={submitting} className="auth-submit-btn primary">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
          <div className="auth-divider"><span>or</span></div>
          <p>
            Admin? <Link to="/admin/login" className="admin-link">Admin Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}


