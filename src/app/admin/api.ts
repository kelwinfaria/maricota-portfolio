export async function api(path: string, opts?: RequestInit) {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || r.statusText) }
  return r.json()
}

export const PRESETS = [
  { name: 'Sage & Olive', brand: '#6B7A58', brandL: '#8A9A75', brandP: '#EAF0E3', sec: '#F3F3EC', pill: '#F7F6F1', accent: '#8A9A7E' },
  { name: 'Rose & Blush', brand: '#C08070', brandL: '#D09A8A', brandP: '#F7EAE5', sec: '#F5EFEB', pill: '#FBF7F5', accent: '#C08070' },
  { name: 'Caramelo', brand: '#B08A55', brandL: '#C8A265', brandP: '#F7EEDB', sec: '#F2EBE0', pill: '#FBF7F1', accent: '#B08A55' },
  { name: 'Ink & Sand', brand: '#3A382F', brandL: '#5C5A50', brandP: '#EBEBDE', sec: '#EEEEE5', pill: '#F5F5EE', accent: '#6B7A58' },
  { name: 'Lilás Suave', brand: '#8B7BA8', brandL: '#A490BE', brandP: '#EDE8F5', sec: '#F0EDF7', pill: '#F7F5FB', accent: '#8B7BA8' },
  { name: 'Terracota', brand: '#BD6A45', brandL: '#D08055', brandP: '#F7E8DF', sec: '#F3EAE3', pill: '#FAF4EF', accent: '#BD6A45' },
]
