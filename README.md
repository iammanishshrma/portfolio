# Manish Sharma, portfolio

A single-page portfolio built with React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui and Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Where things live

- `src/data/resume.ts`: every fact on the page (profile, experience, education, toolkit). Edit here first.
- `src/components/sections/`: one file per page section (Hero, Projects, Experience, Toolkit, Contact).
- `src/components/demos/`: the three interactive project demos. They are lazy-loaded so they stay out of the main bundle.
- `src/components/hero/RenderTrace.tsx`: the performance trace in the hero. Totals are real (3.2s and 1.6s); the per-phase breakdown is illustrative.
- `src/index.css`: palette (paper, ink and a yellow highlighter), fonts and shared utilities. Colors are CSS variables, so the whole scheme changes from the `@theme` block.
- `src/assets/portrait.webp`: the hero photo (720px wide, grayscale, metadata stripped). To swap it, export a WebP with location data removed and keep the same file name.
- `public/Manish_Sharma_React_Developer_Resume.pdf`: the resume linked from the page. Replace it to update the download.

## Deploy

`npm run build` produces a static `dist/` folder that works on Vercel, Netlify, Cloudflare Pages or GitHub Pages with no extra config.
# portfolio
