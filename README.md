# Suministros Hostelería · App de pedidos (demo)

App móvil de pedidos para una empresa de suministros de hostelería: mantelería, servilletas, desechables, limpieza y celulosa.

- `index.html`: app del cliente (bar o restaurante). Catálogo con fichas técnicas, carrito con franja de entrega, seguimiento y repetición de pedidos, cuenta con puntos. Precios con IVA incluido.
- `admin.html`, `admin.css`, `admin.js`: panel de control de la empresa, protegido en el servidor.
- `login.html`, `login.js`: pantalla de acceso al panel.
- `app.js`: lógica de la app del cliente. Pedidos del día con cambio de estado, precios y disponibilidad de productos, ranking de clientes.
- `estilos.css`: estilos compartidos (sistema de diseño Flip7: turquesa, coral y dorado).
- `datos.js`: catálogo y pedidos de ejemplo.
- `factura.js`: factura de cada pedido (se puede imprimir o guardar en PDF), desde la app del cliente y desde el panel.

En esta demo los pedidos, precios y estados se guardan en el navegador del dispositivo. Clientes, productos y precios son de ejemplo.

## Seguridad

- **Panel protegido en el servidor**: `middleware.js` no entrega `admin.html` (ni sus archivos) sin una sesión válida; si no la hay, redirige a `login.html`.
- **Inicio de sesión en el servidor** (`api/login.mjs`): compara la contraseña en tiempo constante, frena los intentos repetidos y crea una cookie firmada (HMAC-SHA256) `HttpOnly`, `Secure` y `SameSite=Strict` que caduca a las 8 horas. `api/logout.mjs` la borra.
- **Cabeceras de seguridad** (`vercel.json`): Content-Security-Policy estricta (solo scripts propios), anti-iframe, HSTS, `nosniff`, Referrer-Policy y Permissions-Policy.
- Todo el contenido que escribe el usuario se escapa antes de mostrarse.

### Configuración obligatoria en Vercel

En **Settings → Environment Variables** añade (para Production) y vuelve a desplegar:

| Variable | Valor |
|---|---|
| `ADMIN_PASSWORD` | la contraseña del panel |
| `SESSION_SECRET` | una cadena larga y aleatoria (64 caracteres o más) |

Mientras no existan, el servidor usa una contraseña de respaldo cuya huella está en el código; configura las variables para que la seguridad dependa solo de secretos que no están en el repositorio.


## Dirección publicada

- App del cliente: https://suministros-hosteleria-k1fy.vercel.app
- Panel de la empresa: https://suministros-hosteleria-k1fy.vercel.app/admin.html

Cada cambio que se sube a `main` se publica solo en Vercel.

## Publicar en Vercel

Archivos estáticos, sin build: importa el repositorio en Vercel con Framework Preset «Other» y pulsa Deploy.
