import { NextRequest, NextResponse } from 'next/server'
import { setSession, clearSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password, action } = await req.json()

  if (action === 'check') {
    const { isAuthenticated } = await import('@/lib/auth')
    const ok = await isAuthenticated()
    return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  }

  if (action === 'logout') {
    await clearSession()
    return NextResponse.json({ ok: true })
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })
  }

  await setSession()
  return NextResponse.json({ ok: true })
}
