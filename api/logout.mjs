// POST /api/logout  →  borra la cookie de sesión
import { cabeceraCookie } from './_sesion.mjs';

export function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Set-Cookie': cabeceraCookie('', 0) }
  });
}
