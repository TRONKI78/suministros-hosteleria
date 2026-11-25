// POST /api/login  { password }  →  crea la cookie de sesión firmada (HttpOnly)
import { claveCorrecta, firmar, cabeceraCookie, DURACION } from './_sesion.mjs';

const espera = ms => new Promise(r => setTimeout(r, ms));
const json = (cuerpo, estado, extra = {}) => new Response(JSON.stringify(cuerpo), {
  status: estado, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }
});

export async function POST(request) {
  // Solo peticiones de esta misma web (protección CSRF)
  const origen = request.headers.get('origin');
  if (origen && new URL(origen).host !== new URL(request.url).host) return json({ ok: false, error: 'Origen no permitido' }, 403);

  let datos = {};
  try { datos = await request.json(); } catch (e) { return json({ ok: false, error: 'Petición no válida' }, 400); }

  await espera(400 + Math.random() * 300); // frena los intentos por fuerza bruta
  if (!claveCorrecta(datos.password)) return json({ ok: false, error: 'Contraseña incorrecta' }, 401);

  const exp = Math.floor(Date.now() / 1000) + DURACION;
  return json({ ok: true }, 200, { 'Set-Cookie': cabeceraCookie(`${exp}.${firmar(exp)}`, DURACION) });
}

export function GET() { return json({ ok: false, error: 'Método no permitido' }, 405, { Allow: 'POST' }); }
