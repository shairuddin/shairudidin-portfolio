# Experimental_Portfolio

Portfolio website for **Shaik Siruddin Pasha**, Digital Marketing Professional (Dubai).
Dark, editorial design inspired by touquirakhtar.com, rebuilt for a marketer, with 218 real work samples.

## Quick look (no install)

Open `dist/index.html` in your browser. Everything is already built.

## Develop

Requires Node.js 18+.

```bash
npm install
npm run dev      # http://localhost:5173, rebuilds when you edit src/
npm run build    # writes the deployable site to dist/
```

To publish, upload the **contents of `dist/`** to any static host (Netlify, Vercel, GitHub Pages, cPanel).

## Where to edit things

| What | File |
| --- | --- |
| Name, intro, contact details, stats, services, process, toolkit | `src/config/site.js` |
| Experience timeline | `src/data/experience.js` |
| Skill groups | `src/data/skills.js` |
| Work titles, clients, featured items, hiding an item | `scripts/work-overrides.json`, then run `node scripts/generate-projects.mjs` |
| Colours, fonts, spacing | `src/styles.css` (tokens at the top) |
| Toolkit logos and names | `src/config/site.js` (`toolkit`), icons in `src/data/toolLogos.js` |
| Portrait illustration | `public/assets/portrait.svg` |
| CV download | `public/assets/Shaik_Siruddin_Pasha_CV.pdf` |

## Work samples

`public/assets/work/` holds web-sized copies of the files in the original
"Siruddin Pasha Portfolio" folder (originals untouched):

- images → WebP (max 1600 px) plus a thumbnail
- videos → 540p MP4 (H.264, fast start) plus a poster frame
- PDFs → copied, with a first-page thumbnail
- voiceovers → MP3

`scripts/work-manifest.json` lists every converted file. `src/data/projects.js` is generated from it
together with `scripts/work-overrides.json`. `docs/work-overview-*.jpg` are contact sheets of all the work, numbered.

Not included on the site: `VS ECO BLOCKS.pptx` (the same plan is shown as a PDF) and a staff ID card image
that contains personal and emergency-contact details. Two duplicate files were skipped.

To feature a different piece, give it `"featured": <number>` in `scripts/work-overrides.json`
(higher numbers show first) and regenerate.

## Tool logos

Logos for Meta, Google Ads, Google, WhatsApp, Photoshop, Premiere Pro, Filmora and VEED come from
Simple Icons (CC0) and Tabler Icons (MIT); Lightroom and Adobe Express use the Adobe mark.
Canva, CapCut, VN, KineMaster, PowerDirector and InVideo are not in those free icon sets, so they show a
lettered tile. To use an official logo, save it (SVG or PNG) in `public/assets/tools/`, set
`logo: "assets/tools/canva.svg"` on that tool in `src/config/site.js`, and run `npm run build`.
Logos are trademarks of their owners and are shown only to name the tools used.

## Features

- Hero with large "PORTFOLIO" type, animated faceless illustration, live counters
- Filterable, searchable masonry grid (Video & Reels, Graphic Design, Logo Design, Marketing Plans, Influencer & Social, AI Voiceovers)
- Muted reel previews on hover (desktop), full-screen viewer with keyboard arrows / Esc
- Results strip, toolkit marquee, services, about, process, expandable experience timeline
- WhatsApp and email contact, mailto form, CV download
- Motion on/off toggle (remembered), respects reduced-motion settings
- Responsive from 320 px; keyboard accessible; SEO meta and JSON-LD

Notes: the build uses esbuild + React only. Animations are written with CSS and IntersectionObserver
instead of Framer Motion, and icons are inline SVG instead of Lucide, to keep it dependency-light.
