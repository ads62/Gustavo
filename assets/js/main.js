(()=>{
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
$('#y').textContent=new Date().getFullYear();
const mb=$('.mbtn'),nav=$('#nav'),hd=$('.hd');
let lockY=0,locks=0;
const lock=on=>{if(on){if(locks++===0){lockY=scrollY;document.body.style.top=`-${lockY}px`;document.body.classList.add('lock')}}
  else if(locks>0&&--locks===0){document.body.classList.remove('lock');document.body.style.top='';scrollTo({top:lockY,behavior:'instant'})}};
let menuOn=false;
const closeNav=()=>{if(!menuOn)return;menuOn=false;nav.classList.remove('open');mb.setAttribute('aria-expanded',false);mb.textContent='Menu';lock(false)};
mb.addEventListener('click',()=>{if(menuOn)return closeNav();menuOn=true;nav.classList.add('open');mb.setAttribute('aria-expanded',true);mb.textContent='Fechar';lock(true)});
addEventListener('resize',()=>{if(innerWidth>720)closeNav()});
$$('#nav a').forEach(a=>a.addEventListener('click',e=>{if(menuOn){e.preventDefault();closeNav();const t=$(a.getAttribute('href'));if(t)setTimeout(()=>t.scrollIntoView(),30)}}));

// ajusta o nome do hero à largura (também protege contra fonte de reserva mais larga)
const h1=$('.hero h1');
const fit=()=>{h1.style.fontSize='';const sp=$$('span',h1),col=getComputedStyle(h1).flexDirection==='column';
  const need=col?Math.max(...sp.map(s=>s.scrollWidth)):sp.reduce((a,s)=>a+s.scrollWidth,0)+16,k=h1.clientWidth/need;
  if(k<1)h1.style.fontSize=(parseFloat(getComputedStyle(h1).fontSize)*k*.98).toFixed(1)+'px'};
fit();addEventListener('resize',fit);if(document.fonts)document.fonts.ready.then(fit);

// palavras da frase da marca
$$('[data-words]').forEach(p=>{
  p.setAttribute('aria-label',p.textContent.trim());
  p.innerHTML=p.textContent.trim().split(/\s+/).map((w,i)=>`<span class="w" aria-hidden="true"><span style="transition-delay:${i*45}ms">${w}</span></span> `).join('');
});

// entrada por viewport
const io='IntersectionObserver' in window&&!reduce?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);if(e.target.dataset.count)count(e.target)}}),{threshold:.2}):null;
const targets=$$('.stock li,[data-words],[data-count]');
if(io)targets.forEach(t=>io.observe(t));else{document.body.classList.add('no-io');targets.forEach(t=>t.classList.add('in'))}
function count(el){const to=parseFloat(el.dataset.count),t0=performance.now();
  const f=t=>{const k=Math.min(1,(t-t0)/1400),v=to*(1-Math.pow(1-k,3));el.textContent=v.toFixed(1).replace('.',',');if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}

// scroll: um único handler com rAF
if(!reduce){
  const hero=$('.hero'),bi=$('.band-in');let t=false;
  const cl=v=>Math.max(0,Math.min(1,v));
  const run=()=>{t=false;const h=innerHeight;
    hero.style.setProperty('--hp',cl(scrollY/h).toFixed(3));
    const r=bi.getBoundingClientRect();bi.style.setProperty('--bp',cl((h*.95-r.top)/(h*.6)).toFixed(3));
    hd.classList.toggle('sc',scrollY>40)};
  addEventListener('scroll',()=>{if(!t){t=true;requestAnimationFrame(run)}},{passive:true});run();
}else hd.classList.add('sc'),$('.band-in').style.setProperty('--bp',1);

// ficha do veículo: painel que se abre a partir da foto clicada
const vm=$('#vm'),px=$('.px'),pimg=$('#vm-img'),main=$('main'),rootEl=document.documentElement;
let from='',last=null,sy=0,isOpen=false,tm=0;
const set=(id,v)=>{$(id).textContent=v};
const spec=(k,v)=>`<div><dt>${k}</dt><dd>${v}</dd></div>`;
const esc=t=>String(t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function show(src,alt){pimg.classList.add('sw');setTimeout(()=>{pimg.onload=()=>{pimg.style.maxWidth=Math.round(pimg.naturalWidth*1.25)+'px';pimg.classList.remove('sw')};pimg.src=src;pimg.alt=alt;if(pimg.complete)pimg.onload()},reduce?0:180)}
function fill(d){
  const [brand,...rest]=d.name.split(' ');
  set('#vm-brand',brand);set('#vm-name',rest.join(' '));
  set('#vm-sub',`${d.type}, ${d.color.toLowerCase()}`+(d.year?` · ${d.year}`:''));
  const pr=$('#vm-price');pr.hidden=!d.price;if(d.price)pr.textContent=d.price;
  // somente dados reais: campos sem informação não aparecem
  const f=[['Marca',brand],['Modelo',rest.join(' ')],['Categoria',d.type],['Cor',d.color],['Ano',d.year],['Quilometragem',d.km],['Combustível',d.fuel],['Câmbio',d.gear],['Versão',d.version]].filter(x=>x[1]);
  $('#vm-specs').innerHTML=f.map(x=>spec(x[0],esc(x[1]))).join('');
  $('#vm-note').textContent=(d.year&&d.km)?'':'Ano, quilometragem e condições de pagamento: fale com a equipe.';
  $('#vm-wa').href='https://wa.me/5535998188845?text='+encodeURIComponent('Olá! Tenho interesse no '+d.name+' '+d.color.toLowerCase()+' que vi no site.');
  const imgs=(d.imgs||d.img).split(',').map(x=>x.trim()),th=$('#vm-th');
  th.innerHTML=imgs.length>1?imgs.map((s,i)=>`<button type="button" data-i="${i}" aria-label="Foto ${i+1}" aria-current="${i==0}"><img src="${s}" alt=""></button>`).join(''):'';
  th.onclick=e=>{const b=e.target.closest('button');if(!b)return;$$('button',th).forEach(x=>x.setAttribute('aria-current',x===b));show(imgs[b.dataset.i],d.alt)};
  pimg.style.maxWidth='';pimg.onload=()=>{pimg.style.maxWidth=Math.round(pimg.naturalWidth*1.25)+'px'};pimg.src=imgs[0];pimg.alt=d.alt;
}
function openV(c){
  if(isOpen)return;isOpen=true;last=c;clearTimeout(tm);
  const r=c.querySelector('.ph').getBoundingClientRect();
  fill(c.dataset);sy=scrollY;
  lock(true);main.inert=true;$('.hd').inert=true;
  vm.hidden=false;vm.scrollTop=0;
  from=`inset(${r.top}px ${innerWidth-r.right}px ${innerHeight-r.bottom}px ${r.left}px)`;
  if(!reduce)vm.animate({clipPath:[from,'inset(0)']},{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
  requestAnimationFrame(()=>{vm.classList.add('open');px.focus({preventScroll:true})});
}
function closeV(){
  if(!isOpen)return;isOpen=false;vm.classList.remove('open');
  const end=()=>{vm.hidden=true;lock(false);main.inert=false;$('.hd').inert=false;if(last)last.focus({preventScroll:true})};
  if(reduce){end();return}
  vm.animate({clipPath:['inset(0)',from]},{duration:450,easing:'cubic-bezier(.6,0,.2,1)'});
  tm=setTimeout(end,440);
}
$$('.v').forEach(c=>c.addEventListener('click',()=>openV(c)));
px.addEventListener('click',closeV);
vm.addEventListener('click',e=>{if(e.target===vm||e.target.classList.contains('pwrap')||e.target.classList.contains('pg'))closeV()});
document.addEventListener('keydown',e=>{
  if(!isOpen)return;
  if(e.key==='Escape'){e.preventDefault();closeV()}
  else if(e.key==='Tab'){const f=$$('button,a[href]',vm).filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];
    if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const t=$$('#vm-th button');if(t.length>1){const i=t.findIndex(x=>x.getAttribute('aria-current')==='true'),n=(i+(e.key==='ArrowRight'?1:t.length-1))%t.length;t[n].click()}}
});

// cursor
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
  const cur=$('.cur'),lab=$('.curl'),root=document.documentElement;
  addEventListener('mousemove',e=>{
    root.classList.add('hc');
    const p=`translate3d(${e.clientX}px,${e.clientY}px,0)`;
    cur.style.transform=p;lab.style.transform=p;
  },{passive:true});
  document.addEventListener('mouseover',e=>{
    const v=e.target.closest('[data-cursor]'),l=e.target.closest('a,button');
    lab.classList.toggle('on',!!v);
    cur.classList.toggle('link',!!l&&!v);cur.classList.toggle('hov',!!v);
  });
  addEventListener('mousedown',()=>cur.classList.add('dn'));addEventListener('mouseup',()=>cur.classList.remove('dn'));
  const map=$('#map');if(map){map.addEventListener('mouseenter',()=>{root.classList.remove('hc');cur.style.opacity=0;lab.classList.remove('on')});map.addEventListener('mouseleave',()=>{cur.style.opacity=''})}
  document.addEventListener('mouseleave',()=>cur.style.opacity=0);
  document.addEventListener('mouseenter',()=>cur.style.opacity='');
}
})();
