import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://obprrtqyzpaudfeyftyd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icHJydHF5enBhdWRmZXlmdHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTc4ODIsImV4cCI6MjA4NjA5Mzg4Mn0.Lu1n4m9GFNb85o-zxD_q5bmx20SuW0SMIfxSompVZdQ'
)

async function go() {
  // 1. Insert Troy as client
  const { data: client, error: cErr } = await sb.from('clients').insert({
    company_name: 'MixzoKickz',
    website: 'https://mixzokickz.com',
    industry: 'Sneaker Resale',
    status: 'active',
    notes: 'Client: Troy. Denver, CO. Online sneaker store (new + preowned). Instagram: @mixzo.Kickz. Email: Mixzo.kickz@gmail.com. Phone: 720-720-5015. Miami Vice theme. $3,000 build + $200/mo maintenance.',
    tags: ['sneakers', 'e-commerce', 'denver'],
    client_since: '2026-02-24'
  }).select()
  console.log('Client:', client?.[0]?.id || cErr?.message)

  const clientId = client?.[0]?.id
  if (!clientId) return

  // 2. Invoice - paid
  const { data: inv, error: iErr } = await sb.from('invoices').insert({
    client_id: clientId,
    invoice_number: 'VTX-2026-002',
    status: 'paid',
    issue_date: '2026-02-24',
    due_date: '2026-02-24',
    subtotal: 3000,
    tax_rate: 0,
    tax_amount: 0,
    discount_amount: 0,
    total: 3000,
    amount_paid: 3000,
    currency: 'usd',
    notes: 'MixzoKickz custom sneaker e-commerce platform',
    paid_at: '2026-02-24T21:00:00Z'
  }).select()
  console.log('Invoice:', inv?.[0]?.id || iErr?.message)

  // 3. Project
  const { data: proj, error: pErr } = await sb.from('projects').insert({
    client_id: clientId,
    name: 'MixzoKickz Platform',
    description: 'Custom sneaker store - new + preowned. Next.js + Supabase + StockX. Miami Vice theme (pink + blue). Shipping only. Free shipping over $200. All sales final.',
    status: 'in_progress',
    priority: 'high',
    value: 3000,
    monthly_recurring: 200,
    start_date: '2026-02-24',
    progress: 10,
    tags: ['next.js', 'supabase', 'stockx', 'e-commerce']
  }).select()
  console.log('Project:', proj?.[0]?.id || pErr?.message)

  console.log('\nDashboard updated! Troy/MixzoKickz added as client #2')
  console.log('Revenue: +$3,000 | MRR: +$200/mo')
}
go()
