// Panel de control de la empresa. El acceso lo protege el servidor (middleware.js + /api/login).
(function(){
const IVA=0.21;
const {CATS,P}=window.SH_DATA;
const ORIG=Object.fromEntries(P.map(p=>[p.id,p.base]));
const catName=Object.fromEntries(CATS.map(c=>[c[0],c[1]]));
const catBg=Object.fromEntries(CATS.map(c=>[c[0],c[3]]));
const byId=Object.fromEntries(P.map(p=>[p.id,p]));
const $=s=>document.querySelector(s);
const eur=n=>n.toLocaleString('es-ES',{style:'currency',currency:'EUR'});
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(e){return d}};
const store=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

// Pedidos de hoy de otros clientes (ejemplo)
const SEED=[
 {n:'SH-25850',cli:'Restaurante El Pinar',h:'08:42',st:'prep',slot:'Mañana 8–11 h',notes:'Dejar en cocina, entrada por la calle de atrás',items:[[2,6],[8,4],[14,2],[16,1]]},
 {n:'SH-25849',cli:'Cafetería Mercat',h:'08:15',st:'prep',slot:'Mañana 11–14 h',notes:'',items:[[7,3],[10,2],[17,2]]},
 {n:'SH-25846',cli:'Hotel Mar Blau',h:'07:58',st:'reparto',slot:'Hoy 8–11 h',notes:'Preguntar por Marta en recepción',items:[[5,6],[13,2],[18,4],[19,2]]},
 {n:'SH-25844',cli:'Bar Ca la Pepa',h:'07:31',st:'reparto',slot:'Hoy 8–11 h',notes:'',items:[[1,10],[6,2],[15,6]]},
 {n:'SH-25843',cli:'Pizzería Nápoles',h:'07:05',st:'ok',slot:'Hoy 8–11 h',notes:'',items:[[9,6],[11,2],[12,3]]}
];
// Compras del mes antes de hoy y ventas de los 6 días anteriores (ejemplo)
const CLIENTES=[['Hotel Mar Blau','Malvarrosa',1840.50,9],['Restaurante El Pinar','Benimaclet',1265.20,7],['Bar La Lonja','Ciutat Vella',980.30,6],
 ['Cafetería Mercat','Russafa',742.10,8],['Bar Ca la Pepa','El Cabanyal',611.75,5],['Pizzería Nápoles','Campanar',498.40,4]];
const SEMANA=[812.40,1043.90,756.20,1189.70,968.30,1102.50];

let adminSt=load('sh-admin',{}), filtro='todos', oq='', pq='';
const base=it=>it.reduce((s,[id,n])=>s+(byId[id]?byId[id].p:0)*n,0);
const total=it=>base(it)*(1+IVA);
const units=it=>it.reduce((s,[,n])=>s+n,0);

// Junta los pedidos de ejemplo con los que ha hecho el cliente de la demo en su app
function allOrders(){
  const cli=load('sh-pedidos',null), cliOrders=(cli&&Array.isArray(cli.orders))?cli.orders:window.SH_DATA.ORDERS;
  const mine=cliOrders.filter(o=>o&&Array.isArray(o.items)&&(o.d==='hoy'||o.st!=='ok')).map(o=>({...o,cli:'Bar La Lonja',src:'cli',h:o.h||(o.d==='hoy'?'—':o.d),hoy:o.d==='hoy',slot:o.slot||'Mañana 8–11 h'}));
  const seed=SEED.map(o=>({...o,st:adminSt[o.n]||o.st,src:'adm',hoy:true}));
  return [...mine.filter(o=>o.hoy).reverse(),...seed,...mine.filter(o=>!o.hoy)].filter(o=>o.items.every(([id])=>byId[id]));
}
function setSt(o,st){
  if(o.src==='cli'){
    const cli=load('sh-pedidos',null)||{cart:{},ivaIncl:true,points:1840};
    if(!Array.isArray(cli.orders)) cli.orders=window.SH_DATA.ORDERS.map(x=>({...x}));
    const t=cli.orders.find(x=>x.n===o.n); if(t) t.st=st; store('sh-pedidos',cli);
  } else {adminSt[o.n]=st;store('sh-admin',adminSt)}
}

const ST={prep:['Preparando','prep'],reparto:['En reparto','info'],ok:['Entregado','ok']};
const NEXT={prep:['reparto','Enviar a reparto'],reparto:['ok','Marcar entregado']};
function orderRows(list,{compact}={}){
  if(!list.length) return '<tbody><tr><td class="empty-row" colspan="7">No hay pedidos que coincidan.</td></tr></tbody>';
  return `<thead><tr><th>Pedido</th><th>Cliente</th><th>Hora</th><th class="r">Artículos</th><th class="r">Total</th><th>Estado</th><th class="r">Acciones</th></tr></thead><tbody>`+
  list.map(o=>{const [lbl,c]=ST[o.st], nx=NEXT[o.st], isNew=o.src==='cli'&&o.hoy&&o.st==='prep';
    return `<tr><td data-l="Pedido"><b class="mono">${esc(o.n)}</b>${isNew?' <span class="tag-st new">Nuevo</span>':''}</td>
    <td data-l="Cliente"><b>${esc(o.cli)}</b>${!compact&&o.notes?`<small>Nota: ${esc(o.notes)}</small>`:''}${!compact?`<small>Entrega: ${esc(o.slot)}</small>`:''}</td>
    <td data-l="Hora">${esc(o.h)}</td><td data-l="Artículos" class="r">${units(o.items)}</td><td data-l="Total" class="r"><b>${eur(total(o.items))}</b></td>
    <td data-l="Estado"><span class="tag-st ${c}"><i></i>${lbl}</span></td>
    <td class="r acts"><button class="btn btn-ghost sm" data-fact="${esc(o.n)}">Factura</button>${nx?`<button class="btn btn-primary sm" data-st="${nx[0]}" data-n="${esc(o.n)}">${nx[1]}</button>`:''}</td></tr>`}).join('')+'</tbody>';
}

function renderHoy(){
  const all=allOrders(), hoy=all.filter(o=>o.hoy), v=hoy.reduce((s,o)=>s+total(o.items),0);
  const prep=all.filter(o=>o.st==='prep').length, ruta=all.filter(o=>o.st==='reparto').length, ayer=SEMANA[SEMANA.length-1];
  $('#kVentas').textContent=eur(v);
  const d=(v-ayer)/ayer*100; $('#kDelta').textContent=(d>=0?'+':'')+d.toFixed(1).replace('.',',')+' % vs ayer';
  $('#kPedidos').textContent=hoy.length; $('#kTicket').textContent='Ticket medio '+(hoy.length?eur(v/hoy.length):'—');
  $('#kPrep').textContent=prep; $('#kPrepTag').hidden=!prep; $('#kRuta').textContent=ruta;
  $('#navPend').textContent=prep||''; $('#sideN').textContent=prep?`${prep} ${prep===1?'pedido':'pedidos'} por preparar`:'Todo preparado';
  $('#today').textContent=$('#today').dataset.date+(prep?` · ${prep} ${prep===1?'pedido':'pedidos'} por preparar`:' · Todo al día');
  const u={}; hoy.forEach(o=>o.items.forEach(([id,n])=>u[id]=(u[id]||0)+n));
  const top=Object.entries(u).sort((a,b)=>b[1]-a[1]).slice(0,4);
  $('#topHoy').innerHTML=top.map(([id,n],i)=>{const p=byId[id];return `<div class="top-it${i===0?' first':''}"><div class="ti-h"><span class="ti-e" style="background:${catBg[p.cat]}">${p.e}</span><span class="ti-c">${catName[p.cat]}</span></div>
    <b>${n} uds</b><span class="ti-n">${esc(p.n)}</span><span class="tag-st ${i===0?'ok':'neutral'}">${i===0?'Nº 1 del día':'Puesto '+(i+1)}</span></div>`}).join('')||'<p class="empty-row">Aún no hay ventas hoy.</p>';
  renderChart([...SEMANA,v]);
  $('#recent').innerHTML=orderRows(all.slice(0,6),{compact:true});
}

// Gráfico de barras (una serie): barras finas con extremo redondeado, hoy resaltado, tooltip al pasar
function renderChart(vals){
  const box=$('#chart'), W=Math.max(280,box.clientWidth||560), H=230, pl=58, pr=8, pt=12, pb=28;
  const raw=Math.max(...vals)/4, step=[100,200,250,500,1000,2000,2500,5000].find(s=>s>=raw)||10000, max=step*4;
  const days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return i===6?'Hoy':d.toLocaleDateString('es-ES',{weekday:'short'}).replace('.','')});
  const bw=(W-pl-pr)/7, y=v=>pt+(H-pt-pb)*(1-v/max);
  let g=''; for(let t=0;t<=max;t+=step){g+=`<line x1="${pl}" x2="${W-pr}" y1="${y(t)}" y2="${y(t)}" class="gl"/><text x="${pl-8}" y="${y(t)+4}" class="ax" text-anchor="end">${t.toLocaleString('es-ES')} €</text>`}
  const bars=vals.map((v,i)=>{const x=pl+i*bw+bw*.22, w=bw*.56, top=y(v), h=H-pb-top, r=Math.min(4,h/2);
    return `<g class="bx${i===6?' now':''}" data-i="${i}"><rect class="hit" x="${pl+i*bw}" y="${pt}" width="${bw}" height="${H-pt-pb}" fill="transparent"/>
    <path d="M${x} ${H-pb}V${top+r}Q${x} ${top} ${x+r} ${top}H${x+w-r}Q${x+w} ${top} ${x+w} ${top+r}V${H-pb}Z"/>
    <text x="${x+w/2}" y="${H-8}" class="ax${i===6?' strong':''}" text-anchor="middle">${days[i]}</text></g>`}).join('');
  $('#chart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${g}<line x1="${pl}" x2="${W-pr}" y1="${H-pb}" y2="${H-pb}" class="base"/>${bars}</svg>`;
  $('#wkTotal').textContent=eur(vals.reduce((a,b)=>a+b,0));
  const tip=$('#tip');
  $('#chart').querySelectorAll(".bx").forEach(b=>{
    const show=e=>{const i=+b.dataset.i;tip.innerHTML=`<b>${days[i]==='Hoy'?'Hoy':days[i]}</b>${eur(vals[i])}`;tip.hidden=false;
      const r=b.getBoundingClientRect();tip.style.left=Math.min(window.innerWidth-140,Math.max(8,r.left+r.width/2-60))+'px';tip.style.top=(r.top+window.scrollY-54)+'px'};
    b.addEventListener('mouseenter',show);b.addEventListener('click',show);b.addEventListener('mouseleave',()=>tip.hidden=true);
  });
}

