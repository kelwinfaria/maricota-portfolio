interface Product {
  id: string; name: string; category: string; det?: string; price?: string
  featured: boolean; images: string[]; wa?: string
}
import { formatPrice, byPriceDesc } from '@/lib/price'

interface Category { id: string; label: string }

function ProductCard({ p, cats }: { p: Product; cats: Category[] }) {
  const cat = cats.find(c => c.id === p.category)
  const catLabel = cat?.label ?? p.category
  const imgs = p.images ?? []
  return (
    <article
      className={`card${p.featured ? ' feat' : ''}`}
      data-category={p.category}
      data-det={p.det ?? ''}
      data-price={formatPrice(p.price)}
      data-cat-label={catLabel}
      data-images={imgs.join('|')}
      data-wa={p.wa ?? ''}
    >
      <div className="card-med">
        <span className={p.featured ? 'ctag2 hot' : 'ctag2'}>{p.featured ? '★ Destaque' : catLabel}</span>
        <span className="czoom">⤢</span>
        {imgs[0] && <img src={imgs[0]} alt={p.name} loading="lazy" />}
        {imgs.length > 1 && <span className="card-multi">{imgs.map((_, i) => <i key={i} />)}</span>}
      </div>
      <div className="card-bod">
        <h3 className="card-name">{p.name}</h3>
        <p className="card-det">{p.det ?? ''}</p>
        <div className="card-ft">
          <span className="card-price">{formatPrice(p.price)}</span>
          <span className="card-more">{imgs.length > 1 ? `${imgs.length} fotos →` : 'ampliar →'}</span>
        </div>
      </div>
    </article>
  )
}

export function HomeProdutos({ products, categories }: { products: Product[]; categories: Category[] }) {
  // Ordena do maior para o menor preço, independente da categoria.
  const sorted = [...products].sort((a, b) => byPriceDesc(a.price, b.price))
  return (
    <section className="produtos" id="produtos">
      <div className="wrap">
        <div className="sh rv">
          <p className="ey">Portfólio</p>
          <h2>Nossos Produtos</h2>
          <p className="sub">Clique em qualquer peça para ver detalhes e encomendar.</p>
        </div>
        <div className="filters rv" id="filters">
          <button className="filter on" data-filter="todos">Todos</button>
          {categories.map(c => (
            <button key={c.id} className="filter" data-filter={c.id}>{c.label}</button>
          ))}
        </div>
        <div className="grid" id="grid">
          {sorted.map(p => <ProductCard key={p.id} p={p} cats={categories} />)}
        </div>
        <p className="cnote rv">As <b>roupinhas</b> têm troca de cor sob encomenda. Cada <b>porta maternidade</b> é personalizada com o nome e o bichinho do bebê.</p>
      </div>
    </section>
  )
}
