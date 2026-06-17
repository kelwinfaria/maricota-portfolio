import { NextResponse } from 'next/server'

type ProductPayload = {
  name: string
  category: string | null
  det: string | null
  price: string | null
  fabric: string | null
  wa: string | null
  featured: boolean
  images: string[]
}

type SlotPayload = {
  type: 'product' | 'category'
  ref_id: string
  label: string | null
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function readJson(req: Request) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

function stringValue(value: unknown, maxLength: number, required = false) {
  if (value == null) return required ? null : ''
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (required && !trimmed) return null
  if (trimmed.length > maxLength) return null
  return trimmed
}

function optionalString(value: unknown, maxLength: number) {
  const result = stringValue(value, maxLength)
  return result === null ? null : result || null
}

function safeUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function validateProductPayload(body: unknown): ProductPayload | string {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Payload invalido.'
  const input = body as Record<string, unknown>

  const name = stringValue(input.name, 120, true)
  if (name === null) return 'Nome do produto invalido.'

  const category = optionalString(input.category, 80)
  const det = optionalString(input.det, 280)
  const price = optionalString(input.price, 80)
  const fabric = optionalString(input.fabric, 120)
  const wa = optionalString(input.wa, 240)

  if (!Array.isArray(input.images)) return 'Imagens invalidas.'
  const images = input.images.filter((item): item is string => typeof item === 'string').map(item => item.trim())
  if (images.length !== input.images.length || images.length > 12 || images.some(item => item.length > 500 || !safeUrl(item))) {
    return 'Imagens invalidas.'
  }

  return {
    name,
    category,
    det,
    price,
    fabric,
    wa,
    featured: input.featured === true,
    images,
  }
}

export function validateCategoryPayload(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Payload invalido.'
  const input = body as Record<string, unknown>

  const label = stringValue(input.label, 80, true)
  if (label === null) return 'Nome da categoria invalido.'

  const id = stringValue(input.id, 80)
  const color = typeof input.color === 'string' && HEX_COLOR.test(input.color) ? input.color : '#8A9A7E'
  const position = typeof input.position === 'number' && Number.isSafeInteger(input.position) ? input.position : 0

  return {
    id: id || `cat_${Date.now()}`,
    label,
    color,
    fixed: input.fixed === true,
    position,
  }
}

export function validateCategoryUpdatePayload(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Payload invalido.'
  const label = stringValue((body as Record<string, unknown>).label, 80, true)
  if (label === null) return 'Nome da categoria invalido.'
  return { label }
}

export function validateSlotsPayload(body: unknown): SlotPayload[] | string {
  if (!Array.isArray(body)) return 'Lista invalida.'
  if (body.length > 12) return 'Limite de itens excedido.'

  return body.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null
    const input = item as Record<string, unknown>
    const type = input.type === 'category' ? 'category' : input.type === 'product' ? 'product' : null
    const refId = stringValue(input.ref_id, 120, true)
    const label = optionalString(input.label, 120)
    if (!type || refId === null) return null
    return { type, ref_id: refId, label }
  }).every(Boolean)
    ? body.map((item) => {
        const input = item as Record<string, unknown>
        return {
          type: input.type as 'product' | 'category',
          ref_id: String(input.ref_id).trim(),
          label: optionalString(input.label, 120),
        }
      })
    : 'Item invalido.'
}

export function validateSettingsPayload(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return 'Payload invalido.'
  const input = body as Record<string, unknown>
  const result: Record<string, unknown> = {}

  if ('wa_number' in input) {
    const wa = stringValue(input.wa_number, 240)
    if (wa === null) return 'WhatsApp invalido.'
    result.wa_number = wa
  }

  if ('admin_name' in input) {
    const adminName = stringValue(input.admin_name, 80, true)
    if (adminName === null) return 'Nome invalido.'
    result.admin_name = adminName
  }

  if ('appearance' in input) {
    const appearance = input.appearance
    if (!appearance || typeof appearance !== 'object' || Array.isArray(appearance)) return 'Aparencia invalida.'

    const source = appearance as Record<string, unknown>
    const keys = ['brand', 'brandL', 'brandP', 'sec', 'pill', 'accent'] as const
    const next: Record<(typeof keys)[number], string> = {
      brand: '',
      brandL: '',
      brandP: '',
      sec: '',
      pill: '',
      accent: '',
    }

    for (const key of keys) {
      if (typeof source[key] !== 'string' || !HEX_COLOR.test(source[key])) return 'Aparencia invalida.'
      next[key] = source[key]
    }

    result.appearance = next
  }

  if (Object.keys(result).length === 0) return 'Nenhuma configuracao valida.'
  return result
}

