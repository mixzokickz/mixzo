'use client'

import { useEffect, useState } from 'react'
import { Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SITE_NAME, BUSINESS_EMAIL, BUSINESS_PHONE, BUSINESS_INSTAGRAM, BUSINESS_LOCATION } from '@/lib/constants'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState('')
  const [stockxStatus, setStockxStatus] = useState<'checking' | 'ok' | 'error'>('checking')

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setUser(session.user)
        const res = await fetch('/api/auth/role', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        const data = await res.json()
        setRole(data.role || 'unknown')
      }

      // Check StockX
      try {
        const res = await fetch('/api/stockx/search?q=test')
        setStockxStatus(res.ok ? 'ok' : 'error')
      } catch {
        setStockxStatus('error')
      }
    }
    load()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Store Info */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Store Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Store Name</span><span>{SITE_NAME}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Email</span><span>{BUSINESS_EMAIL}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Phone</span><span>{BUSINESS_PHONE}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Instagram</span><span>{BUSINESS_INSTAGRAM}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Location</span><span>{BUSINESS_LOCATION}</span></div>
          </div>
        </div>

        {/* Account */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Email</span><span>{user?.email || '--'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">Role</span><span className="capitalize">{role || '--'}</span></div>
            <div className="flex justify-between"><span className="text-[var(--text-muted)]">User ID</span><span className="text-xs font-mono">{user?.id?.slice(0, 12) || '--'}...</span></div>
          </div>
        </div>

        {/* Integrations */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Integrations</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">StockX API</p>
              <p className="text-xs text-[var(--text-muted)]">Product lookup and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              {stockxStatus === 'checking' ? (
                <Loader2 size={18} className="animate-spin text-[var(--text-muted)]" />
              ) : stockxStatus === 'ok' ? (
                <div className="flex items-center gap-1 text-green-400 text-sm"><CheckCircle size={16} /> Connected</div>
              ) : (
                <a
                  href="/api/stockx/auth"
                  className="px-3 py-1.5 bg-[#FF2E88] text-white text-xs font-medium rounded-lg hover:opacity-90 transition inline-block"
                >
                  Connect
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login' }}
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-4 text-center text-red-400 hover:border-red-400 transition-colors font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
