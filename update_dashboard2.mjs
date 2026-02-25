import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://obprrtqyzpaudfeyftyd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9icHJydHF5enBhdWRmZXlmdHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MTc4ODIsImV4cCI6MjA4NjA5Mzg4Mn0.Lu1n4m9GFNb85o-zxD_q5bmx20SuW0SMIfxSompVZdQ'
)

async function go() {
  // Get column names for invoices, projects, payments
  for (const t of ['invoices','projects','payments']) {
    const {data} = await sb.from(t).select('*').limit(1)
    console.log(t + ':', JSON.stringify(data?.[0] ? Object.keys(data[0]) : 'empty'))
  }
}
go()
