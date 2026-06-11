import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { oldPassword, newPassword } = await req.json()

  if (oldPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 })
  }
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Nova senha: mínimo 6 caracteres.' }, { status: 400 })
  }

  // In production, store in env via Vercel dashboard. Here we just acknowledge.
  // The new password takes effect after updating ADMIN_PASSWORD in Vercel env vars.
  return NextResponse.json({ ok: true, note: 'Atualize ADMIN_PASSWORD nas variáveis de ambiente da Vercel.' })
}
