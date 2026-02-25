import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-black gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-text-muted max-w-md mb-8">The page you are looking for does not exist or has been moved.</p>
      <div className="flex gap-3">
        <Link href="/"><Button size="lg"><Home className="w-4 h-4" /> Go Home</Button></Link>
        <Link href="/shop"><Button variant="secondary" size="lg"><ArrowLeft className="w-4 h-4" /> Shop</Button></Link>
      </div>
    </div>
  )
}
