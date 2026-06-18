import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { badRequest, readJson, validateSettingsPayload } from '@/lib/api-validation'

export async function GET() {
  const { data, error } = await supabaseAdmin.from('settings').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const result: Record<string, unknown> = {}
  for (const row of data ?? []) result[row.key] = row.value
  return NextResponse.json(result)
}

export async function PUT(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const body = validateSettingsPayload(await readJson(req))
  if (typeof body === 'string') return badRequest(body)

  const rows = Object.entries(body).map(([key, value]) => ({ key, value }))

  const { error } = await supabaseAdmin
    .from('settings')
    .upsert(rows, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
