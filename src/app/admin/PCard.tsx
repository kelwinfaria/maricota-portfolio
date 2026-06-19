import type { Product, Category } from './types'
import { formatPrice } from '@/lib/price'

export function PCard({ p, cats, onEdit, onDel }: {
  p: Product; cats: Category[]; onEdit: () => void; onDel: () => void
}) {
  const cat = cats.find(c => c.id === p.category)
  return (
    <div className="pcard" onClick={onEdit}>
      <div className="pcimg">
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)', fontSize: '2rem' }}>🧸</div>}
        <div className="pcbdg">
          <span className="bdg bdg-cat">{cat?.label ?? p.category}</span>
          {p.featured && <span className="bdg bdg-ft">★</span>}
        </div>
        <div className="pcact">
          <button className="pca ed" onClick={e => { e.stopPropagation(); onEdit() }}>✏️</button>
          <button className="pca dl" onClick={e => { e.stopPropagation(); onDel() }}>🗑</button>
        </div>
      </div>
      <div className="pcbody">
        <div className="pcn">{p.name}</div>
        <div className="pcd">{p.det}</div>
        <div className="pcft"><span className="pcp">{formatPrice(p.price)}</span><span className="pcf">{p.fabric}</span></div>
      </div>
    </div>
  )
}
