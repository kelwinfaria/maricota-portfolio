import { PCard } from './PCard'
import type { Product, Category } from './types'
import { byPriceAsc } from '@/lib/price'

export function ProductsSection({ products, cats, activeFilter, setActiveFilter, onEdit, onDel }: {
  products: Product[]; cats: Category[]; activeFilter: string
  setActiveFilter: (f: string) => void; onEdit: (id: string) => void; onDel: (id: string) => void
}) {
  const filtered = (activeFilter === 'todos' ? products : products.filter(p => p.category === activeFilter))
    .slice().sort((a, b) => byPriceAsc(a.price, b.price)) // menor -> maior preço
  const filters = [
    { id: 'todos', label: 'Todos', count: products.length },
    ...cats.map(c => ({ id: c.id, label: c.label, count: products.filter(p => p.category === c.id).length })),
  ]
  return (
    <div>
      <div className="fbr">
        {filters.map(c => (
          <button key={c.id} className={`pill ${c.id === activeFilter ? 'pg-solid' : 'pg-ghost'}`} onClick={() => setActiveFilter(c.id)}>
            {c.label}<span className="nc">{c.count}</span>
          </button>
        ))}
      </div>
      <div className="pgrid">
        {filtered.map(p => <PCard key={p.id} p={p} cats={cats} onEdit={() => onEdit(p.id)} onDel={() => onDel(p.id)} />)}
      </div>
      {!filtered.length && (
        <div className="empty">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="14" width="48" height="38" rx="6"/>
            <path d="M22 14v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/>
            <line x1="32" y1="28" x2="32" y2="42"/>
            <line x1="25" y1="35" x2="39" y2="35"/>
          </svg>
          <h3>Nenhum produto aqui</h3>
          <p>Clique em &quot;Novo produto&quot; para adicionar.</p>
        </div>
      )}
    </div>
  )
}
