import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { pool } from '../../../lib/server/admin';
export const prerender = false;
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store, private', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' } });
export const POST: APIRoute = async ({ request, params }) => {
  const inviteCode = params.codigo || '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(inviteCode)) return reply({ error: 'Invitación o código inválido.' }, 404);
  const location = import.meta.env.EVENT_LOCATION?.trim();
  if (!pool || !location) return reply({ error: 'La ubicación todavía no está disponible.' }, 503);
  let body: unknown;
  try { body = await request.json(); } catch { return reply({ error: 'Código inválido.' }, 400); }
  const code = (body && typeof body === 'object') ? (body as Record<string, unknown>).code : null;
  if (typeof code !== 'string' || !/^[A-Za-z0-9_-]{22}$/.test(code)) return reply({ error: 'Código inválido.' }, 400);
  const hash = createHash('sha256').update(code).digest('hex');
  try {
    // Una sola actualización atómica permite que como máximo una solicitud reciba la ubicación.
    const result = await pool.query('UPDATE guests SET location_used_at=now() WHERE invite_code=$1 AND location_code_hash=$2 AND location_used_at IS NULL RETURNING id', [inviteCode, hash]);
    if (!result.rowCount) return reply({ error: 'El código no es válido o ya fue utilizado. Contacta a la anfitriona.' }, 403);
    return reply({ location });
  } catch { return reply({ error: 'No se pudo consultar la ubicación. Inténtalo de nuevo.' }, 500); }
};
