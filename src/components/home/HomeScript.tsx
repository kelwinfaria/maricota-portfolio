'use client'
import { useEffect } from 'react'

/**
 * Toda a interatividade da home (nav, menu mobile, carousel, filtros, lightbox)
 * roda aqui dentro de um useEffect — ou seja, DEPOIS da hidratação do React.
 *
 * Antes isso era um <script> inline injetado via dangerouslySetInnerHTML, que
 * executava durante o parse do HTML, ANTES da hidratação. Ele mutava nós do DOM
 * pertencentes aos Server Components (#filters, #cdots, #ctrack); na hidratação o
 * React detectava divergência, disparava um recoverable hydration error e
 * re-renderizava as subárvores do zero, apagando as mutações e os event listeners.
 * Resultado: contagens sumiam, pills não clicavam e o carousel não navegava.
 *
 * Rodando em useEffect, o DOM já está estável e o React não mexe mais nessas
 * subárvores estáticas, então tudo persiste.
 */
export function HomeScript({ waUrl }: { waUrl: string }) {
  useEffect(() => {
    const cleanups: Array<() => void> = []
    const on = (
      el: Window | Document | Element,
      ev: string,
      fn: EventListenerOrEventListenerObject,
      opts?: AddEventListenerOptions,
    ) => {
      el.addEventListener(ev, fn, opts)
      cleanups.push(() => el.removeEventListener(ev, fn, opts))
    }

    // --- nav + fab no scroll ---
    const nav = document.getElementById('nav')
    const fab = document.getElementById('fab')
    if (nav || fab) {
      const onScroll = () => {
        if (nav) nav.classList.toggle('sc', scrollY > 20)
        if (fab) fab.classList.toggle('show', scrollY > 520)
      }
      on(window, 'scroll', onScroll, { passive: true })
      onScroll()
    }

    // --- menu mobile (burger) ---
    const burger = document.getElementById('burger')
    const mmenu = document.getElementById('mmenu')
    if (burger && mmenu) {
      const toggleMenu = (o?: boolean) => {
        const op = o ?? !mmenu.classList.contains('op')
        mmenu.classList.toggle('op', op)
        burger.classList.toggle('op', op)
        document.body.style.overflow = op ? 'hidden' : ''
      }
      on(burger, 'click', () => toggleMenu())
      mmenu.querySelectorAll('a').forEach(a => on(a, 'click', () => toggleMenu(false)))
    }

    // --- reveal on scroll ---
    const io = new IntersectionObserver(
      es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target) }
      }),
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )
    document.querySelectorAll('.rv').forEach(el => io.observe(el))
    cleanups.push(() => io.disconnect())
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('.rv:not(.vis)').forEach(el => {
        if (el.getBoundingClientRect().top < innerHeight * 0.94) el.classList.add('vis')
      })
    }))

    // --- carousel infinito ---
    const ctrack = document.getElementById('ctrack')
    const cdots = document.getElementById('cdots')
    if (ctrack && cdots) {
      const orig = Array.from(ctrack.children)
      const n = orig.length
      const added: Node[] = []
      if (n > 1) {
        const tail = orig[0].cloneNode(true)
        const head = orig[n - 1].cloneNode(true)
        ctrack.appendChild(tail)
        ctrack.insertBefore(head, orig[0])
        added.push(tail, head)
      }
      let ci = 1, snapping = false
      let carTimer: ReturnType<typeof setInterval> | null = null
      const restart = () => {
        if (carTimer) clearInterval(carTimer)
        if (n > 1) carTimer = setInterval(() => step(1), 4200)
      }
      const jump = (idx: number) => {
        snapping = true
        ctrack.style.transition = 'none'
        ci = idx
        ctrack.style.transform = `translateX(-${ci * 100}%)`
        void ctrack.offsetWidth
        ctrack.style.transition = ''
        snapping = false
      }
      const sync = () => {
        const di = ((ci - 1) % n + n) % n
        Array.from(cdots.children).forEach((d, i) => d.classList.toggle('on', i === di))
      }
      const goTo = (idx: number) => {
        ci = idx
        ctrack.style.transform = `translateX(-${ci * 100}%)`
        sync()
      }
      const step = (dir: number) => goTo(ci + dir)

      for (let i = 0; i < n; i++) {
        const d = document.createElement('button')
        d.className = 'cdot' + (i === 0 ? ' on' : '')
        d.setAttribute('aria-label', 'Slide ' + (i + 1))
        d.addEventListener('click', () => { goTo(i + 1); restart() })
        cdots.appendChild(d)
        added.push(d)
      }
      jump(1)
      on(ctrack, 'transitionend', (e => {
        if (snapping || (e as TransitionEvent).propertyName !== 'transform') return
        if (ci <= 0) jump(n)
        else if (ci >= n + 1) jump(1)
      }) as EventListener)
      restart()

      let tx = 0, ty = 0, locked = false
      on(ctrack, 'touchstart', (e => {
        const t = (e as TouchEvent).touches[0]
        tx = t.clientX; ty = t.clientY; locked = false
      }) as EventListener, { passive: true })
      on(ctrack, 'touchmove', (e => {
        if (locked) return
        const t = (e as TouchEvent).touches[0]
        const dx = Math.abs(t.clientX - tx), dy = Math.abs(t.clientY - ty)
        if (dx > dy && dx > 8) { locked = true; e.preventDefault() }
      }) as EventListener, { passive: false })
      on(ctrack, 'touchend', (e => {
        if (!locked) return
        const dx = (e as TouchEvent).changedTouches[0].clientX - tx
        step(dx < 0 ? 1 : -1); restart(); locked = false
      }) as EventListener, { passive: true })

      cleanups.push(() => {
        if (carTimer) clearInterval(carTimer)
        added.forEach(node => { try { node.parentNode?.removeChild(node) } catch {} })
      })
    }

    // --- filtros (pills) ---
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.card'))
    const goFilter = (f: string) => {
      document.querySelectorAll<HTMLElement>('.filter').forEach(x => x.classList.toggle('on', x.dataset.filter === f))
      cards.forEach(c => { c.hidden = !(f === 'todos' || c.dataset.category === f) })
      const el = document.getElementById('produtos')
      if (el) {
        const top = el.getBoundingClientRect().top + scrollY - 60
        scrollTo({ top, behavior: 'smooth' })
      }
    }
    const filtersEl = document.getElementById('filters')
    if (filtersEl) {
      on(filtersEl, 'click', (e => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('.filter')
        if (b?.dataset.filter) goFilter(b.dataset.filter)
      }) as EventListener)
    }
    // contagem de produtos em cada pill
    document.querySelectorAll<HTMLElement>('.filter').forEach(f => {
      let nEl = f.querySelector('.n')
      const k = f.dataset.filter
      const count = k === 'todos' ? cards.length : cards.filter(c => c.dataset.category === k).length
      if (!nEl) {
        nEl = document.createElement('span')
        nEl.className = 'n'
        f.appendChild(nEl)
        const created = nEl
        cleanups.push(() => { try { created.remove() } catch {} })
      }
      nEl.textContent = String(count)
    })
    // cards de coleção que filtram
    document.querySelectorAll<HTMLElement>('.cc[data-filter]').forEach(c => {
      on(c, 'click', () => { if (c.dataset.filter) goFilter(c.dataset.filter) })
    })

    // --- lightbox ---
    const lb = document.getElementById('lb')
    const lbImg = document.getElementById('lbImg') as HTMLImageElement | null
    const lbCat = document.getElementById('lbCat')
    const lbName = document.getElementById('lbName')
    const lbDet = document.getElementById('lbDet')
    const lbPrice = document.getElementById('lbPrice')
    const lbDots = document.getElementById('lbDots')
    const lbPrev = document.getElementById('lbPrev') as HTMLElement | null
    const lbNext = document.getElementById('lbNext') as HTMLElement | null
    const lbWaBtn = document.querySelector<HTMLAnchorElement>('.lb-wa')
    if (lb && lbImg && lbPrev && lbNext && lbDots && lbCat && lbName && lbDet && lbPrice) {
      let gallery: string[] = [], gi = 0
      const paint = () => {
        lbImg.style.opacity = '0'
        lbImg.onload = () => { lbImg.style.opacity = '1' }
        lbImg.src = gallery[gi]
        if (lbImg.complete) lbImg.style.opacity = '1'
        Array.from(lbDots.children).forEach((d, i) => d.classList.toggle('on', i === gi))
      }
      const resolveWa = (raw: string) => {
        if (!raw) return waUrl
        if (raw.startsWith('http')) return raw
        return 'https://wa.me/' + raw.replace(/\D/g, '')
      }
      const openLB = (card: HTMLElement) => {
        gallery = (card.dataset.images || '').split('|').filter(Boolean)
        gi = 0
        lbCat.textContent = card.dataset.catLabel || ''
        const nameEl = card.querySelector('.card-name')
        lbName.innerHTML = nameEl ? nameEl.innerHTML : ''
        lbDet.textContent = card.dataset.det || ''
        lbPrice.textContent = card.dataset.price || ''
        if (lbWaBtn) lbWaBtn.href = resolveWa(card.dataset.wa || '')
        lbDots.innerHTML = ''
        const multi = gallery.length > 1
        lbPrev.hidden = lbNext.hidden = !multi
        if (multi) gallery.forEach((_, i) => {
          const d = document.createElement('i')
          d.onclick = () => { gi = i; paint() }
          lbDots.appendChild(d)
        })
        paint()
        lb.classList.add('open')
        document.body.style.overflow = 'hidden'
      }
      const closeLB = () => { lb.classList.remove('open'); document.body.style.overflow = '' }
      cards.forEach(c => on(c, 'click', () => openLB(c)))
      lbPrev.onclick = () => { gi = (gi - 1 + gallery.length) % gallery.length; paint() }
      lbNext.onclick = () => { gi = (gi + 1) % gallery.length; paint() }
      const lbCloseEl = document.getElementById('lbClose') as HTMLElement | null
      if (lbCloseEl) lbCloseEl.onclick = closeLB
      on(lb, 'click', (e => { if (e.target === lb) closeLB() }) as EventListener)
      on(window, 'keydown', (e => { if ((e as KeyboardEvent).key === 'Escape') closeLB() }) as EventListener)
    }

    return () => { cleanups.forEach(fn => fn()) }
  }, [waUrl])

  return null
}
