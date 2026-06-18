import { useState, useEffect } from 'react'
import type { Slot, Product, Category } from './types'

function slotMove(arr: Slot[], i: number, dir: number): Slot[] {
  const n = [...arr]; const ni = i + dir
  if (ni < 0 || ni >= n.length) return arr
  ;[n[i], n[ni]] = [n[ni], n[i]]; return n
}

function SlotItem({ sl, thumb, name, onMoveUp, onMoveDown, onRemove }: {
  sl: Slot; thumb?: string; name: string
  onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void
}) {
  return (
    <div className="slot">
      <span className="slot-drag">⋮⋮</span>
      <div className="slot-thumb">
        {thumb
          ? <img src={thumb} alt="" />
          : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>🖼</div>}
      </div>
      <div className="slot-info">
        <div className="slot-name">{name}</div>
        <div className="slot-sub">{sl.label}</div>
      </div>
      <div className="slot-acts">
        <button className="slot-btn mv" onClick={onMoveUp}>↑</button>
        <button className="slot-btn mv" onClick={onMoveDown}>↓</button>
        <button className="slot-btn rm" onClick={onRemove}>✕</button>
      </div>
    </div>
  )
}

interface Props {
  colTab: string; setColTab: (t: string) => void
  carousel: Slot[]; especiais: Slot[]; products: Product[]; cats: Category[]
  onSaveCarousel: (s: Slot[]) => void; onSaveEspeciais: (s: Slot[]) => void
  onAddSlot: (m: 'carousel' | 'especial') => void
  newCat: string; setNewCat: (v: string) => void; onAddCat: () => void
  onRemoveCat: (id: string) => void; renamingCat: string | null; renameVal: string
  setRenamingCat: (id: string | null) => void; setRenameVal: (v: string) => void
  onRenameCat: (id: string) => void
}

export function CollectionsSection(p: Props) {
  const TABS: [string, string][] = [['carousel', '🎠 Carrossel da Capa'], ['especiais', '✦ Coleções Especiais'], ['categorias', '🏷️ Categorias']]

  const [draft, setDraft] = useState<Slot[]>(p.carousel)
  const [dirty, setDirty] = useState(false)

  useEffect(() => { setDraft(p.carousel); setDirty(false) }, [p.carousel])

  function updateDraft(next: Slot[]) { setDraft(next); setDirty(true) }

  return (
    <div>
      <div className="tabs">
        {TABS.map(([k, l]) => (
          <button key={k} className={`tab${p.colTab === k ? ' on' : ''}`} onClick={() => p.setColTab(k)}>{l}</button>
        ))}
      </div>
      {p.colTab === 'carousel' && (
        <div>
          <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>Defina quais produtos aparecem no carrossel da capa. Adicione, reordene e clique em <b>Salvar carrossel</b> para publicar.</p>
          <div className="slot-list">
            {draft.map((sl, i) => {
              const prod = p.products.find(x => x.id === sl.ref_id)
              return <SlotItem key={sl.ref_id + i} sl={sl} thumb={prod?.images?.[0]} name={prod?.name ?? sl.ref_id}
                onMoveUp={() => updateDraft(slotMove(draft, i, -1))}
                onMoveDown={() => updateDraft(slotMove(draft, i, 1))}
                onRemove={() => { const n = [...draft]; n.splice(i, 1); updateDraft(n) }} />
            })}
            {draft.length === 0 && <p style={{ fontSize: '.84rem', color: 'var(--ink3)', padding: '12px 0' }}>Nenhum slide ainda. Adicione produtos abaixo.</p>}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center' }}>
            <button className="add-slot" onClick={() => p.onAddSlot('carousel')}>+ Adicionar produto</button>
            <button
              className="btn-sm"
              style={{ background: dirty ? 'var(--brand)' : 'var(--bg2)', color: dirty ? '#fff' : 'var(--ink3)', border: 'none', padding: '10px 20px', borderRadius: 100, fontWeight: 600, fontSize: '.84rem', cursor: dirty ? 'pointer' : 'default', transition: 'all .2s' }}
              onClick={() => { if (dirty) { p.onSaveCarousel(draft); setDirty(false) } }}
            >
              {dirty ? '💾 Salvar carrossel' : '✓ Salvo'}
            </button>
          </div>
        </div>
      )}
      {p.colTab === 'especiais' && (
        <div>
          <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>Escolha quais coleções aparecem na seção &quot;Nossas Coleções&quot; do portfólio.</p>
          <div className="slot-list">
            {p.especiais.map((sl, i) => {
              const cat = p.cats.find(c => c.id === sl.ref_id)
              const prod = p.products.find(x => x.category === sl.ref_id || x.id === sl.ref_id)
              return <SlotItem key={i} sl={sl} thumb={prod?.images?.[0]} name={cat?.label ?? prod?.name ?? sl.ref_id}
                onMoveUp={() => p.onSaveEspeciais(slotMove(p.especiais, i, -1))}
                onMoveDown={() => p.onSaveEspeciais(slotMove(p.especiais, i, 1))}
                onRemove={() => { const n = [...p.especiais]; n.splice(i, 1); p.onSaveEspeciais(n) }} />
            })}
          </div>
          <button className="add-slot" onClick={() => p.onAddSlot('especial')}>+ Adicionar coleção</button>
        </div>
      )}
      {p.colTab === 'categorias' && (
        <div>
          <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>Gerencie as categorias dos produtos. Clique no lápis para renomear qualquer categoria.</p>
          <div className="cat-list">
            {p.cats.map(c => (
              <div key={c.id} className="cat-item">
                <span className="cat-dot" style={{ background: c.color }} />
                {p.renamingCat === c.id ? (
                  <>
                    <input className="cat-rename-input" autoFocus value={p.renameVal} onChange={e => p.setRenameVal(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') p.onRenameCat(c.id); if (e.key === 'Escape') p.setRenamingCat(null) }} />
                    <button className="cat-rename-ok" onClick={() => p.onRenameCat(c.id)}>✓</button>
                    <button className="cat-rename-cancel" onClick={() => p.setRenamingCat(null)}>✕</button>
                  </>
                ) : (
                  <>
                    <span className="cat-name">{c.label}</span>
                    <span className="cat-badge">{p.products.filter(x => x.category === c.id).length} produtos</span>
                    {c.fixed && <span style={{ fontSize: '.66rem', color: 'var(--ink3)', padding: '3px 9px', background: 'var(--bg2)', borderRadius: 100 }}>Padrão</span>}
                    <button className="cat-edit" title="Renomear" onClick={() => { p.setRenamingCat(c.id); p.setRenameVal(c.label) }}>✏️</button>
                    {!c.fixed && <button className="cat-rm" onClick={() => p.onRemoveCat(c.id)}>✕</button>}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="cat-add-row">
            <input type="text" value={p.newCat} onChange={e => p.setNewCat(e.target.value)} placeholder="Nome da nova categoria (ex: Kits Presentes)" onKeyDown={e => e.key === 'Enter' && p.onAddCat()} />
            <button className="btn-sm" onClick={p.onAddCat}>Adicionar</button>
          </div>
        </div>
      )}
    </div>
  )
}
