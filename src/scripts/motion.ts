// Structural motion, never ornamental (per the brand direction).
//   · Display headings clip-reveal per line from behind an overflow mask.
//   · Content blocks fade-and-rise as they enter.
//   · Home's process sequence pins and scrolls horizontally on desktop, the
//     connecting rule drawing left→right; it stacks vertically below 900px.
// Everything is gated on prefers-reduced-motion: reduce (CSS already reveals
// the content statically in that case, so we simply bail out).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function revealLines(): void {
  // The CSS hidden state is translateY(110%); GSAP reads that into its `y`
  // channel (in px), so we animate `y` to 0 — animating a separate `yPercent`
  // would leave the CSS-derived `y` in place and park the line hidden.
  const play = (el: Element): void =>
    void gsap.to(el.querySelectorAll('.line-inner'), {
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.06,
      overwrite: true,
    });

  document.querySelectorAll<HTMLElement>('.reveal-lines').forEach((el) => {
    const rect = el.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    // Above-the-fold headings play on load; the rest wait for scroll. (A scroll
    // trigger left to reveal in-view content on its own can park it hidden.)
    if (inView) {
      play(el);
    } else {
      ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => play(el) });
    }
  });
}

function revealBlocks(): void {
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 88%',
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
      }),
  });
}

function processSequence(): void {
  const section = document.querySelector<HTMLElement>('[data-process]');
  if (!section) return;
  const track = section.querySelector<HTMLElement>('[data-process-track]');
  const rule = section.querySelector<HTMLElement>('[data-process-rule]');
  if (!track) return;

  const mm = gsap.matchMedia();

  // Desktop: horizontal pin. The track is wider than the viewport; scroll
  // drives it left while the rule draws across.
  mm.add('(min-width: 900px)', () => {
    // Overflow of the track past its own visible width, plus a little clearance
    // so the last card (and its text) fully clears the right edge at the end.
    const distance = () => {
      const overflow = track.scrollWidth - track.clientWidth;
      return overflow > 0 ? overflow + 32 : 0;
    };
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });
    if (rule) {
      // Finish the rule a bit before the end so it reads as "drawn" rather than
      // still creeping across as the section releases.
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          transformOrigin: 'left center',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + distance() * 0.7,
            scrub: 0.4,
          },
        }
      );
    }
    return () => tween.kill();
  });

  // Mobile: vertical stack, rule draws downward as the block enters.
  mm.add('(max-width: 899px)', () => {
    gsap.set(track, { x: 0 });
    if (rule) {
      gsap.fromTo(
        rule,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top center',
          scrollTrigger: { trigger: track, start: 'top 80%', end: 'bottom 60%', scrub: 1 },
        }
      );
    }
  });
}

export function initMotion(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  let started = false;
  const start = (): void => {
    if (started) return;
    started = true;
    revealLines();
    revealBlocks();
    processSequence();
    ScrollTrigger.refresh();
  };

  // Wait for web fonts so line heights are final: a font swap mid-entrance
  // shifts the baseline and the hero reveal appears to jump/glitch. Fall back
  // to a timer in case fonts.ready never settles.
  if ('fonts' in document && document.fonts.status !== 'loaded') {
    document.fonts.ready.then(start);
    window.setTimeout(start, 1200);
  } else {
    start();
  }
}
