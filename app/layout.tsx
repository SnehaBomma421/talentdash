import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import { Suspense } from 'react'
import { PostHogProvider } from '@/components/PostHogProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'TalentDash — Software Engineer Salaries & Compensation Intelligence',
  description: 'Browse verified salary data for Software Engineers, Product Managers and more across Google, Amazon, Flipkart and 100+ companies in India.',
  openGraph: {
    title: 'TalentDash — Compensation Intelligence Platform',
    description: 'Browse verified salary data for tech roles across top companies in India.',
    type: 'website',
    siteName: 'TalentDash',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TalentDash — Compensation Intelligence',
    description: 'Browse verified salary data for tech roles across top companies in India.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'TalentDash',
              url: 'https://talentdash.com',
              description: 'Compensation intelligence platform for tech professionals in India.',
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-td-bg font-sans antialiased">
        {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
          <Script
            src="https://cdn.posthog.com/static/array.js"
            data-posthog-key={process.env.NEXT_PUBLIC_POSTHOG_KEY}
            data-posthog-host={process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'}
            strategy="afterInteractive"
          />
        )}
        <Suspense fallback={null}>
          <PostHogProvider />
        </Suspense>
        <nav className="bg-td-surface border-b border-td-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-td-black">TalentDash</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/salaries" className="text-sm font-medium text-td-body hover:text-td-black transition-colors">
                  Salaries
                </Link>
                <Link href="/compare" className="text-sm font-medium text-td-body hover:text-td-black transition-colors">
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-td-surface border-t border-td-border mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-td-muted">&copy; {new Date().getFullYear()} TalentDash. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <Link href="/salaries" className="text-xs text-td-muted hover:text-td-body transition-colors">Salaries</Link>
                <Link href="/compare" className="text-xs text-td-muted hover:text-td-body transition-colors">Compare</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
