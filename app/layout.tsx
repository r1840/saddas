import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'CryptoVest - Platforma Handlu Kryptowalutami',
  description: 'Handluj i zarządzaj portfelem kryptowalut z danymi rynkowymi w czasie rzeczywistym i zaawansowanymi narzędziami',
  generator: 'cryptovest.app',
  icons: {
    icon: [
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pl">
      <body classNazwa={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
