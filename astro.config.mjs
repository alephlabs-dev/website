// @ts-check
import { defineConfig } from 'astro/config';

// Aleph Labs — static marketing site.
// Interactivity (GSAP scroll motion, the Three.js aleph, the live clock)
// ships as bundled client <script> tags, so no UI-framework integration is needed.
export default defineConfig({
  site: 'https://alephlabs.dev',
});