function renderPedidos(){
  const all=allOrders(), cnt=k=>k==='todos'?all.length:all.filter(o=>o.st===k).length;
  $('#fseg').innerHTML=[['todos','Todos'],['prep','Preparando'],['reparto','En reparto'],['ok','Entregados']].map(([k,l])=>`<button type="button" data-f="${k}" aria-pressed="${k===filtro}">${l}<span>${cnt(k)}</span></button>`).join('');
  const t=oq.trim().toLowerCase();
  $('#otbl').innerHTML=orderRows(all.filter(o=>(filtro==='todos'||o.st===filtro)&&(!t||(o.n+' '+o.cli).toLowerCase().includes(t))));
}
function renderProductos(){
  const t=pq.trim().toLowerCase(), l=P.filter(p=>!t||(p.n+' '+p.ref).toLowerCase().includes(t));
  $('#pInfo').textContent=`${P.length} productos · ${P.filter(p=>p.out).length} agotados`;
  $('#ptbl').innerHTML=`<thead><tr><th>Producto</th><th>Categoría</th><th class="r">Precio (IVA incl.)</th><th>Disponible</th></tr></thead><tbody>`+
  (l.map(p=>{const chg=Math.abs(p.p-ORIG[p.id])>.001;
    return `<tr class="${p.out?'off':''}"><td data-l="Producto"><div class="prodc"><span class="ti-e" style="background:${catBg[p.cat]}">${p.e}</span><div><b>${esc(p.n)}</b><small>${p.ref} · ${esc(p.f)}</small></div></div></td>
    <td data-l="Categoría">${catName[p.cat]}</td>
    <td data-l="Precio" class="r"><label class="price-in"><input type="number" inputmode="decimal" step="0.05" min="0.05" max="9999" value="${(p.p*(1+IVA)).toFixed(2)}" data-price="${p.id}" id="pr-${p.id}" aria-label="Precio de ${esc(p.n)}"><span>€</span></label>${chg?`<small>Antes ${eur(ORIG[p.id]*(1+IVA))}</small>`:''}</td>
    <td data-l="Disponible"><button class="switch" role="switch" aria-checked="${!p.out}" data-av="${p.id}" aria-label="Disponible: ${esc(p.n)}"></button></td></tr>`}).join('')||'<tr><td class="empty-row" colspan="4">No hay productos con ese nombre.</td></tr>')+'</tbody>';
}
function saveCat(){const o={};P.forEach(p=>{if(Math.abs(p.p-ORIG[p.id])>.001||p.out)o[p.id]={p:p.p,out:!!p.out}});store('sh-catalogo',o)}
function renderClientes(){
  const hoy=allOrders().filter(o=>o.hoy), add={};
  hoy.forEach(o=>add[o.cli]=(add[o.cli]||0)+total(o.items));
  const l=CLIENTES.map(([n,z,t,k])=>({n,z,t:t+(add[n]||0),k:k+hoy.filter(o=>o.cli===n).length,hoy:!!add[n]})).sort((a,b)=>b.t-a.t);
  const lvl=i=>i===0?['Oro','gold']:i<3?['Plata','neutral']:['Bronce','bronze'];
  $('#ctbl').innerHTML=`<thead><tr><th>#</th><th>Cliente</th><th>Zona</th><th class="r">Pedidos</th><th class="r">Compras del mes</th><th>Nivel</th></tr></thead><tbody>`+
  l.map((c,i)=>{const [ln,lc]=lvl(i);return `<tr><td data-l="Puesto" class="mono">${i+1}</td><td data-l="Cliente"><div class="prodc"><span class="av sm">${esc(c.n.split(' ').map(w=>w[0]).slice(0,2).join(''))}</span><div><b>${esc(c.n)}</b>${c.hoy?'<small>Ha pedido hoy</small>':''}</div></div></td>
   <td data-l="Zona">${esc(c.z)}</td><td data-l="Pedidos" class="r">${c.k}</td><td data-l="Compras" class="r"><b>${eur(c.t)}</b></td><td data-l="Nivel"><span class="tag-st ${lc}">${ln}</span></td></tr>`}).join('')+'</tbody>';
}
function renderAll(){renderHoy();renderPedidos();renderProductos();renderClientes()}

