'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { SITE_NAME } from '@/lib/constants'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'customer',
        })
        toast.success('Account created successfully')
        router.push('/shop')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Signup failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold gradient-text tracking-tight">{SITE_NAME}</h1>
          </Link>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5 font-medium">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-1.5 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--pink)] focus:outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--pink)] hover:underline font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
