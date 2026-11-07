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
| Industries (work folders) and which clients are in each | `INDUSTRIES` in `scripts/generate-projects.mjs`, then run `node scripts/generate-projects.mjs` |
| Colours, fonts, spacing | `src/styles.css` (tokens at the top) |
| Toolkit logos and names | `src/config/site.js` (`toolkit`), icons in `src/data/toolLogos.js` |
| Hero 3D avatar | `src/components/Avatar3D.jsx`; layers in `public/assets/avatar/` (character `avatar.webp`, depth map `depth.webp`, floating cards `card-*.webp`). The older flat illustration is kept at `public/assets/portrait.svg` |
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

## 3D avatar notes

The avatar is a 2.5D effect built from the single 3D render: the character is drawn with WebGL and
displaced by a depth map so the head turns in perspective, and the five UI cards are separate layers in a
CSS 3D scene. Browsers block WebGL from reading image files when a page is opened straight from disk, so on
`file://` the character stays still (the cards and tilt still animate). Through `npm run dev` or once hosted,
the full effect runs. It switches off with the Motion toggle and for reduced-motion users.

## Features

- Hero with large "PORTFOLIO" type, 2.5D animated 3D avatar (WebGL depth parallax, floating cards at different depths, follows the mouse, idle sway on touch), live counters
- Work organised like folders: Highlights, then 6 industry folders (Healthcare, Education, Retail & Consumer, Tech/AI & Creators, Real Estate & Services, Events & Community). Inside a folder, work is grouped by client and can be filtered by client and by type. A "By type" view and a global search are also available. Every folder has its own link (e.g. `#work/healthcare/arogya-hospitals`) and the browser Back button works
- Muted reel previews on hover (desktop), full-screen viewer with keyboard arrows / Esc
- Results strip, toolkit marquee, services, about, process, expandable experience timeline
- WhatsApp and email contact, mailto form, CV download
- Motion on/off toggle (remembered), respects reduced-motion settings
- Responsive from 320 px; keyboard accessible; SEO meta and JSON-LD

Notes: the build uses esbuild + React only. Animations are written with CSS and IntersectionObserver
instead of Framer Motion, and icons are inline SVG instead of Lucide, to keep it dependency-light.
