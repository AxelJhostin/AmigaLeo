import { createAuthClient } from '@neon/auth';
import { BetterAuthVanillaAdapter } from '@neon/auth/vanilla/adapters';

type Guest = { id:string; display_name:string; invite_code:string; status:'pending'|'attending'|'declined'; companion_allowed:boolean; companion_name:string|null; companion_attending:boolean; location_issued:boolean; location_used:boolean };
const app = document.querySelector<HTMLElement>('#admin-app')!;
const authUrl = app.dataset.authUrl || '';
const auth = authUrl ? createAuthClient(authUrl, { adapter: BetterAuthVanillaAdapter({ fetchOptions: { credentials: 'include' } }) }) : null;
const el = <T extends HTMLElement>(selector:string) => document.querySelector<T>(selector)!;
const msg = el<HTMLElement>('#message');
const login = el<HTMLElement>('#login-section');
const dashboard = el<HTMLElement>('#dashboard');
const logout = el<HTMLButtonElement>('#logout');
const form = el<HTMLFormElement>('#guest-form');
const cancel = el<HTMLButtonElement>('#cancel-edit');
const list = el<HTMLElement>('#guest-list');
let guests: Guest[] = [];
function message(s:string) { msg.textContent = s; }
async function api(method = 'GET', data?:object, endpoint = '/api/admin/guests') {
  if (!auth) throw new Error('Configura Neon Auth en el servidor.');
  const { data: sessionData, error } = await auth.getSession();
  const token = sessionData?.session?.token;
  if (error || !token) throw new Error('No se pudo recuperar la sesión. Revisa la configuración del navegador e inicia sesión otra vez.');
  const res = await fetch(endpoint, { method, headers: { Authorization: `Bearer ${token}`, ...(data ? {'Content-Type':'application/json'} : {}) }, body: data ? JSON.stringify(data) : undefined });
  if (res.status === 401) throw new Error('Esta cuenta no está autorizada para administrar la lista.');
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Ocurrió un error.');
  return result;
}
function render() {
  for (const [id, value] of [['#total',guests.length],['#attending',guests.filter(g=>g.status==='attending').length],['#declined',guests.filter(g=>g.status==='declined').length],['#pending-count',guests.filter(g=>g.status==='pending').length]] as const) el<HTMLElement>(id).textContent = String(value);
  const term = el<HTMLInputElement>('#search').value.toLocaleLowerCase('es');
  const status = el<HTMLSelectElement>('#status').value;
  list.replaceChildren();
  const filtered = guests.filter(g => g.display_name.toLocaleLowerCase('es').includes(term) && (status === 'all' || g.status === status));
  if (!filtered.length) { const p = document.createElement('p'); p.className = 'helper'; p.textContent = 'No hay invitados para mostrar.'; list.append(p); return; }
  for (const guest of filtered) {
    const row = document.createElement('article'); row.className = 'guest-row';
    const info = document.createElement('div'); const name = document.createElement('strong'); name.textContent = guest.display_name;
    const detail = document.createElement('p'); detail.textContent = `${guest.status === 'attending' ? 'Confirmó' : guest.status === 'declined' ? 'No asistirá' : 'Pendiente'} · ${guest.companion_allowed ? `Acompañante permitido${guest.companion_name ? `: ${guest.companion_name}` : ''}${guest.companion_attending ? ' (confirmado)' : ''}` : 'Sin acompañante'}`;
    info.append(name, detail); const actions = document.createElement('div'); actions.className = 'guest-actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Editar'; edit.addEventListener('click', () => { (form.elements.namedItem('id') as HTMLInputElement).value=guest.id; (form.elements.namedItem('name') as HTMLInputElement).value=guest.display_name; (form.elements.namedItem('companion') as HTMLInputElement).checked=guest.companion_allowed; (form.elements.namedItem('companionName') as HTMLInputElement).value=guest.companion_name || ''; cancel.hidden=false; form.scrollIntoView({behavior:'smooth'}); });
    const url = `${location.origin}/invitacion/${guest.invite_code}`;
    const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'Copiar enlace'; copy.addEventListener('click', async () => { try { await navigator.clipboard.writeText(url); message('Enlace copiado.'); } catch { message('No se pudo copiar el enlace.'); } });
    const share = document.createElement('a'); share.textContent = 'WhatsApp'; share.href = `https://wa.me/?text=${encodeURIComponent(`¡Hola ${guest.display_name}! Te comparto tu invitación: ${url}`)}`; share.target='_blank'; share.rel='noopener noreferrer';
    const locationStatus = document.createElement('p'); locationStatus.textContent = guest.location_used ? 'Código de ubicación usado' : guest.location_issued ? 'Código de ubicación generado' : 'Código de ubicación pendiente'; info.append(locationStatus);
    const locationCode = document.createElement('button'); locationCode.type = 'button'; locationCode.textContent = guest.location_issued ? 'Regenerar código' : 'Generar código';
    locationCode.addEventListener('click', async () => {
      if (guest.location_issued && !window.confirm('Esto invalidará el código anterior. ¿Generar uno nuevo?')) return;
      locationCode.disabled = true;
      try {
        const result = await api('POST', { id: guest.id, replace: guest.location_issued }, '/api/admin/location-code');
        guest.location_issued = true; guest.location_used = false;
        locationStatus.textContent = 'Código de ubicación generado'; locationCode.textContent = 'Regenerar código';
        let output = info.querySelector<HTMLElement>('.location-code-output');
        if (!output) { output = document.createElement('p'); output.className = 'location-code-output'; info.append(output); }
        output.textContent = `Código: ${result.code} — cópialo y compártelo con el invitado; solo se muestra aquí ahora. `;
        const copyCode = document.createElement('button'); copyCode.type = 'button'; copyCode.textContent = 'Copiar código';
        copyCode.addEventListener('click', async () => { try { await navigator.clipboard.writeText(result.code); message('Código copiado.'); } catch { message('Selecciona el código para copiarlo manualmente.'); } });
        output.append(copyCode);
        message('Código generado. Cópialo antes de actualizar la lista.');
      } catch (error) { message(error instanceof Error ? error.message : 'No se pudo generar el código.'); }
      finally { locationCode.disabled = false; }
    });
    actions.append(edit, copy, share, locationCode); row.append(info, actions); list.append(row);
  }
}
async function refresh() { guests = await api(); render(); login.hidden=true; dashboard.hidden=false; logout.hidden=false; message('Panel de administración.'); }
el<HTMLFormElement>('#login-form').addEventListener('submit', async e => { e.preventDefault(); if (!auth) { message('Falta configurar Neon Auth.'); return; } const f=new FormData(e.currentTarget as HTMLFormElement); message('Iniciando sesión…'); try { const {error}=await auth.signIn.email({email:String(f.get('email')), password:String(f.get('password'))}); if(error) throw new Error('No se pudo iniciar sesión. Revisa tus datos.'); await refresh(); } catch(err) { message(err instanceof Error ? err.message : 'Error de acceso.'); } });
logout.addEventListener('click', async () => { if(auth) await auth.signOut(); guests=[]; list.replaceChildren(); dashboard.hidden=true; logout.hidden=true; login.hidden=false; message('Sesión cerrada.'); });
form.addEventListener('submit', async e=>{e.preventDefault(); const f=new FormData(form); const id=String(f.get('id')||''); try { await api(id ? 'PATCH' : 'POST',{...(id ? {id}:{}),name:String(f.get('name')||''),companion:f.has('companion'),companionName:String(f.get('companionName')||'')}); form.reset(); (form.elements.namedItem('id') as HTMLInputElement).value=''; cancel.hidden=true; await refresh(); message('Invitado guardado.'); } catch(err){message(err instanceof Error ? err.message : 'Error al guardar.');} });
cancel.addEventListener('click',()=>{form.reset(); (form.elements.namedItem('id') as HTMLInputElement).value=''; cancel.hidden=true;});
el<HTMLButtonElement>('#refresh-list').addEventListener('click', async () => { try { await refresh(); message('Lista actualizada.'); } catch (error) { message(error instanceof Error ? error.message : 'No se pudo actualizar la lista.'); } });
el<HTMLInputElement>('#search').addEventListener('input',render); el<HTMLSelectElement>('#status').addEventListener('change',render);
if (auth) auth.getSession().then(({data})=>{if(data?.session) return refresh();}).catch((error)=>message(error instanceof Error ? error.message : 'No se pudo acceder al panel.')); else message('Falta configurar Neon Auth.');
