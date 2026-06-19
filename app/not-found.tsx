import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <h1 className="text-6xl font-bold text-td-black mb-4">404</h1>
      <h2 className="text-xl font-semibold text-td-body mb-2">Page Not Found</h2>
      <p className="text-td-muted text-center mb-8 max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved. Try browsing our salary database instead.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
        <Link href="/salaries">
          <Button variant="outline">Browse Salaries</Button>
        </Link>
      </div>
    </div>
  )
}
