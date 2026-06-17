'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { api } from './api'
import type { Product, Category, Slot, AppCfg, ImgItem, Settings } from './types'

export function useAdminData() {
  const [authed, setAuthed] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState(false)
  const [page, setPage] = useState('dash')
  const [products, setProducts] = useState<Product[]>([])
  const [cats, setCats] = useState<Category[]>([])
  const [carousel, setCarousel] = useState<Slot[]>([])
  const [especiais, setEspeciais] = useState<Slot[]>([])
  const [appCfg, setAppCfg] = useState<AppCfg>({ brand: '#6B7A58', brandL: '#8A9A75', brandP: '#EAF0E3', sec: '#F3F3EC', pill: '#F7F6F1', accent: '#8A9A7E' })
  const [settings, setSettings] = useState<Settings>({ wa_number: '', admin_name: 'Aladiane' })
  const [activeFilter, setActiveFilter] = useState('todos')
  const [colTab, setColTab] = useState('carousel')
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const [modal, setModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null })
  const [form, setForm] = useState({ name: '', category: '', det: '', price: '', fabric: '', wa: '', featured: false })
  const [imgItems, setImgItems] = useState<ImgItem[]>([])
  const [cfDel, setCfDel] = useState<string | null>(null)
  const [slotMode, setSlotMode] = useState<'carousel' | 'especial' | null>(null)
  const [newCat, setNewCat] = useState('')
  const [sOld, setSOld] = useState(''); const [sNew, setSNew] = useState('')
  const [trash, setTrash] = useState<Product[]>([])
  const [renamingCat, setRenamingCat] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')
  const [cfPermDel, setCfPermDel] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const sbRef = useRef<HTMLElement>(null)
  const dragImgIdx = useRef<number | null>(null)

  const showToast = useCallback((msg: string, type = 'ok') => {
    setToast({ msg, type }); clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }, [])

  const load = useCallback(async () => {
    try {
      const [p, c, cr, es, st, tr] = await Promise.all([
        api('/api/products'), api('/api/categories'), api('/api/carousel'),
        api('/api/especiais'), api('/api/settings'), api('/api/trash'),
      ])
      setProducts(p); setCats(c); setCarousel(cr); setEspeciais(es); setTrash(tr)
      setSettings({ wa_number: st.wa_number ?? '', admin_name: st.admin_name ?? 'Aladiane' })
      if (st.appearance) setAppCfg(st.appearance)
    } catch { showToast('Erro ao carregar dados. Tente novamente.', 'err') }
  }, [showToast])

  const doLogin = async () => {
    try { await api('/api/auth', { method: 'POST', body: JSON.stringify({ password: pw }) }); setAuthed(true); load() }
    catch { setPwErr(true); setTimeout(() => setPwErr(false), 3000) }
  }
  const doLogout = async () => { await api('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'logout' }) }); setAuthed(false); setPw('') }

  const saveProd = async () => {
    if (!form.name.trim()) { showToast('Insira o nome do produto.', 'err'); return }
    try {
      const uploadedUrls: string[] = []
      for (const item of imgItems) {
        if (item.src.startsWith('http')) { uploadedUrls.push(item.src); continue }
        if (item.file) { const fd = new FormData(); fd.append('file', item.file); const r = await fetch('/api/upload', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Falha ao enviar imagem'); if (j.url) uploadedUrls.push(j.url) }
      }
      const body = { ...form, images: uploadedUrls }
      if (modal.id) await api(`/api/products/${modal.id}`, { method: 'PUT', body: JSON.stringify(body) })
      else await api('/api/products', { method: 'POST', body: JSON.stringify(body) })
      await load(); setModal({ open: false, id: null }); showToast(modal.id ? 'Produto atualizado!' : 'Produto adicionado!')
    } catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const delProd = async () => {
    if (!cfDel) return
    try { await api(`/api/products/${cfDel}`, { method: 'DELETE' }); await load(); setCfDel(null); showToast('Produto movido para a lixeira.') }
    catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const restoreProduct = async (id: string) => {
    try { await api(`/api/trash/${id}`, { method: 'POST' }); await load(); showToast('Produto restaurado!') }
    catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const permDelete = async () => {
    if (!cfPermDel) return
    try { await api(`/api/trash/${cfPermDel}`, { method: 'DELETE' }); await load(); setCfPermDel(null); showToast('Excluído permanentemente.') }
    catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const openModal = (id: string | null) => {
    if (id) { const p = products.find(x => x.id === id)!; setForm({ name: p.name, category: p.category, det: p.det ?? '', price: p.price ?? '', fabric: p.fabric ?? '', wa: p.wa ?? '', featured: !!p.featured }); setImgItems((p.images ?? []).map(src => ({ src }))) }
    else { setForm({ name: '', category: cats[0]?.id ?? '', det: '', price: '', fabric: '', wa: '', featured: false }); setImgItems([]) }
    setModal({ open: true, id })
  }

  const moveImg = (from: number, to: number) => setImgItems(prev => { const n = [...prev]; const [item] = n.splice(from, 1); n.splice(to, 0, item); return n })

  const saveCarousel = async (next: Slot[]) => { setCarousel(next); await api('/api/carousel', { method: 'PUT', body: JSON.stringify(next) }); showToast('Carrossel salvo!') }
  const saveEspeciais = async (next: Slot[]) => { setEspeciais(next); await api('/api/especiais', { method: 'PUT', body: JSON.stringify(next) }); showToast('Coleções salvas!') }

  const pickSlot = (type: string, ref_id: string, label: string) => {
    const entry = { type, ref_id, label }
    if (slotMode === 'carousel') saveCarousel([...carousel, entry])
    else saveEspeciais([...especiais, entry])
    setSlotMode(null)
  }

  const addCat = async () => {
    if (!newCat.trim()) return
    const colors = ['#C08070', '#B08A55', '#8B7BA8', '#5B8A8A', '#A08060']
    try { await api('/api/categories', { method: 'POST', body: JSON.stringify({ id: 'cat_' + Date.now(), label: newCat.trim(), color: colors[cats.length % colors.length], fixed: false, position: cats.length }) }); await load(); setNewCat(''); showToast(`Categoria "${newCat}" adicionada!`) }
    catch (e: unknown) { showToast((e as Error).message, 'err') }
  }
  const removeCat = async (id: string) => {
    if (products.some(p => p.category === id)) { showToast('Mova os produtos antes de excluir.', 'err'); return }
    await api(`/api/categories/${id}`, { method: 'DELETE' }); await load(); showToast('Categoria removida.')
  }
  const renameCat = async (id: string) => {
    if (!renameVal.trim()) return
    try { await api(`/api/categories/${id}`, { method: 'PUT', body: JSON.stringify({ label: renameVal.trim() }) }); await load(); setRenamingCat(null); showToast('Categoria renomeada!') }
    catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const saveAppearance = async () => { await api('/api/settings', { method: 'PUT', body: JSON.stringify({ appearance: appCfg }) }); showToast('Aparência salva!') }
  const saveWA = async () => { await api('/api/settings', { method: 'PUT', body: JSON.stringify({ wa_number: settings.wa_number }) }); showToast('WhatsApp atualizado!') }
  const saveName = async () => { await api('/api/settings', { method: 'PUT', body: JSON.stringify({ admin_name: settings.admin_name }) }); showToast('Nome atualizado!') }
  const changePW = async () => {
    if (!sOld || !sNew) return
    try { await api('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword: sOld, newPassword: sNew }) }); setSOld(''); setSNew(''); showToast('Senha alterada!') }
    catch (e: unknown) { showToast((e as Error).message, 'err') }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    Array.from(files).forEach(f => { const r = new FileReader(); r.onload = e => setImgItems(prev => [...prev, { src: e.target!.result as string, file: f }]); r.readAsDataURL(f) })
  }

  useEffect(() => {
    fetch('/api/auth', { method: 'POST', body: JSON.stringify({ action: 'check' }), headers: { 'Content-Type': 'application/json' } })
      .then(r => { if (r.ok) { setAuthed(true); load() } })
      .catch(() => {}).finally(() => setAuthChecking(false))
  }, [load])

  return {
    authed, authChecking, pw, setPw, pwErr, page, setPage,
    products, cats, carousel, especiais, appCfg, setAppCfg, settings, setSettings,
    activeFilter, setActiveFilter, colTab, setColTab, toast, modal, setModal,
    form, setForm, imgItems, setImgItems, cfDel, setCfDel,
    slotMode, setSlotMode, newCat, setNewCat, sOld, setSOld, sNew, setSNew,
    trash, renamingCat, setRenamingCat, renameVal, setRenameVal, cfPermDel, setCfPermDel,
    sbRef, dragImgIdx,
    doLogin, doLogout, saveProd, delProd, restoreProduct, permDelete,
    openModal, moveImg, saveCarousel, saveEspeciais, pickSlot,
    addCat, removeCat, renameCat, saveAppearance, saveWA, saveName, changePW, handleFiles,
  }
}
