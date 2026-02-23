import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'CryptoVest Admin',
  description: 'Separate admin panel for CryptoVest',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, Arial, sans-serif', margin: 0, background: '#0b1020', color: '#e9eefb' }}>
        {children}
      </body>
    </html>
  )
}
