import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://afmtwymcqprwaukkpfta.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmbXR3eW1jcXByd2F1a2twZnRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4MDAyMCwiZXhwIjoyMDg3NTU2MDIwfQ.FrwMghC1VrUBTHnu-Mz98V2hwZgqwzWTVRW9PvW_pRg'
)

async function go() {
  // Create admin user
  const { data: user, error: authErr } = await sb.auth.admin.createUser({
    email: 'mixzo.kickz@gmail.com',
    password: 'MMixzo1738$$',
    email_confirm: true
  })
  
  if (authErr) {
    console.log('Auth error:', authErr.message)
    return
  }
  
  console.log('User created:', user.user.id)

  // Create profile with owner role
  const { error: profErr } = await sb.from('profiles').upsert({
    id: user.user.id,
    email: 'mixzo.kickz@gmail.com',
    full_name: 'Troy',
    role: 'owner',
    phone: '720-720-5015'
  })
  
  if (profErr) console.log('Profile error:', profErr.message)
  else console.log('Profile created: owner role')

  // Also create Aidan as manager
  const { data: aidan, error: aErr } = await sb.auth.admin.createUser({
    email: 'usevantix@gmail.com',
    password: 'VantixAdmin2026!',
    email_confirm: true
  })
  
  if (aErr) console.log('Aidan auth:', aErr.message)
  else {
    await sb.from('profiles').upsert({
      id: aidan.user.id,
      email: 'usevantix@gmail.com',
      full_name: 'Aidan',
      role: 'manager'
    })
    console.log('Aidan created: manager role')
  }

  console.log('\nAdmin accounts ready!')
  console.log('Troy: mixzo.kickz@gmail.com / MMixzo1738$$')
  console.log('Aidan: usevantix@gmail.com / VantixAdmin2026!')
}
go()
