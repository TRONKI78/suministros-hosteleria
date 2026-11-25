// App del cliente: catálogo, carrito, pedidos y cuenta.
(function(){
const IVA=0.21;
const {CATS,P}=window.SH_DATA;
const catBg=Object.fromEntries(CATS.map(c=>[c[0],c[3]]));
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const RANK=[[5,412],[13,377],[17,298],[1,251],[15,190]];
const CLIENTE='Bar La Lonja';
const SLOTS=[['Mañana','8–11 h'],['Mañana','11–14 h'],['Jueves','8–11 h']];
let orders=window.SH_DATA.ORDERS.map(o=>({...o}));
const $=s=>document.querySelector(s);
const eur=n=>n.toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let cart={}, cat='todo', q='', iva=true, slot=0, points=1840;
try{const s=JSON.parse(localStorage.getItem('sh-pedidos')||'{}');cart=s.cart||{};iva=s.ivaIncl!==undefined?!!s.ivaIncl:true;if(s.points)points=s.points;if(s.orders)orders=s.orders}catch(e){}
const save=()=>{try{localStorage.setItem('sh-pedidos',JSON.stringify({cart,ivaIncl:iva,points,orders}))}catch(e){}};
const show=v=>iva?v*(1+IVA):v;
const sumItems=it=>it.reduce((s,[id,n])=>s+byId[id].p*n,0);
const items=()=>Object.entries(cart).filter(([,n])=>n>0).map(([id,n])=>[+id,n]);

function stepper(id,n){return `<div class="step"><button class="minus" data-dec="${id}" aria-label="Quitar uno">−</button><output>${n}</output><button class="plus" data-inc="${id}" aria-label="Añadir uno">+</button></div>`}
function card(p){
  const n=cart[p.id]||0, cls=p.out?'':p.o?' hl':p.low?' low':'';
  const tag=p.out?'<span class="pill out">Agotado</span>':p.o?`<span class="pill gold">-${Math.round((1-p.p/p.o)*100)} %</span>`:p.low?`<span class="pill coral">Quedan ${p.low}</span>`:'';
  return `<article class="pcard${cls}"><button class="thumb" style="background:${catBg[p.cat]}" data-open="${p.id}" aria-label="Ver ficha de ${esc(p.n)}">${p.e}</button>
  <div class="pbody"><div class="tags"><span class="ref">${p.ref}</span>${tag}</div><h3>${p.n}</h3><span class="meta">${p.f}</span>
  <div class="prow"><div class="price">${eur(show(p.p))}${p.o?`<s>${eur(show(p.o))}</s>`:''}<small>${iva?'IVA incluido':'+ IVA'}</small></div>
  ${p.out?'<button class="btn btn-ghost add" disabled>Agotado</button>':n?stepper(p.id,n):`<button class="btn btn-soft add" data-inc="${p.id}">Añadir</button>`}</div></div></article>`;
}
function renderList(){
  const t=q.trim().toLowerCase();
  const l=P.filter(p=>(cat==='todo'||p.cat===cat)&&(!t||(p.n+' '+p.f+' '+p.ref).toLowerCase().includes(t)));
  $('#list').innerHTML=l.length?l.map(card).join(''):`<div class="empty"><span class="emo">🤔</span>No hay productos con «${esc(q)}». Prueba con «mantel» o «lejía».</div>`;
}
function renderChips(){
  $('#chips').innerHTML=[['todo','Todo'],...CATS].map(([k,l])=>`<button class="chip" data-cat="${k}" aria-pressed="${k===cat}">${l}</button>`).join('');
}
function renderHome(){
  $('#flashP').textContent=eur(show(byId[7].p))+(iva?'':' + IVA');
  $('#cats').innerHTML=CATS.map(([k,l,e,bg])=>`<button class="cat" data-gocat="${k}"><span class="emo" style="background:${bg}">${e}</span>${l}<small>${P.filter(p=>p.cat===k).length} productos</small></button>`).join('');
  const medal=['👑','🥈','🥉'];
  $('#rank').innerHTML=RANK.map(([id,u],i)=>{const p=byId[id];return `<button class="ritem${i<3?' r'+(i+1):''}" data-open="${id}">
    <span class="pos">${i===0?'<span class="crown">👑</span>':i<3?medal[i]:i+1}</span><span class="av">${p.e}</span>
    <span class="nm">${p.n}<small>${p.f}</small></span><span class="sc">${u}</span></button>`}).join('');
  const goal=2500, pct=Math.min(100,points/goal*100);
  $('#lvlTxt').innerHTML=`Te faltan <b>${eur(Math.max(0,goal-points))}</b> este año para <b>Platino</b> (−3 % en todo)`;
  $('#lvlBar i').style.width=pct+'%';
  $('#ptsBig').textContent=points.toLocaleString('es-ES')+' PUNTOS';
  $('#ptsBar i').style.width=(points%500)/5+'%';
  $('#ivaSw').setAttribute('aria-checked',iva);
}
const ST={reparto:['🚚 En reparto','sky'],prep:['📦 Preparando','gold'],ok:['✔ Entregado','ok']};
function renderOrders(){
  $('#orders').innerHTML=orders.map((o,i)=>{const [lbl,c]=ST[o.st], base=sumItems(o.items), u=o.items.reduce((s,[,n])=>s+n,0);
    const step=o.st==='prep'?1:o.st==='reparto'?3:4;
    return `<div class="ocard${o.st!=='ok'?' live':''}"><div class="ohead"><b>${o.n}</b><span class="pill ${c}">${lbl}</span></div>
    ${o.st!=='ok'?`<div class="track">${['Recibido','Preparado','En ruta','Entregado'].map((s,k)=>`<div class="${k<step?'done':''}"><i></i>${s}</div>`).join('')}</div>`:''}
    <p>${o.d} · ${u} uds · ${o.items.map(([id,n])=>`${n}× ${byId[id].n}`).join(' · ')}</p>
    <div class="ofoot"><span class="price">${eur(base*(1+IVA))}<small>IVA incluido</small></span><div class="oacts"><button class="btn btn-ghost" data-fact="${i}">Factura</button><button class="btn btn-ghost" data-repeat="${i}">Repetir</button></div></div></div>`}).join('');
}
function renderCart(){
  const it=items(), u=it.reduce((s,[,n])=>s+n,0), base=sumItems(it), tot=base*(1+IVA);
  const b=$('#badge'); if(b.textContent!==String(u||'')){b.textContent=u||'';b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop')}
  $('#cbar').hidden=!u; $('#app').classList.toggle('has-cart',!!u);
  $('#cbarN').textContent=`${u} ${u===1?'artículo':'artículos'} · Ver pedido`; $('#cbarT').textContent=eur(tot);
  $('#lines').innerHTML=it.length?it.map(([id,n])=>{const p=byId[id];return `<li><span class="thumb" style="background:${catBg[p.cat]}">${p.e}</span><span class="nm">${p.n}<small>${n} × ${eur(show(p.p))} = ${eur(show(p.p*n))} ${iva?'IVA incl.':'+ IVA'}</small></span>${stepper(id,n)}</li>`}).join('')
    :`<li class="empty"><span class="emo">🍽️</span>Tu pedido está vacío. Añade productos desde el catálogo.</li>`;
  $('#cartBody').hidden=!it.length;
  $('#slots').innerHTML=SLOTS.map(([d,h],i)=>`<button data-slot="${i}" aria-pressed="${i===slot}">${d}<small>${h}</small></button>`).join('');
  $('#sum').innerHTML=`<div><span>Base imponible</span><span>${eur(base)}</span></div>
    <div><span>IVA 21 %</span><span>${eur(base*IVA)}</span></div><div class="big"><span>Total</span><span>${eur(tot)}</span></div>`;
}
function renderDetail(id){
  const p=byId[id], n=cart[id]||0;
  $('#det').innerHTML=`<div class="dart" style="background:${catBg[p.cat]}">${p.e}</div>
  <div class="dinfo"><div class="tags"><span class="ref">REF. ${p.ref}</span>${p.o?'<span class="pill gold">Oferta flash</span>':''}${p.low?`<span class="pill coral">Quedan ${p.low}</span>`:''}</div>
  <h3>${p.n}</h3><span class="meta">${p.f}</span></div>
  <div class="specs">${p.s.map(([k,v])=>`<div><span>${k.toUpperCase()}</span><b>${v}</b></div>`).join('')}</div>
  <div class="dbuy"><div class="price">${eur(show(p.p))}${p.o?`<s>${eur(show(p.o))}</s>`:''}<small>${iva?'IVA incluido':'+ IVA'}</small></div>
  ${p.out?'<button class="btn btn-ghost" disabled>Agotado</button>':n?stepper(id,n):`<button class="btn btn-primary" data-inc="${id}">Añadir al pedido</button>`}</div>`;
}
let detId=null;
function renderAll(){renderList();renderCart();if(detId)renderDetail(detId)}

let tt; function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),1800)}
function sheet(id){['#cartSheet','#detSheet'].forEach(s=>$(s).classList.toggle('on',s===id));$('#shade').classList.toggle('on',!!id);if(id!=='#detSheet')detId=null}
function change(id,d){if(d>0&&byId[id].out)return;cart[id]=Math.max(0,(cart[id]||0)+d);if(!cart[id])delete cart[id];save();renderAll();if(d>0&&cart[id]===1)toast(`${byId[id].e} Añadido al pedido`)}

