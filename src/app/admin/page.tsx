'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

/* ─── types ─── */
interface Product { id: string; name: string; category: string; det: string; price: string; fabric: string; wa: string; featured: boolean; images: string[]; created_at?: string }
interface Category { id: string; label: string; color: string; fixed: boolean }
interface Slot { type: string; ref_id: string; label: string }
interface AppCfg { brand: string; brandL: string; brandP: string; sec: string; pill: string; accent: string }

const PRESETS = [
  { name: 'Sage & Olive', brand: '#6B7A58', brandL: '#8A9A75', brandP: '#EAF0E3', sec: '#F3F3EC', pill: '#F7F6F1', accent: '#8A9A7E' },
  { name: 'Rose & Blush', brand: '#C08070', brandL: '#D09A8A', brandP: '#F7EAE5', sec: '#F5EFEB', pill: '#FBF7F5', accent: '#C08070' },
  { name: 'Caramelo', brand: '#B08A55', brandL: '#C8A265', brandP: '#F7EEDB', sec: '#F2EBE0', pill: '#FBF7F1', accent: '#B08A55' },
  { name: 'Ink & Sand', brand: '#3A382F', brandL: '#5C5A50', brandP: '#EBEBDE', sec: '#EEEEE5', pill: '#F5F5EE', accent: '#6B7A58' },
  { name: 'Lilás Suave', brand: '#8B7BA8', brandL: '#A490BE', brandP: '#EDE8F5', sec: '#F0EDF7', pill: '#F7F5FB', accent: '#8B7BA8' },
  { name: 'Terracota', brand: '#BD6A45', brandL: '#D08055', brandP: '#F7E8DF', sec: '#F3EAE3', pill: '#FAF4EF', accent: '#BD6A45' },
]

