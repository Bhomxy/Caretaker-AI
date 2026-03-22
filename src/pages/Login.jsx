import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import {
  APP_NAME,
  FORM_INPUT_CLASS,
  FORM_LABEL_CLASS,
} from '../lib/constants'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-page">
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!isSupabaseConfigured()) {
      setError(
        'Supabase is not configured. Copy .env.example to .env and add your project URL and anon key.'
      )
      return
    }
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error: signErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (signErr) {
          setError(signErr.message)
          return
        }
        navigate('/', { replace: true })
        return
      }

      const { error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (signUpErr) {
        setError(signUpErr.message)
        return
      }
      navigate('/', { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-4 py-10">
      <Card className="w-full max-w-[400px] rounded-2xl" bodyClassName="p-8">
        <div className="mb-5 flex justify-center rounded-xl bg-sidebar px-4 py-5 ring-1 ring-white/10">
          <Logo className="max-h-[60px] w-auto max-w-[min(100%,280px)] object-contain object-center" />
        </div>
        <h1 className="sr-only">{APP_NAME}</h1>
        <p className="text-base font-extrabold text-ink">Welcome back</p>
        <p className="mt-1 text-sm text-ink-secondary">
          Sign in to your property manager dashboard.
        </p>

        <div className="mt-6 flex rounded-lg border border-border p-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`flex-1 rounded-md font-bold ${
              mode === 'signin'
                ? 'bg-teal-pale text-teal-dk hover:bg-teal-pale'
                : 'text-ink-muted hover:text-ink-secondary'
            }`}
            onClick={() => {
              setMode('signin')
              setError('')
            }}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={`flex-1 rounded-md font-bold ${
              mode === 'signup'
                ? 'bg-teal-pale text-teal-dk hover:bg-teal-pale'
                : 'text-ink-muted hover:text-ink-secondary'
            }`}
            onClick={() => {
              setMode('signup')
              setError('')
            }}
          >
            Create account
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className={FORM_LABEL_CLASS}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              className={FORM_INPUT_CLASS}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className={FORM_LABEL_CLASS}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete={
                mode === 'signin' ? 'current-password' : 'new-password'
              }
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              className={FORM_INPUT_CLASS}
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="text-xs font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primary"
            disabled={busy}
            className="w-full"
          >
            {busy
              ? 'Please wait…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-[11px] text-ink-muted">
          Enable Email provider in Supabase Authentication settings. Confirm
          email may be required for new sign-ups.
        </p>
        <p className="mt-2 text-center text-[11px]">
          <Link
            to="/"
            className="font-semibold text-teal-d hover:text-teal-dk"
          >
            Back to app
          </Link>
        </p>
      </Card>
    </div>
  )
}
