import { PCard } from './PCard'
import type { Product, Category } from './types'

export function DashSection({ products, cats, onEdit, onDel, onNavigate }: {
  products: Product[]; cats: Category[]; onEdit: (id: string) => void
  onDel: (id: string) => void; onNavigate: (p: string) => void
}) {
  const feat = products.filter(p => p.featured).slice(0, 4)
  return (
    <div>
      <div className="stats">
        <div className="stat s1"><div className="stat-n">{products.length}</div><div className="stat-l">Produtos cadastrados</div></div>
        <div className="stat s2"><div className="stat-n">{products.filter(p => p.category === 'bichinhos').length}</div><div className="stat-l">Bichinhos</div></div>
        <div className="stat s3"><div className="stat-n">{products.filter(p => p.category === 'roupinhas').length}</div><div className="stat-l">Roupinhas</div></div>
        <div className="stat s4"><div className="stat-n">{products.filter(p => p.category === 'porta').length}</div><div className="stat-l">Porta Maternidade</div></div>
      </div>
      <div className="sec-tt">
        Produtos em destaque{' '}
        <a href="#" onClick={e => { e.preventDefault(); onNavigate('produtos') }}>Ver todos →</a>
      </div>
      <div className="pgrid">
        {feat.length
          ? feat.map(p => <PCard key={p.id} p={p} cats={cats} onEdit={() => onEdit(p.id)} onDel={() => onDel(p.id)} />)
          : <p style={{ color: 'var(--ink3)', fontStyle: 'italic', fontSize: '.85rem' }}>Nenhum destaque ainda.</p>}
      </div>
    </div>
  )
}
