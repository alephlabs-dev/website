# Aleph Labs — website

Marketing site for Aleph Labs, built from the Claude Design handoff bundle in
`../project`. Astro (static output), TypeScript, GSAP for motion, Three.js for
the hero aleph. No UI framework — interactivity ships as bundled client scripts.

## Commands

```bash
npm install
npm run dev       # dev server at http://localhost:4321
npm run build     # static build to dist/
npm run preview   # serve the production build
npm run check     # astro + TypeScript diagnostics
```

## Structure

```
src/
  layouts/Base.astro        head, fonts, grain overlay, shared script wiring
  components/
    Header.astro            sticky nav + fullscreen mobile menu
    Footer.astro
    AlephMark.astro         the three-stroke logo (CSS)
  pages/
    index.astro   /         Home
    services.astro /services
    work.astro    /work     primary design
    about.astro   /about
  scripts/
    clock.ts                live Buenos Aires clock
    menu.ts                 mobile menu open/close
    workIndex.ts            Work index hover → detail panel
    motion.ts               GSAP line reveals, block reveals, process pin
    aleph.ts                Three.js machined aleph (Home hero)
  styles/global.css         brand tokens, type roles, reveal/no-js states
```

## Notes

- **Theming** is per page via `data-theme` on `<html>` (`dark` = ink pages,
  `light` = plaster pages), which drives body colour, link hover, and the grain
  overlay (ink pages only).
- **Motion** honours `prefers-reduced-motion`: reveals render statically, the
  process sequence doesn't pin, and the hero keeps its CSS aleph rest pose
  instead of loading Three.js.
- The prototypes' container-query units (`cqi`) and the design-tool viewport
  simulator were converted to `vw` / real breakpoints — identical clamp values,
  no `container-type` containing-block surprises.
- Placeholder images (workshop / portrait / render tiles) mirror the design
  intent; drop real assets into those blocks when available.
- `cal.com/alephlabs`, LinkedIn and GitHub links are the prototype's
  placeholders — point them at real URLs before launch.
