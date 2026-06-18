export function getHomeScript(waUrl: string): string {
  return `
(function(){
const nav=document.getElementById('nav'),fab=document.getElementById('fab');
if(nav&&fab){
  const onScroll=()=>{nav.classList.toggle('sc',scrollY>20);fab.classList.toggle('show',scrollY>520)};
  addEventListener('scroll',onScroll,{passive:true});onScroll();
}
const burger=document.getElementById('burger'),mmenu=document.getElementById('mmenu');
if(burger&&mmenu){
  const toggleMenu=(o)=>{const op=o??!mmenu.classList.contains('op');mmenu.classList.toggle('op',op);burger.classList.toggle('op',op);document.body.style.overflow=op?'hidden':''};
  burger.addEventListener('click',()=>toggleMenu(undefined));
  mmenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
}
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');io.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -6% 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));
requestAnimationFrame(()=>requestAnimationFrame(()=>{document.querySelectorAll('.rv:not(.vis)').forEach(el=>{if(el.getBoundingClientRect().top<window.innerHeight*.94)el.classList.add('vis')})}));
const ctrack=document.getElementById('ctrack'),cdots=document.getElementById('cdots');
if(ctrack&&cdots){
  const orig=[...ctrack.children];
  const n=orig.length;
  if(n>1){
    ctrack.appendChild(orig[0].cloneNode(true));
    ctrack.insertBefore(orig[n-1].cloneNode(true),orig[0]);
  }
  let ci=1,ct=null,snapping=false;
  const jump=(idx)=>{snapping=true;ctrack.style.transition='none';ci=idx;ctrack.style.transform='translateX(-'+ci*100+'%)';void ctrack.offsetWidth;ctrack.style.transition='';snapping=false};
  const sync=()=>{const di=((ci-1)%n+n)%n;[...cdots.children].forEach((d,i)=>d.classList.toggle('on',i===di))};
  const goTo=(idx)=>{ci=idx;ctrack.style.transform='translateX(-'+ci*100+'%)';sync()};
  const step=(dir)=>goTo(ci+dir);
  for(let i=0;i<n;i++){const d=document.createElement('button');d.className='cdot'+(i===0?' on':'');d.setAttribute('aria-label','Slide '+(i+1));d.addEventListener('click',()=>{clearInterval(ct);goTo(i+1);ct=setInterval(()=>step(1),4200)});cdots.appendChild(d)}
  jump(1);
  ctrack.addEventListener('transitionend',e=>{if(snapping||e.propertyName!=='transform')return;if(ci<=0)jump(n);else if(ci>=n+1)jump(1)});
  if(n>1)ct=setInterval(()=>step(1),4200);
  let tx=0,ty=0,locked=false;
  ctrack.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;locked=false},{passive:true});
  ctrack.addEventListener('touchmove',e=>{if(locked)return;const dx=Math.abs(e.touches[0].clientX-tx),dy=Math.abs(e.touches[0].clientY-ty);if(dx>dy&&dx>8){locked=true;e.preventDefault()}},{passive:false});
  ctrack.addEventListener('touchend',e=>{if(!locked)return;const dx=e.changedTouches[0].clientX-tx;clearInterval(ct);step(dx<0?1:-1);ct=setInterval(()=>step(1),4200);locked=false},{passive:true});
}
const cards=[...document.querySelectorAll('.card')];
const goFilter=(f)=>{
  document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('on',x.dataset.filter===f));
  cards.forEach(c=>c.hidden=!(f==='todos'||c.dataset.category===f));
  const el=document.getElementById('produtos');
  if(el){const top=el.getBoundingClientRect().top+scrollY-60;window.scrollTo({top,behavior:'smooth'})}
};
const filtersEl=document.getElementById('filters');
if(filtersEl)filtersEl.addEventListener('click',e=>{const b=e.target.closest('.filter');if(b)goFilter(b.dataset.filter)});
document.querySelectorAll('.filter').forEach(f=>{const k=f.dataset.filter;const n=k==='todos'?cards.length:cards.filter(c=>c.dataset.category===k).length;const s=document.createElement('span');s.className='n';s.textContent=n;f.appendChild(s)});
document.querySelectorAll('.cc[data-filter]').forEach(c=>c.addEventListener('click',()=>goFilter(c.dataset.filter)));
const lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),
  lbCat=document.getElementById('lbCat'),lbName=document.getElementById('lbName'),
  lbDet=document.getElementById('lbDet'),lbPrice=document.getElementById('lbPrice'),
  lbDots=document.getElementById('lbDots'),lbPrev=document.getElementById('lbPrev'),lbNext=document.getElementById('lbNext'),
  lbWaBtn=document.querySelector('.lb-wa');
const globalWaUrl='${waUrl}';
if(lb&&lbImg&&lbPrev&&lbNext&&lbDots&&lbCat&&lbName&&lbDet&&lbPrice){
  let gallery=[],gi=0;
  const paint=()=>{lbImg.style.opacity=0;lbImg.onload=()=>lbImg.style.opacity=1;lbImg.src=gallery[gi];if(lbImg.complete)lbImg.style.opacity=1;[...lbDots.children].forEach((d,i)=>d.classList.toggle('on',i===gi))};
  const resolveWa=(raw)=>{if(!raw)return globalWaUrl;if(raw.startsWith('http'))return raw;const digits=raw.replace(/\\D/g,'');return'https://wa.me/'+digits};
  const openLB=(card)=>{
    gallery=card.dataset.images.split('|').filter(Boolean);gi=0;
    lbCat.textContent=card.dataset.catLabel;
    lbName.innerHTML=card.querySelector('.card-name').innerHTML;
    lbDet.textContent=card.dataset.det;lbPrice.textContent=card.dataset.price;
    if(lbWaBtn)lbWaBtn.href=resolveWa(card.dataset.wa||'');
    lbDots.innerHTML='';const multi=gallery.length>1;
    lbPrev.hidden=lbNext.hidden=!multi;
    if(multi)gallery.forEach((_,i)=>{const d=document.createElement('i');d.onclick=()=>{gi=i;paint()};lbDots.appendChild(d)});
    paint();lb.classList.add('open');document.body.style.overflow='hidden';
  };
  const closeLB=()=>{lb.classList.remove('open');document.body.style.overflow=''};
  cards.forEach(c=>c.addEventListener('click',()=>openLB(c)));
  lbPrev.onclick=()=>{gi=(gi-1+gallery.length)%gallery.length;paint()};
  lbNext.onclick=()=>{gi=(gi+1)%gallery.length;paint()};
  const lbCloseEl=document.getElementById('lbClose');
  if(lbCloseEl)lbCloseEl.onclick=closeLB;
  lb.addEventListener('click',e=>{if(e.target===lb)closeLB()});
  addEventListener('keydown',e=>{if(e.key==='Escape')closeLB()});
}
})();`
}
