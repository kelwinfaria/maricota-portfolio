import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { readJson } from '@/lib/api-validation'

export async function POST(req: NextRequest) {
  if (!await isAuthenticated()) return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })

  const body = await readJson(req)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
  }

  const { oldPassword, newPassword } = body as Record<string, unknown>

  if (typeof oldPassword !== 'string' || oldPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 401 })
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    return NextResponse.json({ error: 'Nova senha: minimo 6 caracteres.' }, { status: 400 })
  }

  return NextResponse.json(
    { error: 'Atualize ADMIN_PASSWORD nas variaveis de ambiente da Vercel para alterar a senha.' },
    { status: 501 }
  )
}
