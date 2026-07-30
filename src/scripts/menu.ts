// Fullscreen mobile menu. The toggle lives in the header; the overlay is a
// fixed panel. Opening locks body scroll; links, the close button, and Escape
// all dismiss it.
export function initMenu(): void {
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const toggle = document.querySelector<HTMLElement>('[data-menu-toggle]');
  if (!menu || !toggle) return;

  const setOpen = (open: boolean): void => {
    menu.dataset.open = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '[ close ]' : '[ menu ]';
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => setOpen(menu.dataset.open !== 'true'));

  menu
    .querySelectorAll<HTMLElement>('[data-menu-close], a[href]')
    .forEach((el) => el.addEventListener('click', () => setOpen(false)));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.dataset.open === 'true') setOpen(false);
  });
}
