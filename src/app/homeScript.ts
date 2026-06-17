export function getHomeScript(waUrl: string): string {
  return `
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
let tx=0,ty=0,hSwipe=false;
const cframe=document.getElementById('cframe');
cframe.addEventListener('touchstart',e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;hSwipe=false},{passive:true});
cframe.addEventListener('touchmove',e=>{const dx=Math.abs(e.touches[0].clientX-tx),dy=Math.abs(e.touches[0].clientY-ty);if(!hSwipe&&(dx>5||dy>5))hSwipe=dx>dy;if(hSwipe)e.preventDefault()},{passive:false});
cframe.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40){clearInterval(ct);goC(ci+(dx>0?-1:1));ct=setInterval(()=>goC(ci+1),4200)}},{passive:true});
const cards=[...document.querySelectorAll('.card')];
function goFilter(f){
  document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('on',x.dataset.filter===f));
  cards.forEach(c=>c.hidden=!(f==='todos'||c.dataset.category===f));
  const el=document.getElementById('produtos');
  if(el){const top=el.getBoundingClientRect().top+scrollY-60;window.scrollTo({top,behavior:'smooth'})}
}
document.getElementById('filters').addEventListener('click',e=>{const b=e.target.closest('.filter');if(b)goFilter(b.dataset.filter)});
document.querySelectorAll('.filter').forEach(f=>{const k=f.dataset.filter;const n=k==='todos'?cards.length:cards.filter(c=>c.dataset.category===k).length;const s=document.createElement('span');s.className='n';s.textContent=n;f.appendChild(s)});
document.querySelectorAll('.cc[data-filter]').forEach(c=>c.addEventListener('click',()=>goFilter(c.dataset.filter)));
const lb=document.getElementById('lb'),lbImg=document.getElementById('lbImg'),
  lbCat=document.getElementById('lbCat'),lbName=document.getElementById('lbName'),
  lbDet=document.getElementById('lbDet'),lbPrice=document.getElementById('lbPrice'),
  lbDots=document.getElementById('lbDots'),lbPrev=document.getElementById('lbPrev'),lbNext=document.getElementById('lbNext'),
  lbWaBtn=document.querySelector('.lb-wa');
const globalWaUrl='${waUrl}';
let gallery=[],gi=0;
function paint(){lbImg.style.opacity=0;lbImg.onload=()=>lbImg.style.opacity=1;lbImg.src=gallery[gi];if(lbImg.complete)lbImg.style.opacity=1;[...lbDots.children].forEach((d,i)=>d.classList.toggle('on',i===gi))}
function resolveWa(raw){if(!raw)return globalWaUrl;if(raw.startsWith('http'))return raw;const digits=raw.replace(/\\D/g,'');return'https://wa.me/'+digits}
function openLB(card){
  gallery=card.dataset.images.split('|').filter(Boolean);gi=0;
  lbCat.textContent=card.dataset.catLabel;
  lbName.innerHTML=card.querySelector('.card-name').innerHTML;
  lbDet.textContent=card.dataset.det;lbPrice.textContent=card.dataset.price;
  if(lbWaBtn)lbWaBtn.href=resolveWa(card.dataset.wa||'');
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
}
