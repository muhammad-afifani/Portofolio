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
  var DISC = { cfd: 's-teal', slosh: 's-teal', fem: 's-hot', mech: 's-cold', hx: 's-hot', plan: 's-amber' };
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

  var DUTY_ICON = {
    emission: '<path d="M6 21V9h5v12M8.5 9V5" /><path d="M13 7c1.5-2 4-2 5 0 1.6 0 2.6 1.6 2 3H12c-.6-1.4.2-3 1-3z" />',
    energy: '<circle cx="12" cy="13" r="8" /><path d="M12 13l4-4M8 19h8" />',
    ghg: '<path d="M4 15a4 4 0 0 1 3-6 5 5 0 0 1 9.5 1A3.5 3.5 0 0 1 17 17H7a3 3 0 0 1-3-2z" />',
    report: '<path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" />'
  };
  function two(n) { return (n < 9 ? '0' : '') + (n + 1); }

  // Problems & fixes: numbered stops on a line; one problem -> fix card at a time.
  function fixesHTML(j, ji) {
    var n = j.problemsSolved.length, base = 'fix-' + ji;
    return '<div class="fixes" data-fixes><p class="issues-label">' + esc(U.problemsLabel) + ' <span class="fold-n">' + n + '</span></p>' +
      '<div class="fix-rail" role="tablist" aria-label="' + esc(U.problemsLabel) + '"><span class="fix-line" aria-hidden="true"><i></i></span>' +
      j.problemsSolved.map(function (p, k) {
        return '<button type="button" role="tab" class="fix-dot" id="' + base + '-t' + k + '" aria-controls="' + base + '-p' + k + '" aria-selected="' + (k === 0) + '" tabindex="' + (k ? -1 : 0) + '" data-k="' + k + '">' +
          '<span class="fix-num">' + two(k) + '</span><span class="fix-t">' + esc(p.title) + '</span></button>';
      }).join('') + '</div>' +
      j.problemsSolved.map(function (p, k) {
        return '<div class="fix-card' + (k === 0 ? ' in' : '') + '" role="tabpanel" id="' + base + '-p' + k + '" aria-labelledby="' + base + '-t' + k + '"' + (k ? ' hidden' : '') + '>' +
          '<div class="fix-top"><span class="fix-k">' + two(k) + ' / ' + (n < 10 ? '0' : '') + n + '</span><h4>' + esc(p.title) + '</h4></div>' +
          '<div class="fix-flow"><div class="fix-p"><b>' + esc(U.fixProblem) + '</b><p>' + esc(p.problem) + '</p></div>' +
          '<svg class="fix-arrow" viewBox="0 0 64 24" aria-hidden="true"><path d="M2 12H54" /><path d="M46 4l10 8-10 8" /></svg>' +
          '<div class="fix-s"><b>' + esc(U.fixSolution) + '</b><p>' + esc(p.solution) + '</p></div></div>' +
          '<div class="fix-nav"><button type="button" class="icon-btn" data-step="-1" aria-label="' + esc(U.fixPrev) + '"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M12 4l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>' +
          '<button type="button" class="icon-btn" data-step="1" aria-label="' + esc(U.fixNext) + '"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M8 4l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button></div></div>';
      }).join('') + '</div>';
  }

  // Self-built tools: pick a tool on the left, see its screen, what it does, and ask for access.
  function toolsHTML() {
    var T = D.tools || [];
    if (!T.length) return '';
    var cam = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
    function mail(t) {
      var body = lang === 'id'
        ? 'Halo Afifani,\n\nSaya ingin meminta akses ke ' + t.name + '.\n\nNama:\nInstansi:\nKeperluan:\n'
        : 'Hi Afifani,\n\nI would like to request access to ' + t.name + '.\n\nName:\nCompany:\nPurpose:\n';
      return 'mailto:muhammad.afifani007@gmail.com?subject=' + encodeURIComponent((lang === 'id' ? 'Permintaan akses: ' : 'Access request: ') + t.name) + '&body=' + encodeURIComponent(body);
    }
    return '<div class="sbt" data-tools><div class="sbt-head"><p class="issues-label">' + esc(U.toolsLabel) + ' <span class="fold-n">' + T.length + '</span></p>' +
      '<p class="sbt-intro">' + esc(U.toolsIntro) + '</p></div><div class="sbt-wrap">' +
      '<div class="tool-list" role="tablist" aria-label="' + esc(U.toolsLabel) + '">' + T.map(function (t, k) {
        return '<button type="button" role="tab" class="tool-tab" id="tool-t' + k + '" aria-controls="tool-p' + k + '" aria-selected="' + (k === 0) + '" tabindex="' + (k ? -1 : 0) + '" data-k="' + k + '">' +
          '<span class="tool-n">' + two(k) + '</span><span class="tool-name"><b>' + esc(t.name) + '</b><small>' + esc(t.sub) + '</small></span></button>';
      }).join('') + '</div><div class="tool-panels">' + T.map(function (t, k) {
        var real = t.shots.filter(function (x) { return !x.soon; });
        var screen = real.length
          ? '<div class="device-shot">' + photoBtn(real[0].src, real[0].caption, real[0].w, real[0].h) + '</div>'
          : '<div class="device-soon">' + t.shots.map(function (x) { return '<div class="slot">' + cam + '<span>' + esc(x.caption) + '</span><small>' + esc(U.toolSoon) + '</small></div>'; }).join('') + '</div>';
        return '<div class="tool-panel' + (k === 0 ? ' in' : '') + '" role="tabpanel" id="tool-p' + k + '" aria-labelledby="tool-t' + k + '"' + (k ? ' hidden' : '') + '>' +
          '<div class="device"><div class="device-bar"><span class="device-name">' + esc(t.name) + '</span><span class="device-chip">' + esc(U.toolWebApp) + '</span></div>' + screen + '</div>' +
          '<div class="tool-info"><div><p class="tool-desc">' + esc(t.desc) + '</p><div class="tool-cta"><a class="btn btn-ink" href="' + esc(mail(t)) + '">' + esc(U.toolRequest) + '</a><small>' + esc(U.toolRequestNote) + '</small></div></div>' +
          '<ul class="tool-feats">' + t.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></div></div>';
      }).join('') + '</div></div></div>';
  }

  function jobHTML(j, i) {
    var stream = i === 0 ? 's-energy' : 's-amber';
    var co = j.companyLink;
    var duties = j.duties ? '<div class="duties2"><p class="issues-label">' + esc(U.dutiesLabel) + '</p><ul class="duty-list">' +
      j.duties.map(function (g) {
        return '<li><svg viewBox="0 0 24 24" aria-hidden="true">' + (DUTY_ICON[g.key] || '') + '</svg><div><b>' + esc(g.title) + '</b><span>' + esc(g.items.join(' ')) + '</span></div></li>';
      }).join('') + '</ul></div>' : '';
    var withCaps = j.activitySlots.some(function (a) { return a.caption; });
    var photos = '<p class="photos-label">' + esc(U.photosLabel) + '</p><div class="photo-main">' + photoBtn(j.sitePhoto, j.sitePhotoCaption, 800, 600) +
      '<span class="photo-cap">' + esc(j.sitePhotoCaption) + '</span></div><div class="thumbs' + (withCaps ? ' cap' : '') + '">' +
      j.activitySlots.map(function (a, k) {
        var alt = a.caption || (co.short + ' field activity ' + (k + 1));
        return withCaps ? '<figure>' + photoBtn(a.src, alt) + '<figcaption>' + esc(a.caption) + '</figcaption></figure>' : photoBtn(a.src, alt);
      }).join('') + '</div>';
    return '<article class="job ' + stream + '"><div class="job-head"><p class="job-when">' + esc(j.dates) + '</p>' +
      '<div><h3>' + esc(j.role) + '</h3><p class="job-co">' + esc(j.company) + ' · ' + esc(j.location) + '</p></div>' +
      '<a class="co-link" href="' + esc(co.url) + '" target="_blank" rel="noopener"><img src="' + esc(co.logo) + '" alt="" width="64" height="36" loading="lazy"><span>' + esc(co.full) + '<small class="ext">' + esc(strip(U.visitSite)) + '</small></span></a></div>' +
      '<div class="job-body"><div class="job-main">' +
      '<ul class="bullets">' + j.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
      '<ul class="tags">' + j.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
      duties +
      '<div class="design"><p class="design-label">' + esc(cap(U.engDesignLabel)) + '</p><p>' + esc(j.design) + '</p>' +
      '<div class="design-facts"><p><b>' + esc(cap(U.teamLedLabel)) + '</b>' + esc(j.leadTeam) + '</p><p><b>' + esc(cap(U.collabLabel)) + '</b>' + esc(j.collaboration) + '</p></div></div>' +
      fixesHTML(j, i) + '</div><aside class="job-photos">' + photos + '</aside></div>' + (i === 0 ? toolsHTML() : '') + '</article>';
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
            if (ph.soon) return '<figure><div class="slot">' + cam + esc(U.projPhotoSoon) + '</div><figcaption>' + esc(ph.caption) + '</figcaption></figure>';
            return '<figure' + (ph.fit === 'contain' ? ' class="doc"' : '') + '>' + photoBtn(ph.src, ph.caption, ph.w, ph.h) + '<figcaption>' + esc(ph.caption) + '</figcaption></figure>';
          }).join('') + '</div></div>'
        : '') + '</div>';
  }

  var RADAR_TOOLS = [];
  function LV_NOW() { return U.levels; }
  function credentialsHTML() {
    var streams = ['s-energy', 's-violet', 's-amber'];
    var certs = D.certifications.map(function (c, i) {
      var pv = c.preview;
      return '<li class="cert ' + streams[i] + '"><div class="cert-top">' +
        '<button type="button" class="cert-sheet" data-lb="' + esc(pv.src) + '" data-cap="' + esc(c.name) + '" aria-label="' + esc(U.certEnlarge) + ': ' + esc(c.name) + '">' +
        '<img src="' + esc(pv.src) + '" alt="' + esc(U.certAlt) + ': ' + esc(c.name) + '" width="' + pv.w + '" height="' + pv.h + '" loading="lazy"></button>' +
        '<span class="cert-year">' + esc(c.year) + '</span></div><h3>' + esc(c.name) + '</h3>' +
        '<p class="issuer"><img src="' + esc(c.logo) + '" alt="" width="48" height="18" loading="lazy">' + esc(c.issuer) + '</p><p>' + esc(c.desc) + '</p>' +
        '<button type="button" class="link cert-open" data-lb="' + esc(pv.src) + '" data-cap="' + esc(c.name) + '">' + esc(U.certEnlarge) + '</button></li>';
    }).join('');
    var other = '<p class="sub-h" style="margin-top:34px;font-size:17px">' + esc(U.otherCertsLabel) + '</p><ul class="other-certs">' +
      D.otherCerts.map(function (c) { return '<li><span>' + esc(c.year) + '</span>' + esc(c.name) + '</li>'; }).join('') + '</ul>';
    // Competency radar: Expert sits in the bullseye, Basic on the outer ring; each group owns a quarter.
    var LV = U.levels;
    var RING = { 4: 17, 3: 27.5, 2: 37.5, 1: 47.5 };   // % of the radar's width
    var TOOLS = [];
    var PAD = { 4: 12, 3: 10, 2: 9, 1: 9 };   // keep logos off the sector edges and the ring labels
    D.toolGroups.forEach(function (g, gi) {
      var inner = [];
      [4, 3, 2, 1].forEach(function (lv) {
        var on = g.items.filter(function (it) { return it.level === lv; }), angs = [];
        on.forEach(function (it, k) {
          var span = 90 - 2 * PAD[lv], a = PAD[lv] + (k + 0.5) * (span / on.length);
          angs.push(a);
          var ang = gi * 90 + a, r = RING[lv], rad = ang * Math.PI / 180;
          TOOLS.push({ name: it.name, level: lv, g: g, gi: gi, ang: ang,
            x: (50 + r * Math.sin(rad)).toFixed(2), y: (50 - r * Math.cos(rad)).toFixed(2) });
        });
        if (angs.length) inner = angs;
      });
    });
    TOOLS.forEach(function (t, i) { t.i = i; });
    RADAR_TOOLS = TOOLS;
    function logo(n, w) { var lg = P.softwareLogos[n]; return lg ? '<img src="' + esc(lg) + '" alt="" width="' + w + '" height="' + w + '" loading="lazy">' : ''; }
    var wedges = D.toolGroups.map(function (g, gi) {
      var a0 = gi * 90 * Math.PI / 180, a1 = (gi + 1) * 90 * Math.PI / 180, R = 48;
      return '<path class="rd-wedge ' + g.stream + '" data-g="' + g.key + '" d="M50 50 L' + (50 + R * Math.sin(a0)).toFixed(2) + ' ' + (50 - R * Math.cos(a0)).toFixed(2) +
        ' A' + R + ' ' + R + ' 0 0 1 ' + (50 + R * Math.sin(a1)).toFixed(2) + ' ' + (50 - R * Math.cos(a1)).toFixed(2) + ' Z"/>';
    }).join('');
    var rings = [4, 3, 2, 1].map(function (lv) { return '<circle class="rd-ring" cx="50" cy="50" r="' + RING[lv] + '"/>'; }).join('');
    var radar = '<div class="skills-block rd-wrap" data-rd data-f="all"><div class="cm-head"><p class="sub-h">' + esc(cap(U.softwareToolsLabel)) + ' <span class="fold-n">' + TOOLS.length + '</span></p>' +
      '<div class="cm-filter" role="group" aria-label="' + esc(U.softwareToolsLabel) + '"><button type="button" data-f="all" aria-pressed="true">' + esc(U.filterAll) + '</button>' +
      D.toolGroups.map(function (g) { return '<button type="button" class="' + g.stream + '" data-f="' + g.key + '" aria-pressed="false"><i aria-hidden="true"></i>' + esc(g.title) + '</button>'; }).join('') + '</div></div>' +
      '<div class="rd-layout"><div class="rd" data-f="all">' +
      '<svg class="rd-bg" viewBox="0 0 100 100" aria-hidden="true">' + wedges + rings +
      '<path class="rd-axis" d="M50 2V98M2 50H98"/><circle class="rd-hub" cx="50" cy="50" r="1.4"/></svg>' +
      '<div class="rd-sweep" aria-hidden="true"></div>' +
      [4, 3, 2, 1].map(function (lv) { return '<span class="rd-lv" style="top:' + (50 - RING[lv] - 2.6) + '%" aria-hidden="true">' + esc(LV[lv - 1]) + '</span>'; }).join('') +
      TOOLS.map(function (t) {
        return '<button type="button" class="rd-node ' + t.g.stream + ' g-' + t.g.key + '" data-t="' + t.i + '" style="--x:' + t.x + '%;--y:' + t.y + '%;--a:' + t.ang.toFixed(1) + ';--d:' + t.i + '"' +
          ' aria-label="' + esc(t.name) + ', ' + esc(LV[t.level - 1]) + '">' + logo(t.name, 40) + '<span class="rd-name">' + esc(t.name) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="rd-side"><div class="rd-card" aria-live="polite"></div>' +
      '<div class="rd-list">' + [4, 3, 2, 1].map(function (lv) {
        var on = TOOLS.filter(function (t) { return t.level === lv; });
        return '<div class="rd-row"><p><b>' + esc(LV[lv - 1]) + '</b><span class="rd-dots" aria-hidden="true">' + [1, 2, 3, 4].map(function (k) { return '<i' + (k <= lv ? ' class="on"' : '') + '></i>'; }).join('') + '</span></p><div>' +
          on.map(function (t) { return '<button type="button" class="rd-chip ' + t.g.stream + ' g-' + t.g.key + '" data-t="' + t.i + '">' + logo(t.name, 18) + esc(t.name) + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div><p class="cm-note">' + esc(U.levelNote) + '</p></div></div></div>';
    var comp = D.coreSkills.map(function (t, i) {
      var st = FOCUS_STYLE[i % FOCUS_STYLE.length];
      var dash = st[0] === 'dash' ? ' stroke-dasharray="10 6"' : st[0] === 'dot' ? ' stroke-dasharray="2 5" stroke-linecap="round"' : '';
      return '<li><svg viewBox="0 0 56 10" aria-hidden="true"><line x1="0" y1="5" x2="56" y2="5" stroke="var(' + st[1] + ')" stroke-width="3.5"' + dash + '/></svg>' + esc(t) + '</li>';
    }).join('');
    return section('credentials', 'Skills & Credentials', 'E-06', U.sectionCredentials, '', 's-violet',
      '<ul class="certs">' + certs + '</ul>' + other +
      radar +
      '<div class="skills-block"><p class="sub-h">' + esc(cap(U.coreCompLabel)) + '</p><ul class="legend legend-cols">' + comp + '</ul></div>');
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
  // Each section is a pipe spool: flanged at the joints, with a tee branch to the section's
  // equipment tag. Along the run sit real fittings: gate valves whose handwheels turn as you
  // scroll, a pressure gauge whose needle follows scroll speed, a swing check valve, a control
  // valve with a diaphragm actuator, and pipe supports. Flow chevrons follow scroll direction.
  var FIT = {
    // every drawing has the pipe centreline at x=52 of a 76-wide viewBox
    gate: { h: 84, svg: '<rect x="38" y="4" width="28" height="7" rx="1.5" class="fl"/><rect x="38" y="73" width="28" height="7" rx="1.5" class="fl"/>' +
      '<path d="M41 11h22v62H41z" class="st"/><path d="M44 30l16 12-16 12zM60 30L44 42l16 12z" class="dk" opacity=".35"/>' +
      '<rect x="24" y="35" width="18" height="14" rx="2" class="st"/><path d="M24 42H13" class="stem"/>' +
      '<g class="hw"><circle cx="11" cy="42" r="10" class="wheel"/><path d="M11 32v20M1 42h20M4 35l14 14M18 35L4 49" class="spoke"/><circle cx="11" cy="42" r="2.6" class="hub"/></g>' },
    gauge: { h: 64, svg: '<rect x="38" y="44" width="28" height="7" rx="1.5" class="fl" opacity="0"/><path d="M43 46H30V36" class="tube"/>' +
      '<rect x="26" y="40" width="8" height="7" rx="1" class="dk"/><circle cx="30" cy="22" r="15" class="bezel"/><circle cx="30" cy="22" r="11.5" class="face"/>' +
      '<path d="M22 30a11 11 0 1 1 16 0" class="ticks"/><g class="needle"><path d="M30 22L30 12" class="nd"/></g><circle cx="30" cy="22" r="2" class="hub"/>' },
    check: { h: 78, svg: '<rect x="38" y="4" width="28" height="7" rx="1.5" class="fl"/><rect x="38" y="67" width="28" height="7" rx="1.5" class="fl"/>' +
      '<path d="M41 11h22v56H41z" class="st"/><circle cx="38" cy="39" r="13" class="st"/><circle cx="38" cy="39" r="9" class="cover"/>' +
      '<g class="bolts"><circle cx="38" cy="28.5" r="1.4"/><circle cx="38" cy="49.5" r="1.4"/><circle cx="27.5" cy="39" r="1.4"/><circle cx="31" cy="31.6" r="1.4"/><circle cx="31" cy="46.4" r="1.4"/></g>' +
      '<path d="M57 26v24m-4-6l4 7 4-7" class="arrow"/>' },
    control: { h: 100, svg: '<rect x="38" y="44" width="28" height="7" rx="1.5" class="fl"/><rect x="38" y="89" width="28" height="7" rx="1.5" class="fl"/>' +
      '<path d="M41 51h22v38H41z" class="st"/><circle cx="52" cy="70" r="13" class="st"/>' +
      '<path d="M39 70H20" class="stem"/><path d="M38 62H24M38 78H24" class="yoke"/><g class="travel"><rect x="27" y="66" width="6" height="8" rx="1" class="dk"/></g>' +
      '<path d="M20 50c-14 0-18 9-18 20s4 20 18 20z" class="act"/><path d="M20 50v40" class="dk-line"/>' +
      '<rect x="22" y="26" width="16" height="12" rx="2" class="box"/><path d="M30 38v12" class="tube"/><circle cx="30" cy="32" r="2.4" class="lamp"/>' },
    clamp: { h: 30, svg: '<path d="M0 6h4v18H0z" class="dk"/><path d="M4 14h36" class="bracket"/><rect x="40" y="9" width="24" height="11" rx="4" class="band"/>' +
      '<circle cx="43.5" cy="14.5" r="1.6" class="hub"/><circle cx="60.5" cy="14.5" r="1.6" class="hub"/>' }
  };
  var FIT_ORDER = ['gate', 'gauge', 'check', 'control'];
  function fitHTML(type, top) {
    var f = FIT[type];
    return '<svg class="fit fit-' + type + '" viewBox="0 0 76 ' + f.h + '" width="76" height="' + f.h + '" style="top:' + Math.round(top - f.h / 2) + 'px" aria-hidden="true">' + f.svg + '</svg>';
  }
  function addPipes() {
    main.querySelectorAll(':scope > section.sec').forEach(function (sec, k) {
      var stream = (sec.className.match(/\bs-[a-z]+/) || ['s-hot'])[0];
      if (sec.classList.contains('contact')) stream = 's-amber';
      var pipe = document.createElement('div');
      pipe.className = 'pipe ' + stream;
      pipe.dataset.k = k;
      pipe.setAttribute('aria-hidden', 'true');
      pipe.innerHTML = '<i class="pipe-body"></i>' + (k ? '<i class="flange"></i>' : '<i class="inlet"></i>') +
        '<i class="branch"><i class="branch-flange"></i></i><div class="fits"></div>';
      sec.insertBefore(pipe, sec.firstChild);
    });
    layoutPipes();
  }
  function layoutPipes() {
    main.querySelectorAll('.pipe').forEach(function (pipe) {
      var sec = pipe.parentNode, tag = sec.querySelector('.tag'), br = pipe.querySelector('.branch'), fits = pipe.querySelector('.fits');
      var pr = pipe.getBoundingClientRect(), sr = sec.getBoundingClientRect(), H = sr.height, k = +pipe.dataset.k;
      if (!pr.width) return;
      var branchY = 160;
      if (tag) {
        var tr = tag.getBoundingClientRect();
        branchY = tr.top + tr.height / 2 - sr.top;
        br.style.display = '';
        br.style.top = (branchY - 6) + 'px';
        br.style.width = Math.max(0, tr.left - pr.right) + 'px';
      } else br.style.display = 'none';
      // the main fitting sits just below the branch; long sections get a second one
      var placed = [], html = '';
      function put(type, y) { if (y > 70 && y < H - 70) { html += fitHTML(type, y); placed.push([y, FIT[type].h]); } }
      put(FIT_ORDER[k % FIT_ORDER.length], branchY + 150);
      if (H > 1500) put(FIT_ORDER[(k + 2) % FIT_ORDER.length], Math.round(H * 0.62));
      placed.push([branchY, 40]);
      for (var y = 110; y < H - 60; y += 380) {
        var clash = placed.some(function (p) { return Math.abs(p[0] - y) < p[1] / 2 + 45; });
        if (!clash) html += fitHTML('clamp', y);
      }
      fits.innerHTML = html;
    });
  }
  var lastY = window.scrollY, pv = 0, pvT = 0, pvRaf = 0, lastT = performance.now();
  function pvTick() {
    pv += (pvT - pv) * 0.12; pvT *= 0.9;
    root.style.setProperty('--pv', pv.toFixed(3));
    pvRaf = (pv > 0.002 || pvT > 0.002) ? requestAnimationFrame(pvTick) : 0;
  }
  window.addEventListener('scroll', function () {
    var y = window.scrollY, t = performance.now();
    if (Math.abs(y - lastY) > 4) { root.classList.toggle('flow-up', y < lastY); }
    if (!IL.isPaused()) {
      root.style.setProperty('--sc', Math.round(y));
      var v = Math.abs(y - lastY) / Math.max(8, t - lastT);   // px per ms
      pvT = Math.max(pvT, Math.min(1, v / 3));
      if (!pvRaf) pvRaf = requestAnimationFrame(pvTick);
    }
    lastY = y; lastT = t;
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
    var tabs = [].slice.call(main.querySelectorAll('.stage-tabs [role="tab"]'));
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
      var mt = lang === 'id'
        ? { l_in: 'Fluida sumur', l_gas: 'Gas ke flare', l_oil: 'Minyak', l_wat: 'Air ke OWTU' }
        : { l_in: 'Well fluid', l_gas: 'Gas to flare', l_oil: 'Oil', l_wat: 'Water to OWTU' };
      mt.label = D.projectLog[i].scope;
      IL.mount(m, m.dataset.mini, mt);
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

    // generic tab group: buttons [role=tab] inside `rail`, panels by aria-controls; arrow keys move
    function tabGroup(box, tabSel, onShow) {
      var tabs = [].slice.call(box.querySelectorAll(tabSel));
      function show(k, focus) {
        tabs.forEach(function (t, x) {
          var on = x === k, panel = document.getElementById(t.getAttribute('aria-controls'));
          t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
          if (on && focus) t.focus();
          panel.hidden = !on; panel.classList.remove('in');
          if (on) { void panel.offsetWidth; panel.classList.add('in'); }
        });
        if (onShow) onShow(k, tabs.length);
      }
      tabs.forEach(function (t, k) {
        t.addEventListener('click', function () { show(k); });
        t.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (d) { e.preventDefault(); show((k + d + tabs.length) % tabs.length, true); }
        });
      });
      return { show: show, count: tabs.length, current: function () { return tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); } };
    }
    main.querySelectorAll('[data-fixes]').forEach(function (box) {
      var line = box.querySelector('.fix-line i');
      var g = tabGroup(box, '.fix-dot', function (k, n) {
        line.style.width = (n > 1 ? k / (n - 1) * 100 : 0) + '%';
        box.querySelectorAll('.fix-dot').forEach(function (d, x) { d.classList.toggle('done', x < k); });
      });
      box.querySelectorAll('[data-step]').forEach(function (b) {
        b.addEventListener('click', function () { g.show((g.current() + +b.dataset.step + g.count) % g.count); });
      });
    });
    main.querySelectorAll('[data-tools]').forEach(function (box) { tabGroup(box, '.tool-tab'); });
    // competency radar
    main.querySelectorAll('[data-rd]').forEach(function (box) {
      var rd = box.querySelector('.rd'), card = box.querySelector('.rd-card');
      var nodes = [].slice.call(box.querySelectorAll('.rd-node')), chips = [].slice.call(box.querySelectorAll('.rd-chip'));
      var sel = 0;
      function show(i) {
        var t = RADAR_TOOLS[i], lg = P.softwareLogos[t.name];
        card.className = 'rd-card ' + t.g.stream;
        card.innerHTML = (lg ? '<img src="' + esc(lg) + '" alt="" width="64" height="64">' : '') +
          '<div><p class="rd-g"><i aria-hidden="true"></i>' + esc(t.g.title) + '</p><h4>' + esc(t.name) + '</h4>' +
          '<p class="rd-l"><b>' + esc(LV_NOW()[t.level - 1]) + '</b><span class="rd-dots" aria-hidden="true">' + [1, 2, 3, 4].map(function (k) { return '<i' + (k <= t.level ? ' class="on"' : '') + '></i>'; }).join('') + '</span></p>' +
          '<p class="rd-hint">' + esc(U.levelHints[t.level - 1]) + '</p></div>';
        void card.offsetWidth; card.classList.add('in');
        nodes.forEach(function (n) { n.classList.toggle('hot', +n.dataset.t === i); });
        chips.forEach(function (c) { c.classList.toggle('hot', +c.dataset.t === i); });
      }
      function pick(i) { sel = i; nodes.forEach(function (n) { n.classList.toggle('sel', +n.dataset.t === i); }); show(i); }
      nodes.concat(chips).forEach(function (el) {
        var i = +el.dataset.t;
        el.addEventListener('click', function () { pick(i); });
        el.addEventListener('mouseenter', function () { show(i); });
        el.addEventListener('focus', function () { show(i); });
        el.addEventListener('mouseleave', function () { show(sel); });
        el.addEventListener('blur', function () { show(sel); });
      });
      pick(0);
      box.querySelectorAll('[data-f]').forEach(function (b) {
        b.addEventListener('click', function () {
          box.querySelectorAll('[data-f]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          rd.dataset.f = b.dataset.f; box.dataset.f = b.dataset.f;
          if (b.dataset.f !== 'all') { var first = RADAR_TOOLS.filter(function (t) { return t.g.key === b.dataset.f; })[0]; if (first) pick(first.i); }
        });
      });
      if ('IntersectionObserver' in window && !IL.isPaused()) {
        rd.classList.add('ready');
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (!e.isIntersecting) return;
            rd.classList.add('in'); io.disconnect();
            setTimeout(function () { rd.classList.add('done'); }, 900 + RADAR_TOOLS.length * 45);
          });
        }, { threshold: 0.3 });
        io.observe(rd); observers.push(io);
      }
    });

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