let tt; function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>el.classList.remove('on'),2200)}
function menu(open){$('#side').classList.toggle('open',open);$('#scrim').classList.toggle('on',open);$('#menuBtn').setAttribute('aria-expanded',open)}

document.addEventListener('click',e=>{
  const a=e.target.closest('a[data-filter]'); if(a){filtro=a.dataset.filter}
  const b=e.target.closest('button'); if(!b) return; const d=b.dataset;
  if(d.st&&NEXT[allOrders().find(x=>x.n===d.n)?.st]?.[0]===d.st){const o=allOrders().find(x=>x.n===d.n);setSt(o,d.st);renderAll();toast(d.st==='reparto'?`${o.n} enviado a reparto`:`${o.n} entregado`)}
  else if(d.fact){const o=allOrders().find(x=>x.n===d.fact); if(o) window.SH_FACTURA.abrir(o,o.cli)}
  else if(d.f){filtro=d.f;renderPedidos()}
  else if(d.av){const p=byId[d.av];p.out=!p.out;saveCat();renderProductos();toast(p.out?`${p.n}: agotado`:`${p.n}: disponible`)}
});
document.addEventListener('change',e=>{
  const id=e.target.dataset&&e.target.dataset.price; if(!id) return;
  const v=Math.round(parseFloat(String(e.target.value).replace(',','.'))*100)/100, p=byId[id];
  if(!(v>0&&v<10000)){e.target.value=(p.p*(1+IVA)).toFixed(2);toast('Escribe un precio entre 0,05 € y 9.999 €');return}
  p.p=v/(1+IVA);saveCat();renderAll();toast(`${p.n}: ${eur(v)} IVA incluido`);
});
$('#oq').addEventListener('input',e=>{oq=e.target.value;renderPedidos()});
$('#pq').addEventListener('input',e=>{pq=e.target.value;renderProductos()});
$('#gq').addEventListener('input',e=>{oq=e.target.value;$('#oq').value=oq;if(location.hash!=='#pedidos')location.hash='pedidos';else renderPedidos()});
$('#resetCat').onclick=()=>{P.forEach(p=>{p.p=ORIG[p.id];p.out=false});store('sh-catalogo',{});renderAll();toast('Precios originales restaurados')};
$('#menuBtn').onclick=()=>menu(!$('#side').classList.contains('open'));
$('#scrim').onclick=()=>menu(false);
$('#logout').onclick=async()=>{try{await fetch('api/logout',{method:'POST',credentials:'same-origin'})}catch(e){}location.replace('login.html')};
window.addEventListener('storage',renderAll);
let rz; window.addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(renderHoy,150)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')menu(false)});

const now=new Date(), hr=now.getHours();
$('#hello').textContent=hr<14?'Buenos días':hr<21?'Buenas tardes':'Buenas noches';
const td=now.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'});
$('#today').dataset.date=td.charAt(0).toUpperCase()+td.slice(1);
$('#tbDate').textContent=now.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});

const VIEWS={hoy:'Panel',pedidos:'Pedidos',productos:'Productos',clientes:'Clientes'};
function route(){const v=(location.hash||'#hoy').slice(1), ok=VIEWS[v]?v:'hoy';
  Object.keys(VIEWS).forEach(k=>$('#v-'+k).hidden=k!==ok);
  document.querySelectorAll('.side-nav a[data-v]').forEach(a=>a.dataset.v===ok?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current'));
  $('#crumb').textContent=VIEWS[ok]; menu(false); renderPedidos(); window.scrollTo(0,0)}
window.addEventListener('hashchange',route);
renderAll();route();
})();
