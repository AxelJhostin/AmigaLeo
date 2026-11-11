const section = document.querySelector<HTMLElement>('.location-section');
const form = section?.querySelector<HTMLFormElement>('.location-form');
if (section && form) {
  const feedback = form.querySelector<HTMLElement>('.location-feedback')!;
  const input = form.querySelector<HTMLInputElement>('#location-code')!;
  const button = form.querySelector<HTMLButtonElement>('button')!;
  const result = section.querySelector<HTMLElement>('.location-result')!;
  feedback.textContent = '';
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const code = input.value.trim();
    if (!/^[A-Za-z0-9_-]{22}$/.test(code)) { feedback.textContent = 'Revisa el código e inténtalo de nuevo.'; return; }
    button.disabled = true; feedback.textContent = 'Consultando ubicación…';
    try {
      const response = await fetch(`/api/ubicacion/${encodeURIComponent(section.dataset.inviteCode || '')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store', body: JSON.stringify({ code }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'No se pudo consultar la ubicación.');
      result.querySelector('p')!.textContent = data.location;
      if (typeof data.mapUrl === 'string') {
        const link = document.createElement('a');
        link.href = data.mapUrl; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'Abrir ubicación en Google Maps'; link.className = 'location-map-link';
        result.append(link);
      }
      result.hidden = false; form.hidden = true; input.value = '';
    } catch (error) { feedback.textContent = error instanceof Error ? error.message : 'No se pudo consultar la ubicación. Contacta a la anfitriona si el código ya fue usado.'; }
    finally { button.disabled = false; }
  });
}
