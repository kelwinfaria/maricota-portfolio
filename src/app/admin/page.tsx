'use client'
import './admin.css'
import { useAdminData } from './useAdminData'
import { AdminLogin } from './AdminLogin'
import { AdminSidebar } from './AdminSidebar'
import { DashSection } from './DashSection'
import { ProductsSection } from './ProductsSection'
import { CollectionsSection } from './CollectionsSection'
import { AppearanceSection } from './AppearanceSection'
import { SettingsSection } from './SettingsSection'
import { TrashSection } from './TrashSection'
import { ProductModal } from './ProductModal'
import { SlotModal } from './SlotModal'

const PG_TITLES: Record<string, string> = { dash: 'Dashboard', produtos: 'Nossos Produtos', colecoes: 'Coleções', aparencia: 'Aparência', settings: 'Configurações', lixeira: 'Lixeira' }

export default function AdminPage() {
  const d = useAdminData()

  if (d.authChecking) return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'grid', placeItems: 'center' }}>
      <img src="/images/logo-maricota.png" alt="Maricota" style={{ height: 32, opacity: 0.4, mixBlendMode: 'multiply' }} />
    </div>
  )

  if (!d.authed) return <AdminLogin pw={d.pw} setPw={d.setPw} pwErr={d.pwErr} onLogin={d.doLogin} />

  return (
    <div id="app" className="ready">
      <AdminSidebar page={d.page} setPage={d.setPage} products={d.products} trash={d.trash} settings={d.settings} sbRef={d.sbRef} onLogout={d.doLogout} />

      <div className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <button className="mob-btn" onClick={() => d.sbRef.current?.classList.toggle('open')}><span /><span /><span /></button>
            <div className="tb-title">{PG_TITLES[d.page]}</div>
          </div>
          <div className="tb-r">
            {d.page === 'produtos' && <button className="btn-add" onClick={() => d.openModal(null)}>+ Novo produto</button>}
          </div>
        </div>

        <div className="pc">
          {d.page === 'dash' && <DashSection products={d.products} cats={d.cats} onEdit={d.openModal} onDel={d.setCfDel} onNavigate={d.setPage} />}
          {d.page === 'produtos' && <ProductsSection products={d.products} cats={d.cats} activeFilter={d.activeFilter} setActiveFilter={d.setActiveFilter} onEdit={d.openModal} onDel={d.setCfDel} />}
          {d.page === 'colecoes' && <CollectionsSection colTab={d.colTab} setColTab={d.setColTab} carousel={d.carousel} especiais={d.especiais} products={d.products} cats={d.cats} onSaveCarousel={d.saveCarousel} onSaveEspeciais={d.saveEspeciais} onAddSlot={d.setSlotMode} newCat={d.newCat} setNewCat={d.setNewCat} onAddCat={d.addCat} onRemoveCat={d.removeCat} renamingCat={d.renamingCat} renameVal={d.renameVal} setRenamingCat={d.setRenamingCat} setRenameVal={d.setRenameVal} onRenameCat={d.renameCat} />}
          {d.page === 'aparencia' && <AppearanceSection appCfg={d.appCfg} setAppCfg={d.setAppCfg} onSave={d.saveAppearance} />}
          {d.page === 'settings' && <SettingsSection settings={d.settings} setSettings={d.setSettings} sOld={d.sOld} setSOld={d.setSOld} sNew={d.sNew} setSNew={d.setSNew} onSaveWA={d.saveWA} onSaveName={d.saveName} onChangePW={d.changePW} />}
          {d.page === 'lixeira' && <TrashSection trash={d.trash} cats={d.cats} onRestore={d.restoreProduct} onPermDelete={d.setCfPermDel} />}
        </div>
      </div>

      {d.modal.open && <ProductModal modalId={d.modal.id} form={d.form} setForm={d.setForm} imgItems={d.imgItems} setImgItems={d.setImgItems} cats={d.cats} dragImgIdx={d.dragImgIdx} onSave={d.saveProd} onClose={() => d.setModal({ open: false, id: null })} onMoveImg={d.moveImg} onHandleFiles={d.handleFiles} />}
      {d.slotMode && <SlotModal slotMode={d.slotMode} products={d.products} cats={d.cats} onPick={d.pickSlot} onClose={() => d.setSlotMode(null)} />}

      {d.cfDel && (
        <div className="ov open" onClick={e => e.target === e.currentTarget && d.setCfDel(null)}>
          <div className="cbox">
            <div className="ci">🗑️</div><h3>Mover para lixeira?</h3>
            <p>O produto ficará na lixeira e poderá ser restaurado.</p>
            <div className="cbox-btns"><button className="btn-cancel" onClick={() => d.setCfDel(null)}>Cancelar</button><button className="btn-del" onClick={d.delProd}>Mover</button></div>
          </div>
        </div>
      )}

      {d.cfPermDel && (
        <div className="ov open" onClick={e => e.target === e.currentTarget && d.setCfPermDel(null)}>
          <div className="cbox">
            <div className="ci">⚠️</div><h3>Excluir permanentemente?</h3>
            <p>Esta ação não pode ser desfeita. O produto será perdido para sempre.</p>
            <div className="cbox-btns"><button className="btn-cancel" onClick={() => d.setCfPermDel(null)}>Cancelar</button><button className="btn-del" onClick={d.permDelete}>Excluir</button></div>
          </div>
        </div>
      )}

      {d.toast && (
        <div className={`toast show ${d.toast.type}`}><span className="tdot" /><span>{d.toast.msg}</span></div>
      )}
    </div>
  )
}
