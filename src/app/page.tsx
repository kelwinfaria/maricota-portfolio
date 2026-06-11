import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  category: string
  det: string
  price: string
  featured: boolean
  images: string[]
}

interface CarouselSlot {
  type: string
  ref_id: string
  label: string
}

interface EspecialSlot {
  type: string
  ref_id: string
  label: string
}

interface Category {
  id: string
  label: string
}

interface Appearance {
  brand: string; brandL: string; brandP: string
  sec: string; pill: string; accent: string
}

async function getData() {
  const [prods, cats, carousel, especiais, settingsRows] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('categories').select('*').order('position'),
    supabase.from('carousel_slots').select('*').order('position'),
    supabase.from('especiais_slots').select('*').order('position'),
    supabase.from('settings').select('*'),
  ])

  const settings: Record<string, unknown> = {}
  for (const row of settingsRows.data ?? []) settings[row.key] = row.value

  return {
    products: (prods.data ?? []) as Product[],
    categories: (cats.data ?? []) as Category[],
    carousel: (carousel.data ?? []) as CarouselSlot[],
    especiais: (especiais.data ?? []) as EspecialSlot[],
    wa: (settings.wa_number as string) ?? '5599999999999',
    appearance: (settings.appearance as Appearance) ?? { brand: '#6B7A58', brandL: '#8A9A75', brandP: '#EAF0E3', sec: '#F3F3EC', pill: '#F7F6F1', accent: '#8A9A7E' },
  }
}

function productCardHTML(p: Product, cats: Category[]) {
  const cat = cats.find(c => c.id === p.category)
  const catLabel = cat?.label ?? p.category
  const imgs = p.images ?? []
  const mainImg = imgs[0] ?? ''
  const dataImages = imgs.join('|')
  const multiDots = imgs.length > 1 ? `<span class="card-multi">${imgs.map(() => '<i></i>').join('')}</span>` : ''
  const moreText = imgs.length > 1 ? `${imgs.length} fotos →` : 'ampliar →'
  const tagClass = p.featured ? 'ctag2 hot' : 'ctag2'
  const tagText = p.featured ? '★ Destaque' : catLabel
  const featClass = p.featured ? ' feat' : ''

  return `<article class="card${featClass}" data-category="${p.category}" data-det="${(p.det ?? '').replace(/"/g, '&quot;')}" data-price="${(p.price ?? '').replace(/"/g, '&quot;')}" data-cat-label="${catLabel}" data-images="${dataImages}">
  <div class="card-med"><span class="${tagClass}">${tagText}</span><span class="czoom">⤢</span>${mainImg ? `<img src="${mainImg}" alt="${p.name}" loading="lazy">` : ''}${multiDots}</div>
  <div class="card-bod"><h3 class="card-name">${p.name}</h3><p class="card-det">${p.det ?? ''}</p><div class="card-ft"><span class="card-price">${p.price ?? ''}</span><span class="card-more">${moreText}</span></div></div>
</article>`
}

function carouselSlideHTML(slot: CarouselSlot, products: Product[]) {
  const prod = products.find(p => p.id === slot.ref_id)
  if (!prod) return ''
  const img = prod.images?.[0] ?? ''
  return `<div class="cslide"><img src="${img}" alt="${prod.name}"><div class="cgrad"></div><div class="ccap"><div class="cn">${prod.name}</div><div class="cd">${slot.label ?? 'Bichinho feito à mão'}</div></div></div>`
}

function especialCardHTML(slot: EspecialSlot, products: Product[], categories: Category[], index: number) {
  const isBig = index === 0
  if (slot.type === 'category') {
    const cat = categories.find(c => c.id === slot.ref_id)
    const prod = products.find(p => p.category === slot.ref_id)
    const img = prod?.images?.[0] ?? ''
    const name = cat?.label ?? slot.ref_id
    return `<div class="cc${isBig ? ' big' : ''}" onclick="goFilter('${slot.ref_id}')">
  <div class="cc-img">${img ? `<img src="${img}" alt="${name}">` : ''}</div>
  <div class="cc-body"><span class="cc-lbl">${slot.label ?? 'Coleção 2026'}</span><h3 class="cc-title">${name}</h3><span class="cc-cta">Ver produtos →</span></div>
</div>`
  }
  const prod = products.find(p => p.id === slot.ref_id)
  if (!prod) return ''
  const img = prod.images?.[0] ?? ''
  return `<div class="cc${isBig ? ' big' : ''}" onclick="goFilter('${prod.category}')">
  <div class="cc-img">${img ? `<img src="${img}" alt="${prod.name}">` : ''}</div>
  <div class="cc-body"><span class="cc-lbl">${slot.label ?? 'Destaque'}</span><h3 class="cc-title">${prod.name}</h3><span class="cc-cta">Ver produtos →</span></div>
</div>`
}

