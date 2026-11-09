import type { APIRoute } from 'astro';
import { createHash, randomBytes } from 'node:crypto';
import { isAdmin, pool } from '../../../lib/server/admin';
export const prerender = false;
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export const POST: APIRoute = async ({ request }) => {
  if (!await isAdmin(request) || !pool) return reply({ error: 'No autorizado.' }, 401);
  try {
    const data = await request.json();
    if (typeof data.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id) || typeof data.replace !== 'boolean') return reply({ error: 'Solicitud inválida.' }, 400);
    const code = randomBytes(16).toString('base64url');
    const hash = createHash('sha256').update(code).digest('hex');
    const result = await pool.query('UPDATE guests SET location_code_hash=$2, location_issued_at=now(), location_used_at=NULL WHERE id=$1 AND ($3 OR location_code_hash IS NULL) RETURNING id', [data.id, hash, data.replace]);
    if (!result.rowCount) return reply({ error: 'Ya hay un código o la invitación no existe. Actualiza la lista.' }, 409);
    return reply({ code });
  } catch { return reply({ error: 'No se pudo generar el código.' }, 500); }
};
