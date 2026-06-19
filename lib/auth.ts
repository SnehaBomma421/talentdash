/**
 * Auth.js (NextAuth v5) configuration for TalentDash.
 *
 * Currently uses a placeholder GitHub provider.
 * In production: switch to real OAuth apps and add database adapter.
 *
 * Auth is intentionally light-touch — only used for:
 * - Contributor login to submit salary records
 * - Admin panel to moderate/verify records
 * - Review and interview experience submissions
 */
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth: session }) {
      // Open access for MVP — restrict to specific emails later
      return !!session?.user
    },
  },
})