async function api(path: string, opts?: RequestInit) {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts })
  if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || r.statusText) }
  return r.json()
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [page, setPage] = useState('dash')
  const [products, setProducts] = useState<Product[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [carousel, setCarousel] = useState<Slot[]>([])
  const [especiais, setEspeciais] = useState<Slot[]>([])
  const [appCfg, setAppCfg] = useState<AppCfg>({ brand: '#6B7A58', brandL: '#8A9A75', brandP: '#EAF0E3', sec: '#F3F3EC', pill: '#F7F6F1', accent: '#8A9A7E' })
  const [settings, setSettings] = useState({ wa_number: '', admin_name: 'Aladiane' })
  const [activeFilter, setActiveFilter] = useState('todos')
  const [colTab, setColTab] = useState('carousel')
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const [modal, setModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [form, setForm] = useState({ name: '', category: '', det: '', price: '', fabric: '', wa: '', featured: false })
  const [imgs, setImgs] = useState<string[]>([])
  const [imgFiles, setImgFiles] = useState<File[]>([])
  const [cfDel, setCfDel] = useState<string | null>(null)
  const [slotMode, setSlotMode] = useState<'carousel' | 'especial' | null>(null)
  const [newCat, setNewCat] = useState('')
  const [sOld, setSOld] = useState(''); const [sNew, setSNew] = useState('')
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sbRef = useRef<HTMLElement>(null)

  const showToast = useCallback((msg: string, type = 'ok') => {
    setToast({ msg, type })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const load = useCallback(async () => {
    const [p, c, cr, es, st] = await Promise.all([
      api('/api/products'), api('/api/categories'),
      api('/api/carousel'), api('/api/especiais'), api('/api/settings'),
    ])
    setProducts(p); setCats(c); setCarousel(cr); setEspeciais(es)
    setSettings({ wa_number: st.wa_number ?? '', admin_name: st.admin_name ?? 'Aladiane' })
    if (st.appearance) setAppCfg(st.appearance)
  }, [])

  const doLogin = async () => {
    try {
      await api('/api/auth', { method: 'POST', body: JSON.stringify({ password: pw }) })
      setAuthed(true); load()
    } catch { setPwErr(true); setTimeout(() => setPwErr(false), 3000) }
  }

  const doLogout = async () => {
    await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) })
    setAuthed(false); setPw('')
  }

  /* product save */
  const saveProd = async () => {
    if (!form.name.trim()) { showToast('Insira o nome do produto.', 'err'); return }
    try {
      let uploadedUrls = imgs.filter(u => u.startsWith('http'))
      const toUpload = imgFiles
      for (const file of toUpload) {
        const fd = new FormData(); fd.append('file', file)
        const r = await fetch('/api/upload', { method: 'POST', body: fd })
        const j = await r.json()
        if (j.url) uploadedUrls.push(j.url)
      }
      const body = { ...form, images: uploadedUrls }
      if (modal.id) {
        await api(`/api/products/${modal.id}`, { method: 'PUT', body: JSON.stringify(body) })
      } else {
        await api('/api/products', { method: 'POST', body: JSON.stringify(body) })
      }
      await load(); setModal({ open: false, id: null }); showToast(modal.id ? 'Produto atualizado!' : 'Produto adicionado!')
    } catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const delProd = async () => {
    if (!cfDel) return
    try {
      await api(`/api/products/${cfDel}`, { method: 'DELETE' })
      await load(); setCfDel(null); showToast('Produto excluído.')
    } catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const openModal = (id: string | null) => {
    if (id) {
      const p = products.find(x => x.id === id)!
      setForm({ name: p.name, category: p.category, det: p.det ?? '', price: p.price ?? '', fabric: p.fabric ?? '', wa: p.wa ?? '', featured: !!p.featured })
      setImgs(p.images ?? []); setImgFiles([])
    } else {
      setForm({ name: '', category: cats[0]?.id ?? '', det: '', price: '', fabric: '', wa: '', featured: false })
      setImgs([]); setImgFiles([])
    }
    setModal({ open: true, id })
  }

  /* carousel / especiais */
  const saveCarousel = async (next: Slot[]) => {
    setCarousel(next)
    await api('/api/carousel', { method: 'PUT', body: JSON.stringify(next) })
    showToast('Carrossel salvo!')
  }
  const saveEspeciais = async (next: Slot[]) => {
    setEspeciais(next)
    await api('/api/especiais', { method: 'PUT', body: JSON.stringify(next) })
    showToast('Coleções salvas!')
  }
  const moveSlot = (arr: Slot[], i: number, dir: number, save: (a: Slot[]) => void) => {
    const n = [...arr]; const ni = i + dir
    if (ni < 0 || ni >= n.length) return
    ;[n[i], n[ni]] = [n[ni], n[i]]; save(n)
  }
  const removeSlot = (arr: Slot[], i: number, save: (a: Slot[]) => void) => {
    const n = [...arr]; n.splice(i, 1); save(n)
  }
  const pickSlot = (type: string, ref_id: string, label: string) => {
    const entry = { type, ref_id, label }
    if (slotMode === 'carousel') saveCarousel([...carousel, entry])
    else saveEspeciais([...especiais, entry])
    setSlotMode(null)
  }

  /* categories */
  const addCat = async () => {
    if (!newCat.trim()) return
    const colors = ['#C08070', '#B08A55', '#8B7BA8', '#5B8A8A', '#A08060']
    try {
      await api('/api/categories', { method: 'POST', body: JSON.stringify({ id: 'cat_' + Date.now(), label: newCat.trim(), color: colors[cats.length % colors.length], fixed: false, position: cats.length }) })
      await load(); setNewCat(''); showToast(`Categoria "${newCat}" adicionada!`)
    } catch (e: unknown) { showToast((e as Error).message, 'err') }
  }
  const removeCat = async (id: string) => {
    if (products.some(p => p.category === id)) { showToast('Mova os produtos antes de excluir.', 'err'); return }
    await api(`/api/categories/${id}`, { method: 'DELETE' }); await load(); showToast('Categoria removida.')
  }

  /* appearance */
  const saveAppearance = async () => {
    await api('/api/settings', { method: 'PUT', body: JSON.stringify({ appearance: appCfg }) })
    showToast('Aparência salva!')
  }

  /* settings */
  const saveWA = async () => { await api('/api/settings', { method: 'PUT', body: JSON.stringify({ wa_number: settings.wa_number }) }); showToast('WhatsApp atualizado!') }
  const saveName = async () => { await api('/api/settings', { method: 'PUT', body: JSON.stringify({ admin_name: settings.admin_name }) }); showToast('Nome atualizado!') }
  const changePW = async () => {
    if (!sOld || !sNew) return
    try {
      await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword: sOld, newPassword: sNew }) })
      setSOld(''); setSNew(''); showToast('Senha alterada!')
    } catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  /* img preview */
  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(f => {
      const r = new FileReader(); r.onload = e => setImgs(prev => [...prev, e.target!.result as string])
      setImgFiles(prev => [...prev, f]); r.readAsDataURL(f)
    })
  }

  const filtered = activeFilter === 'todos' ? products : products.filter(p => p.category === activeFilter)
  const feat = products.filter(p => p.featured).slice(0, 4)

  const pgTitles: Record<string, string> = { dash: 'Dashboard', produtos: 'Nossos Produtos', colecoes: 'Coleções', aparencia: 'Aparência', settings: 'Configurações' }

  useEffect(() => {
    fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'check' }), headers: { 'Content-Type': 'application/json' } })
      .then(r => { if (r.ok) { setAuthed(true); load() } }).catch(() => {})
  }, [load])

  if (!authed) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: adminCSS }} />
      <div id="login">
        <div className="lcard">
          <img src="/images/logo-maricota.png" alt="Maricota" />
          <h1>Painel de Administração</h1>
          <p className="sub">Bem-vinda, Aladiane</p>
          <div className="field">
            <label>Senha</label>
            <input type="password" className={pwErr ? 'err' : ''} value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && doLogin()} placeholder="••••••••" autoFocus />
            {pwErr && <div className="err-msg show">Senha incorreta. Tente novamente.</div>}
          </div>
          <button className="lbtn" onClick={doLogin}>Entrar</button>
          <p className="lnote">Porta segura · Maricota 2026</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: adminCSS }} />

      <div id="app" className="ready">
        {/* SIDEBAR */}
        <nav className="sb" ref={sbRef as React.RefObject<HTMLElement>} id="sb">
          <div className="sb-head">
            <img className="sb-logo" src="/images/logo-maricota.png" alt="Maricota" />
            <div className="sb-role">Painel Administrativo</div>
          </div>
          <div className="sb-nav">
            <div className="sb-grp">Principal</div>
            {(['dash', 'produtos', 'colecoes'] as const).map(pg => (
              <button key={pg} className={`sbl${page === pg ? ' on' : ''}`} onClick={() => { setPage(pg); sbRef.current?.classList.remove('open') }}>
                <span className="ico">{pg === 'dash' ? '📊' : pg === 'produtos' ? '🧸' : '✦'}</span>
                <span className="lbl">{pg === 'dash' ? 'Dashboard' : pg === 'produtos' ? 'Produtos' : 'Coleções'}</span>
                {pg === 'produtos' && <span className="bdg">{products.length}</span>}
              </button>
            ))}
            <div className="sb-grp">Personalizar</div>
            <button className={`sbl${page === 'aparencia' ? ' on' : ''}`} onClick={() => { setPage('aparencia'); sbRef.current?.classList.remove('open') }}><span className="ico">🎨</span><span className="lbl">Aparência</span></button>
            <div className="sb-grp">Sistema</div>
            <button className={`sbl${page === 'settings' ? ' on' : ''}`} onClick={() => { setPage('settings'); sbRef.current?.classList.remove('open') }}><span className="ico">⚙️</span><span className="lbl">Configurações</span></button>
            <a className="sbl" href="/" target="_blank"><span className="ico">🔗</span><span className="lbl">Ver portfólio</span></a>
          </div>
          <div className="sb-foot">
            <div className="sb-user">
              <div className="sb-av">{(settings.admin_name || 'A')[0].toUpperCase()}</div>
              <div><div className="sb-un">{settings.admin_name || 'Aladiane'}</div><div className="sb-ue">admin</div></div>
            </div>
            <button className="sb-out" onClick={doLogout}>⬅ Sair</button>
          </div>
        </nav>
        <div className="sb-ovl" id="sbOvl" onClick={() => sbRef.current?.classList.remove('open')}></div>

        <div className="main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <button className="mob-btn" onClick={() => sbRef.current?.classList.toggle('open')}><span></span><span></span><span></span></button>
              <div className="tb-title">{pgTitles[page]}</div>
            </div>
            <div className="tb-r">
              {page === 'produtos' && <button className="btn-add" onClick={() => openModal(null)}>+ Novo produto</button>}
            </div>
          </div>

          <div className="pc">
            {/* DASHBOARD */}
            {page === 'dash' && (
              <div>
                <div className="stats">
                  <div className="stat s1"><div className="stat-n">{products.length}</div><div className="stat-l">Produtos cadastrados</div></div>
                  <div className="stat s2"><div className="stat-n">{products.filter(p => p.category === 'bichinhos').length}</div><div className="stat-l">Bichinhos</div></div>
                  <div className="stat s3"><div className="stat-n">{products.filter(p => p.category === 'roupinhas').length}</div><div className="stat-l">Roupinhas</div></div>
                  <div className="stat s4"><div className="stat-n">{products.filter(p => p.category === 'porta').length}</div><div className="stat-l">Porta Maternidade</div></div>
                </div>
                <div className="sec-tt">Produtos em destaque <a href="#" onClick={e => { e.preventDefault(); setPage('produtos') }}>Ver todos →</a></div>
                <div className="pgrid">
                  {feat.length ? feat.map(p => <PCard key={p.id} p={p} cats={cats} onEdit={() => openModal(p.id)} onDel={() => setCfDel(p.id)} />) : <p style={{ color: 'var(--ink3)', fontStyle: 'italic', fontSize: '.85rem' }}>Nenhum destaque ainda.</p>}
                </div>
              </div>
            )}

            {/* PRODUTOS */}
            {page === 'produtos' && (
              <div>
                <div className="fbr">
                  {[{ id: 'todos', label: 'Todos', count: products.length }, ...cats.map(c => ({ id: c.id, label: c.label, count: products.filter(p => p.category === c.id).length }))].map(c => (
                    <button key={c.id} className={`pill ${c.id === activeFilter ? 'pg-solid' : 'pg-ghost'}`} onClick={() => setActiveFilter(c.id)}>{c.label}<span className="nc">{c.count}</span></button>
                  ))}
                </div>
                <div className="pgrid">
                  {filtered.map(p => <PCard key={p.id} p={p} cats={cats} onEdit={() => openModal(p.id)} onDel={() => setCfDel(p.id)} />)}
                </div>
                {!filtered.length && (
                  <div className="empty">
                    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="8" y="14" width="48" height="38" rx="6"/><path d="M22 14v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/><line x1="32" y1="28" x2="32" y2="42"/><line x1="25" y1="35" x2="39" y2="35"/></svg>
                    <h3>Nenhum produto aqui</h3><p>Clique em "Novo produto" para adicionar.</p>
                  </div>
                )}
              </div>
            )}

            {/* COLEÇÕES */}
            {page === 'colecoes' && (
              <div>
                <div className="tabs">
                  {[['carousel', '🎠 Carrossel da Capa'], ['especiais', '✦ Coleções Especiais'], ['categorias', '🏷️ Categorias']].map(([k, l]) => (
                    <button key={k} className={`tab${colTab === k ? ' on' : ''}`} onClick={() => setColTab(k)}>{l}</button>
                  ))}
                </div>
                {colTab === 'carousel' && (
                  <div>
                    <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>Defina quais itens aparecem no carrossel da primeira tela do portfólio.</p>
                    <div className="slot-list">
                      {carousel.map((sl, i) => {
                        const p = products.find(x => x.id === sl.ref_id)
                        return (
                          <div key={i} className="slot">
                            <span className="slot-drag">⋮⋮</span>
                            <div className="slot-thumb">{p?.images?.[0] ? <img src={p.images[0]} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>🖼</div>}</div>
                            <div className="slot-info"><div className="slot-name">{p?.name ?? sl.ref_id}</div><div className="slot-sub">{sl.label}</div></div>
                            <div className="slot-acts">
                              <button className="slot-btn mv" onClick={() => moveSlot(carousel, i, -1, saveCarousel)}>↑</button>
                              <button className="slot-btn mv" onClick={() => moveSlot(carousel, i, 1, saveCarousel)}>↓</button>
                              <button className="slot-btn rm" onClick={() => removeSlot(carousel, i, saveCarousel)}>✕</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button className="add-slot" onClick={() => setSlotMode('carousel')}>+ Adicionar slide ao carrossel</button>
                  </div>
                )}
                {colTab === 'especiais' && (
                  <div>
                    <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>Escolha quais coleções aparecem na seção "Nossas Coleções" do portfólio.</p>
                    <div className="slot-list">
                      {especiais.map((sl, i) => {
                        const cat = cats.find(c => c.id === sl.ref_id)
                        const p = products.find(x => x.category === sl.ref_id || x.id === sl.ref_id)
                        return (
                          <div key={i} className="slot">
                            <span className="slot-drag">⋮⋮</span>
                            <div className="slot-thumb">{p?.images?.[0] ? <img src={p.images[0]} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>📂</div>}</div>
                            <div className="slot-info"><div className="slot-name">{cat?.label ?? p?.name ?? sl.ref_id}</div><div className="slot-sub">{sl.label}</div></div>
                            <div className="slot-acts">
                              <button className="slot-btn mv" onClick={() => moveSlot(especiais, i, -1, saveEspeciais)}>↑</button>
                              <button className="slot-btn mv" onClick={() => moveSlot(especiais, i, 1, saveEspeciais)}>↓</button>
                              <button className="slot-btn rm" onClick={() => removeSlot(especiais, i, saveEspeciais)}>✕</button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <button className="add-slot" onClick={() => setSlotMode('especial')}>+ Adicionar coleção</button>
                  </div>
                )}
                {colTab === 'categorias' && (
                  <div>
                    <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 18, maxWidth: 560 }}>Gerencie as categorias dos produtos.</p>
                    <div className="cat-list">
                      {cats.map(c => (
                        <div key={c.id} className={`cat-item${c.fixed ? ' cat-fixed' : ''}`}>
                          <span className="cat-dot" style={{ background: c.color }}></span>
                          <span className="cat-name">{c.label}</span>
                          <span className="cat-badge">{products.filter(p => p.category === c.id).length} produtos</span>
                          {c.fixed ? <span style={{ fontSize: '.66rem', color: 'var(--ink3)', padding: '3px 9px', background: 'var(--bg2)', borderRadius: 100 }}>Padrão</span> : <button className="cat-rm" onClick={() => removeCat(c.id)}>✕</button>}
                        </div>
                      ))}
                    </div>
                    <div className="cat-add-row">
                      <input type="text" value={newCat} onChange={e => setNewCat(e.target.value)} placeholder="Nome da nova categoria (ex: Kits Presentes)" onKeyDown={e => e.key === 'Enter' && addCat()} />
                      <button className="btn-sm" onClick={addCat}>Adicionar</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* APARÊNCIA */}
            {page === 'aparencia' && (
              <div>
                <p style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 20, maxWidth: 640 }}>Personalize as cores do portfólio.</p>
                <div className="ap-grid">
                  <div className="ap-card" style={{ gridColumn: 'span 2' }}>
                    <h3>Paletas prontas</h3>
                    <p className="desc">Escolha um tema completo ou ajuste individualmente.</p>
                    <div className="presets">
                      {PRESETS.map((p, i) => <div key={i} className="preset" style={{ background: p.brand }} title={p.name} onClick={() => setAppCfg(p)} />)}
                    </div>
                  </div>
                  <div className="ap-card">
                    <h3>Cor principal</h3>
                    <p className="desc">Botões de ação, badges de destaque, CTA de WhatsApp.</p>
                    {(['brand', 'brandL', 'brandP'] as const).map((k, idx) => (
                      <div key={k} className="color-row"><label>{['Cor primária', 'Tom claro (hover)', 'Fundo pastel'][idx]}</label><input type="color" className="color-pick" value={appCfg[k]} onChange={e => setAppCfg(prev => ({ ...prev, [k]: e.target.value }))} /></div>
                    ))}
                  </div>
                  <div className="ap-card">
                    <h3>Seções e detalhes</h3>
                    <p className="desc">Fundo das seções alternadas e acento nos títulos.</p>
                    {(['sec', 'pill', 'accent'] as const).map((k, idx) => (
                      <div key={k} className="color-row"><label>{['Fundo das seções', 'Fundo das pílulas', 'Acento (itálico)'][idx]}</label><input type="color" className="color-pick" value={appCfg[k]} onChange={e => setAppCfg(prev => ({ ...prev, [k]: e.target.value }))} /></div>
                    ))}
                  </div>
                </div>
                <div className="ap-actions">
                  <button className="ap-save" onClick={saveAppearance}>Salvar aparência</button>
                  <button className="ap-reset" onClick={() => setAppCfg(PRESETS[0])}>Restaurar padrões</button>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {page === 'settings' && (
              <div className="set-grid">
                <div className="sc">
                  <h3>WhatsApp de contato</h3>
                  <p className="desc">Número que aparece em todos os botões de encomenda.</p>
                  <div className="field"><label>Número (com DDI + DDD)</label><input type="text" value={settings.wa_number} onChange={e => setSettings(s => ({ ...s, wa_number: e.target.value }))} placeholder="5599999999999" /></div>
                  <button className="ssave" onClick={saveWA}>Salvar número</button>
                </div>
                <div className="sc">
                  <h3>Dados do ateliê</h3>
                  <p className="desc">Nome exibido no painel.</p>
                  <div className="field"><label>Seu nome</label><input type="text" value={settings.admin_name} onChange={e => setSettings(s => ({ ...s, admin_name: e.target.value }))} placeholder="Aladiane" /></div>
                  <button className="ssave" onClick={saveName}>Salvar</button>
                </div>
                <div className="sc">
                  <h3>Alterar senha</h3>
                  <p className="desc">Mantenha o painel protegido.</p>
                  <div className="field"><label>Senha atual</label><input type="password" value={sOld} onChange={e => setSOld(e.target.value)} placeholder="Senha atual" /></div>
                  <div className="field"><label>Nova senha</label><input type="password" value={sNew} onChange={e => setSNew(e.target.value)} placeholder="Nova senha (mín. 6 caracteres)" /></div>
                  <button className="ssave" onClick={changePW}>Alterar senha</button>
                </div>
                <div className="sc">
                  <h3>Portfólio público</h3>
                  <p className="desc">Link que seus clientes acessam.</p>
                  <a className="lp" href="/" target="_blank">🔗 Abrir portfólio</a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT MODAL */}
      {modal.open && (
        <div className="ov open" onClick={e => e.target === e.currentTarget && setModal({ open: false, id: null })}>
          <div className="modal">
            <div className="mh"><h2>{modal.id ? 'Editar produto' : 'Novo produto'}</h2><button className="mcl" onClick={() => setModal({ open: false, id: null })}>✕</button></div>
            <div className="mb">
              <div className="fld" style={{ marginBottom: 6 }}><label>Foto(s) do produto</label></div>
              <div className="uz" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}>
                <input type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} />
                <div className="ui">📷</div><div className="ul">Toque para escolher ou arraste</div><div className="us">JPG, PNG · câmera ou galeria</div>
              </div>
              {imgs.length > 0 && (
                <div className="upvs">
                  {imgs.map((src, i) => (
                    <div key={i} className="upv">
                      <img src={src} alt="" />
                      <button className="rm" onClick={() => { setImgs(p => p.filter((_, j) => j !== i)); setImgFiles(p => p.filter((_, j) => j !== i)) }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="fr">
                <div className="fld"><label>Nome do produto *</label><input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Girafinha Alfredo" /></div>
                <div className="fld"><label>Categoria *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="fr full"><div className="fld"><label>Descrição curta</label><input type="text" value={form.det} onChange={e => setForm(f => ({ ...f, det: e.target.value }))} placeholder="Ex: Vestido, laço e jardineira" /></div></div>
              <div className="fr">
                <div className="fld"><label>Preço</label><input type="text" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="R$ 179,00" /></div>
                <div className="fld"><label>Tipo de tecido</label><input type="text" value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} placeholder="Ex: Algodão e pelúcia" /></div>
              </div>
              <div className="fr full">
                <div className="fld">
                  <label>Link WhatsApp (deixe vazio para usar o padrão)</label>
                  <input type="text" value={form.wa} onChange={e => setForm(f => ({ ...f, wa: e.target.value }))} placeholder="https://wa.me/5599999999999" />
                  <div className="hint">Se vazio, usa o número configurado em Configurações.</div>
                </div>
              </div>
              <div className="tr">
                <div className="trl"><h4>Produto em destaque</h4><p>Aparece com card maior na coleção</p></div>
                <label className="tog"><input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}/><span className="tog-tr"></span></label>
              </div>
            </div>
            <div className="mf"><button className="btn-cancel" onClick={() => setModal({ open: false, id: null })}>Cancelar</button><button className="btn-save" onClick={saveProd}>Salvar produto</button></div>
          </div>
        </div>
      )}

      {/* SLOT PICKER */}
      {slotMode && (
        <div className="ov open" onClick={e => e.target === e.currentTarget && setSlotMode(null)}>
          <div className="modal" style={{ maxWidth: 540 }}>
            <div className="mh"><h2>{slotMode === 'carousel' ? 'Adicionar ao carrossel' : 'Adicionar coleção'}</h2><button className="mcl" onClick={() => setSlotMode(null)}>✕</button></div>
            <div className="mb">
              <p style={{ fontSize: '.82rem', color: 'var(--ink3)', marginBottom: 14 }}>{slotMode === 'carousel' ? 'Escolha um produto:' : 'Escolha uma categoria ou produto:'}</p>
              <div className="pgrid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
                {slotMode === 'especial' && cats.map(c => (
                  <div key={c.id} className="pcard" onClick={() => pickSlot('category', c.id, 'Coleção 2026')}>
                    <div className="pcimg">{products.find(p => p.category === c.id)?.images?.[0] ? <img src={products.find(p => p.category === c.id)!.images[0]} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>📂</div>}</div>
                    <div className="pcbody"><div className="pcn" style={{ fontSize: '.88rem' }}>{c.label}</div><div className="pcd">Categoria</div></div>
                  </div>
                ))}
                {products.map(p => (
                  <div key={p.id} className="pcard" onClick={() => pickSlot('product', p.id, 'Bichinho feito à mão')}>
                    <div className="pcimg">{p.images?.[0] ? <img src={p.images[0]} alt="" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)' }}>🖼</div>}</div>
                    <div className="pcbody"><div className="pcn" style={{ fontSize: '.88rem' }}>{p.name}</div><div className="pcd">Produto</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {cfDel && (
        <div className="ov open" onClick={e => e.target === e.currentTarget && setCfDel(null)}>
          <div className="cbox">
            <div className="ci">🗑️</div>
            <h3>Excluir produto?</h3>
            <p>Esta ação não pode ser desfeita.</p>
            <div className="cbox-btns"><button className="btn-cancel" onClick={() => setCfDel(null)}>Cancelar</button><button className="btn-del" onClick={delProd}>Excluir</button></div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className={`toast show ${toast.type}`}><span className="tdot"></span><span>{toast.msg}</span></div>
      )}
    </>
  )
}

function PCard({ p, cats, onEdit, onDel }: { p: Product; cats: Category[]; onEdit: () => void; onDel: () => void }) {
  const cat = cats.find(c => c.id === p.category)
  return (
    <div className="pcard" onClick={onEdit}>
      <div className="pcimg">
        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" /> : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--ink3)', fontSize: '2rem' }}>🧸</div>}
        <div className="pcbdg">
          <span className="bdg bdg-cat">{cat?.label ?? p.category}</span>
          {p.featured && <span className="bdg bdg-ft">★</span>}
        </div>
        <div className="pcact">
          <button className="pca ed" onClick={e => { e.stopPropagation(); onEdit() }}>✏️</button>
          <button className="pca dl" onClick={e => { e.stopPropagation(); onDel() }}>🗑</button>
        </div>
      </div>
      <div className="pcbody">
        <div className="pcn">{p.name}</div>
        <div className="pcd">{p.det}</div>
        <div className="pcft"><span className="pcp">{p.price}</span><span className="pcf">{p.fabric}</span></div>
      </div>
    </div>
  )
}

const adminCSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --ink:#3A382F;--ink2:#5C5A50;--ink3:#A39D92;
  --bg:#F7F6F1;--bg2:#EFEDE6;--bg3:#E6E3DA;--white:#FFF;
  --olive:#6B7A58;--olivel:#8A9A75;--olivep:#EAF0E3;
  --sage:#8A9A7E;--sagep:#EEF2E9;
  --red:#C0685A;--redp:#FAE8E5;
  --gold:#B89A5E;--goldp:#F5EDD7;
  --line:rgba(58,56,47,.11);--lines:rgba(58,56,47,.055);
  --sh:0 4px 20px -8px rgba(58,56,47,.22);
  --shs:0 2px 10px -4px rgba(58,56,47,.16);
  --r:14px;--ez:cubic-bezier(.22,1,.36,1);--sb:264px;
  --brand:#6B7A58;--brand-l:#8A9A75;--brand-p:#EAF0E3;
  --accent:#8A9A7E;--accent-p:#EEF2E9;
  --pill-bg:#F7F6F1;--sec-bg:#EFEDE6;
}
html{height:100%;-webkit-text-size-adjust:100%}
body{min-height:100%;font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;line-height:1.58}
img{display:block;max-width:100%}
button,input,select,textarea{font-family:inherit;font-size:inherit}
::selection{background:var(--brand);color:#fff}
#login{position:fixed;inset:0;z-index:900;background:var(--bg);display:flex;align-items:center;justify-content:center;padding:20px}
.lcard{background:var(--white);border-radius:24px;padding:48px 40px;width:100%;max-width:400px;box-shadow:0 24px 64px -24px rgba(58,56,47,.28);text-align:center}
.lcard img{height:42px;mix-blend-mode:multiply;margin:0 auto 26px}
.lcard h1{font-family:'Cormorant Garamond',serif;font-size:1.6rem;margin-bottom:5px;font-weight:600}
.lcard .sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;color:var(--ink3);margin-bottom:30px}
.lcard .field{margin-bottom:13px;text-align:left}
.lcard label{display:block;font-size:.74rem;font-weight:600;letter-spacing:.04em;color:var(--ink2);margin-bottom:6px}
.lcard input{width:100%;padding:12px 15px;border:1.5px solid var(--line);border-radius:11px;background:var(--bg);color:var(--ink);font-size:.94rem;outline:none;transition:border-color .25s,box-shadow .25s}
.lcard input:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 18%,transparent)}
.lcard input.err{border-color:var(--red)}
.lcard .err-msg{font-size:.76rem;color:var(--red);margin-top:4px;display:none}
.lcard .err-msg.show{display:block}
.lcard .lbtn{width:100%;padding:13px;background:var(--brand);color:#fff;border:none;border-radius:11px;font-size:.9rem;font-weight:600;cursor:pointer;transition:background .25s;margin-top:5px;min-height:48px}
.lcard .lbtn:hover{background:var(--brand-l)}
.lcard .lnote{font-size:.7rem;color:var(--ink3);margin-top:18px}
#app{display:none;min-height:100vh}
#app.ready{display:flex}
.sb{width:var(--sb);flex:none;background:var(--ink);min-height:100vh;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.sb-head{padding:24px 20px 18px;border-bottom:1px solid rgba(255,255,255,.08)}
.sb-logo{height:26px;filter:brightness(0) invert(1);opacity:.86}
.sb-role{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.36);margin-top:5px}
.sb-nav{flex:1;padding:14px 10px}
.sb-grp{font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.28);padding:0 10px;margin:16px 0 5px}
.sbl{display:flex;align-items:center;gap:11px;padding:10px 11px;border-radius:9px;color:rgba(255,255,255,.58);font-size:.84rem;font-weight:500;cursor:pointer;transition:all .22s;margin-bottom:1px;border:none;background:none;width:100%;text-align:left;text-decoration:none}
.sbl:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.88)}
.sbl.on{background:var(--brand);color:#fff}
.sbl .ico{width:34px;height:34px;border-radius:8px;display:grid;place-items:center;font-size:.95rem;flex:none;background:rgba(255,255,255,.07)}
.sbl.on .ico{background:rgba(255,255,255,.18)}
.sbl .lbl{flex:1}
.sbl .bdg{font-size:.64rem;background:rgba(255,255,255,.14);padding:2px 8px;border-radius:100px;font-weight:600}
.sbl.on .bdg{background:rgba(255,255,255,.24)}
.sb-foot{padding:12px 10px;border-top:1px solid rgba(255,255,255,.07)}
.sb-user{display:flex;align-items:center;gap:9px;padding:9px 11px}
.sb-av{width:32px;height:32px;border-radius:50%;background:var(--brand);display:grid;place-items:center;color:#fff;font-size:.8rem;font-weight:700;flex:none}
.sb-un{font-size:.8rem;color:rgba(255,255,255,.78);font-weight:500;line-height:1.2}
.sb-ue{font-size:.64rem;color:rgba(255,255,255,.34)}
.sb-out{margin-top:3px;padding:9px 11px;border-radius:9px;color:rgba(255,255,255,.4);font-size:.78rem;cursor:pointer;transition:all .22s;display:flex;align-items:center;gap:8px;border:none;background:none;width:100%}
.sb-out:hover{background:rgba(255,255,255,.06);color:rgba(255,255,255,.7)}
.sb-ovl{display:none;position:fixed;inset:0;z-index:490;background:rgba(34,31,22,.42)}
.main{flex:1;display:flex;flex-direction:column;min-height:100vh;overflow:hidden}
.topbar{background:var(--white);border-bottom:1px solid var(--line);padding:13px clamp(16px,3vw,30px);display:flex;align-items:center;justify-content:space-between;gap:12px;position:sticky;top:0;z-index:200}
.tb-title{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;display:flex;align-items:center;gap:12px}
.tb-r{display:flex;gap:9px;align-items:center}
.btn-add{display:inline-flex;align-items:center;gap:7px;background:var(--brand);color:#fff;border:none;padding:10px 18px;border-radius:100px;font-size:.8rem;font-weight:600;cursor:pointer;transition:background .22s,transform .2s;min-height:38px;white-space:nowrap}
.btn-add:hover{background:var(--brand-l);transform:translateY(-1px)}
.mob-btn{display:none;width:38px;height:38px;border:1px solid var(--line);border-radius:10px;background:var(--bg);cursor:pointer;align-items:center;justify-content:center;flex-direction:column;gap:4px}
.mob-btn span{width:16px;height:1.8px;background:var(--ink);border-radius:2px;display:block}
.pc{flex:1;padding:clamp(16px,3vw,30px);overflow-y:auto}
.tabs{display:flex;gap:4px;background:var(--bg2);border-radius:12px;padding:4px;width:fit-content;margin-bottom:22px;flex-wrap:wrap}
.tab{padding:9px 18px;border-radius:9px;font-size:.8rem;font-weight:500;cursor:pointer;transition:all .22s;border:none;background:transparent;color:var(--ink2);min-height:38px;white-space:nowrap}
.tab.on{background:var(--white);color:var(--ink);box-shadow:var(--shs)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:26px}
.stat{background:var(--white);border:1px solid var(--line);border-radius:var(--r);padding:18px 20px;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;width:4px;height:100%}
.stat.s1::before{background:var(--brand)}.stat.s2::before{background:var(--sage)}.stat.s3::before{background:var(--gold)}.stat.s4::before{background:var(--red)}
.stat-n{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:600;line-height:1}
.stat-l{font-size:.72rem;color:var(--ink3);margin-top:4px;font-weight:500}
.sec-tt{font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:600;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between}
.sec-tt a{font-family:'DM Sans',sans-serif;font-size:.74rem;color:var(--brand);font-weight:600;text-decoration:none}
.fbr{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.pill{padding:8px 15px;border-radius:100px;font-size:.78rem;font-weight:500;cursor:pointer;border:none;min-height:36px;transition:all .22s;white-space:nowrap}
.pg-ghost{background:var(--white);color:var(--ink2);box-shadow:0 0 0 1px var(--line)}
.pg-ghost:hover{box-shadow:0 0 0 1px var(--brand)}
.pg-solid{background:var(--ink);color:#fff}
.nc{opacity:.4;font-size:.7rem;margin-left:5px}
.pgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(188px,1fr));gap:13px}
.pcard{background:var(--white);border:1px solid var(--line);border-radius:var(--r);overflow:hidden;transition:box-shadow .28s var(--ez),transform .28s var(--ez);position:relative;cursor:pointer}
.pcard:hover{box-shadow:var(--sh);transform:translateY(-3px)}
.pcimg{aspect-ratio:1;background:var(--bg2);overflow:hidden;position:relative}
.pcimg img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--ez)}
.pcard:hover .pcimg img{transform:scale(1.04)}
.pcbdg{position:absolute;top:8px;left:8px;display:flex;gap:4px;flex-wrap:wrap}
.bdg{font-size:.55rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;padding:4px 9px;border-radius:100px}
.bdg-cat{background:rgba(255,255,255,.92);color:var(--ink)}
.bdg-ft{background:var(--brand);color:#fff}
.pcact{position:absolute;top:8px;right:8px;display:flex;gap:4px;opacity:0;transition:opacity .22s}
.pcard:hover .pcact{opacity:1}
.pca{width:28px;height:28px;border-radius:7px;border:none;cursor:pointer;display:grid;place-items:center;font-size:.8rem;transition:background .2s}
.pca.ed{background:rgba(255,255,255,.92)}.pca.ed:hover{background:#fff}
.pca.dl{background:rgba(192,104,90,.1);color:var(--red)}.pca.dl:hover{background:var(--redp)}
.pcbody{padding:11px 13px 13px}
.pcn{font-family:'Cormorant Garamond',serif;font-size:1.05rem;font-weight:600;line-height:1.2;margin-bottom:2px}
.pcd{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.85rem;color:var(--ink3);margin-bottom:6px}
.pcft{display:flex;align-items:center;justify-content:space-between}
.pcp{font-size:.8rem;font-weight:700;color:var(--brand)}
.pcf{font-size:.66rem;color:var(--ink3)}
.empty{text-align:center;padding:52px 20px;color:var(--ink3)}
.empty svg{width:56px;margin:0 auto 13px;opacity:.28}
.empty h3{font-family:'Cormorant Garamond',serif;font-size:1.2rem;color:var(--ink2);margin-bottom:5px}
.empty p{font-size:.85rem}
.slot-list{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.slot{display:flex;align-items:center;gap:13px;background:var(--white);border:1px solid var(--line);border-radius:var(--r);padding:12px 14px;transition:box-shadow .22s}
.slot-drag{cursor:grab;color:var(--ink3);font-size:1.1rem;flex:none;padding:2px 4px}
.slot-thumb{width:52px;height:52px;border-radius:9px;overflow:hidden;background:var(--bg2);flex:none}
.slot-thumb img{width:100%;height:100%;object-fit:cover}
.slot-info{flex:1;min-width:0}
.slot-name{font-weight:600;font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.slot-sub{font-size:.72rem;color:var(--ink3);margin-top:2px}
.slot-acts{display:flex;gap:6px;flex:none}
.slot-btn{width:30px;height:30px;border-radius:8px;border:none;cursor:pointer;display:grid;place-items:center;font-size:.82rem;transition:background .2s}
.slot-btn.rm{background:var(--redp);color:var(--red)}.slot-btn.rm:hover{background:rgba(192,104,90,.25)}
.slot-btn.mv{background:var(--bg2);color:var(--ink2)}.slot-btn.mv:hover{background:var(--bg3)}
.add-slot{display:flex;align-items:center;gap:9px;padding:12px 16px;border-radius:var(--r);border:2px dashed var(--bg3);background:transparent;cursor:pointer;color:var(--ink3);font-size:.84rem;font-weight:500;transition:all .22s;width:100%}
.add-slot:hover{border-color:var(--brand);color:var(--brand);background:var(--brand-p)}
.cat-list{display:flex;flex-direction:column;gap:9px;margin-bottom:18px}
.cat-item{display:flex;align-items:center;gap:12px;background:var(--white);border:1px solid var(--line);border-radius:12px;padding:12px 15px}
.cat-dot{width:12px;height:12px;border-radius:50%;flex:none}
.cat-name{flex:1;font-weight:500;font-size:.88rem}
.cat-badge{font-size:.64rem;background:var(--bg2);color:var(--ink3);padding:3px 9px;border-radius:100px}
.cat-rm{width:28px;height:28px;border-radius:7px;border:none;cursor:pointer;display:grid;place-items:center;font-size:.8rem;background:var(--redp);color:var(--red);transition:background .2s;flex:none}
.cat-rm:hover{background:rgba(192,104,90,.24)}
.cat-fixed{opacity:.55;pointer-events:none}
.cat-add-row{display:flex;gap:9px;margin-top:6px}
.cat-add-row input{flex:1;padding:10px 13px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font-size:.88rem;outline:none;transition:border-color .22s}
.cat-add-row input:focus{border-color:var(--brand)}
.cat-add-row .btn-sm{padding:10px 16px;background:var(--brand);color:#fff;border:none;border-radius:10px;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .22s;white-space:nowrap;min-height:40px}
.cat-add-row .btn-sm:hover{background:var(--brand-l)}
.ap-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:800px}
.ap-card{background:var(--white);border:1px solid var(--line);border-radius:var(--r);padding:22px}
.ap-card h3{font-family:'Cormorant Garamond',serif;font-size:1.15rem;margin-bottom:5px}
.ap-card .desc{font-size:.78rem;color:var(--ink3);margin-bottom:16px}
.presets{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:16px}
.preset{width:38px;height:38px;border-radius:10px;cursor:pointer;border:3px solid transparent;transition:all .22s;flex:none}
.preset:hover{transform:scale(1.08)}
.color-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px}
.color-row label{font-size:.76rem;font-weight:500;color:var(--ink2)}
.color-pick{width:38px;height:38px;border-radius:9px;overflow:hidden;border:1.5px solid var(--line);cursor:pointer;padding:0;background:none}
.color-pick::-webkit-color-swatch-wrapper{padding:0}
.color-pick::-webkit-color-swatch{border:none;border-radius:7px}
.ap-actions{display:flex;gap:9px;margin-top:18px;flex-wrap:wrap}
.ap-save{padding:10px 22px;background:var(--brand);color:#fff;border:none;border-radius:100px;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .22s;min-height:38px}
.ap-save:hover{background:var(--brand-l)}
.ap-reset{padding:10px 18px;background:var(--bg2);color:var(--ink2);border:1px solid var(--line);border-radius:100px;font-size:.82rem;font-weight:500;cursor:pointer;transition:all .22s;min-height:38px}
.ap-reset:hover{background:var(--bg3)}
.set-grid{display:grid;gap:16px;max-width:580px}
.sc{background:var(--white);border:1px solid var(--line);border-radius:var(--r);padding:22px 24px}
.sc h3{font-family:'Cormorant Garamond',serif;font-size:1.18rem;margin-bottom:4px}
.sc .desc{font-size:.78rem;color:var(--ink3);margin-bottom:18px}
.sc .field{margin-bottom:13px;text-align:left}
.sc label{display:block;font-size:.73rem;font-weight:600;letter-spacing:.04em;color:var(--ink2);margin-bottom:6px}
.sc input{width:100%;padding:11px 13px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font-size:.9rem;outline:none;transition:border-color .22s}
.sc input:focus{border-color:var(--brand)}
.sc .ssave{padding:10px 22px;background:var(--brand);color:#fff;border:none;border-radius:100px;font-size:.8rem;font-weight:600;cursor:pointer;min-height:38px;transition:background .22s}
.sc .ssave:hover{background:var(--brand-l)}
.sc .lp{display:inline-flex;align-items:center;gap:7px;color:var(--brand);font-size:.8rem;font-weight:500;text-decoration:none;border:1px solid var(--line);padding:8px 15px;border-radius:100px;transition:all .22s}
.sc .lp:hover{border-color:var(--brand)}
.ov{position:fixed;inset:0;z-index:800;background:rgba(34,31,22,.52);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:center;justify-content:center;padding:18px}
.ov.open{display:flex}
.modal{background:var(--white);border-radius:20px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 30px 80px -22px rgba(0,0,0,.4)}
.mh{padding:22px 26px 16px;border-bottom:1px solid var(--lines);display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:var(--white);z-index:2;border-radius:20px 20px 0 0}
.mh h2{font-family:'Cormorant Garamond',serif;font-size:1.45rem;font-weight:600}
.mcl{width:34px;height:34px;border-radius:50%;border:none;background:var(--bg);cursor:pointer;display:grid;place-items:center;color:var(--ink2);transition:background .2s}
.mcl:hover{background:var(--bg2)}
.mb{padding:20px 26px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:13px;margin-bottom:13px}
.fr.full{grid-template-columns:1fr}
.fld{display:flex;flex-direction:column;gap:6px}
.fld label{font-size:.72rem;font-weight:600;letter-spacing:.03em;color:var(--ink2)}
.fld input,.fld select,.fld textarea{padding:10px 13px;border:1.5px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);font-size:.88rem;outline:none;transition:border-color .22s,box-shadow .22s}
.fld input:focus,.fld select:focus,.fld textarea:focus{border-color:var(--brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--brand) 15%,transparent)}
.fld textarea{min-height:68px;resize:none;line-height:1.5}
.fld .hint{font-size:.68rem;color:var(--ink3)}
.uz{border:2px dashed var(--bg3);border-radius:13px;padding:22px;text-align:center;cursor:pointer;transition:all .28s;position:relative;overflow:hidden;min-height:110px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:7px;margin-bottom:13px}
.uz:hover,.uz.drag{border-color:var(--sage);background:var(--sagep)}
.uz input[type=file]{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%}
.uz .ui{font-size:1.8rem;line-height:1}
.uz .ul{font-size:.8rem;color:var(--ink2);font-weight:500}
.uz .us{font-size:.7rem;color:var(--ink3)}
.upvs{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
.upv{position:relative;width:68px;height:68px;border-radius:9px;overflow:hidden;border:1.5px solid var(--line)}
.upv img{width:100%;height:100%;object-fit:cover}
.upv .rm{position:absolute;top:3px;right:3px;width:18px;height:18px;border-radius:50%;background:rgba(192,104,90,.9);border:none;cursor:pointer;color:#fff;font-size:.56rem;display:grid;place-items:center}
.tr{display:flex;align-items:center;justify-content:space-between;padding:13px 15px;background:var(--bg);border-radius:11px;margin-bottom:13px}
.tr .trl h4{font-size:.85rem;font-weight:600;margin-bottom:2px}
.tr .trl p{font-size:.72rem;color:var(--ink3)}
.tog{position:relative;width:46px;height:25px;flex:none}
.tog input{opacity:0;width:0;height:0;position:absolute}
.tog-tr{position:absolute;inset:0;border-radius:100px;background:var(--bg3);cursor:pointer;transition:background .28s}
.tog input:checked+.tog-tr{background:var(--brand)}
.tog-tr::after{content:'';position:absolute;width:19px;height:19px;left:3px;top:3px;border-radius:50%;background:#fff;transition:transform .28s var(--ez);box-shadow:0 1px 4px rgba(0,0,0,.18)}
.tog input:checked+.tog-tr::after{transform:translateX(21px)}
.mf{padding:14px 26px 20px;display:flex;gap:9px;justify-content:flex-end;border-top:1px solid var(--lines);position:sticky;bottom:0;background:var(--white);border-radius:0 0 20px 20px}
.btn-cancel{padding:10px 20px;border-radius:100px;border:1.5px solid var(--line);background:var(--bg);color:var(--ink2);font-size:.82rem;font-weight:500;cursor:pointer;transition:all .22s;min-height:40px}
.btn-cancel:hover{border-color:var(--ink)}
.btn-save{padding:10px 26px;border-radius:100px;border:none;background:var(--brand);color:#fff;font-size:.82rem;font-weight:600;cursor:pointer;transition:background .22s,transform .2s;min-height:40px}
.btn-save:hover{background:var(--brand-l);transform:translateY(-1px)}
.cbox{background:var(--white);border-radius:18px;width:100%;max-width:360px;padding:30px 26px;text-align:center;box-shadow:0 24px 60px -22px rgba(0,0,0,.4)}
.cbox .ci{font-size:2.2rem;margin-bottom:10px}
.cbox h3{font-family:'Cormorant Garamond',serif;font-size:1.35rem;margin-bottom:7px}
.cbox p{font-size:.85rem;color:var(--ink3);margin-bottom:22px}
.cbox-btns{display:flex;gap:9px;justify-content:center}
.btn-del{padding:10px 22px;border-radius:100px;border:none;background:var(--red);color:#fff;font-size:.82rem;font-weight:600;cursor:pointer;min-height:40px}
.btn-del:hover{background:#a85748}
.toast{position:fixed;bottom:22px;right:22px;z-index:999;background:var(--ink);color:#fff;padding:12px 18px;border-radius:12px;font-size:.82rem;font-weight:500;box-shadow:0 8px 28px -8px rgba(0,0,0,.38);transform:translateY(110px);opacity:0;transition:transform .42s var(--ez),opacity .42s var(--ez);pointer-events:none;display:flex;align-items:center;gap:9px;max-width:280px}
.toast.show{transform:translateY(0);opacity:1}
.tdot{width:7px;height:7px;border-radius:50%;flex:none}
.toast.ok .tdot{background:var(--sage)}
.toast.err .tdot{background:var(--red)}
@media(max-width:860px){
  #app.ready{flex-direction:column}
  .sb{position:fixed;top:0;left:0;height:100%;z-index:500;transform:translateX(-100%);transition:transform .38s var(--ez)}
  .sb.open{transform:none}
  .sb-ovl.open{display:block}
  .main{width:100%}
  .mob-btn{display:flex}
  .stats{grid-template-columns:1fr 1fr}
  .fr{grid-template-columns:1fr}
  .ap-grid{grid-template-columns:1fr}
}
@media(max-width:480px){
  .stats{grid-template-columns:1fr 1fr}
  .pgrid{grid-template-columns:repeat(2,1fr)}
  .mb{padding:16px 18px}.mh{padding:16px 20px 13px}.mf{padding:12px 18px 16px}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`
