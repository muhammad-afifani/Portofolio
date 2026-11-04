/* Portfolio renderer + interactions. Content: assets/js/data.js (window.PORTFOLIO). */
(function () {
  'use strict';

  var P = window.PORTFOLIO;
  var IL = window.Illustrations;
  var root = document.documentElement;
  var main = document.getElementById('main');
  var navEl = document.getElementById('nav');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var lang = store('lang') === 'id' ? 'id' : 'en';
  var D, U;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function strip(label) { return String(label || '').replace(/\s*[↗↓→]\s*$/, ''); } // arrows come from CSS
  function ext(href, label, cls) {
    return '<a class="link ext ' + (cls || '') + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(strip(label)) + '</a>';
  }

  // ------------------------------------------------------------- copy for illustration labels
  var IL_TEXT = {
    en: {
      hx: { l_hotIn: 'Hot in', l_hotOut: 'Hot out', l_coldIn: 'Cold in', l_coldOut: 'Cold out', l_baffle: 'Segmental baffle', l_tubes: 'Tube bundle', l_tubesheet: 'Tubesheet', l_shell: 'Shell (section)' },
      pv: { l_vm: 'von Mises', l_cycles: 'Cycles (N)', l_salt: 'Salt (MPa), ASME VIII Div.2 fatigue check', l_design: 'Design life 7.39e6', l_allow: 'Allowable 5.02e9', l_margin: 'about 680x margin' },
      emis: { l_gtg: 'GTG package · SEU', l_port: 'Stack test port (PPPU)', l_flare: 'Flare', l_chart: 'EnPI against Energy Baseline (EnB)', l_time: 'time', l_warn: 'Early warning', l_better: 'below EnB = saving', l_illus: 'illustration, not plant data' },
      pipe: { l_pending: 'Pending', l_welded: 'Welded', l_nde: 'NDE accepted', l_scurve: 'S-curve: weld progress, plan against actual', l_plan: 'plan', l_actual: 'actual', l_illus: 'illustration, not project data' },
      modes: ['Both streams', 'Shell side', 'Tube side'],
      sheet: ['Drawing', 'Scale: not to scale', 'Live'],
      pause: 'Pause motion', play: 'Play motion'
    },
    id: {
      hx: { l_hotIn: 'Panas masuk', l_hotOut: 'Panas keluar', l_coldIn: 'Dingin masuk', l_coldOut: 'Dingin keluar', l_baffle: 'Baffle segmental', l_tubes: 'Bundel tube', l_tubesheet: 'Tubesheet', l_shell: 'Shell (potongan)' },
      pv: { l_vm: 'von Mises', l_cycles: 'Siklus (N)', l_salt: 'Salt (MPa), cek fatigue ASME VIII Div.2', l_design: 'Umur desain 7.39e6', l_allow: 'Diizinkan 5.02e9', l_margin: 'margin sekitar 680x' },
      emis: { l_gtg: 'Paket GTG · SEU', l_port: 'Port uji cerobong (PPPU)', l_flare: 'Flare', l_chart: 'EnPI terhadap Energy Baseline (EnB)', l_time: 'waktu', l_warn: 'Peringatan dini', l_better: 'di bawah EnB = hemat', l_illus: 'ilustrasi, bukan data plant' },
      pipe: { l_pending: 'Belum', l_welded: 'Sudah dilas', l_nde: 'Lolos NDE', l_scurve: 'S-curve: progres las, rencana vs aktual', l_plan: 'rencana', l_actual: 'aktual', l_illus: 'ilustrasi, bukan data proyek' },
      modes: ['Kedua aliran', 'Sisi shell', 'Sisi tube'],
      sheet: ['Gambar', 'Skala: tidak berskala', 'Live'],
      pause: 'Jeda animasi', play: 'Putar animasi'
    }
  };
  var SVC = [
    { kind: 'pv', stream: 's-hot', sheet: 'V-116 · FEM' },
    { kind: 'hx', stream: 's-cold', sheet: 'E-101 · TEMA shell & tube' },
    { kind: 'emis', stream: 's-energy', sheet: 'ISO 50001 · PPPU' },
    { kind: 'pipe', stream: 's-amber', sheet: 'ISO · RFID spool tracking' }
  ];
  var DISC = { cfd: 's-teal', fem: 's-hot', mech: 's-cold', hx: 's-hot', plan: 's-amber' };
  var FOCUS_STYLE = [ // P&ID line types, one per focus area
    ['solid', '--hot'], ['dash', '--cold'], ['solid', '--amber'], ['dot', '--ink'], ['dash', '--energy'], ['solid', '--energy'], ['dot', '--violet']
  ];

  // ------------------------------------------------------------- sections
  function navHTML() {
    var items = [['about', U.navAbout], ['services', U.navServices], ['timeline', U.navTimeline], ['case-studies', U.navCase],
      ['projects', U.navProjects], ['credentials', U.navCredentials], ['contact', U.navContact]];
    return '<div class="wrap">' +
      '<a class="brand" href="#top" aria-label="Muhammad Afifani Romadhan, home"><span class="brand-mark" aria-hidden="true">MA</span><span class="brand-name">M. Afifani Romadhan</span></a>' +
      '<ul class="nav-links" id="nav-links">' + items.map(function (i) { return '<li><a href="#' + i[0] + '">' + esc(i[1]) + '</a></li>'; }).join('') + '</ul>' +
      '<div class="nav-tools">' +
      '<div class="seg" role="group" aria-label="' + esc(U.langLabel) + '"><button type="button" data-lang="en" aria-pressed="' + (lang === 'en') + '">EN</button><button type="button" data-lang="id" aria-pressed="' + (lang === 'id') + '">ID</button></div>' +
      '<button type="button" class="icon-btn" id="motion-btn" aria-pressed="false"></button>' +
      '<a class="btn btn-ink btn-cv" href="assets/CV_Muhammad_Afifani_Romadhan.pdf" download>' + esc(U.downloadCv) + '</a>' +
      '<button type="button" class="icon-btn menu-btn" id="menu-btn" aria-expanded="false" aria-controls="nav-links" aria-label="' + esc(U.menu) + '">' +
      '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" stroke-width="2" fill="none"/></svg></button>' +
      '</div></div>';
  }

  // Top manway nozzle with a bolted flange, and the support legs, so the portrait reads as a pressure vessel.
  // Both are drawn behind the vessel shell, so only the parts outside the outline show.
  function vesselParts() {
    var bolts = function (y, h) { return [40, 56, 72, 88, 104, 120].map(function (x) { return '<rect x="' + x + '" y="' + y + '" width="6" height="' + h + '" rx="1" fill="#15181D"/>'; }).join(''); };
    var top = '<svg class="v-top" viewBox="0 0 160 76" aria-hidden="true"><defs><linearGradient id="vs" x1="0" x2="1"><stop offset="0" stop-color="#8F9AA7"/><stop offset=".35" stop-color="#E3E8ED"/><stop offset="1" stop-color="#7D8895"/></linearGradient></defs>' +
      '<rect x="52" y="30" width="56" height="46" fill="url(#vs)" stroke="#15181D" stroke-width="3"/>' +
      '<rect x="22" y="10" width="116" height="20" rx="3" fill="url(#vs)" stroke="#15181D" stroke-width="3"/>' + bolts(5, 30) +
      '<rect x="40" y="2" width="80" height="6" rx="2" fill="#15181D"/></svg>';
    var legs = '<svg class="v-legs" viewBox="0 0 420 110" aria-hidden="true"><defs><linearGradient id="vl" x1="0" x2="1"><stop offset="0" stop-color="#8F9AA7"/><stop offset=".4" stop-color="#E3E8ED"/><stop offset="1" stop-color="#7D8895"/></linearGradient></defs>' +
      '<path d="M96 30 L330 86 M326 30 L92 86" stroke="#15181D" stroke-width="2" fill="none" opacity=".55"/>' +
      [[78, 24], [322, 24]].map(function (l) {
        return '<rect x="' + l[0] + '" y="0" width="22" height="86" fill="url(#vl)" stroke="#15181D" stroke-width="3"/>' +
          '<rect x="' + (l[0] - 14) + '" y="86" width="50" height="9" rx="2" fill="#15181D"/>' +
          '<circle cx="' + (l[0] - 6) + '" cy="90.5" r="2" fill="#F4F1EA"/><circle cx="' + (l[0] + 28) + '" cy="90.5" r="2" fill="#F4F1EA"/>';
      }).join('') +
      '<line x1="30" y1="95" x2="390" y2="95" stroke="#15181D" stroke-width="2"/>' +
      Array.apply(null, Array(24)).map(function (_, k) { return '<line x1="' + (34 + k * 15) + '" y1="95" x2="' + (27 + k * 15) + '" y2="104" stroke="#4A515C" stroke-width="1.5"/>'; }).join('') + '</svg>';
    return top + legs;
  }

  function heroHTML() {
    var stats = D.stats.map(function (s, i) {
      var cls = ['s-amber', 's-energy', 's-cold', 's-hot'][i];
      return '<li class="' + cls + '"><div class="stat-v" data-count="' + esc(s.value) + '">' + esc(s.value) + '</div><div class="stat-l">' + esc(s.label) + '</div></li>';
    }).join('');
    return '<section class="sec hero s-hot" id="top" data-screen-label="Hero"><div class="wrap">' +
      '<div class="hero-grid"><div>' +
      '<p class="kicker">' + esc(U.heroKicker) + '</p>' +
      '<h1><span class="pre">Ir. </span>Muhammad Afifani <span class="heat">Romadhan</span><span class="post">, S.T., IPP.</span></h1>' +
      '<p class="hero-lead">' + esc(U.heroTagline) + '</p>' +
      '<div class="cta-row"><a class="btn btn-ink" href="#case-studies">' + esc(strip(U.viewWorkCta)) + '</a>' +
      '<a class="btn btn-line dl" href="assets/CV_Muhammad_Afifani_Romadhan.pdf" download>' + esc(strip(U.getCvCta)) + '</a></div>' +
      '<ul class="hero-tags" aria-label="' + esc(U.focusAreasLabel) + '">' + D.heroTags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="portrait">' + vesselParts() + '<div class="vessel"><img src="assets/img/portrait.webp" width="786" height="800" alt="Portrait of Muhammad Afifani Romadhan" fetchpriority="high"></div>' +
      '<span class="nozzle n1" aria-hidden="true"></span><span class="nozzle n2" aria-hidden="true"></span>' +
      '<div class="callout c2"><b>' + esc(U.nowLabel) + '</b>' + esc(U.nowValue) + '</div>' +
      '<div class="callout c1"><b>' + esc(U.regLabel) + '</b>' + esc(U.regValue) + '</div></div>' +
      '</div>' +
      '<div class="clients"><span class="clients-label">' + esc(U.experienceAtLabel) + '</span><ul class="client-logos">' +
      P.clients.map(function (c) { return '<li><img src="' + esc(c.logo) + '" alt="' + esc(c.name) + '" width="120" height="34" loading="lazy"></li>'; }).join('') +
      '</ul></div>' +
      '<ul class="stats">' + stats + '</ul>' +
      '</div></section>';
  }
  function cap(s) { // 'STEPS I TOOK' -> 'Steps I took'; keeps acronyms such as CV, PPPU
    s = String(s || '');
    return s.split(' ').map(function (w, k) {
      if (/^(CV|PPPU|HSSE|EPC|ISO|PII|BNSP|I)$/.test(w.replace(/[^A-Z]/g, ''))) return w;
      w = w.toLowerCase();
      return k ? w : w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }

  function aboutHTML() {
    var legend = D.heroTags.map(function (t, i) {
      var st = FOCUS_STYLE[i % FOCUS_STYLE.length];
      var dash = st[0] === 'dash' ? ' stroke-dasharray="10 6"' : st[0] === 'dot' ? ' stroke-dasharray="2 5" stroke-linecap="round"' : '';
      return '<li><svg viewBox="0 0 56 10" aria-hidden="true"><line x1="0" y1="5" x2="56" y2="5" stroke="var(' + st[1] + ')" stroke-width="3.5"' + dash + '/></svg>' + esc(t) + '</li>';
    }).join('');
    return section('about', 'About', 'E-01', U.sectionAbout, '', 's-energy',
      '<div class="about-grid"><div><p class="about-bio">' + esc(U.heroBio) + '</p>' +
      '<dl class="facts">' + D.quickFacts.map(function (f) {
        var v = f.value.indexOf('@') > 0 ? '<a class="link" href="mailto:' + esc(f.value) + '">' + esc(f.value) + '</a>' : esc(f.value);
        return '<div><dt>' + esc(cap(f.label)) + '</dt><dd>' + v + '</dd></div>';
      }).join('') + '</dl></div>' +
      '<div><p class="legend-title">' + esc(cap(U.focusAreasLabel)) + '</p><ul class="legend">' + legend + '</ul></div></div>');
  }

  function section(id, label, tag, title, intro, stream, inner, extra) {
    return '<section class="sec ' + stream + ' ' + (extra || '') + '" id="' + id + '" data-screen-label="' + esc(label) + '"><div class="wrap">' +
      '<header class="sec-head"><span class="tag">' + tag + '</span><h2>' + esc(title) + '</h2>' + (intro ? '<p class="sec-intro">' + esc(intro) + '</p>' : '') + '</header>' +
      inner + '</div></section>';
  }

  function servicesHTML() {
    var T = IL_TEXT[lang];
    var tabs = D.services.map(function (s, i) {
      return '<button type="button" role="tab" id="tab-' + i + '" aria-controls="panel-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-i="' + i + '">' + esc(s.title) + '</button>';
    }).join('');
    var panels = SVC.map(function (v, i) {
      return '<div class="panel" role="tabpanel" id="panel-' + i + '" aria-labelledby="tab-' + i + '"' + (i ? ' hidden' : '') + '>' +
        (v.kind === 'hx' ? '<div class="seg hx-modes" role="group" aria-label="Flow">' + T.modes.map(function (m, k) {
          return '<button type="button" data-mode="' + ['both', 'shell', 'tube'][k] + '" aria-pressed="' + (k === 0) + '">' + esc(m) + '</button>';
        }).join('') + '</div>' : '') +
        '<div class="il" data-il="' + v.kind + '"></div>' +
        '<div class="title-block"><span>' + esc(T.sheet[0]) + ': ' + esc(v.sheet) + '</span><span>' + esc(T.sheet[1]) + '</span></div></div>';
    }).join('');
    var list = D.services.map(function (s, i) {
      return '<li class="svc ' + SVC[i].stream + (i === 0 ? ' on' : '') + '" data-i="' + i + '"><span class="svc-n">' + esc(s.index) + '</span><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></li>';
    }).join('');
    return section('services', 'Services', 'E-02', U.sectionServices, U.skillStageHint, 's-hot',
      '<div class="stage-wrap"><ol class="svc-list">' + list + '</ol>' +
      '<div class="stage"><div class="stage-tabs" role="tablist" aria-label="' + esc(U.sectionServices) + '">' + tabs + '</div>' +
      '<div class="stage-sheet">' + panels + '</div></div></div>');
  }

  function photoBtn(src, alt, w, h) {
    return '<button type="button" data-lb="' + esc(src) + '" data-cap="' + esc(alt) + '" aria-label="' + esc(U.enlarge) + ': ' + esc(alt) + '"><img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" width="' + (w || 300) + '" height="' + (h || 300) + '"></button>';
  }

  function jobHTML(j, i) {
    var stream = i === 0 ? 's-energy' : 's-amber';
    var co = j.companyLink;
    var duties = j.duties ? '<details class="duties"><summary>' + esc(U.dutiesLabel) + '</summary><div class="duty-groups">' +
      j.duties.map(function (g) { return '<div><h4>' + esc(g.title) + '</h4><ul>' + g.items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>'; }).join('') +
      '</div></details>' : '';
    var issues = '<details class="fold issues" data-open-wide><summary>' + esc(cap(U.problemsLabel)) + ' <span class="fold-n">' + j.problemsSolved.length + '</span></summary>' +
      '<div class="issue-h" aria-hidden="true"><span></span><span>' + esc(cap(U.issueLabel)) + '</span><span></span><span>' + esc(cap(U.solutionLabel)) + '</span></div>' +
      j.problemsSolved.map(function (p, k) {
        return '<div class="issue"><span class="issue-n">' + (k < 9 ? '0' : '') + (k + 1) + '</span><p class="issue-p"><span class="sr-only">' + esc(U.issueLabel) + ': </span>' + esc(p.problem) +
          '</p><span class="issue-arrow" aria-hidden="true"></span><p class="issue-s" data-label="' + esc(cap(U.solutionLabel)) + '"><span class="sr-only">' + esc(U.solutionLabel) + ': </span>' + esc(p.solution) + '</p></div>';
      }).join('') + '</details>';
    var tool = j.innovationTool ? '<div class="tool"><div><b>' + esc(cap(U.innovationLabel)) + '</b><h4>' + esc(j.innovationTool.title) + '</h4><p>' + esc(j.innovationTool.desc) + '</p></div>' +
      '<a class="btn btn-line ext" href="' + esc(j.innovationTool.url) + '" target="_blank" rel="noopener">' + esc(strip(j.innovationTool.linkLabel)) + '</a></div>' : '';
    var photos = '<p class="photos-label">' + esc(U.photosLabel) + '</p><div class="photo-main">' + photoBtn(j.sitePhoto, j.sitePhotoCaption, 800, 600) +
      '<span class="photo-cap">' + esc(j.sitePhotoCaption) + '</span></div><div class="thumbs">' +
      j.activitySlots.map(function (a, k) { return photoBtn(a.src, co.short + ' field activity ' + (k + 1)); }).join('') + '</div>';
    return '<article class="job ' + stream + '"><div class="job-head"><p class="job-when">' + esc(j.dates) + '</p>' +
      '<div><h3>' + esc(j.role) + '</h3><p class="job-co">' + esc(j.company) + ' · ' + esc(j.location) + '</p></div>' +
      '<a class="co-link" href="' + esc(co.url) + '" target="_blank" rel="noopener"><img src="' + esc(co.logo) + '" alt="" width="64" height="36" loading="lazy"><span>' + esc(co.full) + '<small class="ext">' + esc(strip(U.visitSite)) + '</small></span></a></div>' +
      '<div class="job-body"><div class="job-main">' +
      '<ul class="bullets">' + j.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
      '<ul class="tags">' + j.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      duties +
      '<div class="design"><p class="design-label">' + esc(cap(U.engDesignLabel)) + '</p><p>' + esc(j.design) + '</p>' +
      '<div class="design-facts"><p><b>' + esc(cap(U.teamLedLabel)) + '</b>' + esc(j.leadTeam) + '</p><p><b>' + esc(cap(U.collabLabel)) + '</b>' + esc(j.collaboration) + '</p></div></div>' +
      issues + tool + '</div><aside class="job-photos">' + photos + '</aside></div></article>';
  }

  var FIELD_IMG = ['field-1', 'field-smelter-pipe-lift', 'field-3'];
  function timelineHTML() {
    var field = '<div class="field s-amber"><div class="field-head"><p class="photos-label">' + esc(U.fieldDocLabel) + '</p>' +
      ext('https://1drv.ms/f/c/8df1985aa0d6d304/IgDBfgF6AVRVQoP1owdhx68vAee1EubdAm7vDMsded4Tpk8?e=pmDyq6', U.viewGalleryLabel) + '</div><div class="field-grid">' +
      [1, 2, 3].map(function (n) {
        var cap0 = U['field' + n + 'Placeholder'];
        return '<figure>' + photoBtn('assets/img/' + FIELD_IMG[n - 1] + '.webp', cap0, n === 2 ? 1400 : 900, n === 2 ? 788 : 675) + '<figcaption>' + esc(cap0) + '</figcaption></figure>';
      }).join('') + '</div></div>';
    return section('timeline', 'Experience', 'E-03', U.sectionTimeline, '', 's-energy', D.timeline.map(jobHTML).join('') + field, 'band');
  }

  function caseHTML(c, i) {
    var stream = i === 0 ? 's-hot' : 's-cold';
    return '<article class="case ' + stream + (i % 2 ? ' rev' : '') + '" id="' + esc(c.anchor) + '"><p class="case-meta">' + esc(c.client) + ' · ' + esc(c.date) + '</p>' +
      '<h3>' + esc(c.title) + '</h3><div class="case-grid"><div class="case-text">' +
      '<p class="case-scope">' + esc(c.scope) + '</p>' +
      '<p class="case-method"><b>' + esc(U.methodLabel) + '.</b> ' + esc(c.method.replace(/^Method,\s*/i, '').replace(/^Metode,\s*/i, '')) + '</p>' +
      '<details class="fold" data-open-wide><summary>' + esc(cap(U.stepsLabel)) + ' <span class="fold-n">' + c.steps.length + '</span></summary>' +
      '<ol class="steps">' + c.steps.map(function (s) { return '<li><span class="n" aria-hidden="true">' + s.n + '</span><p>' + esc(s.text) + '</p></li>'; }).join('') + '</ol></details>' +
      '<div class="conclusion"><b>' + esc(cap(U.conclusionLabel)) + '</b><p>' + esc(c.conclusion) + '</p></div></div>' +
      '<div class="case-side"><p class="photos-label">' + esc(U.figLabel) + '</p><div class="figs">' + c.images.map(function (im) {
        return '<figure>' + photoBtn(im.src, im.caption) + '<figcaption>' + esc(im.caption) + '</figcaption></figure>';
      }).join('') + '</div>' +
      '<div class="readout"><div class="readout-h">' + esc(cap(U.resultsReadout)) + '</div><table><tbody>' +
      c.metrics.map(function (m) { return '<tr><td>' + esc(m.label) + '</td><td>' + esc(m.value) + '</td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="case-links">' + ext(c.companyLink.url, c.companyLink.full) + ext(c.link, U.projectDocLabel) + '</div></div></div></article>';
  }

  function projectsHTML() {
    var nodes = D.projectLog.map(function (p, i) {
      return '<li class="' + DISC[p.discipline] + '"><button type="button" class="node" data-p="' + i + '" aria-pressed="' + (i === 0) + '" aria-controls="proj-detail">' +
        '<span class="who">' + esc(shortName(p.client)) + '</span><span class="dot" aria-hidden="true"></span><span class="when">' + esc(p.date) + '</span>' +
        '<span class="disc">' + esc(U['disc_' + p.discipline]) + '</span></button></li>';
    }).join('');
    return section('projects', 'Project Log', 'E-05', U.sectionProjects, U.projectsIntro, 's-teal',
      '<p class="photos-label">' + esc(U.projectsHint) + '</p><div class="rail"><div class="rail-line" aria-hidden="true"></div><ol>' + nodes + '</ol></div>' +
      '<div id="proj-detail" aria-live="polite"></div>', 'band');
  }
  function shortName(c) { return c.replace(/^PT\s+/, '').replace(/\s+(Tbk\.|Ltd\.|Internasional Tbk\.)$/, '').replace(' Internasional', ''); }

  function projectDetail(i) {
    var p = D.projectLog[i];
    var cam = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    return '<div class="proj ' + DISC[p.discipline] + '"><div><div class="proj-il" data-mini="' + p.discipline + '"></div>' +
      (p.photos && p.photos.length ? ''
        : '<div class="slots"><div class="slot">' + cam + esc(U.projPhotoSoon) + '</div><div class="slot">' + cam + esc(U.projPhotoSoon) + '</div></div>') + '</div>' +
      '<div><p class="proj-n">' + esc(p.index) + ' / ' + D.projectLog.length + ' · ' + esc(U['disc_' + p.discipline]) + '</p><h3>' + esc(p.project) + '</h3>' +
      '<dl><dt>' + esc(U.projClient) + '</dt><dd><a class="link ext" href="' + esc(p.companyUrl) + '" target="_blank" rel="noopener">' + esc(p.client) + '</a></dd>' +
      '<dt>' + esc(U.projScope) + '</dt><dd>' + esc(p.scope) + '</dd>' +
      '<dt>' + esc(U.projRole) + '</dt><dd>' + esc(p.role) + '</dd>' +
      '<dt>' + esc(U.projDate) + '</dt><dd>' + esc(p.date) + '</dd></dl>' +
      '<div class="proj-links">' + ext(p.link, U.referenceLabel) + (p.anchor ? '<a class="link" href="' + esc(p.anchorHref) + '">' + esc(U.projCaseLink) + '</a>' : '') + '</div>' +
      '<div class="soon"><b>' + esc(U.projWriteup) + '</b><p>' + esc(U.projWriteupSoon) + '</p></div></div>' +
      (p.photos && p.photos.length
        ? '<div class="proj-shots"><p class="photos-label">' + esc(p.photosLabel || U.projPhotos) + '</p><div class="shots">' + p.photos.map(function (ph) {
            return '<figure' + (ph.fit === 'contain' ? ' class="doc"' : '') + '>' + photoBtn(ph.src, ph.caption, ph.w, ph.h) + '<figcaption>' + esc(ph.caption) + '</figcaption></figure>';
          }).join('') + '</div></div>'
        : '') + '</div>';
  }

  function seal() {
    var ticks = '';
    for (var i = 0; i < 36; i++) { var a = i * 10 * Math.PI / 180; ticks += '<line x1="' + (44 + Math.cos(a) * 36).toFixed(1) + '" y1="' + (44 + Math.sin(a) * 36).toFixed(1) + '" x2="' + (44 + Math.cos(a) * (i % 3 ? 40 : 43)).toFixed(1) + '" y2="' + (44 + Math.sin(a) * (i % 3 ? 40 : 43)).toFixed(1) + '"/>'; }
    return '<svg viewBox="0 0 88 88" aria-hidden="true"><g stroke="var(--stream)" stroke-width="2">' + ticks + '</g><circle cx="44" cy="44" r="31" fill="var(--stream-tint)" stroke="var(--stream)" stroke-width="2"/></svg>';
  }

  function credentialsHTML() {
    var streams = ['s-energy', 's-violet', 's-amber'];
    var certs = D.certifications.map(function (c, i) {
      return '<li class="cert ' + streams[i] + '"><div class="seal">' + seal() + '<span>' + esc(c.year) + '</span></div><h3>' + esc(c.name) + '</h3>' +
        '<p class="issuer"><img src="' + esc(c.logo) + '" alt="" width="48" height="18" loading="lazy">' + esc(c.issuer) + '</p><p>' + esc(c.desc) + '</p>' + ext(c.link, U.viewCertificate) + '</li>';
    }).join('');
    var other = '<p class="sub-h" style="margin-top:34px;font-size:17px">' + esc(U.otherCertsLabel) + '</p><ul class="other-certs">' +
      D.otherCerts.map(function (c) { return '<li><span>' + esc(c.year) + '</span>' + esc(c.name) + '</li>'; }).join('') + '</ul>';
    var tools = P.software.map(function (n) {
      var lg = P.softwareLogos[n];
      return '<li>' + (lg ? '<img src="' + esc(lg) + '" alt="" width="32" height="32" loading="lazy">' : '<span class="noimg" aria-hidden="true">' + esc(n.slice(0, 2)) + '</span>') + esc(n) + '</li>';
    }).join('');
    var comp = D.coreSkills.map(function (t, i) {
      var st = FOCUS_STYLE[i % FOCUS_STYLE.length];
      var dash = st[0] === 'dash' ? ' stroke-dasharray="10 6"' : st[0] === 'dot' ? ' stroke-dasharray="2 5" stroke-linecap="round"' : '';
      return '<li><svg viewBox="0 0 56 10" aria-hidden="true"><line x1="0" y1="5" x2="56" y2="5" stroke="var(' + st[1] + ')" stroke-width="3.5"' + dash + '/></svg>' + esc(t) + '</li>';
    }).join('');
    return section('credentials', 'Skills & Credentials', 'E-06', U.sectionCredentials, '', 's-violet',
      '<ul class="certs">' + certs + '</ul>' + other +
      '<div class="skills-grid"><div><p class="sub-h">' + esc(cap(U.softwareToolsLabel)) + '</p><ul class="tools">' + tools + '</ul></div>' +
      '<div><p class="sub-h">' + esc(cap(U.coreCompLabel)) + '</p><ul class="legend">' + comp + '</ul></div></div>');
  }

  function medal(rank) {
    var n = (rank.match(/#(\d)/) || [])[1];
    if (!n) return '';
    var c = n === '1' ? '#E3A008' : '#9AA5B1';
    return '<svg class="medal" viewBox="0 0 52 64" role="img" aria-label="' + esc(rank) + '"><path d="M14 0h9l5 18h-9zM38 0h-9l-5 18h9z" fill="var(--stream)"/><circle cx="26" cy="40" r="20" fill="' + c + '" stroke="#15181D" stroke-width="2"/><text x="26" y="47" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="20" fill="#15181D">' + n + '</text></svg>';
  }
  function achievementsHTML() {
    return section('achievements', 'Achievements', 'E-07', U.sectionAchievements, '', 's-amber',
      '<ul class="awards">' + D.achievements.map(function (a) {
        return '<li class="award"><span class="award-y">' + esc(a.year) + '</span><div><h3>' + esc(a.title) + '</h3><p class="org">' + esc(a.org) + '</p>' +
          '<p class="prog">' + esc(a.program) + (a.rank ? ' · ' + esc(a.rank) : '') + '</p>' + ext(a.link, U.viewEvidence) + '</div>' + medal(a.rank) + '</li>';
      }).join('') + '</ul>');
  }

  function orgEduHTML() {
    var orgs = '<ul class="orgs">' + D.organizational.map(function (o) {
      return '<li class="org"><div><h3>' + esc(o.role) + '</h3><p class="where">' + esc(o.org) + '</p></div><div><p class="when">' + esc(o.dates) + '</p>' + ext(o.link, U.documentationLabel) + '</div></li>';
    }).join('') + '</ul>';
    var edu = '<div class="edu"><img src="assets/img/logo-unesa.webp" alt="UNESA" width="64" height="64" loading="lazy"><div><p class="when">2018 – 2022</p><h3>' + esc(U.degreeName) + '</h3>' +
      '<p>Universitas Negeri Surabaya, Surabaya, Indonesia</p><p>' + esc(U.gpaLabel) + '<b>3.61 / 4.0</b>, ' + esc(U.gpaText) + '</p>' +
      '<p><i>' + esc(U.finalProjectLabel) + esc(U.finalProjectText) + '</i></p></div></div>' +
      '<div class="edu"><img src="assets/img/logo-its.webp" alt="ITS" width="64" height="64" loading="lazy"><div><p class="when">' + esc(U.irBatchLabel) + '</p><h3>' + esc(U.irDegreeName) + '</h3>' +
      '<p>Institut Teknologi Sepuluh Nopember (ITS), Surabaya, Indonesia</p><p>' + esc(U.irRegisteredText) + '</p>' +
      '<button type="button" class="pii-btn" data-lb="assets/img/pii-card.webp" data-cap="' + esc(U.viewPiiCardLabel) + '"><img src="assets/img/pii-card.webp" alt="" width="74" height="44" loading="lazy">' +
      '<span>' + esc(U.viewPiiCardLabel) + '<small>' + esc(U.piiRegNoLabel) + ' 1301.09.111868 · ' + esc(U.piiValidLabel) + ' 06/26–12/26</small></span></button></div></div>';
    return '<section class="sec s-cold" id="education" data-screen-label="Education"><div class="wrap"><div class="two">' +
      '<div id="organizational"><header class="sec-head"><span class="tag">E-08</span><h2>' + esc(U.sectionOrganizational) + '</h2></header>' + orgs + '</div>' +
      '<div><header class="sec-head"><span class="tag">E-09</span><h2>' + esc(U.sectionEducation) + '</h2></header>' + edu + '</div></div></div></section>';
  }

  function trainingHTML() {
    return section('training', 'Training', 'E-10', U.sectionTraining, '', 's-teal',
      '<ul class="trainings">' + D.trainings.map(function (t) {
        return '<li><span class="when">' + esc(t.date) + '</span><h3>' + esc(t.name) + '</h3>' + ext(t.link, U.trainingCertLabel) + '</li>';
      }).join('') + '</ul>', 'band');
  }

  function resumeHTML() {
    return section('resume', 'Resume', 'E-11', U.sectionResume, '', 's-hot',
      '<div class="resume"><a class="cv-sheet" href="assets/CV_Muhammad_Afifani_Romadhan.pdf" target="_blank" rel="noopener"><img src="assets/img/cv-page-1.webp" width="497" height="702" alt="' + esc(U.cvPreviewAlt) + '" loading="lazy"></a>' +
      '<div><h3>' + esc(U.resumeHeading) + '</h3><p>' + esc(U.resumeBlurb) + '</p><div class="cta-row">' +
      '<a class="btn btn-ink dl" href="assets/CV_Muhammad_Afifani_Romadhan.pdf" download>' + esc(strip(U.downloadFullCv)) + '</a>' +
      '<a class="btn btn-line ext" href="assets/CV_Muhammad_Afifani_Romadhan.pdf" target="_blank" rel="noopener">' + esc(strip(U.openCvCta)) + '</a></div>' +
      '<ul class="cv-sum">' + D.resumeHighlights.map(function (r) { return '<li><b>' + esc(r.value) + '</b><span>' + esc(r.label) + '</span></li>'; }).join('') + '</ul></div></div>');
  }

  function contactHTML() {
    var T = IL_TEXT[lang];
    return '<section class="sec contact" id="contact" data-screen-label="Contact"><div class="wrap"><div class="contact-grid"><div>' +
      '<span class="tag">E-12 · ' + esc(cap(U.getInTouch)) + '</span><h2>' + esc(U.contactHeadline) + '</h2>' +
      '<ul class="contact-links"><li><a href="mailto:muhammad.afifani007@gmail.com"><small>Email</small>muhammad.afifani007@gmail.com</a></li>' +
      '<li><a href="tel:+6285259707649"><small>' + esc(U.callMe) + '</small>+62 852-5970-7649</a></li>' +
      '<li><a href="https://www.linkedin.com/in/muhammad-afifani-romadhan/" target="_blank" rel="noopener"><small>LinkedIn</small><span class="ext">muhammad-afifani-romadhan</span></a></li></ul>' +
      '<a class="btn btn-ink dl" href="assets/CV_Muhammad_Afifani_Romadhan.pdf" download>' + esc(strip(U.downloadFullCv)) + '</a></div>' +
      '<figure class="contact-photo"><img src="assets/img/contact-photo.webp" width="1294" height="725" alt="' + esc(U.contactPhotoCaption) + '" loading="lazy"><figcaption>' + esc(U.contactPhotoCaption) + '</figcaption></figure></div>' +
      '<footer class="foot"><span>© ' + new Date().getFullYear() + ' Muhammad Afifani Romadhan, Gresik / Balikpapan, Indonesia</span><span>' + esc(U.footerRole) + '</span></footer>' +
      '</div></section>';
  }

  // ------------------------------------------------------------- render + behaviour
  function render() {
    D = P[lang]; U = D.ui;
    root.lang = lang;
    document.title = lang === 'id'
      ? 'Muhammad Afifani Romadhan · Mechanical Engineer, Energi & Emisi'
      : 'Muhammad Afifani Romadhan · Mechanical Engineer, Energy & Emission';
    document.querySelector('.skip').textContent = U.skipToContent;
    navEl.innerHTML = navHTML();
    main.innerHTML = heroHTML() + aboutHTML() + servicesHTML() + timelineHTML() +
      section('case-studies', 'Case Studies', 'E-04', U.sectionCase, '', 's-hot', D.caseStudies.map(caseHTML).join('')) +
      projectsHTML() + credentialsHTML() + achievementsHTML() + orgEduHTML() + trainingHTML() + resumeHTML() + contactHTML();
    addPipes();
    wire();
  }

  // ------------------------------------------------------------- process pipe (left gutter)
  // Each section is a pipe spool: flanged at the joints, a tee branches off to the
  // section's equipment tag, and an identification band names the stream (ASME A13.1 style).
  // The flow arrows follow the visitor's scroll direction.
  function addPipes() {
    var M = U.pipeMarkers || {};
    main.querySelectorAll(':scope > section.sec').forEach(function (sec, k) {
      var stream = (sec.className.match(/\bs-[a-z]+/) || ['s-hot'])[0];
      if (sec.classList.contains('contact')) stream = 's-amber';
      var pipe = document.createElement('div');
      pipe.className = 'pipe ' + stream;
      pipe.setAttribute('aria-hidden', 'true');
      pipe.innerHTML = '<i class="pipe-body"></i>' + (k ? '<i class="flange"></i>' : '<i class="inlet"></i>') +
        '<i class="branch"><i class="branch-flange"></i></i>' +
        '<span class="marker"><b>' + esc(M[stream] || '') + '</b><i class="marker-arrow"></i></span>';
      sec.insertBefore(pipe, sec.firstChild);
    });
    layoutPipes();
  }
  function layoutPipes() {
    main.querySelectorAll('.pipe').forEach(function (pipe) {
      var sec = pipe.parentNode, tag = sec.querySelector('.tag'), br = pipe.querySelector('.branch'), mk = pipe.querySelector('.marker');
      var pr = pipe.getBoundingClientRect(), sr = sec.getBoundingClientRect();
      if (!pr.width) return;
      if (tag) {
        var tr = tag.getBoundingClientRect();
        br.style.display = '';
        br.style.top = (tr.top + tr.height / 2 - sr.top - 6) + 'px';
        br.style.width = Math.max(0, tr.left - pr.right) + 'px';
        mk.style.top = (tr.top - sr.top + 90) + 'px';
      } else {
        br.style.display = 'none';
        mk.style.top = '160px';
      }
    });
  }
  var lastY = window.scrollY;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    if (Math.abs(y - lastY) > 4) { root.classList.toggle('flow-up', y < lastY); lastY = y; }
  }, { passive: true });
  var rz;
  window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(layoutPipes, 120); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layoutPipes(); });
  window.addEventListener('load', layoutPipes);

  var observers = [];
  function wire() {
    observers.forEach(function (o) { o.disconnect(); }); observers = [];
    var T = IL_TEXT[lang];

    // language
    navEl.querySelectorAll('[data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.lang === lang) return;
        lang = b.dataset.lang; store('lang', lang);
        var y = window.scrollY; render(); window.scrollTo(0, y);
      });
    });
    // mobile menu
    var mb = document.getElementById('menu-btn'), links = document.getElementById('nav-links');
    mb.addEventListener('click', function () { var o = links.classList.toggle('open'); mb.setAttribute('aria-expanded', o); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) { links.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); } });
    // motion toggle
    var motionBtn = document.getElementById('motion-btn');
    function paintMotion() {
      var off = IL.isPaused();
      root.classList.toggle('motion-off', off);
      motionBtn.setAttribute('aria-pressed', String(off));
      motionBtn.setAttribute('aria-label', off ? T.play : T.pause);
      motionBtn.title = off ? T.play : T.pause;
      motionBtn.innerHTML = off
        ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 4l10 6-10 6z" fill="currentColor"/></svg>'
        : '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 4h3.5v12H5zM11.5 4H15v12h-3.5z" fill="currentColor"/></svg>';
    }
    motionBtn.addEventListener('click', function () { IL.setPaused(!IL.isPaused()); store('motion', IL.isPaused() ? 'off' : 'on'); paintMotion(); });
    paintMotion();

    // illustrations on the services stage
    var insts = {};
    main.querySelectorAll('[data-il]').forEach(function (h) { insts[h.dataset.il] = IL.mount(h, h.dataset.il, T[h.dataset.il]); });
    main.querySelectorAll('.hx-modes button').forEach(function (b) {
      b.addEventListener('click', function () {
        b.parentNode.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        insts.hx.setMode(b.dataset.mode);
      });
    });
    var tabs = [].slice.call(main.querySelectorAll('[role="tab"]'));
    var svcs = [].slice.call(main.querySelectorAll('.svc'));
    var sheet = main.querySelector('.stage');
    var manualUntil = 0;
    function activate(i, focus, fromScroll) {
      if (fromScroll && performance.now() < manualUntil) return;
      if (!fromScroll) manualUntil = performance.now() + 1200;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; if (k === i && focus) t.focus(); });
      main.querySelectorAll('.panel').forEach(function (p, k) { p.hidden = k !== i; });
      svcs.forEach(function (s, k) { s.classList.toggle('on', k === i); });
      sheet.className = 'stage ' + SVC[i].stream;
      if (insts[SVC[i].kind] && insts[SVC[i].kind].reset) insts[SVC[i].kind].reset();
    }
    sheet.className = 'stage ' + SVC[0].stream;
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); activate((i + k + tabs.length) % tabs.length, true); }
      });
    });
    svcs.forEach(function (s, i) { s.addEventListener('click', function () { activate(i); }); });
    if ('IntersectionObserver' in window && window.matchMedia('(min-width: 981px)').matches) {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) activate(+e.target.dataset.i, false, true); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      svcs.forEach(function (s) { so.observe(s); });
      observers.push(so);
    }

    // projects explorer
    var nodes = [].slice.call(main.querySelectorAll('.node'));
    var detail = document.getElementById('proj-detail');
    function pick(i, focus) {
      nodes.forEach(function (n, k) { n.setAttribute('aria-pressed', String(k === i)); if (k === i && focus) n.focus(); });
      detail.innerHTML = projectDetail(i);
      var m = detail.querySelector('[data-mini]');
      IL.mount(m, m.dataset.mini, { label: D.projectLog[i].scope });
      wireLightbox(detail);
    }
    nodes.forEach(function (n, i) {
      n.addEventListener('click', function () { pick(i); });
      n.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); pick((i + k + nodes.length) % nodes.length, true); }
      });
    });
    pick(0);

    // counters
    if ('IntersectionObserver' in window && !IL.isPaused()) {
      var co = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          co.unobserve(e.target);
          var el = e.target, raw = el.dataset.count, n = parseFloat(raw), suf = raw.replace(/^[\d.]+/, '');
          if (isNaN(n)) return;
          var t0 = performance.now();
          (function step(t) {
            var p = Math.min(1, (t - t0) / 1200), v = Math.round(n * (1 - Math.pow(1 - p, 3)));
            el.textContent = v + suf;
            if (p < 1) requestAnimationFrame(step);
          })(t0);
        });
      }, { threshold: 0.6 });
      main.querySelectorAll('[data-count]').forEach(function (el) { co.observe(el); });
      observers.push(co);
    }

    // active nav item
    if ('IntersectionObserver' in window) {
      var navLinks = [].slice.call(navEl.querySelectorAll('.nav-links a'));
      var no = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          navLinks.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)); });
        });
      }, { rootMargin: '-40% 0px -55% 0px' });
      main.querySelectorAll('section[id]').forEach(function (s) { no.observe(s); });
      observers.push(no);
    }

    if (window.matchMedia('(min-width: 981px)').matches) main.querySelectorAll('[data-open-wide]').forEach(function (d) { d.open = true; });
    wireLightbox(main);
  }

  // lightbox
  var lb = document.getElementById('lightbox');
  var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb-cap'), lbOpen = lb.querySelector('.lb-open');
  lb.querySelector('.lb-close').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  function wireLightbox(scope) {
    scope.querySelectorAll('[data-lb]').forEach(function (b) {
      b.addEventListener('click', function () {
        lbImg.src = b.dataset.lb; lbImg.alt = b.dataset.cap || ''; lbCap.textContent = b.dataset.cap || '';
        lbOpen.href = b.dataset.lb; lbOpen.textContent = U.openFull;
        lb.querySelector('.lb-close').textContent = U.close;
        if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
      });
    });
  }

  if (store('motion') === 'off') IL.setPaused(true);
  render();
})();
