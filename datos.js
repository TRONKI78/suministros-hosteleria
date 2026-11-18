// Datos compartidos entre la app del cliente (index.html) y el panel de la empresa (admin.html).
// Catálogo de ejemplo. Los cambios de precio y disponibilidad que hace la empresa se guardan aparte
// (clave 'sh-catalogo') y se aplican encima de estos valores al cargar.
(function(){
var CATS=[
  ['mant','Mantelería','🏁','#FDEBE5'],['serv','Servilletas','📃','#E8F6F5'],['desc','Desechables','🥡','#FFF4CC'],
  ['limp','Limpieza','🧴','#E3F1FB'],['celu','Celulosa','🧻','#F1ECE0']];
// o: precio anterior (oferta) · low: últimas unidades · s: ficha técnica
var P=[
 {id:1,cat:'mant',e:'🏁',n:'Mantel de cuadros rojo 100×100',f:'Unidad · algodón-poliéster',ref:'MT-1001',p:7.90,s:[['Tejido','50 % algodón'],['Medida','100×100 cm'],['Lavado','60 °C'],['Color','Rojo y blanco']]},
 {id:2,cat:'mant',e:'⬜',n:'Mantel blanco liso 140×140',f:'Unidad · algodón 100 %',ref:'MT-1402',p:12.90,s:[['Tejido','Algodón 100 %'],['Medida','140×140 cm'],['Lavado','90 °C'],['Acabado','Antimanchas']]},
 {id:3,cat:'mant',e:'🟫',n:'Cubremantel crudo 100×100',f:'Unidad · efecto lino',ref:'MT-1003',p:6.50,o:7.40,s:[['Tejido','Poliéster'],['Medida','100×100 cm'],['Lavado','40 °C'],['Color','Crudo']]},
 {id:4,cat:'mant',e:'📜',n:'Mantel de papel 1×1 m',f:'Caja 400 uds · blanco',ref:'MT-P100',p:29.90,s:[['Material','Papel 40 g'],['Medida','100×100 cm'],['Plegado','Cuartos'],['Uso','Un solo uso']]},
 {id:5,cat:'serv',e:'📃',n:'Servilleta papel 40×40 2 capas',f:'Caja 1.200 uds · blanca',ref:'SV-4012',p:24.90,s:[['Capas','2'],['Medida','40×40 cm'],['Plegado','1/4'],['Color','Blanca']]},
 {id:6,cat:'serv',e:'🍷',n:'Servilleta 33×33 punta-punta',f:'Caja 1.500 uds · burdeos',ref:'SV-3315',p:21.60,s:[['Capas','2'],['Medida','33×33 cm'],['Gofrado','Punta-punta'],['Color','Burdeos']]},
 {id:7,cat:'serv',e:'🗂️',n:'Servilleta zig-zag dispensador 17×17',f:'Caja 6.000 uds',ref:'SV-1760',p:19.80,o:22.50,s:[['Capas','1'],['Medida','17×17 cm'],['Plegado','Zig-zag'],['Uso','Servilletero de barra']]},
 {id:8,cat:'serv',e:'🤍',n:'Servilleta tela algodón 45×45',f:'Pack 12 uds · blanca',ref:'SV-T4512',p:18.50,s:[['Tejido','Algodón 100 %'],['Medida','45×45 cm'],['Lavado','90 °C'],['Color','Blanca']]},
 {id:9,cat:'desc',e:'🥡',n:'Envase take-away kraft 750 ml',f:'Pack 50 uds · con tapa',ref:'DS-0750',p:13.90,s:[['Material','Cartón kraft'],['Capacidad','750 ml'],['Microondas','Sí'],['Compostable','Sí']]},
 {id:10,cat:'desc',e:'☕',n:'Vaso de cartón café 8 oz',f:'Caja 1.000 uds',ref:'DS-V08',p:39.90,s:[['Material','Cartón'],['Capacidad','240 ml'],['Uso','Bebida caliente'],['Tapa','Se vende aparte']]},
 {id:11,cat:'desc',e:'🎞️',n:'Film transparente 300 m',f:'Rollo · ancho 30 cm',ref:'DS-F300',p:12.40,s:[['Material','PVC alimentario'],['Longitud','300 m'],['Ancho','30 cm'],['Caja','Con cortador']]},
 {id:12,cat:'desc',e:'🗑️',n:'Bolsa de basura 85×105',f:'Pack 10 rollos · negra',ref:'DS-B85',p:4.20,low:5,s:[['Material','Polietileno'],['Medida','85×105 cm'],['Galga','Industrial'],['Capacidad','100 L']]},
 {id:13,cat:'limp',e:'🫧',n:'Detergente lavavajillas máquina',f:'Garrafa 12 kg',ref:'LP-D12',p:28.50,s:[['Uso','Lavavajillas industrial'],['Formato','12 kg'],['Agua','Dura y blanda'],['Dosificación','Automática']]},
 {id:14,cat:'limp',e:'🧴',n:'Desengrasante cocinas y planchas',f:'Garrafa 5 L',ref:'LP-DG5',p:14.90,o:16.90,s:[['Uso','Planchas y campanas'],['Formato','5 L'],['Dilución','1:10'],['Apto','Industria alimentaria']]},
 {id:15,cat:'limp',e:'🧪',n:'Lejía apta para alimentos',f:'Garrafa 5 L',ref:'LP-L5',p:3.20,s:[['Uso','Desinfección'],['Formato','5 L'],['Cloro activo','40 g/L'],['Apto','Agua de bebida']]},
 {id:16,cat:'limp',e:'🧼',n:'Gel de manos antibacteriano',f:'Garrafa 5 L',ref:'LP-GM5',p:9.80,s:[['Uso','Lavado de manos'],['Formato','5 L'],['pH','5,5'],['Aroma','Neutro']]},
 {id:17,cat:'celu',e:'🧻',n:'Bobina industrial 2 capas',f:'Pack 2 rollos',ref:'CL-B2',p:16.80,s:[['Capas','2'],['Pasta','Tisú'],['Peso rollo','2,2 kg'],['Uso','Cocina y barra']]},
 {id:18,cat:'celu',e:'🚻',n:'Papel higiénico jumbo',f:'Pack 12 rollos',ref:'CL-J12',p:21.40,s:[['Capas','2'],['Pasta','Reciclada'],['Longitud','150 m'],['Dispensador','Jumbo']]},
 {id:19,cat:'celu',e:'📦',n:'Toalla de manos plegada en Z',f:'Caja 3.800 uds',ref:'CL-Z38',p:26.90,low:3,s:[['Capas','2'],['Medida','24×21 cm'],['Plegado','Z'],['Color','Blanca']]}
];
P.forEach(function(p){p.base=p.p});
try{var o=JSON.parse(localStorage.getItem('sh-catalogo')||'{}');P.forEach(function(p){var x=o[p.id];if(x){if(x.p!=null)p.p=x.p;p.out=!!x.out}})}catch(e){}
// Pedidos de ejemplo del cliente de la demo (Bar La Lonja)
var ORDERS=[
 {n:'SH-25841',d:'17 nov',st:'reparto',items:[[5,3],[13,1],[17,4],[12,2]]},
 {n:'SH-25602',d:'6 nov',st:'ok',items:[[1,8],[3,8],[6,2],[15,4],[16,1]]},
 {n:'SH-25377',d:'22 oct',st:'ok',items:[[9,4],[10,1],[11,1],[18,1],[19,1]]}
];
window.SH_DATA={CATS:CATS,P:P,ORDERS:ORDERS};
})();
