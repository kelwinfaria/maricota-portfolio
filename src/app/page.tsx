import './home.css'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { getHomeScript } from './homeScript'
import { HomeNav } from '@/components/home/HomeNav'
import { HomeHero } from '@/components/home/HomeHero'
import { HomeStrip } from '@/components/home/HomeStrip'
import { HomeSobre } from '@/components/home/HomeSobre'
import { HomeColecoes } from '@/components/home/HomeColecoes'
import { HomeProdutos } from '@/components/home/HomeProdutos'
import { HomeQuote } from '@/components/home/HomeQuote'
import { HomeEncomendar } from '@/components/home/HomeEncomendar'
import { HomeFooter } from '@/components/home/HomeFooter'
import { HomeLightbox } from '@/components/home/HomeLightbox'

export const dynamic = 'force-dynamic'

interface Appearance { brand: string; brandL: string; brandP: string; sec: string; pill: string; accent: string }

async function getData() {
  const [prods, cats, carousel, especiais, settingsRows] = await Promise.all([
    supabase.from('products').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('position'),
    supabase.from('carousel_slots').select('*').order('position'),
    supabase.from('especiais_slots').select('*').order('position'),
    supabase.from('settings').select('*'),
  ])
  const settings: Record<string, unknown> = {}
  for (const row of settingsRows.data ?? []) settings[row.key] = row.value
  return {
    products: prods.data ?? [],
    categories: cats.data ?? [],
    carousel: carousel.data ?? [],
    especiais: especiais.data ?? [],
    wa: (settings.wa_number as string) ?? '5599999999999',
    appearance: (settings.appearance as Appearance) ?? { brand: '#6B7A58', brandL: '#8A9A75', brandP: '#EAF0E3', sec: '#F3F3EC', pill: '#F7F6F1', accent: '#8A9A7E' },
  }
}

export default async function Home() {
  const { products, categories, carousel, especiais, wa, appearance: app } = await getData()
  const waUrl = wa.startsWith('http') ? wa : `https://wa.me/${wa.replace(/\D/g, '')}`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `:root{--olive:${app.brand};--olived:${app.brandL};--brandp:${app.brandP}}` }} />
      <HomeNav waUrl={waUrl} />
      <HomeHero waUrl={waUrl} />
      <HomeStrip />
      <HomeSobre />
      <HomeColecoes products={products} categories={categories} especiais={especiais} />
      <HomeProdutos products={products} categories={categories} />
      <HomeQuote />
      <HomeEncomendar waUrl={waUrl} />
      <HomeFooter waUrl={waUrl} />
      <HomeLightbox waUrl={waUrl} />
      <a className="fab" id="fab" href={waUrl} target="_blank" rel="noopener" aria-label="Encomendar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" /></svg>
        <span>Encomendar</span>
      </a>
      <script dangerouslySetInnerHTML={{ __html: getHomeScript(waUrl) }} />
    </>
  )
}
