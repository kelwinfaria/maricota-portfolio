import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { badRequest, readJson, validateSlotsPayload } from '@/lib/api-validation'

export async function GET() {
  const { data, error } = await supabase
    .from('carousel_slots')
    .select('*')
    .order('position')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const slots = validateSlotsPayload(await readJson(req))
  if (typeof slots === 'string') return badRequest(slots)

  const { error: rpcError } = await supabaseAdmin.rpc('replace_carousel_slots', { slots })
  if (!rpcError) return NextResponse.json({ ok: true })

  const { error: deleteError } = await supabaseAdmin.from('carousel_slots').delete().neq('id', 0)
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })

  const rows = slots.map((s, i) => ({ position: i, type: s.type, ref_id: s.ref_id, label: s.label }))
  const { error } = rows.length
    ? await supabaseAdmin.from('carousel_slots').insert(rows)
    : { error: null }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
