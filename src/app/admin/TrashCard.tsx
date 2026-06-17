import type { Product, Category } from './types'

export function TrashCard({ p, cats, onRestore, onPermDelete }: {
  p: Product; cats: Category[]; onRestore: () => void; onPermDelete: () => void
}) {
  const cat = cats.find(c => c.id === p.category)
  return (
    <div className="pcard trash-card">
      <div className="pcimg">
        {p.images?.[0]
          ? <img src={p.images[0]} alt={p.name} loading="lazy" />
          : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)', fontSize: '2rem' }}>🧸</div>}
        <div className="pcbdg">
          <span className="bdg bdg-cat">{cat?.label ?? p.category}</span>
        </div>
        <div className="pcact">
          <button className="pca ed" title="Restaurar" onClick={e => { e.stopPropagation(); onRestore() }}>↩️</button>
          <button className="pca dl" title="Excluir permanentemente" onClick={e => { e.stopPropagation(); onPermDelete() }}>🗑</button>
        </div>
      </div>
      <div className="pcbody">
        <div className="pcn">{p.name}</div>
        <div className="pcd">{p.det}</div>
        <div className="pcft">
          <button className="trash-restore-btn" onClick={onRestore}>Restaurar</button>
        </div>
      </div>
    </div>
  )
}
