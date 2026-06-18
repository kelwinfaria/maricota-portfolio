interface CarouselSlot { type: string; ref_id: string; label: string }
interface Product { id: string; name: string; images: string[]; featured: boolean }

function CarouselSlide({ prod, label }: { prod: Product; label?: string }) {
  const img = prod.images?.[0] ?? ''
  return (
    <div className="cslide">
      <img src={img} alt={prod.name} />
      <div className="cgrad" />
      <div className="ccap">
        <div className="cn">{prod.name}</div>
        <div className="cd">{label ?? 'Bichinho feito à mão'}</div>
      </div>
    </div>
  )
}

export function HomeHero({ waUrl }: { waUrl: string }) {
  return (
    <header className="hero">
      <div className="wrap">
        <div className="rv">
          <img className="hero-logo" src="/images/logo-maricota.png" alt="Maricota" />
          <h1 className="htag">Maternidade dos sonhos,<span className="it">feita à mão.</span></h1>
          <p className="hlead">Bichinhos, roupinhas e lembranças costuradas uma a uma. Peças únicas para acolher, presentear e eternizar os primeiros dias.</p>
          <div className="hctas">
            <a className="btn btnp" href={waUrl} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" /></svg>
              Encomendar no WhatsApp
            </a>
            <a className="btn btng" href="#colecoes">Ver coleções</a>
          </div>
        </div>
      </div>
    </header>
  )
}
