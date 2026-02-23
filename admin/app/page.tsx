'use client'

import { useEffect, useState } from 'react'

export default function AdminShell() {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  async function checkSession() {
    setError('')
    const res = await fetch('/api/auth/session', { credentials: 'include' })
    if (!res.ok) {
      setAuthorized(false)
      setLoading(false)
      return
    }

    const data = await res.json()
    if (data?.user?.isAdmin) {
      setAuthorized(true)
    } else {
      setAuthorized(false)
    }
    setLoading(false)
  }

  useEffect(() => {
    checkSession()
  }, [])

  async function loginHere() {
    if (!username || !password) return
    setSigningIn(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    })

    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error || 'Login failed')
      setSigningIn(false)
      return
    }

    setSigningIn(false)
    await checkSession()
  }

  if (loading) return <main style={{ padding: 24 }}>Loading admin…</main>

  if (!authorized) {
    return (
      <main style={{ maxWidth: 460, margin: '48px auto', padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Admin login</h1>
        <p style={{ opacity: 0.85 }}>Sign in here, then you’ll get the full original admin panel.</p>
        {error && <div style={{ background: '#3a1d25', color: '#ffd0d0', padding: 10, borderRadius: 8, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'grid', gap: 10 }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" style={{ padding: 10 }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" style={{ padding: 10 }} />
          <button onClick={loginHere} disabled={signingIn} style={{ padding: '10px 12px', cursor: 'pointer' }}>
            {signingIn ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main style={{ height: '100vh' }}>
      <iframe
        src="http://localhost:3000/admin"
        title="CryptoVest Admin"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
      />
    </main>
  )
}