function confirmOrder(){
  const it=items(); if(!it.length) return;
  const base=sumItems(it), num='SH-'+(25842+Math.floor(Math.random()*90));
  const now=new Date();orders.unshift({n:num,d:'hoy',fecha:now.toISOString(),h:now.toTimeString().slice(0,5),st:'prep',items:it,precios:Object.fromEntries(it.map(([id])=>[id,byId[id].p])),slot:SLOTS[slot].join(' '),notes:$('#notes').value.trim()});$('#notes').value=''; const earned=Math.floor(base); points+=earned;
  cart={}; save(); sheet(null); renderAll(); renderOrders(); renderHome();
  $('#winNum').textContent=num;
  $('#winTxt').textContent=`Llega ${SLOTS[slot][0].toLowerCase()} entre las ${SLOTS[slot][1]}. Te avisaremos cuando salga el camión.`;
  $('#winPts').textContent=`+${earned} puntos ⭐`;
  const cols=['#2BA8A2','#FFD23F','#EF6C4A','#5DADE2','#3CC4BD','#FFE47A'];
  $('#confetti').innerHTML=Array.from({length:14},(_,i)=>{const w=6+Math.random()*8,h=Math.random()<.4?w:w*1.8;
    return `<i style="left:${4+i*6.8}%;width:${w}px;height:${h}px;background:${cols[i%6]};border-radius:${i%3===0?'50%':'2px'};animation-duration:${(3.2+Math.random()*1.3).toFixed(2)}s;animation-delay:${(Math.random()*1.5).toFixed(2)}s"></i>`}).join('');
  $('#win').hidden=false;
}

