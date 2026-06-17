interface Product { id: string; name: string; category: string; images: string[] }
interface Category { id: string; label: string }
interface EspecialSlot { type: string; ref_id: string; label: string }

function ColecaoCard({ index, filterKey, label, sublabel, img }: {
  index: number; filterKey: string; label: string; sublabel: string; img: string
}) {
  return (
    <div className={`cc${index === 0 ? ' big' : ''}`} data-filter={filterKey}>
      <div className="cc-img">{img && <img src={img} alt={label} />}</div>
      <div className="cc-body">
        <span className="cc-lbl">{sublabel}</span>
        <h3 className="cc-title">{label}</h3>
        <span className="cc-cta">Ver produtos →</span>
      </div>
    </div>
  )
}

export function HomeColecoes({ products, categories, especiais }: {
  products: Product[]; categories: Category[]; especiais: EspecialSlot[]
}) {
  const cards = especiais.length > 0 ? especiais : categories.map(c => ({ type: 'category', ref_id: c.id, label: c.label }))
  return (
    <section id="colecoes" style={{ padding: 'clamp(70px,9vw,100px) 0' }}>
      <div className="wrap">
        <div className="sh rv">
          <p className="ey">Nosso Ateliê</p>
          <h2>Nossas Coleções</h2>
          <p className="sub">Peças únicas, costuradas com carinho e dedicação.</p>
        </div>
        <div className="cc-grid rv">
          {cards.map((slot, i) => {
            if (slot.type === 'category') {
              const cat = categories.find(c => c.id === slot.ref_id)
              const prod = products.find(p => p.category === slot.ref_id)
              return <ColecaoCard key={i} index={i} filterKey={slot.ref_id} label={cat?.label ?? slot.ref_id} sublabel={(slot as EspecialSlot).label ?? 'Coleção 2026'} img={prod?.images?.[0] ?? ''} />
            }
            const prod = products.find(p => p.id === slot.ref_id)
            if (!prod) return null
            return <ColecaoCard key={i} index={i} filterKey={prod.category} label={prod.name} sublabel={(slot as EspecialSlot).label ?? 'Destaque'} img={prod.images?.[0] ?? ''} />
          })}
        </div>
      </div>
    </section>
  )
}
