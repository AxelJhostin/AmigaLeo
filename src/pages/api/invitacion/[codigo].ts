import type { APIRoute } from 'astro';
import { pool } from '../../../lib/server/admin';
import { RSVP_DEADLINE } from '../../../config/rsvp';
export const prerender = false;
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export const POST: APIRoute = async ({ request, params }) => {
  const code = params.codigo || '';
  if (!/^[A-Za-z0-9_-]{43}$/.test(code)) return reply({ error: 'Invitación no encontrada.' }, 404);
  if (!pool) return reply({ error: 'Servicio temporalmente no disponible.' }, 503);
  let body: unknown;
  try { body = await request.json(); } catch { return reply({ error: 'Respuesta inválida.' }, 400); }
  if (!body || typeof body !== 'object') return reply({ error: 'Respuesta inválida.' }, 400);
  const { status, companionAttending } = body as Record<string, unknown>;
  if ((status !== 'attending' && status !== 'declined') || typeof companionAttending !== 'boolean' || (status === 'declined' && companionAttending)) return reply({ error: 'Respuesta inválida.' }, 400);
  try {
    // La fecha y el permiso de acompañante se validan en la misma operación de escritura.
    const result = await pool.query(`UPDATE guests SET status=$2, companion_attending=$3, updated_at=now()
      WHERE invite_code=$1 AND now() < $4::timestamptz AND (NOT $3 OR companion_allowed)
      RETURNING status, companion_attending`, [code, status, companionAttending, RSVP_DEADLINE]);
    if (result.rowCount) return reply({ ok: true, status: result.rows[0].status, companionAttending: result.rows[0].companion_attending });
    const existing = await pool.query('SELECT companion_allowed, now() >= $2::timestamptz AS closed FROM guests WHERE invite_code=$1', [code, RSVP_DEADLINE]);
    if (!existing.rowCount) return reply({ error: 'Invitación no encontrada.' }, 404);
    if (existing.rows[0].closed) return reply({ error: 'El plazo para confirmar ya terminó.' }, 403);
    return reply({ error: 'Esta invitación no incluye acompañante.' }, 400);
  } catch { return reply({ error: 'No se pudo guardar tu respuesta. Inténtalo de nuevo.' }, 500); }
};
