// Protege el panel de empresa en el servidor: sin sesión válida, Vercel no entrega
// admin.html ni sus archivos y redirige a la pantalla de acceso.
export const config = { matcher: ['/admin', '/admin.html', '/admin.js', '/admin.css'] };

const HASH_INICIAL = '17eeaef3857ec08e11213d8bee9ed740edd012e9ec80f4685d3e66a5d56a71be';
const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

async function secreto() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const base = process.env.ADMIN_PASSWORD ? hex(await crypto.subtle.digest('SHA-256', enc.encode(process.env.ADMIN_PASSWORD))) : HASH_INICIAL;
  return 'sh-fallback:' + base;
}

async function sesionValida(cookie) {
  const m = /(?:^|;\s*)sh_admin=(\d+)\.([\w-]+)/.exec(cookie || '');
  if (!m || Number(m[1]) < Date.now() / 1000) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(await secreto()), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify', 'sign']);
  const firma = b64url(await crypto.subtle.sign('HMAC', key, enc.encode('admin.' + m[1])));
  if (firma.length !== m[2].length) return false;
  let dif = 0; for (let i = 0; i < firma.length; i++) dif |= firma.charCodeAt(i) ^ m[2].charCodeAt(i);
  return dif === 0;
}

export default async function middleware(request) {
  if (await sesionValida(request.headers.get('cookie'))) return; // sigue y entrega el panel
  const url = new URL('/login.html', request.url);
  return Response.redirect(url, 307);
}
