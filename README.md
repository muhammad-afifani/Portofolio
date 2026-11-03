# Portofolio · Muhammad Afifani Romadhan

Static portfolio site (GitHub Pages). Light "process datasheet" design with animated
engineering drawings, EN/ID language switch, and a **swarm build**: a crowd of named
cursors (NEXUS-01, ATLS-07, ...) builds the page as you scroll.

## Structure

```
index.html                     page shell (nav, main, lightbox)
assets/
  js/data.js                   ALL content, English + Indonesian (edit this to update the site)
  js/main.js                   renders the sections, language switch, tabs, project explorer, lightbox
  js/illustrations.js          animated SVG drawings (heat exchanger, pressure vessel + FEM, emission, piping)
  css/style.css                design tokens, layout, responsive rules
  fonts/                       Bricolage Grotesque, Instrument Sans, IBM Plex Mono (woff2, self-hosted)
  img/                         photos, logos, case-study figures (webp)
  CV_Muhammad_Afifani_Romadhan.pdf
swarm/
  swarm-build.js / .css        swarm-cursor build engine and its HUD
```

## Editing content

Everything visible comes from `assets/js/data.js`, in two blocks: `en` and `id`.

- **Freelance projects**: `projectLog`. Each project has `client`, `project`, `scope`, `role`,
  `discipline` (`cfd`, `fem`, `mech`, `hx`, `plan`: picks the colour and the animated drawing),
  `date` and `link`. The detail panel shows "write-up coming soon" and two photo slots until
  you add the real write-up.
- **Jobs**: `timeline` (bullets, `duties`, problems & solutions, photos).
- **Case studies**: `caseStudies` (steps, metrics, figures).
- Replace `assets/CV_Muhammad_Afifani_Romadhan.pdf` to update the CV, and
  `assets/img/cv-page-1.webp` for its preview image.

## Colour means something

Each colour is a process stream, and a section takes the colour of what it talks about:
red = hot side / stress, blue = cold side, green = energy, amber = piping / EPC,
teal = CFD, violet = certification.

## Motion

- The pause button in the nav stops every animation (remembered per visitor).
- Visitors with *reduce motion* on get still drawings and a "Play swarm build" button.
- URL switches: `?swarm=off` disables the swarm, `?swarm=on` always auto-plays it.

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```
