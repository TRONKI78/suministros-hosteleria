// Factura de un pedido: la usan la app del cliente (index.html) y el panel de la empresa (admin.html).
// Datos fiscales de ejemplo: sustituir por los reales de la empresa y de cada cliente.
(function(){
var IVA=0.21;
var EMPRESA={nombre:'Suministros Hostelería S.L.',nif:'B-00000000',dir:'Polígono Industrial, nave 0',cp:'46000 Valencia',tel:'600 000 000'};
var CLIENTES={
  'Bar La Lonja':{nif:'B-12345678',dir:'C/ de la Reina 21',cp:'46011 Valencia',num:'C-04127'},
  'Restaurante El Pinar':{nif:'B-23456789',dir:'C/ de Emili Baró 14',cp:'46020 Valencia',num:'C-03018'},
  'Cafetería Mercat':{nif:'B-34567890',dir:'C/ de Sueca 32',cp:'46006 Valencia',num:'C-04402'},
  'Hotel Mar Blau':{nif:'B-45678901',dir:'Passeig de Neptú 8',cp:'46011 Valencia',num:'C-02211'},
  'Bar Ca la Pepa':{nif:'B-56789012',dir:'C/ de la Reina 112',cp:'46011 Valencia',num:'C-04390'},
  'Pizzería Nápoles':{nif:'B-67890123',dir:'Av. de Pius XII 40',cp:'46015 Valencia',num:'C-03875'}
};
var MESES=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function eur(n){return n.toLocaleString('es-ES',{style:'currency',currency:'EUR'})}
function num(n){return n.toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

// Fecha del pedido: la guardada al crearlo o, en los de ejemplo, "hoy" / "17 nov"
function fecha(o){
  if(o.fecha) return new Date(o.fecha);
  var d=new Date(), m=/^(\d{1,2}) (\w{3})/.exec(o.d||'');
  if(m && MESES.indexOf(m[2])>=0) return new Date(d.getFullYear(),MESES.indexOf(m[2]),+m[1]);
  return d;
}
// Precio sin IVA con el que se hizo el pedido (si se guardó) o el actual
function precio(o,p){return o.precios && o.precios[p.id]!=null ? o.precios[p.id] : p.p}

function html(o,cliente){
  var byId={}; window.SH_DATA.P.forEach(function(p){byId[p.id]=p});
  var c=CLIENTES[cliente]||{nif:'—',dir:'',cp:'',num:''}, f=fecha(o), base=0;
  var filas=o.items.map(function(it){var p=byId[it[0]], u=precio(o,p), imp=u*it[1]; base+=imp;
    return '<tr><td>'+p.ref+'</td><td>'+esc(p.n)+'<small>'+esc(p.f)+'</small></td><td class="r">'+it[1]+'</td><td class="r">'+num(u)+'</td><td class="r">'+num(imp)+'</td></tr>'}).join('');
  var nf='F-'+f.getFullYear()+'-'+String(o.n).replace(/^\D+-?/,'');
  return '<div class="fact" id="factDoc">'+
   '<div class="fact-head"><img src="logo.png" alt=""><div><b>'+EMPRESA.nombre+'</b><span>NIF '+EMPRESA.nif+'<br>'+EMPRESA.dir+' · '+EMPRESA.cp+'<br>Tel. '+EMPRESA.tel+'</span></div>'+
   '<div class="fact-num"><span>FACTURA</span><b>'+nf+'</b><span>'+f.toLocaleDateString('es-ES')+'</span></div></div>'+
   '<div class="fact-parts"><div><span>CLIENTE</span><b>'+esc(cliente)+'</b>NIF '+c.nif+'<br>'+c.dir+(c.cp?'<br>'+c.cp:'')+'</div>'+
   '<div><span>PEDIDO</span><b>'+esc(o.n)+'</b>'+(c.num?'Nº cliente '+c.num+'<br>':'')+'Entrega: '+esc(o.slot||'—')+'</div></div>'+
   '<div class="fact-tw"><table><thead><tr><th>Ref.</th><th>Descripción</th><th class="r">Uds</th><th class="r">Precio</th><th class="r">Importe</th></tr></thead><tbody>'+filas+'</tbody></table></div>'+
   '<div class="fact-tot"><div><span>Base imponible</span><span>'+eur(base)+'</span></div><div><span>IVA 21 %</span><span>'+eur(base*IVA)+'</span></div>'+
   '<div class="big"><span>TOTAL</span><span>'+eur(base*(1+IVA))+'</span></div></div>'+
   '<p class="fact-pie">Forma de pago: domiciliación bancaria a 30 días. Precios en euros sin IVA salvo totales. Factura de demostración con datos de ejemplo.</p></div>';
}

function abrir(o,cliente){
  cerrar();
  var w=document.createElement('div'); w.className='fact-wrap'; w.id='factWrap';
  w.setAttribute('role','dialog'); w.setAttribute('aria-label','Factura del pedido '+o.n);
  w.innerHTML='<div class="fact-acts"><button class="btn btn-gold" id="factPrint">🖨️ Imprimir o guardar PDF</button><button class="btn btn-ghost" id="factClose">Cerrar</button></div>'+html(o,cliente);
  document.body.appendChild(w); document.body.classList.add('fact-open');
  w.querySelector('#factClose').onclick=cerrar;
  w.querySelector('#factPrint').onclick=function(){window.print()};
  w.querySelector('#factClose').focus();
}
function cerrar(){var w=document.getElementById('factWrap'); if(w) w.remove(); document.body.classList.remove('fact-open')}
document.addEventListener('keydown',function(e){if(e.key==='Escape') cerrar()});

window.SH_FACTURA={abrir:abrir,cerrar:cerrar};
})();
