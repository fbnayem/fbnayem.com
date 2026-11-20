# fbnayem.com

Personal website of Fazle Bary Nayem, built with [Astro](https://astro.build) and hosted on Vercel.

## Run locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Where things live

- `src/data/site.ts`: all page copy (profile, ventures, projects, principles, FAQ). Planned to move into Sanity.
- `src/styles/global.css`: design tokens (colours, type, spacing) and shared styles.
- `src/pages/`: Home, About, Ventures, Work (+ case studies), Insights, Connect, Privacy, 404.
- `src/scripts/motion.ts`: smooth scroll, text reveals, parallax, 3D tilt, magnetic buttons (GSAP + Lenis).
- `src/scripts/hero3d.ts`: the Three.js hero object.
- Page transitions use Astro view transitions. All motion respects reduced-motion settings.

## Before going live on fbnayem.com

- Search indexing is off everywhere (`noindex`). Set `PUBLIC_ALLOW_INDEXING=true` in Vercel only for the fbnayem.com production domain.
- Add photos to `public/photos/` (`portrait.jpg` for the hero, `working.jpg` for About). They appear automatically.
- Replace venture letter marks and work gradients with official logos and screenshots.
- Connect the contact form (server handler + email delivery), then update the Privacy page.
- Add the Sanity content editor.
