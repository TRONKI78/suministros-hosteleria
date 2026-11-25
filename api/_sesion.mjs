// Utilidades de sesión del panel de empresa (solo se ejecutan en el servidor de Vercel).
// Configura en Vercel → Settings → Environment Variables:
//   ADMIN_PASSWORD  la contraseña del panel
//   SESSION_SECRET  una cadena larga y aleatoria (por ejemplo, 64 caracteres)
import crypto from 'node:crypto';

// Respaldo mientras no estén configuradas las variables: huella SHA-256 de la contraseña inicial.
const HASH_INICIAL = '17eeaef3857ec08e11213d8bee9ed740edd012e9ec80f4685d3e66a5d56a71be';
export const DURACION = 8 * 60 * 60; // 8 horas
export const COOKIE = 'sh_admin';

const sha256 = t => crypto.createHash('sha256').update(String(t), 'utf8').digest();

export function secreto() {
  return process.env.SESSION_SECRET || ('sh-fallback:' + (process.env.ADMIN_PASSWORD ? sha256(process.env.ADMIN_PASSWORD).toString('hex') : HASH_INICIAL));
}

export function claveCorrecta(intento) {
  if (typeof intento !== 'string' || intento.length === 0 || intento.length > 200) return false;
  const esperado = process.env.ADMIN_PASSWORD ? sha256(process.env.ADMIN_PASSWORD) : Buffer.from(HASH_INICIAL, 'hex');
  return crypto.timingSafeEqual(sha256(intento), esperado); // comparación en tiempo constante
}

export function firmar(exp) {
  return crypto.createHmac('sha256', secreto()).update('admin.' + exp).digest('base64url');
}

export function cabeceraCookie(valor, maxAge) {
  return `${COOKIE}=${valor}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}
