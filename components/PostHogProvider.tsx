'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { getPostHog } from '@/lib/analytics'

export function PostHogProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const client = getPostHog()
    if (!client) return

    // Capture pageview on navigation
    client.capture('$pageview', {
      $current_url: window.location.href,
    })
  }, [pathname, searchParams])

  return null
}
