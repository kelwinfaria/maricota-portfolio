// Helpers de preço compartilhados entre a home e o admin.

// Extrai o valor numérico de preços em texto livre ("R$ 179,90", "299,90", "Cor à escolha").
// Retorna -1 quando não há número (ex.: "Cor à escolha").
export function parsePrice(price?: string): number {
  const n = parseFloat(String(price ?? '').replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}\b)/g, '').replace(',', '.'))
  return Number.isNaN(n) ? -1 : n
}

// Adiciona "R$ " automaticamente quando o preço é numérico e o cliente não digitou.
// Mantém intacto textos sem número ("Cor à escolha") ou que já têm R$.
export function formatPrice(price?: string): string {
  const s = String(price ?? '').trim()
  if (!s || /r\$/i.test(s) || !/\d/.test(s)) return s
  return `R$ ${s}`
}

// Comparadores de ordenação. Preços sem número ("Cor à escolha") vão sempre pro fim.
export function byPriceDesc(a?: string, b?: string): number {
  const pa = parsePrice(a), pb = parsePrice(b)
  if (pa < 0 && pb < 0) return 0
  if (pa < 0) return 1
  if (pb < 0) return -1
  return pb - pa
}
export function byPriceAsc(a?: string, b?: string): number {
  const pa = parsePrice(a), pb = parsePrice(b)
  if (pa < 0 && pb < 0) return 0
  if (pa < 0) return 1
  if (pb < 0) return -1
  return pa - pb
}
