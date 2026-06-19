import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'
import { badRequest, readJson, validateProductPayload } from '@/lib/api-validation'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const body = validateProductPayload(await readJson(req))
  if (typeof body === 'string') return badRequest(body)

  // Gera o id no servidor para nao depender do default do banco
  // (a tabela de producao pode estar sem `default gen_random_uuid()`).
  const { data, error } = await supabaseAdmin
    .from('products')
    .insert([{ id: crypto.randomUUID(), ...body }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
