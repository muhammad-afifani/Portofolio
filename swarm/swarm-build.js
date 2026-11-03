/*
 * Swarm Build — a swarm of multiplayer-style cursors that builds the portfolio
 * as you scroll: drawing selection boxes, typing text, dropping in images and
 * option-dragging duplicate cards into place. Idle cursors flock around your
 * own pointer.
 *
 * Original implementation for this portfolio, inspired by the "swarm of
 * cursors building a site" idea (Swarm by Joel Califa, Swarm Rebuild by
 * Dhvanil Patel). No code from either project is used.
 *
 * Visitors with "reduce motion" switched on get the finished page plus a
 * "Play swarm build" button instead of the automatic build.
 * URL switches: ?swarm=off (never run), ?swarm=on (always auto-play).
 */
(function () {
  'use strict';

  var docEl = document.documentElement;
  function unboot() { docEl.classList.remove('swarm-boot'); }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]swarm=off\b/.test(location.search) || !Element.prototype.animate) {
    unboot();
    return;
  }
  var autoPlay = /[?&]swarm=on\b/.test(location.search) || !reduced;
  if (!autoPlay) unboot();

  // ---------------------------------------------------------------- config
  var NAMES = ['NEXUS-01', 'ATLS-07', 'RION-09', 'NOVA-11', 'CRTX-13', 'ASTR-21', 'HELX-24', 'VECTR-27',
    'VNT-31', 'QUANTM-42', 'ECHO-47', 'ZENTH-51', 'LYRA-64', 'AETHR-77', 'OMEGA-99',
    'KRON-03', 'SOLR-15', 'TITN-18', 'PULS-33', 'FLUX-36', 'IONX-55', 'ORBT-58', 'AXIS-62', 'STRM-70', 'VOLT-81', 'PRSM-88'];
  // process-stream palette, darkened where needed so white name tags stay readable
  var COLORS = ['#BF3A22', '#1B5FD1', '#0F7D50', '#8F6100', '#0A7378', '#6D4BC4', '#C2367A', '#2F6FA8',
    '#B3321D', '#0C7248', '#5B3FA8', '#8A5A00', '#15181D', '#0A6E73'];
  var BLOCK_SELECTOR = 'nav, [data-screen-label]';

  var mobile = window.innerWidth < 760;
  var BASE_AGENTS = mobile ? 7 : 14;
  var MAX_AGENTS = mobile ? 12 : 26;
  var PATIENCE = 4500; // ms a visible layer may wait for a cursor

  // ---------------------------------------------------------------- utils
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(p) { return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function now() { return performance.now(); }
  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function alphaOf(color) {
    if (!color || color === 'transparent') return 0;
    var m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return 1;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean);
    return p.length > 3 ? parseFloat(p[3]) : 1;
  }
  function mk(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function px(v) { return Math.round(v * 10) / 10 + 'px'; }

  // ------------------------------------------------------------- state
  var tasks = [];
  var blocks = [];
  var agents = [];
  var active = [];
  var layer, hud, hudEls = {}, orb;
  var vw = window.innerWidth, vh = window.innerHeight;
  var mouse = { x: -1, y: -1, t: -1e9 };
  var userSpeed = 1;
  var building = false;
  var hidden = false;
  var doneCount = 0;
  var lastScan = 0;
  var visible = [];
  var lastSpawn = 0, surplusSince = 0;
  var nameIdx = 0;
  var completeAt = 0;
  var startTime = now();

  // ------------------------------------------------------------- boot
  function waitForContent(cb) {
    var t0 = now();
    (function poll() {
      var blocksNow = document.querySelectorAll(BLOCK_SELECTOR);
      var h1 = document.querySelector('[data-screen-label] h1');
      var rendered = blocksNow.length >= 4 && h1 && h1.textContent.indexOf('{{') < 0;
      if (rendered || now() - t0 > 9000) return cb(!!rendered);
      setTimeout(poll, 80);
    })();
  }

  function settle(cb) {
    var imgs = Array.prototype.slice.call(document.images, 0, 80);
    var pending = imgs.filter(function (i) { return !i.complete; }).map(function (i) {
      return new Promise(function (r) { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
    });
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var timeout = new Promise(function (r) { setTimeout(r, 1500); });
    Promise.race([Promise.all(pending.concat([fonts])), timeout]).then(function () {
      requestAnimationFrame(function () { requestAnimationFrame(cb); });
    });
  }

  waitForContent(function (ok) {
    if (!ok) { unboot(); return; }
    settle(function () { init(autoPlay); });
  });

  // ------------------------------------------------------------- scan
  function isBoxy(cs) {
    if (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text') return false;
    if (alphaOf(cs.backgroundColor) > 0.015) return true;
    if (cs.backgroundImage && cs.backgroundImage !== 'none') return true;
    var sides = ['Top', 'Right', 'Bottom', 'Left'];
    for (var i = 0; i < 4; i++) {
      if (parseFloat(cs['border' + sides[i] + 'Width']) > 0.4 && cs['border' + sides[i] + 'Style'] !== 'none' &&
        alphaOf(cs['border' + sides[i] + 'Color']) > 0.04) return true;
    }
    return false;
  }

  function hasDirectText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    }
    return false;
  }

  var MEDIA = { IMG: 1, svg: 1, SVG: 1, VIDEO: 1, CANVAS: 1, IFRAME: 1, PICTURE: 1 };
  var SKIP = { SCRIPT: 1, STYLE: 1, BR: 1, TEMPLATE: 1, NOSCRIPT: 1, LINK: 1, META: 1 };
  var FIELD = { INPUT: 1, BUTTON: 1, TEXTAREA: 1, SELECT: 1 };

  function classify(el, cs) {
    if (MEDIA[el.tagName]) return 'media';
    if (FIELD[el.tagName]) return 'box';
    if (isBoxy(cs)) return 'box';
    if (hasDirectText(el)) return 'text';
    return null;
  }

  function scan() {
    var roots = document.querySelectorAll(BLOCK_SELECTOR);
    for (var b = 0; b < roots.length; b++) {
      var rootEl = roots[b];
      if (rootEl.parentElement && rootEl.parentElement.closest(BLOCK_SELECTOR)) continue;
      var fixed = getComputedStyle(rootEl).position === 'fixed';
      var block = { el: rootEl, fixed: fixed, tasks: [], index: blocks.length };
      blocks.push(block);
      var rootCs = getComputedStyle(rootEl);
      var rootKind = isBoxy(rootCs) ? 'box' : null;
      var parent = null;
      if (rootKind) parent = addTask(rootEl, rootKind, null, block, rootEl.getBoundingClientRect());
      walk(rootEl, parent, block);
    }
  }

  function walk(el, parentTask, block) {
    var kids = el.children;
    for (var i = 0; i < kids.length; i++) {
      var c = kids[i];
      if (SKIP[c.tagName]) continue;
      if (c instanceof SVGElement && c.tagName.toLowerCase() !== 'svg') continue;
      var cs = getComputedStyle(c);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (parseFloat(cs.opacity) < 0.02) continue;
      if (cs.position === 'fixed' && !block.fixed) continue;
      var r = c.getBoundingClientRect();
      var kind = classify(c, cs);
      var t = parentTask;
      var onScreenX = r.right > 0 && r.left < vw;
      if (kind && r.width >= 6 && r.height >= 6 && onScreenX) {
        t = addTask(c, kind, parentTask, block, r);
      }
      if (kind !== 'media' && c.children.length) walk(c, t, block);
    }
  }

  function addTask(el, kind, parent, block, r) {
    var t = {
      el: el, kind: kind, parent: parent, block: block, state: 0, anim: null,
      order: tasks.length, w: r.width, h: r.height, dupOf: null, waitingSince: 0
    };
    // repeated siblings of the same size get "option-dragged" from the previous one
    if (kind === 'box' && el.previousElementSibling) {
      var prev = el.previousElementSibling.__swTask;
      if (prev && prev.kind === 'box' && prev.el.tagName === el.tagName &&
        Math.abs(prev.w - r.width) < 2 && Math.abs(prev.h - r.height) < 2) t.dupOf = prev;
    }
    el.__swTask = t;
    tasks.push(t);
    block.tasks.push(t);
    return t;
  }

  // ------------------------------------------------------------- element fx
  function hideEl(t) {
    try {
      t.anim = t.el.animate([{ opacity: 0 }, { opacity: 0 }], { duration: 1e9, fill: 'forwards' });
    } catch (e) { t.anim = null; }
  }
  function setFx(t, opacity, clip) {
    if (!t.anim) return;
    var k = { opacity: opacity, clipPath: clip || 'none' };
    try { t.anim.effect.setKeyframes([k, k]); } catch (e) { }
  }
  function finishEl(t, fade) {
    if (t.state === 2) return;
    t.state = 2;
    doneCount++;
    if (t.anim) { try { t.anim.cancel(); } catch (e) { } t.anim = null; }
    if (fade && t.el.isConnected) {
      try { t.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fade, easing: 'ease-out' }); } catch (e) { }
    }
  }

  function lineBoxes(el, r) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var rects = range.getClientRects();
    var lines = [];
    for (var i = 0; i < rects.length; i++) {
      var q = rects[i];
      if (q.width < 0.5 || q.height < 0.5) continue;
      var hit = null;
      for (var j = 0; j < lines.length; j++) {
        var l = lines[j];
        var mid = q.top + q.height / 2;
        if (mid > l.top && mid < l.bottom) { hit = l; break; }
      }
      if (hit) {
        hit.left = Math.min(hit.left, q.left); hit.right = Math.max(hit.right, q.right);
        hit.top = Math.min(hit.top, q.top); hit.bottom = Math.max(hit.bottom, q.bottom);
      } else lines.push({ left: q.left, right: q.right, top: q.top, bottom: q.bottom });
    }
    lines.sort(function (a, b) { return a.top - b.top; });
    var total = 0;
    lines.forEach(function (l) {
      l.left -= r.left; l.right -= r.left; l.top -= r.top; l.bottom -= r.top;
      l.w = Math.max(1, l.right - l.left);
      total += l.w;
    });
    return { lines: lines, total: total };
  }

  // ------------------------------------------------------------- agents
  var ARROW = '<svg width="22" height="24" viewBox="0 0 22 24"><path d="M2 1.5 L2 19 L6.7 14.8 L9.8 21.6 L13 20.2 L9.9 13.5 L16.4 13.2 Z" ' +
    'fill="var(--c)" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  function spawnAgent(x, y) {
    var i = nameIdx++;
    var color = COLORS[i % COLORS.length];
    var name = NAMES[i % NAMES.length];
    var el = mk('div', 'sw-agent', layer);
    el.style.setProperty('--c', color);
    el.innerHTML = ARROW + '<span class="sw-tag"></span>';
    el.lastChild.textContent = name;
    var a = {
      el: el, svg: el.firstChild, color: color, name: name,
      x: x, y: y, vx: rand(-200, 200), vy: rand(-200, 200), rot: 0,
      mode: 'idle', task: null, t0: 0, phase: rand(0, Math.PI * 2),
      radius: rand(55, 170), spin: rand(0.35, 0.8) * (Math.random() < 0.5 ? -1 : 1),
      cooldown: 0, fx: null, lx: x, ly: y, exit: null
    };
    agents.push(a);
    updateHudAvatars();
    return a;
  }

  function edgePoint() {
    var sx = window.scrollX, sy = window.scrollY;
    var side = Math.floor(Math.random() * 4);
    if (side === 0) return { x: sx + rand(0, vw), y: sy - 30 };
    if (side === 1) return { x: sx + vw + 30, y: sy + rand(0, vh) };
    if (side === 2) return { x: sx + rand(0, vw), y: sy + vh + 30 };
    return { x: sx - 30, y: sy + rand(0, vh) };
  }

  // ------------------------------------------------------------- init
  function init(play) {
    vw = window.innerWidth; vh = window.innerHeight;

    layer = mk('div', '', document.body);
    layer.id = 'sw-layer';
    layer.setAttribute('aria-hidden', 'true');
    buildHud();

    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; mouse.t = now(); }, { passive: true });
    document.addEventListener('mouseleave', function () { mouse.t = -1e9; });
    window.addEventListener('resize', function () { vw = window.innerWidth; vh = window.innerHeight; }, { passive: true });

    var last = now();
    (function frame() {
      var t = now();
      var dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      try { tick(t, dt); } catch (e) { console.warn('[swarm]', e); }
      requestAnimationFrame(frame);
    })();

    if (play) startBuild(true);
    else hud.classList.add('sw-offer');
  }

  // (Re)start a build of the whole page. Everything above the viewport is
  // shown at once; the rest is wiped and rebuilt by the swarm.
  function startBuild(intro) {
    vw = window.innerWidth; vh = window.innerHeight;
    agents.forEach(function (a) { if (a.task) release(a, now()); });
    tasks.forEach(function (t) { if (t.anim) { try { t.anim.cancel(); } catch (e) { } } t.el.__swTask = null; });
    tasks = []; blocks = []; visible = [];
    doneCount = 0; completeAt = 0;
    building = false;
    if (hidden) setHidden(false);

    // Neutralise the page's own fade/blur scroll reveal — the swarm reveals now.
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.transition = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
    void document.body.offsetHeight;

    scan();
    tasks.forEach(hideEl);
    unboot();
    hud.classList.remove('sw-offer', 'sw-done');
    hudEls.layers.innerHTML = '<b class="sw-d">0</b> / <span class="sw-t">0</span> layers';
    hudEls.d = hud.querySelector('.sw-d');
    hudEls.t = hud.querySelector('.sw-t');

    var cx = window.scrollX + vw / 2, cy = window.scrollY + vh / 2;
    var need = BASE_AGENTS - agents.filter(function (a) { return a.mode !== 'leave'; }).length;
    for (var i = 0; i < need; i++) {
      if (intro) {
        var ang = (i / need) * Math.PI * 2;
        spawnAgent(cx + Math.cos(ang) * 420, cy + Math.sin(ang) * 300);
      } else {
        var p = edgePoint();
        spawnAgent(p.x, p.y);
      }
    }
    if (intro) {
      // cursors orbit a glowing orb in the middle of the screen, then fan out
      orb = mk('div', 'sw-orb', layer);
      setTimeout(function () {
        building = true;
        if (orb) { orb.classList.add('out'); setTimeout(function () { orb && orb.remove(); orb = null; }, 600); }
      }, 1300);
    } else building = true;
  }

  // ------------------------------------------------------------- scheduling
  function available(t) {
    if (t.state !== 0) return false;
    for (var p = t.parent; p; p = p.parent) if (p.state !== 2) return false;
    return true;
  }

  function refreshVisible(t) {
    visible = [];
    for (var b = 0; b < blocks.length; b++) {
      var block = blocks[b];
      var br = block.el.getBoundingClientRect();
      var pending = false;
      for (var i = 0; i < block.tasks.length; i++) if (block.tasks[i].state !== 2) { pending = true; break; }
      if (!pending) continue;
      if (!block.el.isConnected) { block.tasks.forEach(function (x) { if (x.state === 0) finishEl(x, 0); }); continue; }
      if (br.bottom < -40 || br.top > vh + 80) {
        // scrolled past (e.g. via a nav jump): don't leave holes behind the visitor
        if (br.bottom < -40 && !block.fixed) block.tasks.forEach(function (x) { if (x.state === 0) finishEl(x, 0); });
        continue;
      }
      for (var k = 0; k < block.tasks.length; k++) {
        var task = block.tasks[k];
        if (task.state !== 0) continue;
        if (!task.el.isConnected) { finishEl(task, 0); continue; }
        var r = task.el.getBoundingClientRect();
        if (r.bottom < -20) { finishEl(task, 0); continue; }
        if (r.top > vh + 40 || r.right < 0 || r.left > vw) continue;
        if (r.width < 1 || r.height < 1) { finishEl(task, 0); continue; }
        if (!available(task)) continue;
        if (!task.waitingSince) task.waitingSince = t;
        // nobody got to it in time: build it "remotely" so the visitor never stares at a hole
        if (t - task.waitingSince > PATIENCE / userSpeed) { finishEl(task, 450); continue; }
        visible.push({ t: task, r: r });
      }
    }
  }

  function pickTask(a) {
    var best = null, bestScore = 1e18;
    var ax = a.x - window.scrollX, ay = a.y - window.scrollY;
    for (var i = 0; i < visible.length; i++) {
      var v = visible[i];
      if (v.t.state !== 0) continue;
      var dx = v.r.left - ax, dy = v.r.top - ay;
      var score = Math.max(0, v.r.top) * 0.9 + Math.sqrt(dx * dx + dy * dy) * 0.35 + v.t.order * 0.002;
      if (score < bestScore) { bestScore = score; best = v; }
    }
    return best;
  }

  function speedFactor() {
    var backlog = visible.length;
    return clamp(1 + backlog / (agents.length * 2.5), 1, 5) * userSpeed;
  }

  // ------------------------------------------------------------- tick
  function tick(t, dt) {
    var sx = window.scrollX, sy = window.scrollY;

    if (!layer) return;
    if (building && !hidden && t - lastScan > 140) {
      lastScan = t;
      refreshVisible(t);
      manageCrowd(t);
    }

    var speed = speedFactor();

    var mouseActive = t - mouse.t < 4000 && mouse.x >= 0;
    var ax, ay;
    if (mouseActive) { ax = sx + mouse.x; ay = sy + mouse.y; }
    else { ax = sx + vw * 0.5; ay = sy + vh * 0.52; }
    if (orb) { ax = sx + vw * 0.5; ay = sy + vh * 0.5; }

    for (var i = agents.length - 1; i >= 0; i--) {
      var a = agents[i];
      var px0 = a.x, py0 = a.y;

      if (a.mode === 'idle') {
        if (building && !hidden && a.cooldown <= t && visible.length) {
          var pick = pickTask(a);
          if (pick) { claim(a, pick.t, t); }
        }
      }

      if (a.mode === 'idle') {
        var ang = a.phase + (t / 1000) * a.spin;
        var rad = orb ? 110 + Math.sin(a.phase * 3) * 25 : (mouseActive ? a.radius * 0.55 : a.radius);
        var tx = ax + Math.cos(ang) * rad, ty = ay + Math.sin(ang) * rad * (orb ? 0.9 : 0.7);
        var k = orb ? 18 : 9, c = orb ? 6 : 4.2;
        a.vx += ((tx - a.x) * k - a.vx * c) * dt;
        a.vy += ((ty - a.y) * k - a.vy * c) * dt;
        // separation
        for (var j = 0; j < agents.length; j++) {
          if (j === i) continue;
          var o = agents[j];
          var dx = a.x - o.x, dy = a.y - o.y, d2 = dx * dx + dy * dy;
          if (d2 < 900 && d2 > 0.01) {
            var f = (900 - d2) / 900 * 900 * dt;
            var d = Math.sqrt(d2);
            a.vx += dx / d * f; a.vy += dy / d * f;
          }
        }
        limit(a, 1700);
        a.x += a.vx * dt; a.y += a.vy * dt;
      } else if (a.mode === 'travel') {
        var sp = startPoint(a.task);
        if (!sp) { release(a, t); continue; }
        var k2 = 90 * Math.min(2.2, speed), c2 = 2 * Math.sqrt(k2) * 0.95;
        a.vx += ((sp.x - a.x) * k2 - a.vx * c2) * dt;
        a.vy += ((sp.y - a.y) * k2 - a.vy * c2) * dt;
        limit(a, 2600 * Math.min(2, speed));
        a.x += a.vx * dt; a.y += a.vy * dt;
        var ddx = sp.x - a.x, ddy = sp.y - a.y;
        if (ddx * ddx + ddy * ddy < 36 || t - a.t0 > 1100 / Math.min(2, speed)) {
          a.x = sp.x; a.y = sp.y;
          beginWork(a, t, speed);
        }
      } else if (a.mode === 'work') {
        work(a, t, speed);
        a.vx = (a.x - px0) / Math.max(dt, 0.001);
        a.vy = (a.y - py0) / Math.max(dt, 0.001);
      } else if (a.mode === 'leave') {
        a.vx += ((a.exit.x - a.x) * 6 - a.vx * 2) * dt;
        a.vy += ((a.exit.y - a.y) * 6 - a.vy * 2) * dt;
        limit(a, 1800);
        a.x += a.vx * dt; a.y += a.vy * dt;
        var ex = a.exit.x - a.x, ey = a.exit.y - a.y;
        if (ex * ex + ey * ey < 900 || t - a.t0 > 2500) {
          a.el.remove();
          agents.splice(i, 1);
          updateHudAvatars();
          continue;
        }
      }

      // rotation: idle cursors point where they fly, workers stand upright
      var spd = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
      var targetRot = 0;
      if ((a.mode === 'idle' || a.mode === 'leave') && spd > 90) targetRot = Math.atan2(a.vy, a.vx) * 180 / Math.PI + 118;
      var diff = ((targetRot - a.rot + 540) % 360) - 180;
      a.rot += diff * Math.min(1, dt * (a.mode === 'work' ? 14 : 7));

      a.el.style.transform = 'translate3d(' + px(a.x - sx) + ',' + px(a.y - sy) + ',0)';
      a.svg.style.transform = 'rotate(' + a.rot.toFixed(1) + 'deg)';
    }

    updateHud(t);
  }

  function limit(a, max) {
    var s = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
    if (s > max) { a.vx *= max / s; a.vy *= max / s; }
  }

  function manageCrowd(t) {
    var backlog = visible.length;
    var desired = clamp(BASE_AGENTS + Math.floor(backlog / 5), BASE_AGENTS, MAX_AGENTS);
    var living = agents.filter(function (a) { return a.mode !== 'leave'; });
    if (living.length < desired && t - lastSpawn > 110) {
      lastSpawn = t;
      var p = edgePoint();
      spawnAgent(p.x, p.y);
      surplusSince = 0;
    } else if (living.length > desired) {
      if (!surplusSince) surplusSince = t;
      if (t - surplusSince > 2500) {
        for (var i = living.length - 1; i >= 0; i--) {
          if (living[i].mode === 'idle') {
            living[i].mode = 'leave'; living[i].t0 = t; living[i].exit = edgePoint();
            break;
          }
        }
        surplusSince = t;
      }
    } else surplusSince = 0;
  }

  // ------------------------------------------------------------- work
  function viewRect(task) {
    if (!task.el.isConnected) return null;
    var r = task.el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    return r;
  }

  function startPoint(task) {
    var r = viewRect(task);
    if (!r) return null;
    var sx = window.scrollX, sy = window.scrollY;
    if (task.dupOf && task.dupOf.state === 2) {
      var s = task.dupOf.el.getBoundingClientRect();
      return { x: s.left + s.width * 0.5 + sx, y: s.top + s.height * 0.5 + sy };
    }
    if (task.kind === 'text') {
      var lb = task.lb || (task.lb = lineBoxes(task.el, r));
      if (lb.lines.length) return { x: r.left + lb.lines[0].left + sx, y: r.top + lb.lines[0].bottom - 2 + sy };
    }
    return { x: r.left + sx, y: r.top + sy };
  }

  function claim(a, task, t) {
    task.state = 1;
    a.task = task;
    a.mode = 'travel';
    a.t0 = t;
    a.el.classList.add('on');
  }

  function release(a, t) {
    var task = a.task;
    if (task && task.state === 1) finishEl(task, 200);
    cleanupFx(a.fx, 0);
    a.fx = null;
    a.task = null;
    a.mode = 'idle';
    a.cooldown = t + 60;
    a.el.classList.remove('on');
  }

  function beginWork(a, t, speed) {
    var task = a.task;
    var r = viewRect(task);
    if (!r) { release(a, t); return; }
    a.mode = 'work';
    a.t0 = t;
    var fx = a.fx = { nodes: [] };
    var c = a.color;
    var area = Math.sqrt(r.width * r.height);

    if (task.dupOf && task.dupOf.state === 2) {
      fx.type = 'dup';
      fx.dur = clamp(420 + area * 0.25, 450, 900) / speed;
      fx.ghost = mk('div', 'sw-sel sw-ghost', layer);
      fx.ghost.style.setProperty('--c', c);
      fx.ghost.style.background = hexA(c, 0.10);
      fx.label = mk('div', 'sw-size', fx.ghost);
      fx.label.style.setProperty('--c', c);
      fx.label.textContent = '⌥ duplicate';
      fx.nodes.push(fx.ghost);
      fx.from = task.dupOf.el.getBoundingClientRect();
      fx.from = { x: fx.from.left - r.left, y: fx.from.top - r.top };
    } else if (task.kind === 'text') {
      fx.type = 'text';
      task.lb = lineBoxes(task.el, r);
      if (!task.lb.lines.length) { fx.type = 'box'; }
      else {
        var chars = (task.el.textContent || '').trim().length;
        fx.dur = clamp(chars * 24, 320, 1700) / speed;
        fx.caret = mk('div', 'sw-caret', layer);
        fx.caret.style.setProperty('--c', c);
        fx.nodes.push(fx.caret);
      }
    }
    if (!fx.type || fx.type === 'box') {
      fx.type = task.kind === 'media' ? 'media' : 'box';
      fx.dur = clamp(330 + area * 0.75, 420, 1500) / speed;
      fx.sel = mk('div', 'sw-sel', layer);
      fx.sel.style.setProperty('--c', c);
      if (fx.type === 'media') {
        fx.sel.style.background = 'repeating-linear-gradient(135deg,' + hexA(c, 0.16) + ' 0 6px,' + hexA(c, 0.05) + ' 6px 12px)';
        fx.sel.classList.add('sw-media');
      } else fx.sel.style.background = hexA(c, 0.06);
      fx.handles = [];
      for (var i = 0; i < 4; i++) {
        var h = mk('div', 'sw-h', fx.sel);
        h.style.setProperty('--c', c);
        fx.handles.push(h);
      }
      fx.label = mk('div', 'sw-size', fx.sel);
      fx.label.style.setProperty('--c', c);
      fx.nodes.push(fx.sel);
      if (r.width > 140 && Math.random() < 0.55 && !task.block.fixed) {
        fx.gh = mk('div', 'sw-guide-h', layer); fx.gh.style.setProperty('--c', c);
        fx.gv = mk('div', 'sw-guide-v', layer); fx.gv.style.setProperty('--c', c);
        fx.nodes.push(fx.gh, fx.gv);
      }
    }
  }

  function work(a, t, speed) {
    var task = a.task, fx = a.fx;
    var r = viewRect(task);
    if (!r) { release(a, t); return; }
    var sx = window.scrollX, sy = window.scrollY;
    var p = clamp((t - a.t0) / fx.dur, 0, 1);
    var W = r.width, H = r.height;

    if (fx.type === 'box' || fx.type === 'media') {
      var e = ease(p);
      var w = W * e, h = H * e;
      fx.sel.style.transform = 'translate3d(' + px(r.left) + ',' + px(r.top) + ',0)';
      fx.sel.style.width = px(Math.max(1, w));
      fx.sel.style.height = px(Math.max(1, h));
      fx.label.textContent = Math.round(w) + ' × ' + Math.round(h);
      fx.label.style.opacity = w > 28 && h > 10 ? '1' : '0';
      fx.label.style.left = px(w / 2);
      fx.label.style.top = px(h);
      var hp = [[0, 0], [w, 0], [0, h], [w, h]];
      for (var i = 0; i < 4; i++) { fx.handles[i].style.left = px(hp[i][0]); fx.handles[i].style.top = px(hp[i][1]); }
      if (fx.gh) {
        fx.gh.style.transform = 'translate3d(0,' + px(r.top + h) + ',0)';
        fx.gv.style.transform = 'translate3d(' + px(r.left + w) + ',0,0)';
      }
      if (fx.type === 'box') setFx(task, 1, 'inset(0px ' + px(W - w) + ' ' + px(H - h) + ' 0px)');
      a.x = r.left + w + sx; a.y = r.top + h + sy;
      if (p >= 1) {
        if (fx.type === 'media') {
          // image placeholder is drawn — now drop the picture in
          if (!fx.dropT) fx.dropT = t;
          var q = clamp((t - fx.dropT) / (280 / speed), 0, 1);
          setFx(task, easeOut(q), 'none');
          if (q < 1) return;
        }
        complete(a, t);
      }
    } else if (fx.type === 'text') {
      var lb = task.lb;
      var dist = ease(p) * lb.total;
      var k = 0;
      while (k < lb.lines.length - 1 && dist > lb.lines[k].w) { dist -= lb.lines[k].w; k++; }
      var L = lb.lines[k];
      var xk = L.left + Math.min(dist, L.w);
      var pad = 60;
      var poly = 'polygon(' + px(-pad) + ' ' + px(-pad) + ',' + px(W + pad) + ' ' + px(-pad) + ',' +
        px(W + pad) + ' ' + px(L.top) + ',' + px(xk) + ' ' + px(L.top) + ',' + px(xk) + ' ' + px(L.bottom + 3) + ',' +
        px(-pad) + ' ' + px(L.bottom + 3) + ')';
      setFx(task, 1, poly);
      fx.caret.style.height = px(L.bottom - L.top);
      fx.caret.style.transform = 'translate3d(' + px(r.left + xk) + ',' + px(r.top + L.top) + ',0)';
      a.x = r.left + xk + 3 + sx; a.y = r.top + L.bottom - 3 + sy;
      if (p >= 1) complete(a, t);
    } else if (fx.type === 'dup') {
      var e2 = ease(p);
      var gx = r.left + fx.from.x * (1 - e2), gy = r.top + fx.from.y * (1 - e2);
      fx.ghost.style.transform = 'translate3d(' + px(gx) + ',' + px(gy) + ',0)';
      fx.ghost.style.width = px(W); fx.ghost.style.height = px(H);
      fx.label.style.left = px(W / 2); fx.label.style.top = px(H);
      a.x = gx + W * 0.5 + sx; a.y = gy + H * 0.5 + sy;
      if (p >= 1) complete(a, t, 220);
    }
  }

  function complete(a, t, fade) {
    finishEl(a.task, fade || 0);
    cleanupFx(a.fx, a.fx.type === 'text' ? 0 : 160);
    a.fx = null;
    a.task = null;
    a.mode = 'idle';
    a.cooldown = t + 40 + Math.random() * 80;
    a.el.classList.remove('on');
  }

  function cleanupFx(fx, hold) {
    if (!fx) return;
    var nodes = fx.nodes;
    setTimeout(function () {
      nodes.forEach(function (n) { n.classList.add('sw-fade'); });
      setTimeout(function () { nodes.forEach(function (n) { n.remove(); }); }, 380);
    }, hold);
  }

  // ------------------------------------------------------------- controls
  function revealAll() {
    agents.forEach(function (a) { if (a.task) release(a, now()); });
    tasks.forEach(function (t) {
      if (t.state === 2) return;
      var inView = false;
      if (t.el.isConnected) {
        var r = t.el.getBoundingClientRect();
        inView = r.bottom > 0 && r.top < vh;
      }
      finishEl(t, inView ? 450 : 0);
    });
  }

  function setHidden(v) {
    hidden = v;
    if (v) revealAll();
    layer.classList.toggle('sw-off', v);
    hud.classList.toggle('sw-min', v);
    hudEls.hide.textContent = v ? 'Show cursors' : '✕';
    hudEls.hide.setAttribute('aria-label', v ? 'Show cursors' : 'Hide cursors');
  }

  function buildHud() {
    hud = mk('div', 'sw-hud', document.body);
    hud.setAttribute('role', 'region');
    hud.setAttribute('aria-label', 'Swarm build controls');
    hud.innerHTML =
      '<div class="sw-avs"></div>' +
      '<span class="sw-stat"><b class="sw-n">0</b> agents</span>' +
      '<span class="sw-stat sw-layers"><b class="sw-d">0</b> / <span class="sw-t">0</span> layers</span>' +
      '<div class="sw-bar"><i></i></div>' +
      '<button type="button" class="sw-speed" aria-label="Build speed">1×</button>' +
      '<button type="button" class="sw-skip">Skip</button>' +
      '<button type="button" class="sw-replay">↻ Replay</button>' +
      '<button type="button" class="sw-play">▶ Play swarm build</button>' +
      '<button type="button" class="sw-hide" aria-label="Hide cursors">✕</button>';
    hudEls.avs = hud.querySelector('.sw-avs');
    hudEls.n = hud.querySelector('.sw-n');
    hudEls.d = hud.querySelector('.sw-d');
    hudEls.t = hud.querySelector('.sw-t');
    hudEls.bar = hud.querySelector('.sw-bar i');
    hudEls.layers = hud.querySelector('.sw-layers');
    hudEls.speed = hud.querySelector('.sw-speed');
    hudEls.skip = hud.querySelector('.sw-skip');
    hudEls.hide = hud.querySelector('.sw-hide');
    hudEls.speed.addEventListener('click', function () {
      userSpeed = userSpeed >= 3 ? 1 : userSpeed + 1;
      hudEls.speed.textContent = userSpeed + '×';
    });
    hudEls.skip.addEventListener('click', function () { revealAll(); });
    hudEls.hide.addEventListener('click', function () {
      if (hud.classList.contains('sw-offer')) { hud.remove(); return; }
      setHidden(!hidden);
    });
    hudEls.play = hud.querySelector('.sw-play');
    hudEls.play.addEventListener('click', function () { startBuild(true); });
    hud.querySelector('.sw-replay').addEventListener('click', function () { startBuild(false); });
  }

  var lastHud = 0;
  function updateHud(t) {
    if (t - lastHud < 120) return;
    lastHud = t;
    var living = agents.filter(function (a) { return a.mode !== 'leave'; }).length;
    hudEls.n.textContent = living;
    hudEls.d.textContent = doneCount;
    hudEls.t.textContent = tasks.length;
    hudEls.bar.style.width = (tasks.length ? doneCount / tasks.length * 100 : 0).toFixed(1) + '%';
    var complete = tasks.length > 0 && doneCount >= tasks.length;
    if (complete && !completeAt) {
      completeAt = t;
      hud.classList.add('sw-done');
      hudEls.layers.innerHTML = '<b>Built</b> ✓';
    }
  }

  function updateHudAvatars() {
    if (!hudEls.avs) return;
    var html = '';
    var shown = agents.filter(function (a) { return a.mode !== 'leave'; }).slice(-5);
    shown.forEach(function (a) {
      html += '<i style="background:' + a.color + '">' + a.name.replace(/[^A-Z]/g, '').charAt(0) + '</i>';
    });
    hudEls.avs.innerHTML = html;
  }
})();
