import type { Product, Category } from './types'

export function SlotModal({ slotMode, products, cats, onPick, onClose }: {
  slotMode: 'carousel' | 'especial'; products: Product[]; cats: Category[]
  onPick: (type: string, ref_id: string, label: string) => void; onClose: () => void
}) {
  return (
    <div className="ov open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 540 }}>
        <div className="mh">
          <h2>{slotMode === 'carousel' ? 'Adicionar ao carrossel' : 'Adicionar coleção'}</h2>
          <button className="mcl" onClick={onClose}>✕</button>
        </div>
        <div className="mb">
          <p style={{ fontSize: '.82rem', color: 'var(--ink3)', marginBottom: 14 }}>
            {slotMode === 'carousel' ? 'Escolha um produto:' : 'Escolha uma categoria ou produto:'}
          </p>
          <div className="pgrid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
            {slotMode === 'especial' && cats.map(c => {
              const img = products.find(p => p.category === c.id)?.images?.[0]
              return (
                <div key={c.id} className="pcard" onClick={() => onPick('category', c.id, 'Coleção 2026')}>
                  <div className="pcimg">
                    {img ? <img src={img} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>📂</div>}
                  </div>
                  <div className="pcbody"><div className="pcn" style={{ fontSize: '.88rem' }}>{c.label}</div><div className="pcd">Categoria</div></div>
                </div>
              )
            })}
            {products.map(p => (
              <div key={p.id} className="pcard" onClick={() => onPick('product', p.id, 'Bichinho feito à mão')}>
                <div className="pcimg">
                  {p.images?.[0] ? <img src={p.images[0]} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>🖼</div>}
                </div>
                <div className="pcbody"><div className="pcn" style={{ fontSize: '.88rem' }}>{p.name}</div><div className="pcd">Produto</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
