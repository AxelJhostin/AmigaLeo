import { createAuthClient } from '@neon/auth';
const app = document.querySelector<HTMLElement>('#setup')!;
const authUrl = app.dataset.authUrl || '';
const form = document.querySelector<HTMLFormElement>('#signup')!;
const result = document.querySelector<HTMLElement>('#result')!;
form.dataset.ready = 'true';
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!authUrl) { result.textContent = 'Falta configurar Neon Auth.'; return; }
  const fields = new FormData(form);
  const button = form.querySelector<HTMLButtonElement>('button')!;
  button.disabled = true; result.textContent = 'Creando cuenta…';
  try {
    const auth = createAuthClient(authUrl);
    const { error } = await auth.signUp.email({ name: String(fields.get('name')).trim(), email: String(fields.get('email')).trim(), password: String(fields.get('password')) });
    if (error) throw new Error(error.message || 'No se pudo crear la cuenta.');
    form.reset(); form.hidden = true;
    result.textContent = 'Cuenta creada. Avísame en el chat y dime el correo que usaste para poder autorizarla. No envíes la contraseña.';
  } catch (error) { result.textContent = error instanceof Error ? error.message : 'No se pudo crear la cuenta.'; }
  finally { button.disabled = false; }
});
