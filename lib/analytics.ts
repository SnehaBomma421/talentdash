/**
 * PostHog analytics client for browser-side event tracking.
 * Initializes only when NEXT_PUBLIC_POSTHOG_KEY is set.
 * PostHog handles page navigation events automatically via the PostHogProvider.
 */
import { PostHog } from 'posthog-js'

let posthog: PostHog | null = null

export function getPostHog(): PostHog | null {
  if (typeof window === 'undefined') return null
  if (posthog) return posthog

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

  if (!key) return null

  // Dynamic import to avoid bundling posthog-js on the server
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const posthogLib = require('posthog-js')
  posthog = posthogLib.init(key, {
    api_host: host,
    capture_pageview: false, // handled by PostHogProvider
    loaded: () => {},
  })

  return posthog
}

/**
 * Track a custom event. No-op if PostHog is not initialized.
 */
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  const client = getPostHog()
  if (client) {
    client.capture(name, properties)
  }
}
