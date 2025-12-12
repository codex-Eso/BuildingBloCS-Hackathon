import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../SupaBase.js'
import { useAuth } from '../auth/useAuth.js'
import { FullPageLoading } from '../components/FullPageLoading.jsx'

export function AuthCallback() {
  const navigate = useNavigate()
  const { session, role, loading, refreshRole } = useAuth()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      // Check if there's a hash fragment with tokens (Supabase email confirmation)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      
      // Also check query params (some flows use these)
      const queryParams = new URLSearchParams(window.location.search)
      const code = queryParams.get('code')
      const errorParam = queryParams.get('error')
      const errorDescription = queryParams.get('error_description')

      if (errorParam) {
        console.error('Auth error:', errorDescription)
        navigate('/login', { replace: true })
        return
      }

      // If we have a code, exchange it for a session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.error('Code exchange error:', error)
          navigate('/login', { replace: true })
          return
        }
        await refreshRole()
      }
      
      // If we have tokens in the hash, Supabase client should auto-detect them
      // Just wait for the session to be established
      if (accessToken && refreshToken) {
        // Give Supabase client time to process the tokens
        await new Promise(resolve => setTimeout(resolve, 500))
        await refreshRole()
      }

      setProcessing(false)
    }

    handleCallback()
  }, [navigate, refreshRole])

  // Wait for both callback processing and auth loading to complete
  useEffect(() => {
    if (processing || loading) return
    
    if (!session) {
      // No session after processing - redirect to login
      navigate('/login', { replace: true })
      return
    }
    
    // Redirect based on role
    navigate(role === 'admin' ? '/admin' : '/app', { replace: true })
  }, [processing, loading, session, role, navigate])

  return <FullPageLoading />
}


