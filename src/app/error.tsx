'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <AlertTriangle className="w-16 h-16 text-pink mb-4" />
      <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
      <p className="text-text-muted max-w-md mb-8">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset} size="lg">Try Again</Button>
    </div>
  )
}
