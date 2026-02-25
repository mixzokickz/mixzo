'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { SITE_NAME } from '@/lib/constants'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-4xl font-bold gradient-text tracking-tight">{SITE_NAME}</h1>
          </Link>
          <p className="text-[var(--text-secondary)] mt-2 text-sm">Reset your password</p>
        </div>

        {sent ? (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Check your email</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              We sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
            <Link href="/login" className="text-sm text-[var(--pink)] hover:underline font-medium">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 space-y-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Enter your email address and we will send you a link to reset your password.
            </p>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] py-3.5 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Mail size={16} />
                  Send Reset Link
                </>
              )}
            </button>

            <p className="text-center text-sm text-[var(--text-muted)]">
              Remember your password?{' '}
              <Link href="/login" className="text-[var(--pink)] hover:underline font-medium">Sign in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
