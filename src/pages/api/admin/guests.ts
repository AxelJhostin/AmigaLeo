import type { APIRoute } from 'astro';
import { randomBytes } from 'node:crypto';
import { isAdmin, pool } from '../../../lib/server/admin';
export const prerender = false;
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
export const GET: APIRoute = async ({ request }) => {
  if (!await isAdmin(request) || !pool) return reply({ error: 'No autorizado' }, 401);
  try { const result = await pool.query('SELECT id, display_name, invite_code, status, companion_allowed, companion_name, companion_attending FROM guests ORDER BY created_at, id'); return reply(result.rows); }
  catch { return reply({ error: 'No se pudo consultar la lista' }, 500); }
};
export const POST: APIRoute = async ({ request }) => {
  if (!await isAdmin(request) || !pool) return reply({ error: 'No autorizado' }, 401);
  try {
    const data = await request.json();
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const companion = data.companion === true;
    const companionName = typeof data.companionName === 'string' ? data.companionName.trim() : '';
    if (!name || name.length > 160 || companionName.length > 160) return reply({ error: 'Revisa el nombre' }, 400);
    const result = await pool.query('INSERT INTO guests (display_name, invite_code, companion_allowed, companion_name) VALUES ($1,$2,$3,$4) RETURNING id', [name, randomBytes(32).toString('base64url'), companion, companion && companionName ? companionName : null]);
    return reply({ id: result.rows[0].id }, 201);
  } catch { return reply({ error: 'No se pudo guardar el invitado' }, 500); }
};
export const PATCH: APIRoute = async ({ request }) => {
  if (!await isAdmin(request) || !pool) return reply({ error: 'No autorizado' }, 401);
  try {
    const data = await request.json();
    if (typeof data.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(data.id) || typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 160 || typeof data.companion !== 'boolean' || typeof data.companionName !== 'string' || data.companionName.length > 160) return reply({ error: 'Datos inválidos' }, 400);
    const result = await pool.query('UPDATE guests SET display_name=$1, companion_allowed=$2, companion_name=$3, companion_attending=CASE WHEN $2 THEN companion_attending ELSE false END, updated_at=now() WHERE id=$4 RETURNING id', [data.name.trim(), data.companion, data.companion && data.companionName.trim() ? data.companionName.trim() : null, data.id]);
    return result.rowCount ? reply({ ok: true }) : reply({ error: 'Invitado no encontrado' }, 404);
  } catch { return reply({ error: 'No se pudo actualizar' }, 500); }
};
