'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyHumanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [countdown, setCountdown] = useState(2)

  const returnTo = useMemo(() => {
    const raw = searchParams.get('returnTo') || '/dashboard'
    if (!raw.startsWith('/')) return '/dashboard'
    if (raw.startsWith('/verify-human')) return '/dashboard'
    return raw
  }, [searchParams])

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(t)
          router.replace(returnTo)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(t)
  }, [router, returnTo])

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-2xl font-bold mb-2">Weryfikacja dostępu</h1>
        <p className="text-muted-foreground mb-6">Chwilę, zabezpieczamy witrynę przed zautomatyzowanym ruchem.</p>
        <button
          onClick={() => router.replace(returnTo)}
          className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          Kontynuuj teraz
        </button>
        <p className="text-xs text-muted-foreground mt-3">Automatyczne przejście za {countdown}s</p>
      </div>
    </main>
  )
}