export default async function Home() {
  const { products, categories, carousel, especiais, wa, appearance: app } = await getData()

  const waUrl = `https://wa.me/${wa}`

  const carouselSlides = carousel.length > 0
    ? carousel.map(s => carouselSlideHTML(s, products)).join('')
    : products.filter(p => p.featured).slice(0, 4).map(p =>
        `<div class="cslide"><img src="${p.images?.[0] ?? ''}" alt="${p.name}"><div class="cgrad"></div><div class="ccap"><div class="cn">${p.name}</div><div class="cd">Bichinho feito à mão</div></div></div>`
      ).join('')

  const especialCards = especiais.length > 0
    ? especiais.map((s, i) => especialCardHTML(s, products, categories, i)).join('')
    : categories.map((cat, i) => {
        const prod = products.find(p => p.category === cat.id)
        const img = prod?.images?.[0] ?? ''
        return `<div class="cc${i === 0 ? ' big' : ''}" onclick="goFilter('${cat.id}')">
  <div class="cc-img">${img ? `<img src="${img}" alt="${cat.label}">` : ''}</div>
  <div class="cc-body"><span class="cc-lbl">Coleção 2026</span><h3 class="cc-title">${cat.label}</h3><span class="cc-cta">Ver produtos →</span></div>
</div>`
      }).join('')

  const productCards = products.map(p => productCardHTML(p, categories)).join('')

  const filterButtons = [
    `<button class="filter on" data-filter="todos">Todos</button>`,
    ...categories.map(c => `<button class="filter" data-filter="${c.id}">${c.label}</button>`)
  ].join('')

  const css = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#FCFBF8;--bg2:#F3F3EC;--paper:#E8E8DF;
  --sage:#8A9A7E;--sages:#E8EDE1;--sagep:#F2F5ED;
  --olive:${app.brand};--olived:${app.brandL};
  --ink:#3A382F;--inkm:#686560;--inks:#A09D92;
  --line:rgba(58,56,47,.11);--lines:rgba(58,56,47,.055);
  --sh:0 28px 62px -32px rgba(58,56,47,.30);
  --shs:0 14px 32px -22px rgba(58,56,47,.26);
  --shx:0 5px 16px -8px rgba(58,56,47,.17);
  --r:20px;--mw:1180px;--ez:cubic-bezier(.22,1,.36,1);
}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{background:var(--bg);font-family:'DM Sans',system-ui,sans-serif;color:var(--ink);overflow-x:clip;-webkit-font-smoothing:antialiased;line-height:1.64;font-weight:400}
img{display:block;max-width:100%}
::selection{background:var(--sage);color:#fff}
.ey{font-weight:500;font-size:.68rem;letter-spacing:.3em;text-transform:uppercase;color:var(--olive)}
h1,h2,h3{font-family:'Cormorant Garamond',serif;font-weight:600;line-height:1.07;letter-spacing:-.01em;color:var(--ink)}
em{font-style:italic;font-weight:500;color:var(--olive)}
.wrap{max-width:var(--mw);margin:0 auto;padding:0 clamp(20px,5vw,40px)}
nav{position:fixed;top:0;left:0;right:0;z-index:600;display:flex;align-items:center;justify-content:space-between;padding:12px clamp(18px,5vw,40px);padding-top:max(12px,env(safe-area-inset-top));background:rgba(252,251,248,.76);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid transparent;transition:border-color .4s,background .4s}
nav.sc{border-bottom-color:var(--line);background:rgba(252,251,248,.95)}
.nav-logo{height:28px;mix-blend-mode:multiply}
.nav-links{display:flex;gap:28px}
.nav-links a{font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;font-weight:500;color:var(--inkm);text-decoration:none;padding:4px 0;position:relative;transition:color .3s}
.nav-links a::after{content:'';position:absolute;left:0;right:100%;bottom:0;height:1.5px;background:var(--sage);border-radius:2px;transition:right .35s var(--ez)}
.nav-links a:hover{color:var(--ink)}.nav-links a:hover::after{right:0}
.n-r{display:flex;align-items:center;gap:10px}
.wa-p{display:inline-flex;align-items:center;gap:8px;background:var(--olive);color:#fff;text-decoration:none;font-size:.76rem;font-weight:500;padding:10px 17px;border-radius:100px;transition:transform .3s var(--ez),background .3s;box-shadow:0 10px 24px -14px var(--olive)}
.wa-p:hover{transform:translateY(-2px);background:var(--olived)}
.burger{display:none;width:40px;height:40px;border:none;background:none;cursor:pointer;flex-direction:column;gap:5px;align-items:center;justify-content:center}
.burger span{width:20px;height:2px;background:var(--ink);border-radius:2px;transition:transform .35s var(--ez),opacity .25s;display:block}
.burger.op span:first-child{transform:translateY(7px) rotate(45deg)}
.burger.op span:nth-child(2){opacity:0}
.burger.op span:last-child{transform:translateY(-7px) rotate(-45deg)}
.mmenu{position:fixed;inset:0;z-index:590;background:rgba(252,251,248,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;opacity:0;visibility:hidden;transition:opacity .35s,visibility .35s}
.mmenu.op{opacity:1;visibility:visible}
.mmenu a{font-family:'Cormorant Garamond',serif;font-size:2rem;color:var(--ink);text-decoration:none;padding:8px 0;font-style:italic;transition:color .3s}
.mmenu a:hover{color:var(--olive)}
.hero{padding:110px 0 64px;overflow:hidden;background:var(--bg)}
.hero-g{display:grid;grid-template-columns:1.08fr .92fr;gap:clamp(36px,6vw,80px);align-items:center}
.hero-logo{height:clamp(54px,8vw,90px);mix-blend-mode:multiply;margin-bottom:18px}
.htag{font-size:clamp(2.2rem,4.8vw,3.5rem);margin-bottom:16px;line-height:1.05;letter-spacing:-.015em}
.htag .it{display:block;font-style:italic;font-weight:500;color:var(--olive)}
.hlead{font-size:1.02rem;color:var(--inkm);max-width:27rem;margin-bottom:26px;line-height:1.66}
.hctas{display:flex;flex-wrap:wrap;gap:11px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;text-decoration:none;font-size:.86rem;font-weight:500;padding:15px 28px;border-radius:100px;transition:transform .3s var(--ez),box-shadow .3s,background .3s,border-color .3s;min-height:50px;letter-spacing:.01em}
.btnp{background:var(--olive);color:#fff;box-shadow:0 18px 36px -16px rgba(107,122,88,.88)}
.btnp:hover{transform:translateY(-2px);background:var(--olived)}
.btnp svg{width:17px;height:17px;flex:none}
.btng{color:var(--ink);border:1px solid var(--line)}
.btng:hover{transform:translateY(-2px);border-color:var(--sage);color:var(--olive)}
.cwrap{position:relative}
.cframe{border-radius:22px;overflow:hidden;aspect-ratio:308/424;background:var(--paper);box-shadow:var(--sh);position:relative}
.ctrack{display:flex;height:100%;transition:transform .65s var(--ez)}
.cslide{min-width:100%;position:relative;flex:none}
.cslide img{width:100%;height:100%;object-fit:cover;object-position:center 20%}
.cgrad{position:absolute;inset:0;background:linear-gradient(to top,rgba(34,31,22,.62),transparent 50%);pointer-events:none}
.ccap{position:absolute;bottom:0;left:0;right:0;padding:42px 20px 20px;z-index:1}
.ccap .cn{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.22rem;color:#fff;font-weight:500;line-height:1.1}
.ccap .cd{font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.75);margin-top:4px}
.ctag-c{position:absolute;top:14px;left:14px;z-index:2;display:inline-flex;align-items:center;gap:7px;background:rgba(252,251,248,.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:var(--ink);font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;font-weight:600;padding:8px 14px;border-radius:100px;box-shadow:var(--shx)}
.ctag-c i{width:5px;height:5px;border-radius:50%;background:var(--olive);display:block}
.cfoot{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:14px}
.cdots{display:flex;gap:7px;align-items:center}
.cdot{width:22px;height:3px;border-radius:2px;background:var(--line);cursor:pointer;border:none;padding:0;transition:background .3s,width .4s var(--ez)}
.cdot.on{background:var(--olive);width:32px}
.chint{font-size:.6rem;letter-spacing:.18em;text-transform:uppercase;color:var(--inks)}
.strip{background:var(--bg2);border-top:1px solid var(--lines);border-bottom:1px solid var(--lines)}
.strip-in{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;padding:22px clamp(20px,5vw,40px);max-width:var(--mw);margin:0 auto}
.spill{display:flex;align-items:center;gap:9px;background:var(--bg);border:1px solid var(--line);border-radius:100px;padding:11px 18px;font-size:.8rem;color:var(--inkm);min-height:44px}
.spill .si{width:24px;height:24px;border-radius:50%;background:var(--sages);color:var(--sage);display:grid;place-items:center;font-size:.78rem;flex:none}
.spill b{color:var(--ink);font-weight:600}
.sh{text-align:center;max-width:620px;margin:0 auto}
.sh .ey{display:inline-flex;align-items:center;gap:10px;margin-bottom:12px}
.sh .ey::before,.sh .ey::after{content:'';width:22px;height:1px;background:var(--sage);opacity:.6}
.sh h2{font-size:clamp(2rem,4.5vw,3.2rem)}
.sh .sub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;color:var(--inks);margin-top:8px}
.sobre{padding:clamp(70px,9vw,100px) 0;background:var(--bg2)}
.sobre-g{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(36px,6vw,70px);align-items:center}
.sobre-ph{position:relative;max-width:360px;width:100%;justify-self:center}
.sframe{border-radius:var(--r);overflow:hidden;aspect-ratio:4/5;background:var(--paper);box-shadow:var(--sh);border:7px solid var(--bg2)}
.sframe img{width:100%;height:100%;object-fit:cover}
.sobre-ph .acc{position:absolute;top:-11px;left:-11px;width:58px;height:58px;border-radius:50%;border:1.5px solid var(--sage);z-index:-1;opacity:.55}
.sobre-ph .blb{position:absolute;bottom:-14px;right:-14px;width:72px;height:72px;border-radius:50%;background:var(--sages);z-index:-1}
.sstat{position:absolute;right:-13px;bottom:14px;background:var(--bg);border:1px solid var(--line);border-radius:15px;padding:12px 16px;box-shadow:var(--shs);text-align:center}
.sstat b{font-family:'Cormorant Garamond',serif;font-size:1.5rem;color:var(--olive);display:block;line-height:1}
.sstat span{font-size:.5rem;letter-spacing:.15em;text-transform:uppercase;color:var(--inks)}
.stitle{font-size:clamp(2rem,3.8vw,2.9rem);margin:12px 0 3px}
.ssub{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;color:var(--inks);margin-bottom:17px}
.sobre-cp p{color:var(--inkm);margin-bottom:12px;max-width:33rem}
.sobre-cp strong{color:var(--olive);font-weight:500}
.vals{display:grid;gap:8px;margin-top:20px}
.val{display:flex;gap:12px;align-items:center;padding:12px 14px;background:var(--bg);border:1px solid var(--lines);border-radius:13px}
.val .vi{width:32px;height:32px;flex:none;border-radius:50%;display:grid;place-items:center;font-size:.88rem}
.val:nth-child(1) .vi{background:var(--sages);color:var(--sage)}
.val:nth-child(2) .vi{background:#ECE8E0;color:var(--olived)}
.val:nth-child(3) .vi{background:#E6EAE1;color:var(--sage)}
.val h4{font-size:.84rem;font-weight:600;margin-bottom:1px;color:var(--ink)}
.val p{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.96rem;color:var(--inks);line-height:1.35;margin-bottom:0}
.sig{font-family:'Caveat',cursive;font-weight:700;font-size:1.8rem;color:var(--olive);margin-top:18px;line-height:1}
.colecoes{padding:clamp(70px,9vw,100px) 0}
.cc-grid{display:grid;grid-template-columns:1.45fr 1fr;grid-template-rows:254px 254px;gap:16px;margin-top:40px}
.cc{border-radius:var(--r);overflow:hidden;position:relative;cursor:pointer;background:var(--paper);box-shadow:var(--shs)}
.cc.big{grid-row:span 2}
.cc-img{width:100%;height:100%}
.cc-img img{width:100%;height:100%;object-fit:cover;transition:transform .8s var(--ez)}
.cc:hover .cc-img img{transform:scale(1.04)}
.cc-body{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(16px,2.5vw,26px);background:linear-gradient(to top,rgba(34,31,22,.7),rgba(34,31,22,.1) 52%,transparent 72%)}
.cc-lbl{font-size:.57rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.7);margin-bottom:5px;font-weight:500}
.cc-title{font-family:'Cormorant Garamond',serif;font-size:clamp(1.4rem,2.2vw,1.9rem);color:#fff;font-weight:600;line-height:1.08}
.cc.big .cc-title{font-size:clamp(1.8rem,3vw,2.5rem)}
.cc-cta{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.78);font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;margin-top:9px;font-weight:500;transition:gap .3s var(--ez)}
.cc:hover .cc-cta{gap:10px}
.produtos{padding:clamp(70px,9vw,100px) 0;background:var(--bg2)}
.filters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:28px 0 38px}
.filter{font-size:.8rem;font-weight:500;color:var(--inkm);background:var(--bg);box-shadow:0 0 0 1px var(--line);border:none;padding:11px 20px;border-radius:100px;cursor:pointer;transition:all .28s var(--ez);min-height:44px;display:inline-flex;align-items:center;white-space:nowrap}
.filter:hover{box-shadow:0 0 0 1px var(--sage);color:var(--ink)}
.filter.on{background:var(--ink);color:#fff;box-shadow:0 0 0 1px var(--ink)}
.filter .n{opacity:.42;font-size:.7rem;margin-left:6px;font-variant-numeric:tabular-nums}
.grid{display:grid;grid-template-columns:repeat(12,1fr);gap:clamp(11px,1.5vw,17px)}
.card{grid-column:span 3;background:var(--bg);border-radius:var(--r);overflow:hidden;border:1px solid var(--lines);cursor:pointer;position:relative;transition:transform .5s var(--ez),box-shadow .5s var(--ez)}
.card.feat{grid-column:span 6}
.card-med{position:relative;overflow:hidden;aspect-ratio:4/5;background:var(--paper)}
.card.feat .card-med{aspect-ratio:3/2}
.card-med img{width:100%;height:100%;object-fit:cover;transition:transform .8s var(--ez)}
.card:hover{transform:translateY(-5px);box-shadow:var(--sh)}
.card:hover .card-med img{transform:scale(1.05)}
.ctag2{position:absolute;top:10px;left:10px;z-index:2;font-size:.57rem;letter-spacing:.12em;text-transform:uppercase;font-weight:600;background:rgba(252,251,248,.95);backdrop-filter:blur(6px);padding:5px 10px;border-radius:100px;color:var(--ink);box-shadow:var(--shx)}
.ctag2.hot{background:var(--olive);color:#fff;box-shadow:none}
.czoom{position:absolute;top:10px;right:10px;z-index:2;width:31px;height:31px;border-radius:50%;background:rgba(252,251,248,.94);display:grid;place-items:center;color:var(--ink);opacity:0;transform:scale(.8);transition:all .32s var(--ez)}
.card:hover .czoom{opacity:1;transform:scale(1)}
.card-bod{padding:14px 16px 18px}
.card-name{font-family:'Cormorant Garamond',serif;font-size:1.26rem;font-weight:600;line-height:1.1}
.card.feat .card-name{font-size:1.55rem}
.card-det{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:.96rem;color:var(--inks);margin-top:2px}
.card-ft{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}
.card-price{font-size:.84rem;font-weight:600;color:var(--olive);white-space:nowrap}
.card-more{font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:var(--inks);white-space:nowrap}
.card-multi{position:absolute;bottom:10px;right:10px;z-index:2;display:flex;gap:4px}
.card-multi i{width:5px;height:5px;border-radius:50%;background:#fff;display:block;box-shadow:0 0 0 1px rgba(58,56,47,.12)}
.card[hidden]{display:none}
.cnote{text-align:center;margin-top:28px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;color:var(--inks);max-width:560px;margin-inline:auto}
.cnote b{font-style:normal;font-family:'DM Sans',sans-serif;font-size:.92em;font-weight:600;color:var(--olive)}
.quote{padding:clamp(70px,9vw,100px) 0;background:${app.brandP};overflow:hidden}
.quote-g{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,6vw,80px);align-items:center}
.quote-cp .qm{font-family:'Cormorant Garamond',serif;font-size:3.8rem;color:var(--sage);line-height:.4;height:26px;margin-bottom:18px}
.quote-cp blockquote{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.38rem,2.8vw,2rem);line-height:1.5;color:var(--ink)}
.quote-cp blockquote span{color:var(--olive)}
.quote-cp .by{font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:var(--inks);margin-top:22px}
.quote-cp .qsig{font-family:'Caveat',cursive;font-weight:700;font-size:1.9rem;color:var(--olive);margin-top:7px;line-height:1}
.quote-illo{display:flex;align-items:center;justify-content:center;color:var(--sage);opacity:.38}
.quote-illo svg{width:min(100%,300px);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.encomendar{padding:clamp(70px,9vw,100px) 0}
.pcards{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:38px}
.pcard{background:var(--bg2);border:1px solid var(--lines);border-radius:var(--r);padding:28px 22px;text-align:center;transition:transform .4s var(--ez),box-shadow .4s}
.pcard:hover{transform:translateY(-4px);box-shadow:var(--shs)}
.pi{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;margin:0 auto 14px;font-size:1.1rem}
.pcard:nth-child(1) .pi{background:var(--sages);color:var(--sage)}
.pcard:nth-child(2) .pi{background:#EDE8E0;color:var(--olived)}
.pcard:nth-child(3) .pi{background:#E6EAE1;color:var(--sage)}
.pcard h3{font-size:1.28rem;margin-bottom:6px}
.pcard p{font-family:'Cormorant Garamond',serif;font-size:1.02rem;color:var(--inkm);line-height:1.5}
.ptag{display:inline-block;margin-top:11px;font-size:.67rem;font-weight:600;letter-spacing:.06em;color:var(--olive);background:var(--bg);border:1px solid var(--line);padding:5px 12px;border-radius:100px}
.cta-band{margin-top:38px;border-radius:26px;overflow:hidden;position:relative;background:var(--ink);color:#fff;padding:clamp(34px,5vw,50px) clamp(24px,4vw,46px);display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.cta-weave{position:absolute;inset:0;background-image:repeating-linear-gradient(0deg,transparent,transparent 5px,rgba(255,255,255,.03) 5px,rgba(255,255,255,.03) 6px),repeating-linear-gradient(90deg,transparent,transparent 5px,rgba(255,255,255,.03) 5px,rgba(255,255,255,.03) 6px);pointer-events:none}
.cta-cp{position:relative;z-index:1}
.cta-band h3{font-size:clamp(1.65rem,3vw,2.4rem);color:#fff;line-height:1.1}
.cta-band p{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.08rem;color:rgba(255,255,255,.74);margin-top:5px}
.btn-wa{position:relative;z-index:1;background:var(--bg);color:var(--olived);font-weight:600;font-size:.88rem;padding:15px 26px;border-radius:100px;text-decoration:none;display:inline-flex;gap:9px;align-items:center;white-space:nowrap;transition:transform .3s var(--ez);box-shadow:0 14px 28px -14px rgba(0,0,0,.4);min-height:50px}
.btn-wa:hover{transform:translateY(-2px)}
footer{background:var(--ink);color:#fff;padding:56px 0 calc(30px + env(safe-area-inset-bottom));overflow:hidden;text-align:center}
.ft-illo{width:76px;height:52px;margin:0 auto 16px;opacity:.2;color:#fff;display:flex;align-items:center;justify-content:center}
.ft-illo svg{width:100%;stroke-linecap:round;stroke-linejoin:round}
.ft-logo{height:34px;margin:0 auto 13px;opacity:.86}
.ft-tag{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.08rem;color:rgba(255,255,255,.54);margin-bottom:20px}
.ft-heart{color:var(--sage)}
.ft-links{display:flex;justify-content:center;gap:10px;margin-bottom:24px;flex-wrap:wrap}
.ft-links a{display:inline-flex;align-items:center;gap:7px;color:#fff;text-decoration:none;font-size:.78rem;letter-spacing:.03em;border:1px solid rgba(255,255,255,.18);padding:10px 19px;border-radius:100px;transition:all .3s var(--ez);min-height:44px}
.ft-links a:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.44)}
.ft-meta{font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.28)}
.fab{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:550;display:inline-flex;align-items:center;gap:9px;background:var(--olive);color:#fff;text-decoration:none;padding:14px 18px;border-radius:100px;font-size:.84rem;font-weight:600;box-shadow:0 16px 32px -12px var(--olive);transform:translateY(130px);transition:transform .5s var(--ez),background .3s}
.fab.show{transform:translateY(0)}
.fab:hover{background:var(--olived)}
.fab svg{width:18px;height:18px}
.lb{position:fixed;inset:0;z-index:900;display:none;background:rgba(34,31,22,.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);align-items:center;justify-content:center;padding:clamp(12px,4vw,36px)}
.lb.open{display:flex}
.lb-in{position:relative;max-width:940px;width:100%;display:grid;grid-template-columns:1.3fr .7fr;background:var(--bg);border-radius:22px;overflow:hidden;box-shadow:0 38px 86px -30px rgba(0,0,0,.56);max-height:88vh}
.lb-stage{position:relative;background:var(--paper);display:flex;align-items:center;justify-content:center;min-height:300px}
.lb-stage img{width:100%;height:100%;max-height:88vh;object-fit:cover;transition:opacity .3s}
.lb-side{padding:clamp(22px,4vw,36px);display:flex;flex-direction:column;justify-content:center}
.lb-cat{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:var(--olive);margin-bottom:10px;font-weight:500}
.lb-name{font-size:clamp(1.65rem,3vw,2rem);margin-bottom:6px}
.lb-det{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.1rem;color:var(--inks);margin-bottom:16px}
.lb-price{font-size:1rem;font-weight:600;color:var(--olive);margin-bottom:19px}
.lb-dots{display:flex;gap:6px;margin-bottom:19px}
.lb-dots i{width:8px;height:8px;border-radius:50%;background:var(--line);cursor:pointer;transition:background .3s}
.lb-dots i.on{background:var(--olive)}
.lb-wa{align-self:flex-start;background:var(--olive);color:#fff;text-decoration:none;font-size:.85rem;font-weight:600;padding:13px 22px;border-radius:100px;display:inline-flex;gap:8px;align-items:center;transition:transform .3s var(--ez),background .3s;min-height:46px}
.lb-wa:hover{transform:translateY(-2px);background:var(--olived)}
.lb-cl{position:absolute;top:12px;right:12px;z-index:5;width:40px;height:40px;border-radius:50%;border:none;background:rgba(252,251,248,.95);color:var(--ink);font-size:1rem;cursor:pointer;display:grid;place-items:center;transition:transform .3s;box-shadow:var(--shx)}
.lb-cl:hover{transform:rotate(90deg)}
.lb-nav{position:absolute;top:50%;transform:translateY(-50%);width:43px;height:43px;border-radius:50%;border:none;background:rgba(252,251,248,.92);color:var(--ink);cursor:pointer;display:grid;place-items:center;z-index:4;font-size:1.3rem;transition:background .3s;box-shadow:var(--shx)}
.lb-nav:hover{background:#fff}
.lb-nav.prev{left:12px}
.lb-nav.next{left:auto;right:calc(.3*100% + 12px)}
.lb-nav[hidden]{display:none}
.rv{opacity:0;transform:translateY(22px);transition:opacity .75s var(--ez),transform .75s var(--ez)}
.rv.vis{opacity:1;transform:none}
@media(max-width:900px){
  .nav-links{display:none}.burger{display:flex}
  .rv{opacity:1;transform:none}
  .hero{padding:96px 0 46px}
  .hero-g{grid-template-columns:1fr;gap:38px;text-align:center}
  .hero-logo{margin-inline:auto}.hlead{margin-inline:auto}.hctas{justify-content:center}
  .cwrap{max-width:min(480px,calc(100vw - 32px));margin:0 auto}
  .sobre-g{grid-template-columns:1fr;gap:38px}
  .sobre-ph{max-width:340px;justify-self:center}
  .cc-grid{grid-template-columns:1fr;grid-template-rows:auto;max-height:none}
  .cc.big{grid-row:span 1}.cc{aspect-ratio:4/3}
  .card{grid-column:span 6}.card.feat{grid-column:span 12}
  .quote-g{grid-template-columns:1fr}.quote-illo{display:none}
  .lb-in{grid-template-columns:1fr;max-height:92vh}
  .lb-stage{max-height:46vh}.lb-stage img{max-height:46vh}
  .lb-nav.next{right:12px}.lb-nav{top:auto;bottom:calc(46vh + 12px)}
  .pcards{grid-template-columns:1fr;gap:11px}
}
@media(max-width:560px){
  .filters{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding:4px 2px 10px;margin-inline:-2px}
  .filters::-webkit-scrollbar{display:none}
  .filter{flex:none}.grid{gap:11px}
  .card,.card.feat{grid-column:span 12}
  .cta-band{flex-direction:column;text-align:center}
  .cta-band .btn-wa{width:100%;justify-content:center}
  .strip-in{gap:8px}
}
@media(prefers-reduced-motion:reduce){
  .rv{opacity:1;transform:none;transition:none}.ctrack{transition:none}html{scroll-behavior:auto}
}`

  const js = `
const nav=document.getElementById('nav'),fab=document.getElementById('fab');
const onScroll=()=>{nav.classList.toggle('sc',scrollY>20);fab.classList.toggle('show',scrollY>520)};
addEventListener('scroll',onScroll,{passive:true});onScroll();
const burger=document.getElementById('burger'),mmenu=document.getElementById('mmenu');
function toggleMenu(o){const op=o??!mmenu.classList.contains('op');mmenu.classList.toggle('op',op);burger.classList.toggle('op',op);document.body.style.overflow=op?'hidden':''}
burger.addEventListener('click',()=>toggleMenu());
mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
const ctrack=document.getElementById('ctrack'),cdots=document.getElementById('cdots');
const cslides=[...ctrack.children];let ci=0,ct=null;
function goC(n){ci=(n+cslides.length)%cslides.length;ctrack.style.transform='translateX(-'+ci*100+'%)';[...cdots.children].forEach((d,i)=>d.classList.toggle('on',i===ci))}
cslides.forEach((_,i)=>{const d=document.createElement('button');d.className='cdot'+(i===0?' on':'');d.setAttribute('aria-label','Slide '+(i+1));d.addEventListener('click',()=>{clearInterval(ct);goC(i);ct=setInterval(()=>goC(ci+1),4200)});cdots.appendChild(d)});
ct=setInterval(()=>goC(ci+1),4200);
let tx=0;
ctrack.addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
ctrack.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40){clearInterval(ct);goC(ci+(dx>0?-1:1));ct=setInterval(()=>goC(ci+1),4200)}},{passive:true});
const cards=[...document.querySelectorAll('.card')];
function goFilter(f){
  document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('on',x.dataset.filter===f));
  cards.forEach(c=>c.hidden=!(f==='todos'||c.dataset.category===f));
  const el=document.getElementById('produtos');
  if(el){const top=el.getBoundingClientRect().top+scrollY-60;window.scrollTo({top,behavior:'smooth'})}
}
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('.filter');if(b)goFilter(b.dataset.filter)});
document.querySelectorAll('.filter').forEach(f=>{const k=f.dataset.filter;const n=k==='todos'?cards.length:cards.filter(c=>c.dataset.category===k).length;const s=document.createElement('span');s.className='n';s.textContent=n;f.appendChild(s)});
const lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),
  lbCat=document.getElementById('lbCat'),lbName=document.getElementById('lbName'),
  lbDet=document.getElementById('lbDet'),lbPrice=document.getElementById('lbPrice'),
  lbDots=document.getElementById('lbDots'),lbPrev=document.getElementById('lbPrev'),lbNext=document.getElementById('lbNext');
let gallery=[],gi=0;
function paint(){lbImg.style.opacity=0;lbImg.onload=()=>lbImg.style.opacity=1;lbImg.src=gallery[gi];if(lbImg.complete)lbImg.style.opacity=1;[...lbDots.children].forEach((d,i)=>d.classList.toggle('on',i===gi))}
function openLB(card){
  gallery=card.dataset.images.split('|').filter(Boolean);gi=0;
  lbCat.textContent=card.dataset.catLabel;
  lbName.innerHTML=card.querySelector('.card-name').innerHTML;
  lbDet.textContent=card.dataset.det;lbPrice.textContent=card.dataset.price;
  lbDots.innerHTML='';const multi=gallery.length>1;
  lbPrev.hidden=lbNext.hidden=!multi;
  if(multi)gallery.forEach((_,i)=>{const d=document.createElement('i');d.onclick=()=>{gi=i;paint()};lbDots.appendChild(d)});
  paint();lb.classList.add('open');document.body.style.overflow='hidden';
}
function closeLB(){lb.classList.remove('open');document.body.style.overflow=''}
cards.forEach(c=>c.addEventListener('click',()=>openLB(c)));
lbPrev.onclick=()=>{gi=(gi-1+gallery.length)%gallery.length;paint()};
lbNext.onclick=()=>{gi=(gi+1)%gallery.length;paint()};
document.getElementById('lbClose').onclick=closeLB;
lb.addEventListener('click',e=>{if(e.target===lb)closeLB()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeLB()});`

  const waIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z"/></svg>`

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {/* fonts injected via layout head */}

      <nav id="nav">
        <a href="#top"><img className="nav-logo" src="/images/logo-maricota.png" alt="Maricota" /></a>
        <div className="nav-links">
          <a href="#sobre">Sobre</a><a href="#colecoes">Coleções</a>
          <a href="#produtos">Produtos</a><a href="#encomendar">Encomendar</a>
        </div>
        <div className="n-r">
          <a className="wa-p" href={waUrl} target="_blank" rel="noopener" dangerouslySetInnerHTML={{ __html: waIcon + ' Encomendar' }} />
          <button className="burger" id="burger"><span></span><span></span><span></span></button>
        </div>
      </nav>
      <div className="mmenu" id="mmenu">
        <a href="#sobre">Sobre</a><a href="#colecoes">Coleções</a>
        <a href="#produtos">Produtos</a><a href="#encomendar">Encomendar</a>
      </div>
      <span id="top"></span>

      <header className="hero">
        <div className="wrap hero-g">
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
          <div className="cwrap rv">
            <div className="cframe">
              <span className="ctag-c"><i></i>Coleção 2026</span>
              <div className="ctrack" id="ctrack" dangerouslySetInnerHTML={{ __html: carouselSlides }} />
            </div>
            <div className="cfoot"><div className="cdots" id="cdots"></div><span className="chint">deslize</span></div>
          </div>
        </div>
      </header>

      <div className="strip">
        <div className="strip-in">
          <div className="spill"><span className="si">✦</span><span><b>Peças únicas</b>, feitas à mão</span></div>
          <div className="spill"><span className="si">✈</span><span>Envio para <b>todo o Brasil</b></span></div>
          <div className="spill"><span className="si">❀</span><span>Materiais <b>seguros e macios</b></span></div>
          <div className="spill"><span className="si">♥</span><span><b>Personalização</b> sob encomenda</span></div>
        </div>
      </div>

      <section className="sobre" id="sobre">
        <div className="wrap sobre-g">
          <div className="sobre-ph rv">
            <span className="acc"></span><span className="blb"></span>
            <div className="sframe"><img src="/images/img01.jpg" alt="Aladiane, fundadora da Maricota" /></div>
            <div className="sstat"><b>100%</b><span>Feito à mão</span></div>
          </div>
          <div className="sobre-cp rv">
            <span className="ey">Quem está por trás da Maricota</span>
            <h2 className="stitle">Olá, eu sou <em>Aladiane</em></h2>
            <p className="ssub">Artesã, criadora e fundadora</p>
            <p>A Maricota nasceu em 2024 de um desejo simples: criar peças que fossem além de brinquedos. Cada bichinho que sai das minhas mãos carrega uma intenção de acolher, de durar e de virar memória.</p>
            <p>Trabalho no estilo <strong>Scandi-Boho</strong>: delicado, minimalista e aconchegante. Materiais selecionados e seguros, pensados para os primeiros anos dos pequenos.</p>
            <div className="vals">
              <div className="val"><span className="vi">✦</span><div><h4>Feito com propósito</h4><p>Cada peça é única, costurada à mão com atenção a cada detalhe.</p></div></div>
              <div className="val"><span className="vi">♥</span><div><h4>Para momentos especiais</h4><p>Quartinho, chá de bebê, presente afetivo e memória para a vida.</p></div></div>
              <div className="val"><span className="vi">❀</span><div><h4>Materiais seguros</h4><p>Tecidos selecionados, seguros para os primeiros anos.</p></div></div>
            </div>
            <p className="sig">Aladiane</p>
          </div>
        </div>
      </section>

      <section id="colecoes" style={{ padding: 'clamp(70px,9vw,100px) 0' }}>
        <div className="wrap">
          <div className="sh rv">
            <span className="ey">Para cada momento</span>
            <h2>Nossas <em>Coleções</em></h2>
            <p className="sub">Explore as categorias e encontre a peça perfeita</p>
          </div>
          <div className="cc-grid rv" dangerouslySetInnerHTML={{ __html: especialCards }} />
        </div>
      </section>

      <section className="produtos" id="produtos">
        <div className="wrap">
          <div className="sh rv">
            <span className="ey">Novos produtos</span>
            <h2>Nossos <em>Produtos</em></h2>
            <p className="sub">Cada personagem tem personalidade própria. Cerca de 33cm de puro carinho.</p>
          </div>
          <div className="filters rv" id="filters" dangerouslySetInnerHTML={{ __html: filterButtons }} />
          <div className="grid" id="grid" dangerouslySetInnerHTML={{ __html: productCards }} />
          <p className="cnote rv">As <b>roupinhas</b> têm troca de cor sob encomenda. Cada <b>porta maternidade</b> é personalizada com o nome e o bichinho do bebê.</p>
        </div>
      </section>

      <section className="quote rv">
        <div className="wrap quote-g">
          <div className="quote-cp">
            <div className="qm">&ldquo;</div>
            <blockquote>Cada bichinho conta uma história. Para <span>decorar o quartinho</span>, presentear ou <span>eternizar uma fase tão especial</span>. Seja bem-vindo ao nosso mundo de suavidade e ternura.</blockquote>
            <p className="by">Aladiane, Fundadora da Maricota</p>
            <p className="qsig">com carinho</p>
          </div>
          <div className="quote-illo">
            <svg viewBox="0 0 260 180" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor">
              <rect x="22" y="120" width="216" height="28" rx="10"/><path d="M42 120V64Q42 44 62 44L198 44Q218 44 218 64V120"/><path d="M84 44V24Q84 12 98 12L174 12Q188 12 188 24V44"/>
              <line x1="136" y1="44" x2="136" y2="96"/><path d="M130 92L136 116L142 92"/><path d="M122 106Q129 103 136 106Q143 103 150 106"/>
              <rect x="58" y="70" width="58" height="36" rx="7"/><circle cx="76" cy="88" r="5"/><circle cx="94" cy="88" r="5"/><circle cx="112" cy="88" r="5"/>
              <circle cx="190" cy="88" r="21"/><circle cx="190" cy="88" r="8"/>
              <line x1="190" y1="67" x2="190" y2="109" strokeWidth="1"/><line x1="169" y1="88" x2="211" y2="88" strokeWidth="1"/>
              <line x1="175" y1="73" x2="205" y2="103" strokeWidth="1"/><line x1="205" y1="73" x2="175" y2="103" strokeWidth="1"/>
              <ellipse cx="118" cy="20" rx="13" ry="7"/><line x1="118" y1="13" x2="118" y2="27"/>
              <path d="M118 27Q127 46 131 64Q134 80 136 96" strokeDasharray="3 3"/>
            </svg>
          </div>
        </div>
      </section>

      <section className="encomendar" id="encomendar">
        <div className="wrap">
          <div className="sh rv"><span className="ey">Como encomendar</span><h2>Tudo que você <em>precisa saber</em></h2></div>
          <div className="pcards rv">
            <div className="pcard"><span className="pi">✎</span><h3>Feito por encomenda</h3><p>Cada peça é produzida com dedicação após o pedido. Consulte o prazo de produção disponível.</p><span className="ptag">Prazo sob consulta</span></div>
            <div className="pcard"><span className="pi">✈</span><h3>Frete para todo o Brasil</h3><p>Enviamos com todo carinho para qualquer canto do país. O amor da Maricota chega até você.</p><span className="ptag">Todo o Brasil</span></div>
            <div className="pcard"><span className="pi">♥</span><h3>Formas de pagamento</h3><p>Pix ou link de pagamento. Cartão de crédito via link, com acréscimo da taxa da plataforma.</p><span className="ptag">Pix e Crédito</span></div>
          </div>
          <div className="cta-band rv">
            <span className="cta-weave"></span>
            <div className="cta-cp">
              <h3>Vamos criar a sua peça?</h3>
              <p>Conte qual bichinho, roupinha ou porta maternidade você sonha. Respondo com todo carinho.</p>
            </div>
            <a className="btn-wa" href={waUrl} target="_blank" rel="noopener">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" /></svg>
              Encomendar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="ft-illo">
            <svg viewBox="0 0 260 180" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="22" y="120" width="216" height="28" rx="10"/><path d="M42 120V64Q42 44 62 44L198 44Q218 44 218 64V120"/><path d="M84 44V24Q84 12 98 12L174 12Q188 12 188 24V44"/>
              <line x1="136" y1="44" x2="136" y2="96"/><path d="M130 92L136 116L142 92"/>
              <rect x="58" y="70" width="58" height="36" rx="7"/><circle cx="76" cy="88" r="5"/><circle cx="94" cy="88" r="5"/><circle cx="112" cy="88" r="5"/>
              <circle cx="190" cy="88" r="21"/><circle cx="190" cy="88" r="8"/>
              <line x1="190" y1="67" x2="190" y2="109" strokeWidth="1"/><line x1="169" y1="88" x2="211" y2="88" strokeWidth="1"/>
              <ellipse cx="118" cy="20" rx="13" ry="7"/><path d="M118 27Q127 46 131 64Q134 80 136 96" strokeDasharray="3 3"/>
            </svg>
          </div>
          <img className="ft-logo" src="/images/logo-maricota.png" alt="Maricota" />
          <p className="ft-tag">Maternidade dos sonhos, feita com amor <span className="ft-heart">♥</span></p>
          <div className="ft-links">
            <a href={waUrl} target="_blank" rel="noopener">WhatsApp</a>
            <a href="https://instagram.com/maricota" target="_blank" rel="noopener">@maricota</a>
          </div>
          <p className="ft-meta">Feito à mão · Brasil · Desde 2024</p>
        </div>
      </footer>

      <a className="fab" id="fab" href={waUrl} target="_blank" rel="noopener" aria-label="Encomendar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" /></svg>
        <span>Encomendar</span>
      </a>

      <div className="lb" id="lb" role="dialog" aria-modal="true">
        <div className="lb-in">
          <button className="lb-cl" id="lbClose" aria-label="Fechar">✕</button>
          <button className="lb-nav prev" id="lbPrev" aria-label="Anterior">‹</button>
          <button className="lb-nav next" id="lbNext" aria-label="Próximo">›</button>
          <div className="lb-stage"><img id="lbImg" alt="" /></div>
          <div className="lb-side">
            <p className="lb-cat" id="lbCat"></p>
            <h3 className="lb-name" id="lbName"></h3>
            <p className="lb-det" id="lbDet"></p>
            <p className="lb-price" id="lbPrice"></p>
            <div className="lb-dots" id="lbDots"></div>
            <a className="lb-wa" href={waUrl} target="_blank" rel="noopener">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2 1.2.9 1.6.9 1.9 1.1.2.1.4.1.5-.1l.6-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.8-.1 1.4Z" /></svg>
              Quero esta peça
            </a>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{ __html: js }} />
    </>
  )
}
