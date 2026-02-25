import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://obprrtqyzpaudfeyftyd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icHJydHF5enBhdWRmZXlmdHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTc4ODIsImV4cCI6MjA4NjA5Mzg4Mn0.Lu1n4m9GFNb85o-zxD_q5bmx20SuW0SMIfxSompVZdQ'
)

async function go() {
  // Insert Troy as client
  const { data: client, error: cErr } = await sb.from('clients').insert({
    name: 'Troy - MixzoKickz',
    email: 'Mixzo.kickz@gmail.com',
    phone: '720-720-5015',
    company: 'MixzoKickz',
    status: 'active',
    notes: 'Sneaker store (new + preowned). Denver, CO. Online only. Instagram: @mixzo.Kickz. Domain: MixzoKickz.com. Miami Vice theme (blue + pink). $3,000 + $200/mo.'
  }).select()
  console.log('Client:', client?.[0]?.id || 'ERROR', cErr?.message || '')

  const clientId = client?.[0]?.id
  if (!clientId) { console.log('No client ID, stopping'); return }

  // Invoice - paid
  const { data: inv, error: iErr } = await sb.from('invoices').insert({
    client_id: clientId,
    invoice_number: 'VTX-2026-002',
    amount: 3000,
    status: 'paid',
    due_date: '2026-02-24',
    paid_date: '2026-02-24',
    description: 'MixzoKickz - Custom sneaker e-commerce platform'
  }).select()
  console.log('Invoice:', inv?.[0]?.id || 'ERROR', iErr?.message || '')

  // Project
  const { data: proj, error: pErr } = await sb.from('projects').insert({
    client_id: clientId,
    name: 'MixzoKickz Platform',
    status: 'in_progress',
    description: 'Custom sneaker store - new + preowned. Next.js + Supabase + StockX integration. Miami Vice theme. Shipping only, no pickup.',
    budget: 3000,
    start_date: '2026-02-24'
  }).select()
  console.log('Project:', proj?.[0]?.id || 'ERROR', pErr?.message || '')

  // Payment
  const { data: pay, error: payErr } = await sb.from('payments').insert({
    amount: 3000,
    method: 'paid',
    status: 'completed',
    description: 'MixzoKickz platform build - full payment received',
    date: '2026-02-24'
  }).select()
  console.log('Payment:', pay?.[0]?.id || 'ERROR', payErr?.message || '')

  console.log('Done! Dashboard updated with Troy/MixzoKickz')
}
go()
