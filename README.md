# Portofolio — Muhammad Afifani Romadhan

Static portfolio site (GitHub Pages) with a **swarm build** effect: a crowd of
multiplayer-style cursors builds the page as you scroll. They draw selection
boxes, type text, drop in images and duplicate cards, and idle cursors flock
around your mouse.

## Structure

```
index.html                  page template (rendered by the dc runtime)
assets/
  img/                      photos, logos, case-study figures
  fonts/                    JetBrains Mono, Plus Jakarta Sans, Space Grotesk (woff2)
  js/dc-runtime.js          template runtime (renders {{ }} bindings, EN/ID toggle, …)
  js/image-slot.js          <image-slot> component used for photos
  js/react*.min.js          React 18 (local copy, no CDN needed)
swarm/
  swarm-build.js            swarm-cursor build engine
  swarm-build.css           cursor / selection box / HUD styles
.image-slots.state.json     empty sidecar read by image-slot.js
.nojekyll                   serve files as-is on GitHub Pages
```

Content (texts in EN and ID, jobs, case studies, certificates) lives in the
`class Component` script near the end of `index.html`.

## Swarm build

- Plays automatically on load. The HUD at the bottom has speed (1×/2×/3×),
  **Skip**, **↻ Replay** and **✕** (hide cursors).
- If the visitor's device has *reduce motion* turned on, the page shows up
  finished, with a **▶ Play swarm build** button instead.
- URL switches: `?swarm=on` always auto-plays, `?swarm=off` disables it.
- Tune cursor count, names, colours and timing at the top of
  `swarm/swarm-build.js`.

## Run locally

```
python3 -m http.server 8000
# open http://localhost:8000
```

## CV download

The "Download CV" buttons point to `assets/CV_Muhammad_Afifani_Romadhan.pdf`.
Upload the PDF there with that exact name.
