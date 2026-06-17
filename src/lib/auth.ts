import { cookies } from 'next/headers'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE = 'mc_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('AUTH_SECRET, SUPABASE_SERVICE_ROLE_KEY or ADMIN_PASSWORD must be configured')
  return secret
}

function sign(payload: string) {
  return createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
}

function verifySession(value?: string) {
  if (!value) return false

  const [version, expiresAt, nonce, signature] = value.split('.')
  if (version !== 'v1' || !expiresAt || !nonce || !signature) return false

  const expires = Number(expiresAt)
  if (!Number.isSafeInteger(expires) || expires <= Date.now()) return false

  const expected = sign(`${version}.${expiresAt}.${nonce}`)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
}

function createSessionValue() {
  const version = 'v1'
  const expiresAt = String(Date.now() + SESSION_TTL_SECONDS * 1000)
  const nonce = randomBytes(18).toString('base64url')
  const payload = `${version}.${expiresAt}.${nonce}`
  return `${payload}.${sign(payload)}`
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies()
  return verifySession(store.get(SESSION_COOKIE)?.value)
}

export async function setSession() {
  const store = await cookies()
  store.set(SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  })
}

export async function clearSession() {
  const store = await cookies()
  store.delete(SESSION_COOKIE)
}
