import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const { data, error } = await supabase
    .from('especiais_slots')
    .select('*')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const slots: { type: string; ref_id: string; label: string }[] = await req.json()

  await supabaseAdmin.from('especiais_slots').delete().neq('id', 0)

  const rows = slots.map((s, i) => ({ position: i, type: s.type, ref_id: s.ref_id, label: s.label }))
  const { error } = await supabaseAdmin.from('especiais_slots').insert(rows)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
