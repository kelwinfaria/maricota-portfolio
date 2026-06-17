import type { Category, ImgItem } from './types'

interface Form { name: string; category: string; det: string; price: string; fabric: string; wa: string; featured: boolean }

export function ProductModal({ modalId, form, setForm, imgItems, setImgItems, cats, dragImgIdx, onSave, onClose, onMoveImg, onHandleFiles }: {
  modalId: string | null; form: Form; setForm: (f: Form) => void; imgItems: ImgItem[]; setImgItems: (f: (prev: ImgItem[]) => ImgItem[]) => void
  cats: Category[]; dragImgIdx: React.MutableRefObject<number | null>; onSave: () => void; onClose: () => void
  onMoveImg: (from: number, to: number) => void; onHandleFiles: (files: FileList | null) => void
}) {
  return (
    <div className="ov open" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="mh">
          <h2>{modalId ? 'Editar produto' : 'Novo produto'}</h2>
          <button className="mcl" onClick={onClose}>✕</button>
        </div>
        <div className="mb">
          <div className="fld" style={{ marginBottom: 6 }}>
            <label>Foto(s) do produto</label>
            <div style={{ fontSize: '.68rem', color: 'var(--ink3)', marginBottom: 4 }}>A primeira foto será a capa. Arraste para reordenar.</div>
          </div>
          <div className="uz" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); onHandleFiles(e.dataTransfer.files) }}>
            <input type="file" accept="image/*" multiple onChange={e => onHandleFiles(e.target.files)} />
            <div className="ui">📷</div><div className="ul">Toque para escolher ou arraste</div><div className="us">JPG, PNG · câmera ou galeria</div>
          </div>
          {imgItems.length > 0 && (
            <div className="upvs">
              {imgItems.map((item, i) => (
                <div key={i} className={`upv${i === 0 ? ' upv-cover' : ''}`} draggable
                  onDragStart={() => { dragImgIdx.current = i }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => { if (dragImgIdx.current !== null && dragImgIdx.current !== i) { onMoveImg(dragImgIdx.current, i); dragImgIdx.current = null } }}>
                  <img src={item.src} alt="" />
                  {i === 0 && <span className="upv-capa">Capa</span>}
                  <div className="upv-arrows">
                    {i > 0 && <button className="upv-arr" onClick={() => onMoveImg(i, i - 1)}>‹</button>}
                    {i < imgItems.length - 1 && <button className="upv-arr" onClick={() => onMoveImg(i, i + 1)}>›</button>}
                  </div>
                  <button className="rm" onClick={() => setImgItems(prev => prev.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="fr">
            <div className="fld"><label>Nome do produto *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Girafinha Alfredo" /></div>
            <div className="fld"><label>Categoria *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="fr full"><div className="fld"><label>Descrição curta</label><input type="text" value={form.det} onChange={e => setForm({ ...form, det: e.target.value })} placeholder="Ex: Vestido, laço e jardineira" /></div></div>
          <div className="fr">
            <div className="fld"><label>Preço</label><input type="text" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="R$ 179,00" /></div>
            <div className="fld"><label>Tipo de tecido</label><input type="text" value={form.fabric} onChange={e => setForm({ ...form, fabric: e.target.value })} placeholder="Ex: Algodão e pelúcia" /></div>
          </div>
          <div className="fr full">
            <div className="fld">
              <label>Link WhatsApp (deixe vazio para usar o padrão)</label>
              <input type="text" value={form.wa} onChange={e => setForm({ ...form, wa: e.target.value })} placeholder="https://wa.me/5599999999999" />
              <div className="hint">Se vazio, usa o número configurado em Configurações.</div>
            </div>
          </div>
          <div className="tr">
            <div className="trl"><h4>Produto em destaque</h4><p>Aparece com card maior na coleção</p></div>
            <label className="tog"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /><span className="tog-tr" /></label>
          </div>
        </div>
        <div className="mf">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={onSave}>Salvar produto</button>
        </div>
      </div>
    </div>
  )
}
