# Suministros Hostelería · App de pedidos (demo)

App móvil de pedidos para una empresa de suministros de hostelería: mantelería, servilletas, desechables, limpieza y celulosa.

- `index.html`: app del cliente (bar o restaurante). Catálogo con fichas técnicas, carrito con franja de entrega, seguimiento y repetición de pedidos, cuenta con puntos. Precios con IVA incluido.
- `admin.html`: panel de la empresa, protegido con contraseña. Pedidos del día con cambio de estado, precios y disponibilidad de productos, ranking de clientes.
- `estilos.css`: estilos compartidos (sistema de diseño Flip7: turquesa, coral y dorado).
- `datos.js`: catálogo y pedidos de ejemplo.
- `factura.js`: factura de cada pedido (se puede imprimir o guardar en PDF), desde la app del cliente y desde el panel.

En esta demo los datos se guardan en el navegador del dispositivo. La contraseña del panel se comprueba en el navegador (solo se guarda su huella SHA-256): es una protección básica; para uso real hace falta un inicio de sesión en servidor. Clientes, productos y precios son de ejemplo.

## Publicar en Vercel

Archivos estáticos, sin build: importa el repositorio en Vercel con Framework Preset «Other» y pulsa Deploy.
