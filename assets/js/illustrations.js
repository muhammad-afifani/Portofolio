/*
 * Animated engineering illustrations (inline SVG, no libraries).
 * Every drawing shows the real mechanism of the discipline it stands for:
 *   hx    shell & tube heat exchanger, hot shell-side flow zig-zagging round baffles, cold tube-side flow
 *   pv    pressure vessel with an FEM von Mises contour under cyclic load + the ASME S-N check from the case study
 *   emis  GTG exhaust stack with stack-test port, flare, plume and an EnPI vs baseline chart
 *   pipe  isometric spools whose weld joints go pending -> welded -> NDE accepted, with RFID pings and an S-curve
 * Small variants (cfd, fem, mech, hx, plan) illustrate freelance project disciplines.
 */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var C = {
    ink: '#15181D', ink2: '#4A515C', line: '#C9C1B0', paper: '#FBF9F4', steel: '#A4AEBA', steelD: '#6B7684',
    hot: '#D9432B', hot2: '#F2A33A', cold: '#1B5FD1', cold2: '#22ADC9', energy: '#12905C', amber: '#E3A008',
    teal: '#0E8C92', violet: '#6D4BC4'
  };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = reduced;
  var instances = [];

  // ------------------------------------------------------------ helpers
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function hex(c) { var n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function mix(a, b, t) {
    var x = hex(a), y = hex(b);
    return 'rgb(' + Math.round(x[0] + (y[0] - x[0]) * t) + ',' + Math.round(x[1] + (y[1] - x[1]) * t) + ',' + Math.round(x[2] + (y[2] - x[2]) * t) + ')';
  }
  function ramp(stops, t) {
    t = Math.max(0, Math.min(0.9999, t));
    var f = t * (stops.length - 1), i = Math.floor(f);
    return mix(stops[i], stops[i + 1], f - i);
  }
  var TURBO = ['#2C4BD6', '#22B5D6', '#3CC46E', '#F2C230', '#E0412B'];
  function smooth(pts) { // Catmull-Rom -> cubic bezier path
    var d = 'M' + pts[0][0] + ',' + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ' C' + c1x.toFixed(1) + ',' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ',' + c2y.toFixed(1) + ' ' + p2[0] + ',' + p2[1];
    }
    return d;
  }
  function sample(path, n) { // lookup table of points along a path
    var len = path.getTotalLength(), out = [];
    for (var i = 0; i <= n; i++) { var p = path.getPointAtLength(len * i / n); out.push([p.x, p.y]); }
    return out;
  }
  function at(lut, u) {
    var f = u * (lut.length - 1), i = Math.floor(f), a = lut[i], b = lut[Math.min(i + 1, lut.length - 1)], k = f - i;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  function text(parent, x, y, str, opts) {
    opts = opts || {};
    var t = el('text', {
      x: x, y: y, 'font-family': opts.mono === false ? 'Instrument Sans, sans-serif' : 'IBM Plex Mono, monospace',
      'font-size': opts.size || 11, fill: opts.fill || C.ink2, 'text-anchor': opts.anchor || 'start',
      'font-weight': opts.weight || 400
    }, parent);
    t.textContent = str;
    return t;
  }
  function leader(parent, x1, y1, x2, y2, label, anchor) {
    el('path', { d: 'M' + x1 + ',' + y1 + ' L' + x2 + ',' + y2, stroke: C.ink2, 'stroke-width': 1, fill: 'none' }, parent);
    el('circle', { cx: x1, cy: y1, r: 2.5, fill: C.ink2 }, parent);
    text(parent, x2 + (anchor === 'end' ? -6 : 6), y2 + 4, label, { anchor: anchor || 'start' });
  }
  function hatch(defs, id, color) {
    var p = el('pattern', { id: id, width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 6, height: 6, fill: '#E9E4D8' }, p);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: color || C.steelD, 'stroke-width': 1.4 }, p);
  }
  function svgRoot(host, vb, label) {
    var s = el('svg', { viewBox: vb, role: 'img', 'aria-label': label, preserveAspectRatio: 'xMidYMid meet' });
    s.classList.add('il-svg');
    host.appendChild(s);
    return s;
  }
  var uid = 0;
  function id(p) { return p + '-' + (++uid); }

  // ------------------------------------------------------------ HEAT EXCHANGER
  function heatExchanger(host, opt) {
    opt = opt || {};
    var s = svgRoot(host, '0 0 820 440', 'Animated shell and tube heat exchanger: hot fluid flows around segmental baffles on the shell side while cold fluid flows through the tubes');
    var defs = el('defs', null, s);
    var hId = id('hx-hatch'); hatch(defs, hId);
    var gId = id('hx-tube');
    var g = el('linearGradient', { id: gId, x1: 150, x2: 650, y1: 0, y2: 0, gradientUnits: 'userSpaceOnUse' }, defs);
    el('stop', { offset: 0, 'stop-color': C.cold }, g); el('stop', { offset: 1, 'stop-color': C.cold2 }, g);
    var shG = id('hx-shell');
    var g2 = el('linearGradient', { id: shG, x1: 150, x2: 650, y1: 0, y2: 0, gradientUnits: 'userSpaceOnUse' }, defs);
    el('stop', { offset: 0, 'stop-color': '#FCE3D9' }, g2); el('stop', { offset: 1, 'stop-color': '#FDF0DC' }, g2);

    var TY = [150, 172, 194, 216, 238, 260, 282];
    // shell interior (hot side tint)
    el('rect', { x: 150, y: 138, width: 500, height: 164, fill: 'url(#' + shG + ')' }, s);
    // channel heads interior (cold side tint)
    el('path', { d: 'M150,138 L112,138 Q78,138 78,220 Q78,302 112,302 L150,302 Z', fill: '#DCE8FA' }, s);
    el('path', { d: 'M650,138 L688,138 Q722,138 722,220 Q722,302 688,302 L650,302 Z', fill: '#DDF1F6' }, s);

    var shellFlow = el('g', { 'class': 'hx-shellflow' }, s);
    // baffles
    var BX = [230, 310, 390, 470, 550];
    BX.forEach(function (x, i) {
      var top = i % 2 === 0;
      el('rect', { x: x - 3, y: top ? 138 : 178, width: 6, height: 124, fill: C.steelD, rx: 1 }, s);
    });
    // tubes
    var tubeFlow = el('g', { 'class': 'hx-tubeflow' }, s);
    TY.forEach(function (y) {
      el('line', { x1: 150, y1: y, x2: 650, y2: y, stroke: '#8E99A6', 'stroke-width': 9, 'stroke-linecap': 'butt' }, s);
      el('line', { x1: 150, y1: y, x2: 650, y2: y, stroke: 'url(#' + gId + ')', 'stroke-width': 5, opacity: 0.55, 'class': 'hx-tubefluid' }, s);
    });
    s.appendChild(tubeFlow);

    // shell walls (sectioned, hatched), heads, flanges, tubesheets
    el('rect', { x: 150, y: 128, width: 500, height: 10, fill: 'url(#' + hId + ')', stroke: C.ink, 'stroke-width': 1.5 }, s);
    el('rect', { x: 150, y: 302, width: 500, height: 10, fill: 'url(#' + hId + ')', stroke: C.ink, 'stroke-width': 1.5 }, s);
    el('path', { d: 'M150,128 L112,128 Q68,128 68,220 Q68,312 112,312 L150,312', fill: 'none', stroke: C.ink, 'stroke-width': 3 }, s);
    el('path', { d: 'M650,128 L688,128 Q732,128 732,220 Q732,312 688,312 L650,312', fill: 'none', stroke: C.ink, 'stroke-width': 3 }, s);
    [146, 646].forEach(function (x) {
      el('rect', { x: x, y: 118, width: 8, height: 204, fill: 'url(#' + hId + ')', stroke: C.ink, 'stroke-width': 1.5 }, s);
    });
    el('line', { x1: 78, y1: 220, x2: 146, y2: 220, stroke: C.ink, 'stroke-width': 1, 'stroke-dasharray': '6 4', opacity: 0.4 }, s);

    // nozzles: hot in (top left of shell), hot out (bottom right), cold in (front head bottom), cold out (rear head top)
    function nozzle(x, y1, y2, w, fw) {
      var top = Math.min(y1, y2), h = Math.abs(y2 - y1);
      el('rect', { x: x - w / 2, y: top, width: w, height: h, fill: C.paper, stroke: C.ink, 'stroke-width': 2.5 }, s);
      var fy = y1 < y2 ? top : top + h - 6;
      el('rect', { x: x - fw / 2, y: fy, width: fw, height: 6, fill: C.ink }, s);
    }
    // shell nozzles are full size; head nozzles are smaller and sit on the straight part of the heads,
    // so their base never runs past the curved head outline
    nozzle(190, 64, 128, 34, 52); nozzle(610, 312, 376, 34, 52);
    nozzle(128, 312, 366, 24, 34); nozzle(672, 64, 128, 24, 34);

    // flow paths
    function shellPath(off) {
      return smooth([[190, 52], [190, 150 + off * 0.3], [230, 282 + off * 0.5], [310, 158 + off * 0.5], [390, 282 + off * 0.5],
        [470, 158 + off * 0.5], [550, 282 + off * 0.5], [610, 290], [610, 392]]);
    }
    var shellLuts = [-16, 0, 16].map(function (o) {
      var p = el('path', { d: shellPath(o), fill: 'none', stroke: 'none' }, defs);
      return sample(p, 500);
    });
    var tubeLuts = TY.map(function (y) {
      var p = el('path', { d: 'M128,382 L128,330 Q128,' + y + ' 150,' + y + ' L650,' + y + ' Q672,' + y + ' 672,110 L672,54', fill: 'none' }, defs);
      return sample(p, 500);
    });

    var hotDots = [], coldDots = [];
    for (var i = 0; i < 54; i++) {
      var c = el('circle', { r: 4.2 }, shellFlow);
      hotDots.push({ el: c, lut: shellLuts[i % 3], u: i / 54 + Math.random() * 0.01, sp: 0.055 + Math.random() * 0.01 });
    }
    for (var j = 0; j < TY.length * 7; j++) {
      var c2 = el('circle', { r: 3 }, tubeFlow);
      coldDots.push({ el: c2, lut: tubeLuts[j % TY.length], u: Math.floor(j / TY.length) / 7 + (j % TY.length) * 0.013, sp: 0.075 });
    }

    // labels + P&ID temperature indicators
    function ti(x, y, level, color, anchor) {
      var gI = el('g', null, s);
      el('circle', { cx: x, cy: y, r: 14, fill: C.paper, stroke: C.ink, 'stroke-width': 1.5 }, gI);
      text(gI, x, y + 4, 'TI', { anchor: 'middle', size: 10, fill: C.ink, weight: 500 });
      var bx = anchor === 'end' ? x - 30 : x + 22;
      el('rect', { x: bx, y: y - 16, width: 7, height: 32, rx: 3.5, fill: '#E6E0D3' }, gI);
      var bar = el('rect', { x: bx, y: y + 16 - 32 * level, width: 7, height: 32 * level, rx: 3.5, fill: color }, gI);
      return bar;
    }
    ti(150, 50, 0.92, C.hot); ti(660, 396, 0.55, C.hot2); ti(82, 392, 0.18, C.cold, 'end'); ti(718, 50, 0.45, C.cold2);
    text(s, 216, 46, opt.l_hotIn || 'Hot in', { fill: C.hot, weight: 500 });
    text(s, 584, 410, opt.l_hotOut || 'Hot out', { anchor: 'end', fill: C.hot, weight: 500 });
    text(s, 150, 392, opt.l_coldIn || 'Cold in', { fill: C.cold, weight: 500 });
    text(s, 650, 78, opt.l_coldOut || 'Cold out', { anchor: 'end', fill: C.cold2, weight: 500 });
    leader(s, 390, 140, 420, 100, opt.l_baffle || 'Segmental baffle');
    leader(s, 470, 260, 500, 352, opt.l_tubes || 'Tube bundle');
    leader(s, 150, 316, 175, 352, opt.l_tubesheet || 'Tubesheet');
    leader(s, 300, 307, 300, 352, opt.l_shell || 'Shell (section)');

    var mode = 'both';
    return {
      svg: s,
      setMode: function (m) {
        mode = m;
        shellFlow.style.opacity = m === 'tube' ? 0.12 : 1;
        tubeFlow.style.opacity = m === 'shell' ? 0.12 : 1;
      },
      tick: function (t, dt) {
        hotDots.forEach(function (d) {
          d.u = (d.u + d.sp * dt) % 1;
          var p = at(d.lut, d.u);
          d.el.setAttribute('cx', p[0].toFixed(1)); d.el.setAttribute('cy', p[1].toFixed(1));
          d.el.setAttribute('fill', mix(C.hot, C.hot2, d.u));
        });
        coldDots.forEach(function (d) {
          d.u = (d.u + d.sp * dt) % 1;
          var p = at(d.lut, d.u);
          d.el.setAttribute('cx', p[0].toFixed(1)); d.el.setAttribute('cy', p[1].toFixed(1));
          d.el.setAttribute('fill', mix(C.cold, C.cold2, d.u));
        });
      }
    };
  }

  // ------------------------------------------------------------ PRESSURE VESSEL + FEM + S-N
  function pressureVessel(host, opt) {
    opt = opt || {};
    var s = svgRoot(host, '0 0 820 440', 'Pressure vessel with an FEM von Mises stress contour under cyclic pressure, next to the ASME fatigue check: 7.39 million design cycles against 5.02 billion allowable');
    var defs = el('defs', null, s);
    var clipId = id('pv-clip');
    var clip = el('clipPath', { id: clipId }, defs);
    var vesselD = 'M170,110 Q170,76 230,76 Q290,76 290,110 L290,310 Q290,344 230,344 Q170,344 170,310 Z';
    el('path', { d: vesselD }, clip);
    el('rect', { x: 290, y: 160, width: 44, height: 22 }, clip);
    el('rect', { x: 126, y: 250, width: 44, height: 22 }, clip);
    el('rect', { x: 218, y: 50, width: 24, height: 28 }, clip);

    var body = el('g', { 'class': 'pv-body' }, s);
    // legs
    [184, 276].forEach(function (x) {
      el('rect', { x: x - 6, y: 320, width: 12, height: 62, fill: C.steel, stroke: C.ink, 'stroke-width': 1.5 }, s);
      el('rect', { x: x - 16, y: 380, width: 32, height: 6, fill: C.ink }, s);
    });
    el('line', { x1: 110, y1: 386, x2: 350, y2: 386, stroke: C.ink2, 'stroke-width': 1 }, s);
    for (var hx = 112; hx < 350; hx += 10) el('line', { x1: hx, y1: 386, x2: hx - 7, y2: 394, stroke: C.ink2, 'stroke-width': 1 }, s);

    // mesh cells clipped to the vessel
    var mesh = el('g', { 'clip-path': 'url(#' + clipId + ')' }, body);
    function stress(x, y) {
      var v = 0.32;
      v += 0.22 * Math.exp(-Math.pow((y - 110) / 14, 2)) + 0.22 * Math.exp(-Math.pow((y - 310) / 14, 2));
      v += 0.68 * Math.exp(-(Math.pow(x - 290, 2) + Math.pow(y - 171, 2)) / 420);
      v += 0.5 * Math.exp(-(Math.pow(x - 170, 2) + Math.pow(y - 261, 2)) / 420);
      v += 0.35 * Math.exp(-(Math.pow(x - 184, 2) + Math.pow(y - 322, 2)) / 300) + 0.35 * Math.exp(-(Math.pow(x - 276, 2) + Math.pow(y - 322, 2)) / 300);
      v += 0.18 * Math.exp(-(Math.pow(x - 230, 2) + Math.pow(y - 76, 2)) / 300);
      return Math.min(1, v);
    }
    var cells = [];
    var step = 11;
    for (var y = 48; y < 350; y += step) {
      for (var x = 124; x < 338; x += step) {
        var a = [x, y], b = [x + step, y], c = [x, y + step], d = [x + step, y + step];
        [[a, b, c], [b, d, c]].forEach(function (tri) {
          var cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
          var v = stress(cx, cy);
          var p = el('path', {
            d: 'M' + tri[0] + 'L' + tri[1] + 'L' + tri[2] + 'Z', fill: C.paper,
            stroke: 'rgba(21,24,29,.18)', 'stroke-width': 0.6
          }, mesh);
          cells.push({ el: p, v: v, y: cy });
        });
      }
    }
    // outline on top
    el('path', { d: vesselD, fill: 'none', stroke: C.ink, 'stroke-width': 3 }, body);
    el('path', { d: 'M290,160 L334,160 M290,182 L334,182 M170,250 L126,250 M170,272 L126,272 M218,78 L218,50 M242,78 L242,50', stroke: C.ink, 'stroke-width': 2.5, fill: 'none' }, body);
    el('rect', { x: 334, y: 152, width: 6, height: 38, fill: C.ink }, body);
    el('rect', { x: 120, y: 242, width: 6, height: 38, fill: C.ink }, body);
    el('rect', { x: 210, y: 44, width: 40, height: 6, fill: C.ink }, body);
    text(s, 348, 175, 'N1', { fill: C.ink, weight: 500 });
    text(s, 92, 265, 'N2', { fill: C.ink, weight: 500 });

    // pressure gauge
    var gauge = el('g', { transform: 'translate(392,96)' }, s);
    el('circle', { r: 30, fill: C.paper, stroke: C.ink, 'stroke-width': 2 }, gauge);
    for (var k = 0; k <= 10; k++) {
      var ang = (-220 + k * 26) * Math.PI / 180;
      el('line', { x1: Math.cos(ang) * 22, y1: Math.sin(ang) * 22, x2: Math.cos(ang) * 27, y2: Math.sin(ang) * 27, stroke: k > 7 ? C.hot : C.ink2, 'stroke-width': 1.4 }, gauge);
    }
    var needle = el('line', { x1: 0, y1: 0, x2: 0, y2: -21, stroke: C.hot, 'stroke-width': 2.4, 'stroke-linecap': 'round' }, gauge);
    el('circle', { r: 3.5, fill: C.ink }, gauge);
    text(s, 392, 146, 'PI', { anchor: 'middle', fill: C.ink, weight: 500 });
    el('path', { d: 'M362,96 L334,150', stroke: C.ink2, 'stroke-width': 1, fill: 'none', 'stroke-dasharray': '3 3' }, s);

    // colour bar
    var cb = el('g', { transform: 'translate(386,200)' }, s);
    for (var q = 0; q < 20; q++) el('rect', { x: 0, y: 120 - (q + 1) * 6, width: 12, height: 6.4, fill: ramp(TURBO, q / 19) }, cb);
    el('rect', { x: 0, y: 0, width: 12, height: 120, fill: 'none', stroke: C.ink, 'stroke-width': 1 }, cb);
    text(cb, 20, 8, '93.93 MPa', { size: 10.5, fill: C.ink, weight: 500 });
    text(cb, 20, 120, '0', { size: 10.5 });
    text(cb, -2, -12, opt.l_vm || 'von Mises', { size: 10.5, fill: C.ink, weight: 500 });

    // S-N chart: log10 cycles 3..11, stress amplitude 0..320 MPa
    var ch = el('g', { transform: 'translate(500,80)' }, s);
    var W = 290, H = 250;
    function X(l) { return (l - 3) / 8 * W; }
    function Y(sv) { return H - sv / 320 * H; }
    el('line', { x1: 0, y1: H, x2: W, y2: H, stroke: C.ink, 'stroke-width': 1.5 }, ch);
    el('line', { x1: 0, y1: 0, x2: 0, y2: H, stroke: C.ink, 'stroke-width': 1.5 }, ch);
    for (var l = 3; l <= 11; l += 2) {
      el('line', { x1: X(l), y1: H, x2: X(l), y2: H + 5, stroke: C.ink, 'stroke-width': 1 }, ch);
      text(ch, X(l), H + 19, '10^' + l, { anchor: 'middle', size: 10 });
    }
    [0, 100, 200, 300].forEach(function (v) {
      el('line', { x1: -5, y1: Y(v), x2: 0, y2: Y(v), stroke: C.ink, 'stroke-width': 1 }, ch);
      text(ch, -9, Y(v) + 4, String(v), { anchor: 'end', size: 10 });
    });
    text(ch, W / 2, H + 38, opt.l_cycles || 'Cycles (N)', { anchor: 'middle', size: 10.5, fill: C.ink });
    text(ch, 0, -14, opt.l_salt || 'Salt (MPa), ASME VIII Div.2 fatigue check', { size: 10.5, fill: C.ink });
    function S(lv) { return 52 + 248 * Math.exp(-0.6 * (lv - 3)); }
    var pts = [];
    for (var lv = 3; lv <= 11.001; lv += 0.25) pts.push([+X(lv).toFixed(1), +Y(S(lv)).toFixed(1)]);
    var curve = el('path', { d: smooth(pts), fill: 'none', stroke: C.ink, 'stroke-width': 2 }, ch);
    var LD = Math.log10(7391250), LA = Math.log10(5024270909), SA = 56.36;
    var dLine = el('line', { x1: X(LD), y1: H, x2: X(LD), y2: Y(SA), stroke: C.cold, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, ch);
    var aLine = el('line', { x1: X(LA), y1: H, x2: X(LA), y2: Y(SA), stroke: C.hot, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }, ch);
    var arrow = el('path', { d: 'M' + X(LD) + ',' + (Y(SA) - 26) + ' L' + X(LA) + ',' + (Y(SA) - 26), stroke: C.energy, 'stroke-width': 2, fill: 'none', 'marker-end': 'url(#' + id('m') + ')' }, ch);
    var mk = el('marker', { id: arrow.getAttribute('marker-end').slice(5, -1), markerWidth: 8, markerHeight: 8, refX: 6, refY: 4, orient: 'auto' }, defs);
    el('path', { d: 'M0,0 L8,4 L0,8 Z', fill: C.energy }, mk);
    var mD = el('circle', { cx: X(LD), cy: Y(SA), r: 5, fill: C.cold }, ch);
    var mA = el('circle', { cx: X(LA), cy: Y(SA), r: 5, fill: C.hot }, ch);
    var lbl = el('g', null, ch);
    text(lbl, X(LD) - 4, Y(SA) + 22, opt.l_design || 'Design life 7.39e6', { anchor: 'end', size: 10, fill: C.cold, weight: 500 });
    text(lbl, X(LA) + 2, Y(SA) + 22, opt.l_allow || 'Allowable 5.02e9', { anchor: 'middle', size: 10, fill: C.hot, weight: 500 });
    text(lbl, (X(LD) + X(LA)) / 2, Y(SA) - 33, '', { anchor: 'middle' });
    var margin = text(ch, (X(LD) + X(LA)) / 2, Y(SA) - 36, opt.l_margin || 'about 680x margin', { anchor: 'middle', size: 11, fill: C.energy, weight: 500 });
    var cl = curve.getTotalLength();
    curve.style.strokeDasharray = cl; curve.style.strokeDashoffset = cl;

    var T = 0;
    function render(tt) {
      var solve = Math.min(1, tt / 2.6);           // contour fills low -> high stress
      var cyc = tt > 2.6 ? Math.sin((tt - 2.6) * 2.2) * 0.5 + 0.5 : 0;  // load cycles
      cells.forEach(function (c) {
        if (c.v <= solve * 1.05) {
          var v = c.v * (0.78 + 0.22 * cyc);
          c.el.setAttribute('fill', ramp(TURBO, v));
        } else c.el.setAttribute('fill', C.paper);
      });
      body.setAttribute('transform', 'translate(230,210) scale(' + (1 + 0.012 * cyc) + ',1) translate(-230,-210)');
      needle.setAttribute('transform', 'rotate(' + (-130 + (tt > 2.6 ? 60 + cyc * 150 : solve * 60)) + ')');
      var cp = Math.min(1, Math.max(0, (tt - 0.4) / 2.2));
      curve.style.strokeDashoffset = cl * (1 - cp);
      var show = tt > 2.8 ? 1 : 0;
      [dLine, aLine, mD, mA, lbl, arrow, margin].forEach(function (n) { n.style.opacity = show; n.style.transition = 'opacity .5s'; });
    }
    render(paused ? 9 : 0);
    return {
      svg: s,
      reset: function () { T = 0; },
      tick: function (t, dt) { T += dt; render(T); },
      still: function () { render(9); }
    };
  }

  // ------------------------------------------------------------ ENERGY & EMISSION
  function emission(host, opt) {
    opt = opt || {};
    var s = svgRoot(host, '0 0 820 440', 'Gas turbine exhaust stack with a stack-test port and emission plume, a flare, a grid connection, and an energy performance indicator tracked against its energy baseline');
    var defs = el('defs', null, s);
    var hId = id('em-hatch'); hatch(defs, hId);
    // ground
    el('line', { x1: 20, y1: 370, x2: 460, y2: 370, stroke: C.ink2, 'stroke-width': 1 }, s);
    for (var gx = 22; gx < 460; gx += 10) el('line', { x1: gx, y1: 370, x2: gx - 7, y2: 378, stroke: C.ink2, 'stroke-width': 1 }, s);
    // gas turbine generator package
    el('rect', { x: 40, y: 286, width: 150, height: 84, fill: '#E5EEE8', stroke: C.ink, 'stroke-width': 2.5, rx: 3 }, s);
    el('path', { d: 'M60,300 L110,312 L110,344 L60,356 Z', fill: C.steel, stroke: C.ink, 'stroke-width': 1.5 }, s);
    el('rect', { x: 120, y: 306, width: 52, height: 44, fill: 'url(#' + hId + ')', stroke: C.ink, 'stroke-width': 1.5 }, s);
    text(s, 115, 386 + 8, opt.l_gtg || 'GTG package · SEU', { anchor: 'middle', size: 10.5, fill: C.ink, weight: 500 });
    // exhaust duct to stack
    el('path', { d: 'M190,300 L236,300 L236,370', fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, s);
    el('rect', { x: 230, y: 96, width: 34, height: 274, fill: '#ECE8DE', stroke: C.ink, 'stroke-width': 2.5 }, s);
    el('rect', { x: 226, y: 90, width: 42, height: 8, fill: C.ink }, s);
    // sampling platform + port + probe
    el('rect', { x: 212, y: 204, width: 70, height: 5, fill: C.ink }, s);
    el('path', { d: 'M212,204 L212,190 M282,204 L282,190 M212,190 L282,190', stroke: C.ink2, 'stroke-width': 1.5, fill: 'none' }, s);
    var probe = el('rect', { x: 264, y: 178, width: 34, height: 5, fill: C.energy }, s);
    el('circle', { cx: 264, cy: 180, r: 5, fill: C.paper, stroke: C.ink, 'stroke-width': 1.5 }, s);
    leader(s, 298, 180, 330, 156, opt.l_port || 'Stack test port (PPPU)');
    // flare
    el('rect', { x: 386, y: 150, width: 8, height: 220, fill: C.steel, stroke: C.ink, 'stroke-width': 1.5 }, s);
    el('path', { d: 'M372,370 L390,250 L408,370', fill: 'none', stroke: C.ink2, 'stroke-width': 1.2 }, s);
    var flame = el('g', { transform: 'translate(390,150)' }, s);
    var f1 = el('path', { d: 'M0,0 C-14,-12 -10,-34 0,-52 C10,-34 14,-12 0,0 Z', fill: C.hot }, flame);
    var f2 = el('path', { d: 'M0,0 C-8,-8 -6,-22 0,-34 C6,-22 8,-8 0,0 Z', fill: C.hot2 }, flame);
    var f3 = el('path', { d: 'M0,0 C-4,-5 -3,-12 0,-18 C3,-12 4,-5 0,0 Z', fill: '#FBE27A' }, flame);
    text(s, 410, 136, opt.l_flare || 'Flare', { size: 10.5, fill: C.ink, weight: 500 });
    // grid pylon (Scope 2)
    var py = el('g', { transform: 'translate(430,250)', stroke: C.ink2, 'stroke-width': 1.3, fill: 'none' }, s);
    el('path', { d: 'M-10,120 L0,0 L10,120 M-6,70 L6,70 M-8,96 L8,96 M-18,18 L18,18 M-14,34 L14,34 M-6,70 L8,96 M6,70 L-8,96' }, py);
    el('path', { d: 'M18,18 C30,26 40,24 50,14', stroke: C.violet }, py);
    text(s, 430, 238, 'PLN', { anchor: 'middle', size: 10, fill: C.violet, weight: 500 });

    // plume particles
    var plume = el('g', null, s);
    var puffs = [];
    for (var i = 0; i < 26; i++) {
      var c = el('circle', { r: 6, fill: '#8C96A3' }, plume);
      puffs.push({ el: c, u: i / 26 });
    }
    var chips = ['CO2', 'NOx', 'CH4'].map(function (n, k) {
      var gch = el('g', null, plume);
      el('rect', { x: -17, y: -10, width: 34, height: 18, rx: 4, fill: C.paper, stroke: C.ink2, 'stroke-width': 1 }, gch);
      text(gch, 0, 3, n, { anchor: 'middle', size: 10, fill: C.ink, weight: 500 });
      return { el: gch, u: k / 3 };
    });

    // EnPI chart
    var ch = el('g', { transform: 'translate(510,92)' }, s);
    var W = 280, H = 210;
    el('line', { x1: 0, y1: H, x2: W, y2: H, stroke: C.ink, 'stroke-width': 1.5 }, ch);
    el('line', { x1: 0, y1: 0, x2: 0, y2: H, stroke: C.ink, 'stroke-width': 1.5 }, ch);
    text(ch, 0, -14, opt.l_chart || 'EnPI against Energy Baseline (EnB)', { size: 10.5, fill: C.ink });
    text(ch, W, H + 18, opt.l_time || 'time', { anchor: 'end', size: 10 });
    var base = el('path', { d: 'M0,' + (H * 0.42) + ' L' + W + ',' + (H * 0.46), stroke: C.ink2, 'stroke-width': 1.6, 'stroke-dasharray': '6 4', fill: 'none' }, ch);
    text(ch, W - 4, H * 0.46 - 8, 'EnB', { anchor: 'end', size: 10, fill: C.ink2, weight: 500 });
    var vals = [0.44, 0.46, 0.41, 0.47, 0.43, 0.2, 0.45, 0.5, 0.55, 0.58, 0.62, 0.64];
    var pts = vals.map(function (v, k) { return [+(k / (vals.length - 1) * W).toFixed(1), +(H - v * H * 1.0 - 30).toFixed(1)]; });
    pts = pts.map(function (p, k) { return [p[0], k === 5 ? H * 0.18 : H * (0.5 + (vals[k] - 0.44) * 0.9)]; });
    var line = el('path', { d: smooth(pts), stroke: C.energy, 'stroke-width': 2.6, fill: 'none' }, ch);
    var dots = pts.map(function (p, k) { return el('circle', { cx: p[0], cy: p[1], r: k === 5 ? 6 : 3.6, fill: k === 5 ? C.hot : C.energy }, ch); });
    var flag = el('g', null, ch);
    el('path', { d: 'M' + (pts[5][0] + 7) + ',' + pts[5][1] + ' L' + (pts[5][0] + 22) + ',' + pts[5][1], stroke: C.hot, 'stroke-width': 1.5 }, flag);
    el('rect', { x: pts[5][0] + 22, y: pts[5][1] - 10, width: 104, height: 20, rx: 4, fill: C.hot }, flag);
    text(flag, pts[5][0] + 30, pts[5][1] + 4, opt.l_warn || 'Early warning', { size: 10, fill: '#fff', weight: 500 });
    var better = text(ch, W - 4, H - 10, opt.l_better || 'below EnB = saving', { anchor: 'end', size: 10, fill: C.energy, weight: 500 });
    text(ch, 4, H + 18, opt.l_illus || 'illustration, not plant data', { size: 9.5, fill: C.ink2 });
    var ll = line.getTotalLength();
    line.style.strokeDasharray = ll;

    var T = 0;
    function render(tt, dt) {
      // flame flicker
      var fl = 1 + Math.sin(tt * 13) * 0.06 + Math.sin(tt * 7.3) * 0.05;
      f1.setAttribute('transform', 'scale(' + (1 + Math.sin(tt * 9) * 0.05) + ',' + fl + ')');
      f2.setAttribute('transform', 'scale(1,' + (2 - fl) + ')');
      f3.setAttribute('transform', 'scale(1,' + fl + ')');
      // plume
      puffs.forEach(function (p, k) {
        p.u = (p.u + dt * 0.12) % 1;
        var u = p.u, wob = Math.sin(u * 9 + k) * 6 * u;
        p.el.setAttribute('cx', (247 + u * 150 + wob).toFixed(1));
        p.el.setAttribute('cy', (88 - u * 70 - Math.sin(u * 3) * 8).toFixed(1));
        p.el.setAttribute('r', (5 + u * 16).toFixed(1));
        p.el.setAttribute('opacity', (0.55 * (1 - u)).toFixed(2));
      });
      chips.forEach(function (c, k) {
        c.u = (c.u + dt * 0.07) % 1;
        var u = c.u;
        c.el.setAttribute('transform', 'translate(' + (262 + u * 140).toFixed(1) + ',' + (80 - u * 56 + Math.sin(u * 6 + k) * 6).toFixed(1) + ')');
        c.el.setAttribute('opacity', (u < 0.1 ? u * 10 : u > 0.85 ? (1 - u) / 0.15 : 1).toFixed(2));
      });
      probe.setAttribute('width', (30 + Math.sin(tt * 2) * 4).toFixed(1));
      // chart draws over 4s, holds, then redraws
      var cyc = tt % 9, p = Math.min(1, cyc / 4);
      line.style.strokeDashoffset = ll * (1 - p);
      dots.forEach(function (d, k) { d.style.opacity = k / (dots.length - 1) <= p ? 1 : 0; });
      flag.style.opacity = p > 0.47 ? 1 : 0;
      better.style.opacity = p >= 1 ? 1 : 0;
    }
    render(paused ? 5 : 0, 0);
    return {
      svg: s,
      tick: function (t, dt) { T += dt; render(T, dt); },
      still: function () { render(5, 0); }
    };
  }

  // ------------------------------------------------------------ PIPING ISOMETRIC + S-CURVE
  // Red-oxide primed spools on a steel pipe rack, drawn isometrically with cylinder shading,
  // flanged spool breaks, a gate valve on the branch and weld bands that go
  // pending -> welded -> NDE accepted, while RFID tags on each spool ping.
  function piping(host, opt) {
    opt = opt || {};
    var s = svgRoot(host, '0 0 820 440', 'Isometric piping spools on a pipe rack whose weld joints progress from pending to welded to NDE accepted, tracked with RFID tags and an S-curve of plan against actual progress');
    var defs = el('defs', null, s);
    var PR = { base: '#B5563A', dark: '#6E2E1C', light: '#E7A184' };   // red-oxide primer
    var ST = { base: '#9AA5B1', dark: '#55606C', light: '#DCE2E8' };   // galvanised steel

    var main = [[0, 0, 3], [10, 0, 3], [10, 6, 3], [10, 6, 0.7], [16, 6, 0.7]];
    var branch = [[5, 0, 3], [5, 0, 5.6]];
    function P(p) { return [(p[0] - p[1]) * 0.866, (p[0] + p[1]) * 0.5 - p[2]]; }
    var box = [[-0.6, -1.8, 0], [16.6, -1.8, 0], [16.6, 7.4, 0], [-0.6, 7.4, 0], [0, 0, 6]].map(P);
    var minX = Math.min.apply(null, box.map(function (p) { return p[0]; })), maxX = Math.max.apply(null, box.map(function (p) { return p[0]; }));
    var minY = Math.min.apply(null, box.map(function (p) { return p[1]; })), maxY = Math.max.apply(null, box.map(function (p) { return p[1]; }));
    var sc = Math.min(420 / (maxX - minX), 320 / (maxY - minY));
    var ox = 30 + (420 - (maxX - minX) * sc) / 2, oy = 50 + (320 - (maxY - minY) * sc) / 2;
    function F(p) { var q = P(p); return [ox + (q[0] - minX) * sc, oy + (q[1] - minY) * sc]; }
    function lerp3(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
    function pts(r) { return r.map(function (p, i) { var q = F(p); return (i ? 'L' : 'M') + q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
    function ang(a, b) { var A = F(a), B = F(b); return Math.atan2(B[1] - A[1], B[0] - A[0]) * 180 / Math.PI; }

    // deck plate
    var deck = [[-0.6, -1.8, 0], [16.6, -1.8, 0], [16.6, 7.4, 0], [-0.6, 7.4, 0]].map(F);
    el('path', { d: 'M' + deck.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' L') + ' Z', fill: '#EEE9DD', stroke: C.line, 'stroke-width': 1.5 }, s);

    // soft shadows of the spools on the deck
    [main, branch].forEach(function (r) {
      el('path', { d: pts(r.map(function (p) { return [p[0] + 0.35, p[1] + 0.35, 0]; })), stroke: 'rgba(21,24,29,.10)', 'stroke-width': 16, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, s);
    });
    // steel members (rack + sleeper) drawn as shaded bars
    function bar(a, b, w, col) {
      var d = pts([a, b]);
      el('path', { d: d, stroke: C.ink, 'stroke-width': w + 3, 'stroke-linecap': 'square' }, s);
      el('path', { d: d, stroke: col.base, 'stroke-width': w, 'stroke-linecap': 'square' }, s);
      el('path', { d: d, stroke: col.light, 'stroke-width': Math.max(1.5, w * 0.25), transform: 'translate(-1.2,-1.2)' }, s);
    }
    [[2.5, -1.4], [2.5, 1.4], [8, -1.4], [8, 1.4]].forEach(function (c) {
      var b = F([c[0], c[1], 0]);
      el('ellipse', { cx: b[0], cy: b[1] + 1, rx: 9, ry: 4.5, fill: ST.dark, stroke: C.ink, 'stroke-width': 1.2 }, s); // base plate
      bar([c[0], c[1], 0], [c[0], c[1], 2.55], 7, ST);
    });
    bar([2.5, -1.4, 2.55], [2.5, 1.4, 2.55], 8, ST); bar([8, -1.4, 2.55], [8, 1.4, 2.55], 8, ST);
    bar([2.5, -1.4, 2.55], [8, -1.4, 2.55], 5, ST); bar([2.5, 1.4, 2.55], [8, 1.4, 2.55], 5, ST);
    bar([13, 4.8, 0], [13, 7.2, 0], 7, ST);                                     // sleeper under the low run
    [[2.5, 0], [8, 0]].forEach(function (c) { bar([c[0], c[1], 2.6], [c[0], c[1], 2.85], 6, ST); }); // pipe shoes
    bar([13, 6, 0.05], [13, 6, 0.4], 6, ST);

    // a pipe: dark outline, primer body (round elbows), then per-segment cylinder shading
    function pipe(r) {
      var d = pts(r);
      el('path', { d: d, stroke: C.ink, 'stroke-width': 19, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'butt' }, s);
      el('path', { d: d, stroke: PR.base, 'stroke-width': 15, fill: 'none', 'stroke-linejoin': 'round', 'stroke-linecap': 'butt' }, s);
      for (var i = 0; i < r.length - 1; i++) {
        var A = F(r[i]), B = F(r[i + 1]), dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy) || 1;
        var nx = -dy / L, ny = dx / L, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, gid = id('pg');
        var g = el('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse', x1: mx - nx * 7.5, y1: my - ny * 7.5, x2: mx + nx * 7.5, y2: my + ny * 7.5 }, defs);
        [[0, PR.dark], [0.28, PR.base], [0.55, PR.light], [0.75, PR.base], [1, PR.dark]].forEach(function (st) { el('stop', { offset: st[0], 'stop-color': st[1] }, g); });
        el('path', { d: 'M' + A[0].toFixed(1) + ',' + A[1].toFixed(1) + ' L' + B[0].toFixed(1) + ',' + B[1].toFixed(1), stroke: 'url(#' + gid + ')', 'stroke-width': 15, fill: 'none' }, s);
      }
    }
    pipe(main); pipe(branch);

    // flanges (ellipses perpendicular to the pipe) at spool breaks and open ends
    function flange(a, b, t) {
      var c = F(lerp3(a, b, t)), r = ang(a, b);
      [-3, 3].forEach(function (o) {
        var g = el('g', { transform: 'translate(' + c[0].toFixed(1) + ',' + c[1].toFixed(1) + ') rotate(' + r.toFixed(1) + ') translate(' + o + ',0)' }, s);
        el('ellipse', { rx: 4, ry: 15, fill: ST.light, stroke: C.ink, 'stroke-width': 1.6 }, g);
        el('ellipse', { rx: 1.4, ry: 11, fill: 'none', stroke: ST.dark, 'stroke-width': 1, 'stroke-dasharray': '2 3' }, g);
      });
    }
    flange(main[0], main[1], 0.02); flange(main[0], main[1], 0.7); flange(main[1], main[2], 0.66);
    flange(main[3], main[4], 0.5); flange(main[3], main[4], 0.98); flange(branch[0], branch[1], 0.97);

    // gate valve with a red handwheel on the branch
    var vc = F([5, 0, 4.4]);
    var vg = el('g', { transform: 'translate(' + vc[0].toFixed(1) + ',' + vc[1].toFixed(1) + ')' }, s);
    el('path', { d: 'M-12,-14 L12,-14 L0,0 Z M-12,14 L12,14 L0,0 Z', fill: '#5F6B78', stroke: C.ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, vg);
    el('line', { x1: 0, y1: 0, x2: 26, y2: 15, stroke: C.ink, 'stroke-width': 3 }, vg);
    el('ellipse', { cx: 30, cy: 17, rx: 5, ry: 12, transform: 'rotate(-30 30 17)', fill: 'none', stroke: '#C0392B', 'stroke-width': 3.5 }, vg);

    // weld bands: thin rings around the pipe, coloured by state
    var weldAt = [[main[0], main[1], 0.06], [main[0], main[1], 0.5], [main[0], main[1], 0.66], [main[0], main[1], 0.93],
      [main[1], main[2], 0.12], [main[1], main[2], 0.62], [main[1], main[2], 0.9], [main[2], main[3], 0.12], [main[2], main[3], 0.88],
      [main[3], main[4], 0.12], [main[3], main[4], 0.46], [main[3], main[4], 0.94], [branch[0], branch[1], 0.12], [branch[0], branch[1], 0.93]];
    var joints = weldAt.map(function (w, i) {
      var c = F(lerp3(w[0], w[1], w[2])), r = ang(w[0], w[1]);
      var g = el('g', { transform: 'translate(' + c[0].toFixed(1) + ',' + c[1].toFixed(1) + ') rotate(' + r.toFixed(1) + ')' }, s);
      var halo = el('ellipse', { rx: 6, ry: 13.5, fill: 'none', stroke: C.energy, 'stroke-width': 2.2, opacity: 0 }, g);
      var band = el('ellipse', { rx: 2.6, ry: 9, fill: '#C3CAD2', stroke: C.ink, 'stroke-width': 1.3 }, g);
      return { band: band, halo: halo, k: i / weldAt.length };
    });

    // RFID spool tags
    var tags = [[[2, 0, 3], 'SP-01', -46, -40], [[10, 2.6, 3], 'SP-02', 18, -40], [[10, 6, 1.8], 'SP-03', 24, -6], [[14.6, 6, 0.7], 'SP-04', 6, 26]].map(function (tg, i) {
      var q = F(tg[0]);
      var g = el('g', { transform: 'translate(' + (q[0] + tg[2]).toFixed(1) + ',' + (q[1] + tg[3]).toFixed(1) + ')' }, s);
      el('path', { d: 'M' + (-tg[2]) + ',' + (-tg[3]) + ' L' + (tg[2] < 0 ? 50 : 0) + ',1', stroke: C.ink2, 'stroke-width': 1 }, g); // leader to the pipe
      el('rect', { x: 0, y: -8, width: 50, height: 18, rx: 3, fill: C.paper, stroke: C.ink, 'stroke-width': 1.2 }, g);
      text(g, 25, 5, tg[1], { anchor: 'middle', size: 10, fill: C.ink, weight: 500 });
      var ping = el('circle', { cx: 25, cy: 1, r: 10, fill: 'none', stroke: C.amber, 'stroke-width': 2 }, g);
      return { ping: ping, ph: i * 0.6 };
    });

    // legend
    var lg = el('g', { transform: 'translate(46,412)' }, s);
    [['#C3CAD2', opt.l_pending || 'Pending'], [C.amber, opt.l_welded || 'Welded'], [C.energy, opt.l_nde || 'NDE accepted']].forEach(function (it, i) {
      el('ellipse', { cx: i * 118, cy: 0, rx: 3, ry: 8, fill: it[0], stroke: C.ink, 'stroke-width': 1.2 }, lg);
      text(lg, i * 118 + 10, 4, it[1], { size: 10.5, fill: C.ink });
    });

    // S-curve chart
    var ch = el('g', { transform: 'translate(510,92)' }, s);
    var W = 280, H = 220;
    el('line', { x1: 0, y1: H, x2: W, y2: H, stroke: C.ink, 'stroke-width': 1.5 }, ch);
    el('line', { x1: 0, y1: 0, x2: 0, y2: H, stroke: C.ink, 'stroke-width': 1.5 }, ch);
    text(ch, 0, -14, opt.l_scurve || 'S-curve: weld progress, plan against actual', { size: 10.5, fill: C.ink });
    function sc1(x, k) { return 1 / (1 + Math.exp(-k * (x - 0.5))); }
    var plan = [], act = [];
    for (var i = 0; i <= 24; i++) {
      var x = i / 24;
      plan.push([+(x * W).toFixed(1), +(H - sc1(x, 9) * H * 0.95).toFixed(1)]);
      act.push([+(x * W).toFixed(1), +(H - sc1(x - 0.04, 8.4) * H * 0.92).toFixed(1)]);
    }
    el('path', { d: smooth(plan), stroke: C.ink2, 'stroke-width': 1.8, 'stroke-dasharray': '6 4', fill: 'none' }, ch);
    var aPath = el('path', { d: smooth(act), stroke: C.amber, 'stroke-width': 3, fill: 'none' }, ch);
    text(ch, W - 4, 22, opt.l_plan || 'plan', { anchor: 'end', size: 10, fill: C.ink2, weight: 500 });
    var aLbl = text(ch, W - 4, 48, opt.l_actual || 'actual', { anchor: 'end', size: 10, fill: '#9A6A00', weight: 500 });
    text(ch, 4, H + 18, opt.l_illus || 'illustration, not project data', { size: 9.5, fill: C.ink2 });
    var al = aPath.getTotalLength();
    aPath.style.strokeDasharray = al;
    var head = el('circle', { r: 5, fill: C.amber, stroke: C.ink, 'stroke-width': 1.2 }, ch);
    var lut = sample(aPath, 200);

    var T = 0;
    function render(tt) {
      var p = Math.min(1, (tt % 10) / 8);
      joints.forEach(function (j) {
        var a = p - j.k * 0.8;
        if (a > 0.18) { j.band.setAttribute('fill', C.energy); j.halo.setAttribute('opacity', 0.9); }
        else if (a > 0) { j.band.setAttribute('fill', C.amber); j.halo.setAttribute('opacity', 0); }
        else { j.band.setAttribute('fill', '#C3CAD2'); j.halo.setAttribute('opacity', 0); }
      });
      tags.forEach(function (tg) {
        var u = ((tt + tg.ph) % 2) / 2;
        tg.ping.setAttribute('r', (10 + u * 26).toFixed(1));
        tg.ping.setAttribute('opacity', (1 - u).toFixed(2));
      });
      aPath.style.strokeDashoffset = al * (1 - p);
      var hp = at(lut, p);
      head.setAttribute('cx', hp[0]); head.setAttribute('cy', hp[1]);
      aLbl.style.opacity = p > 0.9 ? 1 : 0;
    }
    render(paused ? 8 : 0);
    return {
      svg: s,
      tick: function (t, dt) { T += dt; render(T); },
      still: function () { render(8); }
    };
  }

  // ------------------------------------------------------------ small discipline vignettes
  function mini(host, kind, opt) {
    opt = opt || {};
    var s = svgRoot(host, '0 0 360 240', opt.label || kind);
    var T = 0, upd;
    if (kind === 'cfd') {
      // potential flow past a cylinder (speed-coloured), with a shedding wake behind it
      var R = 28, CX = 120, CY = 120;
      function yAt(x, y0) { // solve psi = y(1 - R^2/r^2) = y0 for y
        var dx = x - CX, y = y0 || 0.001;
        for (var it = 0; it < 12; it++) { var r2 = dx * dx + y * y; y = y0 / Math.max(0.2, 1 - R * R / r2); if (Math.abs(y) > 140) break; }
        return y;
      }
      for (var sl = -5; sl <= 5; sl++) {
        if (!sl) continue;
        var d0 = '';
        for (var xx = 0; xx <= 360; xx += 8) d0 += (xx ? 'L' : 'M') + xx + ',' + (CY + yAt(xx, sl * 19)).toFixed(1);
        el('path', { d: d0, fill: 'none', stroke: 'rgba(21,24,29,.12)', 'stroke-width': 1 }, s);
      }
      el('circle', { cx: CX, cy: CY, r: R, fill: '#DCE3EA', stroke: C.ink, 'stroke-width': 2.5 }, s);
      var parts = [];
      for (var i = 0; i < 80; i++) {
        var lane = (i % 10) - 4.5;
        parts.push({ el: el('circle', { r: 3 }, s), x: Math.random() * 360, y0: lane * 21 });
      }
      upd = function (tt, dt) {
        parts.forEach(function (p) {
          var dx = p.x - CX, y = yAt(p.x, p.y0), r2 = dx * dx + y * y;
          var cos2 = (dx * dx - y * y) / r2, spd = Math.max(0.15, 1 - R * R / r2 * cos2);
          if (p.x > CX + R && Math.abs(p.y0) < 50) { // wake: slower, oscillating
            var k = Math.min(1, (p.x - CX - R) / 60);
            y += Math.sin(p.x * 0.06 - tt * 5 + (p.y0 > 0 ? 0 : Math.PI)) * 12 * k;
            spd *= 1 - 0.55 * k * Math.exp(-Math.pow(p.y0 / 40, 2));
          }
          p.x += dt * 80 * spd; if (p.x > 368) p.x = -8;
          p.el.setAttribute('cx', p.x.toFixed(1)); p.el.setAttribute('cy', (CY + y).toFixed(1));
          p.el.setAttribute('fill', ramp(TURBO, Math.min(1, spd / 2)));
        });
      };
    } else if (kind === 'fem') {
      var cells = [];
      for (var y = 30; y + 15 <= 210; y += 15) for (var x = 40; x + 14 <= 320; x += 14) {
        var v = Math.exp(-(Math.pow(x - 180, 2) + Math.pow(y - 120, 2)) / 5000) * 0.9 + (y > 180 ? 0.15 : 0);
        cells.push({ el: el('path', { d: 'M' + x + ',' + y + 'l14,0l-14,15Z M' + (x + 14) + ',' + y + 'l0,15l-14,0Z', fill: C.paper, stroke: 'rgba(21,24,29,.2)', 'stroke-width': 0.6 }, s), v: v });
      }
      el('rect', { x: 40, y: 30, width: 280, height: 180, fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, s);
      el('circle', { cx: 180, cy: 120, r: 22, fill: C.paper, stroke: C.ink, 'stroke-width': 2.5 }, s);
      upd = function (tt) { var c = Math.sin(tt * 2) * 0.5 + 0.5; cells.forEach(function (k) { k.el.setAttribute('fill', ramp(TURBO, k.v * (0.6 + 0.4 * c))); }); };
    } else if (kind === 'mech') {
      // vessel drawing with dimension lines drawing themselves
      var vd = el('path', { d: 'M110,70 Q110,40 180,40 Q250,40 250,70 L250,170 Q250,200 180,200 Q110,200 110,170 Z', fill: '#EEF1F4', stroke: C.ink, 'stroke-width': 2.5 }, s);
      var dims = [el('path', { d: 'M110,220 L250,220 M110,214 L110,226 M250,214 L250,226', stroke: C.cold, 'stroke-width': 1.5, fill: 'none' }, s),
        el('path', { d: 'M280,40 L280,200 M274,40 L286,40 M274,200 L286,200', stroke: C.cold, 'stroke-width': 1.5, fill: 'none' }, s)];
      var tA = text(s, 180, 236, 'ID', { anchor: 'middle', size: 11, fill: C.cold, weight: 500 });
      var tB = text(s, 292, 124, 'T/T', { size: 11, fill: C.cold, weight: 500 });
      var thk = el('path', { d: 'M110,120 L60,120', stroke: C.hot, 'stroke-width': 1.5 }, s);
      text(s, 56, 116, 't req', { anchor: 'end', size: 11, fill: C.hot, weight: 500 });
      dims.forEach(function (d) { var L = d.getTotalLength(); d.style.strokeDasharray = L; d._L = L; });
      upd = function (tt) { var p = Math.min(1, (tt % 6) / 2.5); dims.forEach(function (d) { d.style.strokeDashoffset = d._L * (1 - p); }); tA.style.opacity = tB.style.opacity = p >= 1 ? 1 : 0; thk.style.opacity = 0.4 + 0.6 * Math.abs(Math.sin(tt * 2)); };
    } else if (kind === 'hx') {
      el('rect', { x: 40, y: 70, width: 280, height: 100, rx: 10, fill: '#FBE7DC', stroke: C.ink, 'stroke-width': 2.5 }, s);
      [95, 120, 145].forEach(function (yy) { el('line', { x1: 40, y1: yy, x2: 320, y2: yy, stroke: '#8E99A6', 'stroke-width': 7 }, s); });
      [110, 180, 250].forEach(function (xx, i) { el('rect', { x: xx - 2, y: i % 2 ? 100 : 70, width: 4, height: 70, fill: C.steelD }, s); });
      var hp = el('path', { d: smooth([[60, 40], [70, 80], [110, 160], [180, 80], [250, 160], [300, 170], [300, 210]]), fill: 'none' }, s);
      var hl = sample(hp, 200), hd = [], cd = [];
      for (var a = 0; a < 18; a++) hd.push({ el: el('circle', { r: 4 }, s), u: a / 18 });
      for (var b = 0; b < 18; b++) cd.push({ el: el('circle', { r: 3 }, s), u: b / 18, y: [95, 120, 145][b % 3] });
      upd = function (tt, dt) {
        hd.forEach(function (d) { d.u = (d.u + dt * 0.12) % 1; var p = at(hl, d.u); d.el.setAttribute('cx', p[0]); d.el.setAttribute('cy', p[1]); d.el.setAttribute('fill', mix(C.hot, C.hot2, d.u)); });
        cd.forEach(function (d) { d.u = (d.u + dt * 0.18) % 1; d.el.setAttribute('cx', 40 + d.u * 280); d.el.setAttribute('cy', d.y); d.el.setAttribute('fill', mix(C.cold, C.cold2, d.u)); });
      };
    } else if (kind === 'slosh') {
      // Horizontal three-phase separator (KO drum) on an FPSO deck. Well fluid enters the left head and
      // hits the inlet diverter; water settles to the bottom and leaves to the OWTU, oil spills over the
      // weir into the oil bucket, gas leaves the top through the mist pad to the flare. The hull's motion
      // makes the liquid slosh along the drum, and the level transmitter (a radar probe from the top)
      // sees the level swing past its LAH setting.
      var dfs = el('defs', null, s), cid = id('sep');
      var VD = 'M88,70 L282,70 A18,50 0 0 1 282,170 L88,170 A18,50 0 0 1 88,70 Z';
      el('path', { d: VD }, el('clipPath', { id: cid }, dfs));
      function pipe(d, color) {
        el('path', { d: d, stroke: C.ink, 'stroke-width': 8, fill: 'none', 'stroke-linejoin': 'round' }, s);
        el('path', { d: d, stroke: color, 'stroke-width': 4.5, fill: 'none', 'stroke-linejoin': 'round' }, s);
        return sample(el('path', { d: d, fill: 'none' }, dfs), 160);
      }
      // legs and deck
      [[118, 132], [236, 250]].forEach(function (l) {
        el('rect', { x: l[0], y: 150, width: l[1] - l[0], height: 54, fill: '#C3CAD2', stroke: C.ink, 'stroke-width': 1.8 }, s);
        el('rect', { x: l[0] - 7, y: 202, width: l[1] - l[0] + 14, height: 5, fill: C.ink }, s);
      });
      el('line', { x1: 50, y1: 207, x2: 320, y2: 207, stroke: C.ink2, 'stroke-width': 1.2 }, s);
      var lIn = pipe('M24,135 L72,135', '#D8C9A6');
      var lGas = pipe('M275,72 L275,40 L354,40', '#CBD2DA');
      var lOil = pipe('M276,168 L276,190 L354,190', '#F6D58A');
      var lWat = pipe('M190,168 L190,218 L354,218', '#A9CBF3');
      [130, 200].forEach(function (x) { el('rect', { x: x - 4, y: 60, width: 8, height: 11, fill: C.paper, stroke: C.ink, 'stroke-width': 1.5 }, s); });
      el('rect', { x: 116, y: 56, width: 10, height: 15, fill: C.paper, stroke: C.ink, 'stroke-width': 1.5 }, s);  // LT nozzle
      el('path', { d: VD, fill: '#F3F5F8' }, s);
      var gL = el('g', { 'clip-path': 'url(#' + cid + ')' }, s);
      var oil = el('path', { fill: '#F3C664' }, gL), wat = el('path', { fill: '#86B7EF' }, gL), buck = el('path', { fill: '#F3C664' }, gL);
      var bub = [];
      for (var bb = 0; bb < 10; bb++) bub.push({ el: el('circle', { r: 2, fill: '#fff', stroke: C.steelD, 'stroke-width': .8 }, gL), u: Math.random(), x: 110 + Math.random() * 110 });
      el('path', { d: 'M100,96 L100,150', stroke: C.steelD, 'stroke-width': 3.5 }, s);                     // inlet diverter
      el('rect', { x: 238, y: 128, width: 5, height: 44, fill: C.steelD }, s);                                 // weir
      el('rect', { x: 250, y: 77, width: 34, height: 10, fill: 'none', stroke: C.ink2, 'stroke-width': 1, 'stroke-dasharray': '2 2' }, s); // mist pad
      el('line', { x1: 121, y1: 71, x2: 121, y2: 166, stroke: C.ink, 'stroke-width': 1.6 }, s);              // radar probe
      el('circle', { cx: 205, cy: 104, r: 11, fill: 'none', stroke: C.steelD, 'stroke-width': 1.5 }, s);      // manway
      el('path', { d: VD, fill: 'none', stroke: C.ink, 'stroke-width': 2.5 }, s);
      // LT bubble, instrument signal (dashed) to the level bar
      el('circle', { cx: 121, cy: 40, r: 11, fill: C.paper, stroke: C.ink, 'stroke-width': 1.5 }, s);
      text(s, 121, 44, 'LT', { anchor: 'middle', size: 9.5, fill: C.ink, weight: 500 });
      el('line', { x1: 121, y1: 51, x2: 121, y2: 56, stroke: C.ink, 'stroke-width': 1.5 }, s);
      el('path', { d: 'M110,40 L12,40 L12,70', stroke: C.ink2, 'stroke-width': 1, 'stroke-dasharray': '4 3', fill: 'none' }, s);
      var LAH = 109;
      el('rect', { x: 8, y: 70, width: 9, height: 100, rx: 2, fill: '#E6E0D3' }, s);
      var bar = el('rect', { x: 8, y: 118, width: 9, height: 52, rx: 2, fill: C.energy }, s);
      el('line', { x1: 4, y1: LAH, x2: 22, y2: LAH, stroke: C.hot, 'stroke-width': 1.5, 'stroke-dasharray': '3 2' }, s);
      var lah = text(s, 24, LAH + 3, 'LAH', { size: 9.5, fill: C.hot, weight: 500 });
      text(s, 24, 127, opt.l_in || 'Well fluid', { size: 10, fill: C.ink, weight: 500 });
      text(s, 354, 32, opt.l_gas || 'Gas to flare', { anchor: 'end', size: 10, fill: C.ink2, weight: 500 });
      text(s, 354, 183, opt.l_oil || 'Oil', { anchor: 'end', size: 10, fill: '#8A5A00', weight: 500 });
      text(s, 354, 211, opt.l_wat || 'Water to OWTU', { anchor: 'end', size: 10, fill: C.cold, weight: 500 });
      var sea = el('path', { fill: 'none', stroke: C.cold, 'stroke-width': 1.6, opacity: .45 }, s);
      function flow(lut, n, colors) { var a = []; for (var q = 0; q < n; q++) a.push({ el: el('circle', { r: 2.6, fill: colors[q % colors.length] }, s), u: q / n, lut: lut }); return a; }
      var dots = flow(lIn, 5, ['#E3A008', C.cold, '#8C96A3']).concat(flow(lGas, 7, ['#8C96A3']), flow(lOil, 6, ['#C98A00']), flow(lWat, 7, [C.cold]));
      var X0 = 70, X1 = 240, XM = (X0 + X1) / 2;
      function surf(x, t) { return 118 + (x - XM) * 0.16 * Math.sin(t * 1.1) + 3 * Math.sin(x * 0.09 - t * 2.6); }
      function intf(x, t) { return 148 + (x - XM) * 0.08 * Math.sin(t * 1.1 - 0.6) + 1.6 * Math.sin(x * 0.07 - t * 2 + 1); }
      function bucket(x, t) { return 150 + (x - 270) * 0.12 * Math.sin(t * 1.1) + 1.4 * Math.sin(x * 0.2 - t * 3); }
      function layer(f, t, a, b) { var d = ''; for (var x = a; x <= b; x += 4) d += (x === a ? 'M' : 'L') + x + ',' + f(x, t).toFixed(1); return d + ' L' + b + ',176 L' + a + ',176 Z'; }
      upd = function (tt, dt) {
        oil.setAttribute('d', layer(surf, tt, X0, X1)); wat.setAttribute('d', layer(intf, tt, X0, X1)); buck.setAttribute('d', layer(bucket, tt, 240, 304));
        var lvl = surf(121, tt);
        bar.setAttribute('y', lvl.toFixed(1)); bar.setAttribute('height', (170 - lvl).toFixed(1));
        var hi = lvl < LAH;
        bar.setAttribute('fill', hi ? C.hot : C.energy);
        lah.style.opacity = hi ? 1 : 0.45;
        var sd = ''; for (var x = 0; x <= 360; x += 8) sd += (x ? 'L' : 'M') + x + ',' + (234 + 2.5 * Math.sin(x * 0.05 - tt * 1.1)).toFixed(1);
        sea.setAttribute('d', sd);
        dots.forEach(function (d) { d.u = (d.u + dt * 0.35) % 1; var p = at(d.lut, d.u); d.el.setAttribute('cx', p[0]); d.el.setAttribute('cy', p[1]); });
        bub.forEach(function (b) {
          b.u = (b.u + dt * 0.4) % 1;
          var top = surf(b.x, tt), bot = intf(b.x, tt), y = bot - b.u * (bot - top);
          b.el.setAttribute('cx', (b.x + Math.sin(b.u * 9) * 2).toFixed(1)); b.el.setAttribute('cy', y.toFixed(1));
          b.el.setAttribute('opacity', (1 - b.u).toFixed(2));
        });
      };
    } else { // plan: gantt bars growing + critical path
      var rows = [[20, 120], [70, 110], [150, 90], [120, 120], [210, 100]];
      var bars = rows.map(function (r, i) {
        el('line', { x1: 30, y1: 46 + i * 34, x2: 330, y2: 46 + i * 34, stroke: C.line, 'stroke-width': 1 }, s);
        return { el: el('rect', { x: 30 + r[0], y: 36 + i * 34, height: 20, width: 0, rx: 4, fill: i === 2 || i === 4 ? C.hot : C.amber }, s), w: r[1], i: i };
      });
      var today = el('line', { x1: 30, y1: 24, x2: 30, y2: 210, stroke: C.cold, 'stroke-width': 2, 'stroke-dasharray': '4 3' }, s);
      upd = function (tt) { var p = (tt % 7) / 5; bars.forEach(function (b) { b.el.setAttribute('width', Math.max(0, Math.min(1, p * 1.6 - b.i * 0.15)) * b.w); }); today.setAttribute('x1', 30 + Math.min(1, p) * 300); today.setAttribute('x2', 30 + Math.min(1, p) * 300); };
    }
    if (paused) upd(3, 0);
    return { svg: s, tick: function (t, dt) { T += dt; upd(T, dt); }, still: function () { upd(3, 0); } };
  }

  // ------------------------------------------------------------ runtime
  var KINDS = { hx: heatExchanger, pv: pressureVessel, emis: emission, pipe: piping };
  function mount(host, kind, opt) {
    host.innerHTML = '';
    var inst = KINDS[kind] ? KINDS[kind](host, opt) : mini(host, kind, opt);
    inst.host = host;
    inst.visible = false;
    instances.push(inst);
    if (io) io.observe(host);
    if (paused && inst.still) inst.still();
    return inst;
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      instances.forEach(function (i) {
        if (i.host === e.target) {
          if (e.isIntersecting && !i.visible && i.reset) i.reset();
          i.visible = e.isIntersecting;
        }
      });
    });
  }, { rootMargin: '80px' }) : null;

  var last = performance.now();
  (function loop() {
    var t = performance.now(), dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    instances = instances.filter(function (i) { return i.host.isConnected; });
    if (!paused) instances.forEach(function (i) { if ((i.visible || !io) && !i.host.closest('[hidden]')) i.tick(t / 1000, dt); });
    requestAnimationFrame(loop);
  })();

  window.Illustrations = {
    mount: mount,
    setPaused: function (v) { paused = v; if (v) instances.forEach(function (i) { if (i.still) i.still(); }); },
    isPaused: function () { return paused; },
    colors: C
  };
})();
