/* Thesis story: an expandable panel in Education with six chapters.
 * Data: assets/js/thesis.js (window.THESIS). Used by main.js via window.ThesisView. */
(function () {
  'use strict';
  var T = window.THESIS;
  var NS = 'http://www.w3.org/2000/svg';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function two(n) { return (n < 9 ? '0' : '') + (n + 1); }
  function img(name) { return 'assets/img/thesis/' + name + '.webp'; }
  function fmt(v, dec, lang) {
    var s = Number(v).toFixed(dec);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, lang === 'id' ? '.' : ',');
    return parts.join(lang === 'id' ? ',' : '.');
  }
  function photo(name, cap, w, h) {
    return '<button type="button" class="th-ph" data-lb="' + img(name) + '" data-cap="' + esc(cap) + '" aria-label="' + esc(cap) + '">' +
      '<img src="' + img(name) + '" alt="' + esc(cap) + '" loading="lazy" width="' + (w || 640) + '" height="' + (h || 400) + '"></button>';
  }

  // ------------------------------------------------------------ the DPHE cross-section (interactive)
  // Long-section of the exchanger. Baffles rotate to the chosen angle; hot water runs left to right in the
  // copper pipe, cold water right to left in the annulus, weaving more when baffles are fitted.
  var X0 = 90, X1 = 810, YT = 64, YB = 196, YI0 = 112, YI1 = 148, N = 18;
  function dpheSVG(L) {
    var s = '<svg class="th-dphe" viewBox="0 0 900 260" role="img" aria-label="' + esc(L.d.lead) + '"><defs>' +
      '<linearGradient id="thCu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F0B48D"/><stop offset=".45" stop-color="#C0753F"/><stop offset="1" stop-color="#7A3E19"/></linearGradient>' +
      '<linearGradient id="thSS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9EDF1"/><stop offset=".5" stop-color="#B9C1CA"/><stop offset="1" stop-color="#8A95A1"/></linearGradient>' +
      '<clipPath id="thAnn"><rect x="' + X0 + '" y="' + YT + '" width="' + (X1 - X0) + '" height="' + (YB - YT) + '"/></clipPath></defs>';
    // annulus water
    s += '<rect x="' + X0 + '" y="' + YT + '" width="' + (X1 - X0) + '" height="' + (YB - YT) + '" fill="#E3EEFB"/>';
    // baffles (behind the inner pipe), clipped to the annulus
    s += '<g clip-path="url(#thAnn)">';
    for (var k = 0; k < N; k++) {
      var x = X0 + 30 + k * ((X1 - X0 - 60) / (N - 1));
      s += '<g class="th-baf" style="--x:' + x.toFixed(1) + 'px"><line x1="0" y1="-74" x2="0" y2="74" class="th-baf-l"/></g>';
    }
    s += '</g>';
    // cold particles
    s += '<g class="th-cold" clip-path="url(#thAnn)"></g>';
    // inner copper pipe with hot water
    s += '<rect x="' + (X0 - 40) + '" y="' + YI0 + '" width="' + (X1 - X0 + 80) + '" height="' + (YI1 - YI0) + '" fill="url(#thCu)" stroke="#15181D" stroke-width="2"/>' +
      '<rect x="' + (X0 - 40) + '" y="' + (YI0 + 5) + '" width="' + (X1 - X0 + 80) + '" height="' + (YI1 - YI0 - 10) + '" fill="#FBD9C9" opacity=".85"/>' +
      '<g class="th-hot"></g>';
    // shell walls
    s += '<rect x="' + X0 + '" y="' + (YT - 8) + '" width="' + (X1 - X0) + '" height="8" fill="url(#thSS)" stroke="#15181D" stroke-width="1.6"/>' +
      '<rect x="' + X0 + '" y="' + YB + '" width="' + (X1 - X0) + '" height="8" fill="url(#thSS)" stroke="#15181D" stroke-width="1.6"/>' +
      '<rect x="' + (X0 - 6) + '" y="' + (YT - 16) + '" width="10" height="' + (YB - YT + 32) + '" fill="#9AA5B1" stroke="#15181D" stroke-width="1.6"/>' +
      '<rect x="' + (X1 - 4) + '" y="' + (YT - 16) + '" width="10" height="' + (YB - YT + 32) + '" fill="#9AA5B1" stroke="#15181D" stroke-width="1.6"/>';
    // nozzles for the cold stream: in at the right (bottom), out at the left (top)
    s += '<path d="M770 204v34M790 204v34" stroke="#15181D" stroke-width="2"/><rect x="770" y="204" width="20" height="34" fill="url(#thSS)"/>' +
      '<path d="M110 22v34M130 22v34" stroke="#15181D" stroke-width="2"/><rect x="110" y="22" width="20" height="34" fill="url(#thSS)"/>';
    // readouts
    s += '<g class="th-read" font-family="IBM Plex Mono, monospace" font-size="12">' +
      '<text class="th-thi" x="6" y="' + (YI0 - 10) + '" fill="#B3321D">80.0 °C</text>' +
      '<text class="th-tho" x="894" y="' + (YI0 - 10) + '" text-anchor="end" fill="#B3321D">–</text>' +
      '<text x="800" y="254" text-anchor="end" fill="#1B5FD1">30.0 °C</text>' +
      '<text class="th-tco" x="100" y="16" fill="#1B5FD1">–</text></g>';
    s += '</svg>';
    return s;
  }
  var OUT = { tho: [77.6, 72.0, 68.3, 67.2], tco: [32.2, 34.7, 34.4, 34.3] };   // 80 - dTh, 30 + dTc (Table 4.2)

  function mountDphe(box, lang) {
    var svg = box.querySelector('.th-dphe');
    var cold = svg.querySelector('.th-cold'), hot = svg.querySelector('.th-hot');
    var tho = svg.querySelector('.th-tho'), tco = svg.querySelector('.th-tco');
    svg.querySelector('.th-thi').textContent = fmt(80, 1, lang) + ' °C';
    svg.querySelectorAll('.th-read text:not([class])').forEach(function (t) { t.textContent = fmt(30, 1, lang) + ' °C'; });
    var parts = [], i;
    for (i = 0; i < 34; i++) {
      var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '3.2'); cold.appendChild(c);
      parts.push({ el: c, kind: 'c', u: Math.random(), lane: i % 2, ph: Math.random() * 6.28 });
    }
    for (i = 0; i < 16; i++) {
      var h = document.createElementNS(NS, 'circle'); h.setAttribute('r', '3'); hot.appendChild(h);
      parts.push({ el: h, kind: 'h', u: i / 16, ph: Math.random() * 6.28 });
    }
    var state = { v: 1, amp: 1 };
    function mix(a, b, t) { return 'rgb(' + a.map(function (x, k) { return Math.round(x + (b[k] - x) * t); }).join(',') + ')'; }
    function set(v) {
      state.v = v;
      box.dataset.v = v;
      var ang = [0, 90, 60, 45][v];
      svg.querySelectorAll('.th-baf').forEach(function (g) {
        g.style.transform = 'translate(var(--x), 130px) rotate(' + (v === 0 ? 90 : (90 - ang)) + 'deg) scaleY(' + (v === 0 ? 0 : 1 / Math.sin(ang * Math.PI / 180)) + ')';
      });
      tho.textContent = fmt(OUT.tho[v], 1, lang) + ' °C';
      tco.textContent = fmt(OUT.tco[v], 1, lang) + ' °C';
      state.amp = v === 0 ? 0 : [0, 1, 1.25, 1.45][v];
    }
    var last = performance.now(), raf = 0, live = true;
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      var sp = state.v === 0 ? 1 : 0.62;
      parts.forEach(function (p) {
        if (p.kind === 'h') {
          p.u = (p.u + dt * 0.16) % 1;
          var x = X0 - 36 + p.u * (X1 - X0 + 72), y = 130 + Math.sin(p.ph + p.u * 20) * 4;
          p.el.setAttribute('cx', x.toFixed(1)); p.el.setAttribute('cy', y.toFixed(1));
          p.el.setAttribute('fill', mix([217, 67, 43], [242, 163, 58], p.u * (state.v === 0 ? 0.3 : 0.9)));
        } else {
          p.u = (p.u + dt * 0.11 * sp) % 1;
          var xx = X1 - 10 - p.u * (X1 - X0 - 20);
          var base = p.lane ? 172 : 88;
          var y2 = base + Math.sin(xx / ((X1 - X0 - 60) / (N - 1)) * Math.PI + p.ph * 0.2) * 16 * state.amp * (p.lane ? -1 : 1);
          p.el.setAttribute('cx', xx.toFixed(1)); p.el.setAttribute('cy', y2.toFixed(1));
          p.el.setAttribute('fill', mix([27, 95, 209], [34, 173, 201], p.u * (state.v === 0 ? 0.35 : 0.9)));
        }
      });
      if (live) raf = requestAnimationFrame(frame);
    }
    if (!reduced) raf = requestAnimationFrame(frame); else frame(performance.now());
    box.querySelectorAll('[data-v]').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('[data-v]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        set(+b.dataset.v);
        var area = T.metrics.area.v[+b.dataset.v];
        var bar = box.querySelector('.th-area i'), val = box.querySelector('.th-area b');
        bar.style.width = (area / 0.28 * 100) + '%'; val.textContent = fmt(area, 2, lang) + ' m²';
      });
    });
    box.querySelector('[data-v="1"]').click();
    return { stop: function () { live = false; cancelAnimationFrame(raf); } };
  }

  // ------------------------------------------------------------ a single baffle, face on
  // Face view, as in the fabrication drawing: 8 semi-circular cut-outs (R6.5) on a 45° pitch, each with its
  // straight fold line pointing at the centre. The cut tab is bent out along that line, so it shows as a
  // narrow, foreshortened half-disc beside the hole. Only the disc spins; the label stays upright.
  function baffleSVG() {
    var s = '<svg class="th-baffle" viewBox="-44 -44 88 88" aria-hidden="true"><g class="th-baffle-rot">' +
      '<circle r="34" fill="#D58B57" stroke="#15181D" stroke-width="1.2"/><circle r="17.5" fill="var(--sheet)" stroke="#15181D" stroke-width="1.2"/>';
    for (var k = 0; k < 8; k++) {
      s += '<g transform="rotate(' + (k * 45) + ') translate(0 -26)">' +
        '<path d="M0 -6.5a6.5 6.5 0 0 1 0 13z" fill="var(--sheet)" stroke="#15181D" stroke-width=".9"/>' +             // the hole
        '<path d="M0 -6.5a2.6 6.5 0 0 0 0 13z" fill="#F0B48D" stroke="#7A3E19" stroke-width=".8"/>' +                 // the bent fin, foreshortened
        '<path d="M0 -6.5v13" stroke="#15181D" stroke-width="1.1"/></g>';                                              // fold line, radial
    }
    s += '</g><path d="M-34 0h-6M34 0h6" stroke="#15181D" stroke-width="1"/>' +
      '<text x="0" y="42" text-anchor="middle" font-size="5" font-family="IBM Plex Mono, monospace" fill="#4A515C">Ø68 · 8 × R6.5 · 45°</text></svg>';
    return s;
  }

  // ------------------------------------------------------------ the seesaw (chapter 1)
  function seesawSVG(L) {
    return '<svg class="th-seesaw" viewBox="0 0 340 200" role="img" aria-label="' + esc(L.q.tradeQ) + '">' +
      '<path d="M170 168l-22 26h44z" fill="#15181D"/>' +
      '<g class="th-beam"><rect x="30" y="160" width="280" height="8" rx="3" fill="#15181D"/>' +
      '<g transform="translate(76 160)"><rect x="-60" y="-46" width="120" height="46" rx="8" fill="#FBE5DC" stroke="#B3321D" stroke-width="2"/>' +
      '<text y="-27" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-weight="600" font-size="13" fill="#B3321D">' + esc(L.q.tradeUpL[0]) + '</text>' +
      '<text y="-11" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-size="12" fill="#B3321D">' + esc(L.q.tradeUpL[1]) + '</text></g>' +
      '<g transform="translate(264 160)"><rect x="-60" y="-46" width="120" height="46" rx="8" fill="#DEE8FA" stroke="#1B5FD1" stroke-width="2"/>' +
      '<text y="-27" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-weight="600" font-size="13" fill="#1B5FD1">' + esc(L.q.tradeDownL[0]) + '</text>' +
      '<text y="-11" text-anchor="middle" font-family="Instrument Sans, sans-serif" font-size="12" fill="#1B5FD1">' + esc(L.q.tradeDownL[1]) + '</text></g></g>' +
      '<g transform="translate(170 64)"><circle r="30" fill="var(--sheet)" stroke="#15181D" stroke-width="2"/>' +
      '<path d="M-20 0A20 20 0 0 1 0 -20" fill="none" stroke="#E3A008" stroke-width="3"/><path d="M0 0V-24M0 0L-17 -17" stroke="#15181D" stroke-width="2.4" stroke-linecap="round" class="th-q-hand"/>' +
      '<text y="20" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="16" fill="#15181D">θ ?</text></g>' +
      '<path d="M170 94v66" stroke="#15181D" stroke-width="2" stroke-dasharray="3 4"/></svg>';
  }

  // ------------------------------------------------------------ html
  function html(lang) {
    var L = T[lang], V = L.variantNames;
    var tabs = L.tabs.map(function (t, k) {
      return '<button type="button" role="tab" class="th-tab" id="th-t' + k + '" aria-controls="th-p' + k + '" aria-selected="' + (k === 0) + '" tabindex="' + (k ? -1 : 0) + '"><span>' + two(k) + '</span>' + esc(t) + '</button>';
    }).join('');
    var p = [];
    // 1 question
    p.push('<div class="th-q"><div><p class="th-lead">' + esc(L.q.lead) + '</p>' + L.q.body.map(function (b) { return '<p>' + esc(b) + '</p>'; }).join('') +
      '<div class="th-variants" aria-hidden="true">' + V.map(function (v, k) { return '<span class="th-vchip v' + k + '"><i></i>' + esc(v) + '</span>'; }).join('') + '</div></div>' +
      '<div><figure class="th-fig">' + seesawSVG(L) + '<figcaption>' + esc(L.q.tradeQ) + '</figcaption></figure>' +
      '<p class="th-label">' + esc(L.q.fixed) + '</p><dl class="th-fixed">' + L.q.fixedItems.map(function (f) { return '<div><dt>' + esc(f[0]) + '</dt><dd>' + esc(f[1]) + '</dd></div>'; }).join('') + '</dl></div></div>');
    // 2 design
    p.push('<p class="th-lead">' + esc(L.d.lead) + '</p><div class="th-dphe-box"><div class="th-seg" role="group" aria-label="' + esc(L.tabs[1]) + '">' +
      V.map(function (v, k) { return '<button type="button" data-v="' + k + '" aria-pressed="false">' + esc(v) + '</button>'; }).join('') + '</div>' +
      '<div class="th-scroll">' + dpheSVG(L) + '</div><div class="th-legend"><span class="hot"><i></i>' + esc(L.d.flowHot) + '</span><span class="cold"><i></i>' + esc(L.d.flowCold) + '</span>' +
      '<span class="th-area"><em>A</em><i></i><b></b></span></div></div>' +
      '<div class="th-design"><figure class="th-baffle-fig">' + baffleSVG() + '<figcaption><b>' + esc(L.d.baffleTitle) + '</b>' + esc(L.d.baffleNote) + '</figcaption></figure>' +
      '<div><dl class="th-specs">' + L.d.specs.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="th-note">' + esc(L.d.areaNote) + '</p></div></div>');
    // 3 build
    p.push('<p class="th-lead">' + esc(L.b.lead) + '</p><ol class="th-steps">' + L.b.steps.map(function (s, k) {
      return '<li style="--i:' + k + '">' + photo(s[2], s[0] + ': ' + s[1]) + '<div><span class="th-n">' + two(k) + '</span><h4>' + esc(s[0]) + '</h4><p>' + esc(s[1]) + '</p></div></li>';
    }).join('') + '</ol><aside class="th-pub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h8M8 8h4"/></svg>' +
      '<p>' + esc(L.b.pub) + '</p><a class="btn btn-ink ext" href="' + T.journal + '" target="_blank" rel="noopener">' + esc(L.b.pubLink) + '</a></aside>');
    // 4 testing
    p.push('<p class="th-lead">' + esc(L.t.lead) + '</p><div class="th-test"><div><dl class="th-specs">' + L.t.instruments.map(function (s) { return '<div><dt>' + esc(s[0]) + '</dt><dd>' + esc(s[1]) + '</dd></div>'; }).join('') + '</dl>' +
      '<ol class="th-proc">' + L.t.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="th-mosaic">' + L.t.photos.map(function (ph) { return '<figure>' + photo(ph[0], ph[1]) + '<figcaption>' + esc(ph[1]) + '</figcaption></figure>'; }).join('') + '</div></div>');
    // 5 results
    var keys = Object.keys(L.r.metrics);
    p.push('<ul class="th-kpis">' + L.r.kpis.map(function (k) { return '<li><span>' + esc(k[0]) + '</span><b>' + esc(k[1]) + '</b><small>' + esc(k[2]) + '</small></li>'; }).join('') + '</ul>' +
      '<p class="th-lead">' + esc(L.r.lead) + '</p><div class="th-res"><div class="th-mlist" role="group" aria-label="' + esc(L.tabs[4]) + '">' +
      keys.map(function (k, i) { return '<button type="button" data-m="' + k + '" aria-pressed="' + (i === 0) + '">' + esc(L.r.metrics[k][0]) + '</button>'; }).join('') + '</div>' +
      '<div class="th-chart"><h4 class="th-ct"></h4><div class="th-bars">' + V.map(function (v, k) {
        return '<div class="th-bar v' + k + '"><span class="th-bl">' + esc(v) + '</span><span class="th-bt"><i></i></span><b>–</b></div>';
      }).join('') + '</div><p class="th-cx"></p><p class="th-note">' + esc(L.r.note) + '</p></div></div>');
    // 6 lessons
    p.push('<div class="th-verdict"><h4>' + esc(L.l.verdict) + '</h4><p>' + esc(L.l.verdictBody) + '</p></div><div class="th-two">' +
      '<div><p class="th-label">' + esc(L.l.learnedTitle) + '</p><ul class="th-list">' + L.l.learned.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
      '<div><p class="th-label">' + esc(L.l.nextTitle) + '</p><ul class="th-list next">' + L.l.next.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>');

    // 7 journey
    var JI = {
      asme: '<rect x="13" y="6" width="14" height="28" rx="7"/><path d="M8 6v28M5 6h6M5 34h6"/>',
      weld: '<path d="M5 30h30"/><path d="M8 30c2-4 4-4 6 0s4 4 6 0 4-4 6 0 4 4 6 0"/><path d="M26 6l-6 14"/><path d="M22 4l8 4"/>',
      nde: '<circle cx="17" cy="17" r="9"/><path d="M24 24l9 9"/><path d="M12 17h3l2-4 2 8 2-4h2"/>',
      test: '<path d="M7 28a13 13 0 1 1 26 0"/><path d="M20 28l7-9"/><circle cx="20" cy="28" r="2"/><path d="M20 30v6"/>',
      coat: '<path d="M20 4l13 5v9c0 9-6 15-13 18-7-3-13-9-13-18V9z"/><path d="M14 19l4 4 8-8"/>',
      stress: '<path d="M4 12h14a6 6 0 0 1 6 6v18"/><path d="M8 6l-4 6 4 6M30 30l-6 6-6-6"/>',
      hysys: '<rect x="4" y="8" width="10" height="10" rx="2"/><rect x="26" y="8" width="10" height="10" rx="2"/><rect x="15" y="25" width="10" height="10" rx="2"/><path d="M14 13h12M31 18v5l-6 5M9 18v5l6 5"/>',
      inst: '<circle cx="20" cy="17" r="10"/><path d="M10 17h20"/><path d="M20 27v8M14 35h12"/>',
      cfd: '<path d="M4 12c8-5 12 5 20 0s8-3 12 0M4 20c8-5 12 5 20 0s8-3 12 0M4 28c8-5 12 5 20 0s8-3 12 0"/>'
    };
    p.push('<p class="th-lead">' + esc(L.j.lead) + '</p><p class="th-label">' + esc(L.j.learnTitle) + '</p><ol class="th-learn">' +
      L.j.learn.map(function (x, k) {
        return '<li style="--i:' + k + '"><span class="th-li" aria-hidden="true"><svg viewBox="0 0 40 40">' + (JI[T.journeyIcons[k]] || '') + '</svg></span><div><b>' + esc(x[0]) + '</b><p>' + esc(x[1]) + '</p></div></li>';
      }).join('') + '</ol><p class="th-label">' + esc(L.j.pathTitle) + '</p><ol class="th-path">' +
      L.j.path.map(function (x, k) {
        return '<li style="--i:' + k + '"><span class="th-pn" aria-hidden="true">' + two(k) + '</span><span class="th-py">' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b><p>' + esc(x[2]) + '</p></li>';
      }).join('') + '</ol><p class="th-close">' + esc(L.j.close) + '</p>');

    return '<div class="thesis" id="thesis" hidden><div class="th-head"><div><p class="th-kicker">' + esc(L.kicker) + '</p><h3>' + esc(L.title) + '</h3><p class="th-full">' + esc(L.full) + '</p></div>' +
      '<button type="button" class="icon-btn th-x" data-th-close aria-label="' + esc(L.close) + '"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2"/></svg></button>' +
      '<dl class="th-meta">' + L.meta.map(function (m) { return '<div><dt>' + esc(m[0]) + '</dt><dd>' + esc(m[1]) + '</dd></div>'; }).join('') + '</dl></div>' +
      '<div class="th-tabs" role="tablist" aria-label="' + esc(L.title) + '">' + tabs + '</div>' +
      p.map(function (c, k) { return '<section class="th-panel' + (k === 0 ? ' in' : '') + '" role="tabpanel" id="th-p' + k + '" aria-labelledby="th-t' + k + '"' + (k ? ' hidden' : '') + '>' + c + '</section>'; }).join('') +
      '<div class="th-foot"><button type="button" class="btn btn-line" data-th-prev>‹</button><span class="th-pos"></span><button type="button" class="btn btn-ink" data-th-next>›</button></div></div>';
  }

  // ------------------------------------------------------------ behaviour
  function wire(root, lang, onOpenImage) {
    var L = T[lang], box = root.querySelector('#thesis'), btn = root.querySelector('[data-th-open]');
    if (!box || !btn) return;
    var tabs = [].slice.call(box.querySelectorAll('.th-tab')), dphe = null, chartDone = false;
    function chart(key) {
      var m = T.metrics[key], meta = L.r.metrics[key];
      var max = Math.max.apply(null, m.v), lo = m.min, hi = max + (max - lo) * 0.12;
      // "best" compares the baffle angles only: the question is which angle, not whether to fit baffles
      var angles = m.v.slice(1);
      var bestV = m.better === 'high' ? Math.max.apply(null, angles) : m.better === 'low' ? Math.min.apply(null, angles) : null;
      box.querySelector('.th-ct').textContent = meta[0] + ' (' + m.unit + ')';
      box.querySelector('.th-cx').textContent = meta[1];
      box.querySelectorAll('.th-bar').forEach(function (bar, k) {
        var v = m.v[k];
        bar.querySelector('i').style.width = Math.max(2, (v - lo) / (hi - lo) * 100) + '%';
        var isBest = k > 0 && v === bestV;
        bar.querySelector('b').innerHTML = fmt(v, m.dec, lang) + ' <small>' + m.unit + '</small>' + (isBest ? ' <em>' + esc(L.r.best) + '</em>' : '');
        bar.classList.toggle('best', isBest);
      });
    }
    function show(k, focus) {
      tabs.forEach(function (t, x) {
        var on = x === k, panel = document.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
        panel.hidden = !on; panel.classList.remove('in');
        if (on) { void panel.offsetWidth; panel.classList.add('in'); }
      });
      box.querySelector('.th-pos').textContent = two(k) + ' / ' + (tabs.length < 10 ? '0' : '') + tabs.length;
      box.querySelector('[data-th-prev]').disabled = k === 0;
      box.querySelector('[data-th-next]').disabled = k === tabs.length - 1;
      box.querySelector('[data-th-prev]').setAttribute('aria-label', k ? L.tabs[k - 1] : L.tabs[0]);
      box.querySelector('[data-th-next]').setAttribute('aria-label', L.tabs[Math.min(k + 1, tabs.length - 1)]);
      box.dataset.tab = k;
      if (k === 1 && !dphe) dphe = mountDphe(box.querySelector('.th-dphe-box'), lang);
      if (k === 4 && !chartDone) { chartDone = true; requestAnimationFrame(function () { chart('eff'); }); }
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { show(k); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { e.preventDefault(); show((k + d + tabs.length) % tabs.length, true); }
      });
    });
    box.querySelector('[data-th-prev]').addEventListener('click', function () { show(Math.max(0, +box.dataset.tab - 1)); box.querySelector('.th-tabs').scrollIntoView({ block: 'nearest' }); });
    box.querySelector('[data-th-next]').addEventListener('click', function () { show(Math.min(tabs.length - 1, +box.dataset.tab + 1)); box.querySelector('.th-tabs').scrollIntoView({ block: 'nearest' }); });
    box.querySelectorAll('[data-m]').forEach(function (b) {
      b.addEventListener('click', function () {
        box.querySelectorAll('[data-m]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        chart(b.dataset.m);
      });
    });
    function open() {
      box.hidden = false; btn.setAttribute('aria-expanded', 'true'); btn.querySelector('span').textContent = L.close;
      void box.offsetWidth; box.classList.add('open');
      if (box.dataset.tab === undefined) show(0);
      box.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
    function close() {
      box.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.querySelector('span').textContent = L.open;
      setTimeout(function () { box.hidden = true; }, reduced ? 0 : 350);
      btn.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }); btn.focus({ preventScroll: true });
    }
    btn.addEventListener('click', function () { btn.getAttribute('aria-expanded') === 'true' ? close() : open(); });
    box.querySelector('[data-th-close]').addEventListener('click', close);
    if (onOpenImage) onOpenImage(box);
  }

  window.ThesisView = {
    html: html,
    button: function (lang) {
      return '<button type="button" class="th-open" data-th-open aria-expanded="false" aria-controls="thesis">' +
        '<svg viewBox="0 0 40 24" aria-hidden="true"><rect x="2" y="7" width="36" height="10" rx="2"/><path d="M8 4v16M14 4v16M20 4v16M26 4v16M32 4v16"/></svg><span>' + esc(T[lang].open) + '</span></button>';
    },
    wire: wire
  };
})();
