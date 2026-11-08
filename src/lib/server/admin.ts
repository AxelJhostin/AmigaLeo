import { createRemoteJWKSet, jwtVerify } from 'jose';
import pg from 'pg';

const url = import.meta.env.DATABASE_URL;
const authUrl = import.meta.env.NEON_AUTH_BASE_URL;
const adminId = import.meta.env.ADMIN_USER_ID;
const pool = url ? new pg.Pool({ connectionString: url, max: 2 }) : null;
const jwks = authUrl ? createRemoteJWKSet(new URL(`${authUrl}/.well-known/jwks.json`)) : null;
export { pool };
export async function isAdmin(request: Request): Promise<boolean> {
  if (!pool || !authUrl || !jwks || !adminId) return false;
  const match = /^Bearer (\S+)$/.exec(request.headers.get('authorization') || '');
  if (!match) return false;
  try {
    const { payload } = await jwtVerify(match[1], jwks, { issuer: new URL(authUrl).origin, algorithms: ['EdDSA'] });
    return payload.sub === adminId;
  } catch { return false; }
}
