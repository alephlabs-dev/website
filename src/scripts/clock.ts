// Live Buenos Aires clock — the "machine" voice keeps time in the nav and footer.
export function startClock(): void {
  const els = document.querySelectorAll<HTMLElement>('[data-clock]');
  if (!els.length) return;

  const tick = (): void => {
    const time = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour12: false,
    });
    els.forEach((el) => (el.textContent = time));
  };

  tick();
  window.setInterval(tick, 1000);
}
