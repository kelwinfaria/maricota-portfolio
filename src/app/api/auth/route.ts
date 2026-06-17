import { NextRequest, NextResponse } from 'next/server'
import { setSession, clearSession } from '@/lib/auth'
import { readJson } from '@/lib/api-validation'

export async function POST(req: NextRequest) {
  const body = await readJson(req)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
  }

  const { password, action } = body as Record<string, unknown>

  if (action === 'check') {
    const { isAuthenticated } = await import('@/lib/auth')
    const ok = await isAuthenticated()
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  }

  if (action === 'logout') {
    await clearSession()
    return NextResponse.json({ ok: true })
  }

  if (typeof password !== 'string' || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  await setSession()
  return NextResponse.json({ ok: true })
}