document.addEventListener('click',e=>{
  const b=e.target.closest('button,[data-close]'); if(!b) return;
  const d=b.dataset;
  if(d.inc) change(+d.inc,1);
  else if(d.dec) change(+d.dec,-1);
  else if(d.cat){cat=d.cat;renderChips();renderList()}
  else if(d.gocat){cat=d.gocat;renderChips();renderList();location.hash='catalogo'}
  else if(d.open){detId=+d.open;renderDetail(detId);sheet('#detSheet')}
  else if(d.slot!==undefined){slot=+d.slot;renderCart()}
  else if(d.fact!==undefined) window.SH_FACTURA.abrir(orders[+d.fact],CLIENTE);
  else if(d.repeat!==undefined){orders[+d.repeat].items.forEach(([id,n])=>{if(!byId[id].out)cart[id]=(cart[id]||0)+n});save();renderAll();sheet('#cartSheet');toast('🔁 Pedido cargado: ajusta cantidades')}
  else if(b.hasAttribute('data-close')) sheet(null);
});
$('#cartBtn').onclick=()=>sheet('#cartSheet');
$('#cbarBtn').onclick=()=>sheet('#cartSheet');
$('#shade').onclick=()=>sheet(null);
$('#confirmBtn').onclick=confirmOrder;
$('#winBtn').onclick=()=>{$('#win').hidden=true;location.hash='pedidos'};
$('#winFact').onclick=()=>{$('#win').hidden=true;location.hash='pedidos';window.SH_FACTURA.abrir(orders[0],CLIENTE)};
document.addEventListener('keydown',e=>{if(e.key==='Escape'){sheet(null);$('#win').hidden=true}});
$('#q').addEventListener('input',e=>{q=e.target.value;renderList()});
$('#ivaSw').onclick=()=>{iva=!iva;save();renderHome();renderAll();toast(iva?'Precios con IVA':'Precios sin IVA')};
$('#copyTel').onclick=()=>{try{navigator.clipboard.writeText('600000000').then(()=>toast('📋 Teléfono copiado'),()=>toast('Mantén pulsado el número para copiarlo'))}catch(err){toast('Mantén pulsado el número para copiarlo')}};

// Cuenta atrás de la oferta flash (termina a medianoche)
function tick(){const now=new Date(),end=new Date(now);end.setHours(24,0,0,0);let s=Math.floor((end-now)/1000);
  const h=String(Math.floor(s/3600)).padStart(2,'0'),m=String(Math.floor(s%3600/60)).padStart(2,'0'),x=String(s%60).padStart(2,'0');$('#timer').textContent=`${h}:${m}:${x}`}
tick();setInterval(tick,1000);

const VIEWS=['inicio','catalogo','pedidos','cuenta'];
function route(){const v=(location.hash||'#inicio').slice(1), ok=VIEWS.includes(v)?v:'inicio';
  VIEWS.forEach(k=>$('#v-'+k).hidden=k!==ok);
  document.querySelectorAll('.tabs a').forEach(a=>a.dataset.v===ok?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  window.scrollTo(0,0)}
window.addEventListener('hashchange',route);

renderChips();renderHome();renderOrders();renderAll();route();
})();
