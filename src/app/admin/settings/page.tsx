'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, Unplug } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SITE_NAME, BUSINESS_EMAIL, BUSINESS_PHONE, BUSINESS_INSTAGRAM, BUSINESS_LOCATION } from '@/lib/constants'
import { toast } from 'sonner'

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null)
  const [role, setRole] = useState('')
  const [stockxConnected, setStockxConnected] = useState<boolean | null>(null)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    const stockxParam = searchParams.get('stockx')
    if (stockxParam === 'connected') {
      toast.success('StockX connected successfully!')
    } else if (stockxParam === 'error') {
      const reason = searchParams.get('reason') || 'unknown'
      toast.error(`StockX connection failed: ${reason}`)
    }
  }, [searchParams])

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

      // Check StockX connection via settings table
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'stockx_tokens')
        .single()

      setStockxConnected(!!data?.value)
    }
    load()
  }, [])

  const disconnectStockX = async () => {
    setDisconnecting(true)
    try {
      await supabase.from('settings').delete().eq('key', 'stockx_tokens')
      setStockxConnected(false)
      toast.success('StockX disconnected')
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const infoRows = [
    { label: 'Store Name', value: SITE_NAME },
    { label: 'Email', value: BUSINESS_EMAIL },
    { label: 'Phone', value: BUSINESS_PHONE },
    { label: 'Instagram', value: BUSINESS_INSTAGRAM },
    { label: 'Location', value: BUSINESS_LOCATION },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your store and integrations</p>
      </div>

      {/* Store Info */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Store Information</h2>
        <div className="space-y-3 text-sm">
          {infoRows.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-[var(--text-muted)]">{label}</span>
              <span className="text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Email</span>
            <span className="text-white">{user?.email || '--'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Role</span>
            <span className="text-white capitalize">{role || '--'}</span>
          </div>
        </div>
      </div>

      {/* StockX Integration */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4">StockX Integration</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-white">StockX API</p>
            <p className="text-xs text-[var(--text-muted)]">Product lookup and pricing data</p>
          </div>
          {stockxConnected === null ? (
            <Loader2 size={18} className="animate-spin text-[var(--text-muted)]" />
          ) : stockxConnected ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-green-400 text-sm">
                <CheckCircle size={16} />
                Connected
              </div>
              <button
                onClick={disconnectStockX}
                disabled={disconnecting}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded-lg px-3 py-1.5 hover:border-red-400/50 transition-colors"
              >
                {disconnecting ? <Loader2 size={14} className="animate-spin" /> : <Unplug size={14} />}
                Disconnect
              </button>
            </div>
          ) : (
            <a
              href="/api/stockx/auth"
              className="bg-gradient-to-r from-[var(--pink)] to-[var(--cyan)] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Connect StockX
            </a>
          )}
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
  )
}
