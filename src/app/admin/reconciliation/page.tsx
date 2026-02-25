'use client'

import { useEffect, useState } from 'react'
import { ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Item { id: string; name: string; expected: number; actual: number | null; image_url?: string }

export default function ReconciliationPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [counting, setCounting] = useState(false)

  useEffect(() => {
    supabase.from('products').select('id, name, quantity, image_url').eq('status', 'active').order('name')
      .then(({ data }) => {
        setItems((data || []).map((p: any) => ({ id: p.id, name: p.name, expected: p.quantity || 0, actual: null, image_url: p.image_url })))
        setLoading(false)
      })
  }, [])

  const updateActual = (id: string, val: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, actual: val === '' ? null : parseInt(val) } : i))
  }

  const discrepancies = items.filter(i => i.actual !== null && i.actual !== i.expected)

  if (loading) return <div className="space-y-4"><div className="skeleton h-8 w-40" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div></div>

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reconciliation</h1>
          <p className="text-sm text-[var(--text-muted)]">{items.length} products · {discrepancies.length} discrepancies</p>
        </div>
        <button onClick={() => setCounting(!counting)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition ${counting ? 'bg-green-600' : 'bg-[var(--pink)]'}`}>
          <ClipboardCheck size={16} /> {counting ? 'Finish Count' : 'Start Count'}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-12 text-center">
          <ClipboardCheck size={40} className="text-[var(--text-muted)] mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">No products to reconcile</h2>
          <p className="text-sm text-[var(--text-secondary)]">Add products first</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[var(--border)] text-left text-xs text-[var(--text-muted)]">
              <th className="px-4 py-3 font-medium">Product</th><th className="px-4 py-3 font-medium text-center">Expected</th><th className="px-4 py-3 font-medium text-center">Actual</th><th className="px-4 py-3 font-medium text-center">Diff</th><th className="px-4 py-3 font-medium text-center">Status</th>
            </tr></thead>
            <tbody>
              {items.map(i => {
                const diff = i.actual !== null ? i.actual - i.expected : null
                return (
                  <tr key={i.id} className="border-b border-[var(--border)] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white font-medium">{i.name}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-center">{i.expected}</td>
                    <td className="px-4 py-3 text-center">
                      {counting ? (
                        <input type="number" value={i.actual ?? ''} onChange={e => updateActual(i.id, e.target.value)} className="w-16 bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm text-white text-center focus:border-[var(--pink)] focus:outline-none" />
                      ) : (
                        <span className="text-[var(--text-muted)]">{i.actual ?? '—'}</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-center font-medium ${diff === null ? 'text-[var(--text-muted)]' : diff === 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {diff === null ? '—' : diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {diff === null ? <span className="text-[var(--text-muted)]">—</span> : diff === 0 ? <CheckCircle size={16} className="text-green-400 mx-auto" /> : <AlertTriangle size={16} className="text-red-400 mx-auto" />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
