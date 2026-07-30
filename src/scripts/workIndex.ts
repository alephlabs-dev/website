// Work index interaction (shared by the Home teaser and the Work page).
//
// Rows rest dimmed; hovering/clicking a row makes it active. On the Work page an
// active row also drives the detail panel (preview label, title, blurb, scope).
// Pointer leaving the list resets to the first row. On coarse pointers (touch),
// the row nearest the viewport centre becomes active instead of hover.
interface ScopeData {
  image?: string;
  num?: string;
  name?: string;
  blurb?: string;
  scope?: string[];
}

function setText(root: ParentNode, selector: string, value: string | undefined): void {
  const el = root.querySelector<HTMLElement>(selector);
  if (el && value !== undefined) el.textContent = value;
}

function initOne(container: HTMLElement): void {
  const rows = Array.from(container.querySelectorAll<HTMLElement>('[data-work-row]'));
  if (!rows.length) return;

  const detail = document.querySelector<HTMLElement>(
    `[data-work-detail="${container.dataset.workIndex}"]`
  );
  const defaultIndex = Number(container.dataset.default ?? '0');

  const parseData = (row: HTMLElement): ScopeData => {
    try {
      return JSON.parse(row.dataset.item ?? '{}') as ScopeData;
    } catch {
      return {};
    }
  };

  const setActive = (index: number): void => {
    rows.forEach((row, i) => (row.dataset.active = String(i === index)));
    if (!detail) return;
    const data = parseData(rows[index]);
    setText(detail, '[data-detail-image]', data.image ? `[ ${data.image} ]` : undefined);
    setText(detail, '[data-detail-label]', `${data.num} — ${data.name}`);
    setText(detail, '[data-detail-blurb]', data.blurb);
    const scopeEl = detail.querySelector<HTMLElement>('[data-detail-scope]');
    if (scopeEl && data.scope) {
      scopeEl.innerHTML = '';
      for (const line of data.scope) {
        const div = document.createElement('div');
        div.textContent = line;
        scopeEl.appendChild(div);
      }
    }
  };

  const coarse = window.matchMedia('(pointer: coarse)').matches;

  if (coarse) {
    // Activate whichever row sits closest to the viewport centre.
    const onScroll = (): void => {
      const centre = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      rows.forEach((row, i) => {
        const rect = row.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - centre);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  } else {
    rows.forEach((row, i) => {
      row.addEventListener('mouseenter', () => setActive(i));
      row.addEventListener('click', () => setActive(i));
    });
    container.addEventListener('mouseleave', () => setActive(defaultIndex));
  }

  setActive(defaultIndex);
}

export function initWorkIndex(): void {
  document
    .querySelectorAll<HTMLElement>('[data-work-index]')
    .forEach((el) => initOne(el));
}
