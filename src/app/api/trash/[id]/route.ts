import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAuthenticated } from '@/lib/auth'

function storagePathFromPublicUrl(raw: string) {
  try {
    const url = new URL(raw)
    const marker = '/storage/v1/object/public/maricota/'
    const index = url.pathname.indexOf(marker)
    if (index === -1) return null
    return decodeURIComponent(url.pathname.slice(index + marker.length))
  } catch {
    return null
  }
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin
    .from('products')
    .update({ deleted_at: null })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const { id } = await params
  const { data: product, error: readError } = await supabaseAdmin
    .from('products')
    .select('images')
    .eq('id', id)
    .single()

  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })

  const { error } = await supabaseAdmin.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const paths = ((product?.images ?? []) as string[])
    .map(storagePathFromPublicUrl)
    .filter((path): path is string => Boolean(path))

  if (paths.length > 0) {
    const { error: storageError } = await supabaseAdmin.storage.from('maricota').remove(paths)
    if (storageError) {
      return NextResponse.json({ ok: true, storageWarning: storageError.message })
    }
  }

  return NextResponse.json({ ok: true })
}
