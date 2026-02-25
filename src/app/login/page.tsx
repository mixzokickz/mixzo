'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LogIn, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { SITE_NAME } from '@/lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user returned after sign in')
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (['owner', 'manager', 'staff'].includes(profile?.role)) {
        router.push('/admin')
      } else {
        router.push('/shop')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg relative flex items-center justify-center px-4">
      {/* Subtle mesh background */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-pink/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[600px] h-[600px] bg-cyan/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-black tracking-tight text-text">{SITE_NAME}</h1>
          </Link>
          <p className="text-text-secondary mt-2 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border border-border rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-pink focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm text-text-secondary font-medium">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-pink hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm text-white placeholder:text-text-muted focus:border-pink focus:outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (!email || !password) return
              handleLogin({ preventDefault: () => {} } as React.FormEvent)
            }}
            className="w-full bg-pink hover:bg-pink/90 py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all duration-200 active:scale-[0.98] text-sm cursor-pointer shadow-lg shadow-pink/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </button>

          <p className="text-center text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-pink hover:underline font-medium">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
