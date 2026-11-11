const audio = document.querySelector<HTMLAudioElement>('#invitation-music');
const toggle = document.querySelector<HTMLButtonElement>('#music-toggle');
const status = document.querySelector<HTMLElement>('#music-status');
if (audio && toggle && status) {
  const update = () => {
    const playing = !audio.paused;
    toggle.textContent = playing ? '♫  Pausar música' : '♪  Activar música';
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'Pausar música' : 'Activar música');
  };
  audio.addEventListener('play', () => { status.textContent = ''; update(); });
  audio.addEventListener('pause', update);
  audio.addEventListener('error', () => { status.textContent = 'No se pudo cargar la música.'; update(); });
  toggle.addEventListener('click', async () => {
    if (!audio.paused) { audio.pause(); return; }
    try { await audio.play(); } catch { status.textContent = 'No se pudo reproducir la música. Inténtalo de nuevo.'; }
  });
  void audio.play().catch(() => { status.textContent = 'Toca para escuchar la música.'; update(); });
}
