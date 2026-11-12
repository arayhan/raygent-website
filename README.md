# raygent-website

The landing page for [raygent](https://github.com/arayhan/raygent), a CLI that
turns a raw idea into a runnable repo your coding agents already know how to
work in.

Live at https://arayhan.github.io/raygent-website/

Built with Vite, React, Tailwind CSS, three.js and GSAP. Every push to `main`
is typechecked, built and deployed to GitHub Pages.

## Development

Requires Node 20 or newer.

```sh
npm install
npm run dev        # local dev server
npm run typecheck  # tsc, no emit
npm run build      # production build into dist/
npm run preview    # serve the built dist/
```

## Design

The design system and the reasoning behind it live in [MASTER.md](MASTER.md).
Read it before changing colors, type, motion or layout.
