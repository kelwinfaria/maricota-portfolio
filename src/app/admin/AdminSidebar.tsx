import type { Product, Settings } from './types'

export function AdminSidebar({ page, setPage, products, trash, settings, sbRef, onLogout }: {
  page: string; setPage: (p: string) => void; products: Product[]; trash: Product[]
  settings: Settings; sbRef: React.RefObject<HTMLElement | null>; onLogout: () => void
}) {
  const nav = (pg: string) => { setPage(pg); sbRef.current?.classList.remove('open') }
  return (
    <>
      <nav className="sb" ref={sbRef} id="sb">
        <div className="sb-head">
          <img className="sb-logo" src="/images/logo-maricota.png" alt="Maricota" />
          <div className="sb-role">Painel Administrativo</div>
        </div>
        <div className="sb-nav">
          <div className="sb-grp">Principal</div>
          {(['dash', 'produtos', 'colecoes'] as const).map(pg => (
            <button key={pg} className={`sbl${page === pg ? ' on' : ''}`} onClick={() => nav(pg)}>
              <span className="ico">{pg === 'dash' ? '📊' : pg === 'produtos' ? '🧸' : '✦'}</span>
              <span className="lbl">{pg === 'dash' ? 'Dashboard' : pg === 'produtos' ? 'Produtos' : 'Coleções'}</span>
              {pg === 'produtos' && <span className="bdg">{products.length}</span>}
            </button>
          ))}
          <div className="sb-grp">Personalizar</div>
          <button className={`sbl${page === 'aparencia' ? ' on' : ''}`} onClick={() => nav('aparencia')}>
            <span className="ico">🎨</span><span className="lbl">Aparência</span>
          </button>
          <div className="sb-grp">Sistema</div>
          <button className={`sbl${page === 'settings' ? ' on' : ''}`} onClick={() => nav('settings')}>
            <span className="ico">⚙️</span><span className="lbl">Configurações</span>
          </button>
          <button className={`sbl${page === 'lixeira' ? ' on' : ''}`} onClick={() => nav('lixeira')}>
            <span className="ico">🗑️</span>
            <span className="lbl">Lixeira</span>
            {trash.length > 0 && <span className="bdg">{trash.length}</span>}
          </button>
          <a className="sbl" href="/" target="_blank"><span className="ico">🔗</span><span className="lbl">Ver portfólio</span></a>
        </div>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-av">{(settings.admin_name || 'A')[0].toUpperCase()}</div>
            <div>
              <div className="sb-un">{settings.admin_name || 'Aladiane'}</div>
              <div className="sb-ue">admin</div>
            </div>
          </div>
          <button className="sb-out" onClick={onLogout}>⬅ Sair</button>
        </div>
      </nav>
      <div className="sb-ovl" id="sbOvl" onClick={() => sbRef.current?.classList.remove('open')} />
    </>
  )
}
