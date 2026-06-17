const WaIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" />
  </svg>
)

export function HomeNav({ waUrl }: { waUrl: string }) {
  return (
    <>
      <nav id="nav">
        <a href="#top"><img className="nav-logo" src="/images/logo-maricota.png" alt="Maricota" /></a>
        <div className="nav-links">
          <a href="#sobre">Sobre</a>
          <a href="#colecoes">Coleções</a>
          <a href="#produtos">Produtos</a>
          <a href="#encomendar">Encomendar</a>
        </div>
        <div className="n-r">
          <a className="wa-p" href={waUrl} target="_blank" rel="noopener">
            <WaIcon /> Encomendar
          </a>
          <button className="burger" id="burger"><span /><span /><span /></button>
        </div>
      </nav>
      <div className="mmenu" id="mmenu">
        <a href="#sobre">Sobre</a>
        <a href="#colecoes">Coleções</a>
        <a href="#produtos">Produtos</a>
        <a href="#encomendar">Encomendar</a>
      </div>
      <span id="top" />
    </>
  )
}
