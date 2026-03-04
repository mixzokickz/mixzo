'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0C0C0C] px-6 text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h1 className="text-3xl font-black text-white mb-3">Something went wrong</h1>
      <p className="text-[#6A6A80] mb-8 max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-4">
        <button onClick={reset} className="bg-[#FF2E88] hover:bg-[#FF2E88]/90 text-white font-semibold px-6 py-3 rounded-xl transition-colors cursor-pointer">
          Try Again
        </button>
        <a href="/" className="bg-[#1A1A22] hover:bg-[#1E1E26] text-white font-semibold px-6 py-3 rounded-xl border border-[#1E1E26] transition-colors">
          Go Home
        </a>
      </div>
    </div>
  )
}
