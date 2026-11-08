const container = document.querySelector<HTMLElement>('.rsvp');
const form = container?.querySelector<HTMLFormElement>('.rsvp-form');
if (container && form) {
  const feedback = form.querySelector<HTMLElement>('.rsvp-feedback')!;
  const current = container.querySelector<HTMLElement>('.rsvp-current')!;
  const buttons = Array.from(form.querySelectorAll<HTMLButtonElement>('button'));
  feedback.textContent = ''; 
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const answer = (event as SubmitEvent).submitter as HTMLButtonElement | null;
    if (!answer || (answer.value !== 'attending' && answer.value !== 'declined')) return;
    const companion = form.querySelector<HTMLInputElement>('[name="companion"]');
    const companionAttending = answer.value === 'attending' && !!companion?.checked;
    buttons.forEach(button => { button.disabled = true; });
    feedback.textContent = 'Guardando tu respuesta…';
    try {
      const response = await fetch(`/api/invitacion/${encodeURIComponent(container.dataset.code || '')}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: answer.value, companionAttending }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo guardar tu respuesta.');
      if (companion && answer.value === 'declined') companion.checked = false;
      current.textContent = answer.value === 'attending' ? `Confirmaste tu asistencia${companionAttending ? ' con un acompañante' : ''}.` : 'Indicaste que no podrás asistir.';
      feedback.textContent = '¡Respuesta guardada! Puedes cambiarla hasta el 16 de noviembre.';
    } catch (error) { feedback.textContent = error instanceof Error ? error.message : 'No se pudo guardar tu respuesta. Inténtalo de nuevo.'; }
    finally { buttons.forEach(button => { button.disabled = false; }); }
  });
}
