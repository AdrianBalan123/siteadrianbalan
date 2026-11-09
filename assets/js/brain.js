// Creier 3D interactiv pe prima pagină: ~900 de puncte pe suprafața unui creier
// (două emisfere, lob temporal, cerebel, trunchi cerebral), legate de vecinii lor.
// Lupă sub mouse, impulsuri care circulă pe legături, click = rafală de impulsuri,
// tragere = rotire. Static dacă vizitatorul a cerut mișcare redusă.
(function () {
  var canvas = document.querySelector('.hero-brain');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SAGE = '123, 158, 137';
  var ROSE = '221, 165, 165';
  var ROSE_DEEP = '196, 120, 120';

  // ---------- shape ----------
  // x: left/right, y: up/down, z: front(+)/back(-)
  var nodes = [];
  var rand = Math.random;
  var push = function (x, y, z, kind) {
    nodes.push({ x: x, y: y, z: z, blush: rand() > 0.78, kind: kind });
  };
  var sphere = function () {
    var t = rand() * 2 * Math.PI, p = Math.acos(2 * rand() - 1);
    return { x: Math.sin(p) * Math.cos(t), y: Math.cos(p), z: Math.sin(p) * Math.sin(t), t: t, p: p };
  };

  // cerebrum: two hemispheres with a flat inner side, flatter underside, temporal lobe, folds
  for (var i = 0; i < 760; i++) {
    var side = i % 2 ? 1 : -1;
    var d = sphere();
    if (d.x * side < -0.15 && rand() < 0.75) { i--; continue; } // few points on the hidden inner face
    var fold = 1 + 0.055 * Math.sin(d.t * 9 + d.p * 5) + 0.035 * Math.sin(d.p * 14 + d.t * 3);
    var x = d.x * 0.6 * fold, y = d.y * 0.68 * fold, z = d.z * 1.08 * fold;
    if (x * side < 0) x *= 0.25; // flat inner side along the midline
    if (y < -0.15) y *= 0.72; // flatter base
    // temporal lobe: low, toward the front-middle, bulging outward
    if (y < -0.05 && z > -0.35 && z < 0.55) {
      x *= 1.12;
      y -= 0.1;
    }
    // frontal lobe slightly taller than the back
    if (z > 0.4) y *= 1.06;
    push(x + side * 0.33, y + 0.12, z, 'cortex');
  }
  // cerebellum: under the back, with fine horizontal ridges
  for (var c = 0; c < 110; c++) {
    var e = sphere();
    var ridge = 1 + 0.06 * Math.sin(e.p * 22);
    push(e.x * 0.5 * ridge, -0.5 + e.y * 0.24 * ridge, -0.72 + e.z * 0.3 * ridge, 'cerebellum');
  }
  // brain stem: short tilted cylinder
  for (var s = 0; s < 40; s++) {
    var a = rand() * 2 * Math.PI, h = rand();
    push(Math.cos(a) * 0.12, -0.42 - h * 0.5, -0.32 - h * 0.12 + Math.sin(a) * 0.12, 'stem');
  }

  // links: each point to its 3 nearest neighbours in 3D (stable while it turns)
  var edges = [];
  var neighbours = nodes.map(function () { return []; });
  var seen = {};
  nodes.forEach(function (n, i) {
    var best = [];
    for (var j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      var dx = n.x - nodes[j].x, dy = n.y - nodes[j].y, dz = n.z - nodes[j].z;
      var d2 = dx * dx + dy * dy + dz * dz;
      if (best.length < 3 || d2 < best[2].d) {
        best.push({ j: j, d: d2 });
        best.sort(function (p, q) { return p.d - q.d; });
        if (best.length > 3) best.pop();
      }
    }
    best.forEach(function (b) {
      var key = i < b.j ? i + '-' + b.j : b.j + '-' + i;
      if (seen[key] || b.d > 0.06) return;
      seen[key] = 1;
      edges.push([i, b.j]);
      neighbours[i].push(b.j);
      neighbours[b.j].push(i);
    });
  });

  // ---------- view ----------
  var W = 0, H = 0, scale = 1, cx = 0, cy = 0;
  var size = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scale = Math.min(W / 2.8, H / 2.45); // whole brain fits from every angle, perspective included
    cx = W / 2;
    cy = H * 0.52;
  };

  // gentle sway around a three-quarter side view, where the shape reads best
  var BASE_Y = 1.15, BASE_X = 0.18;
  var rotX = BASE_X, rotY = BASE_Y, offX = 0, offY = 0, dragX = 0, dragY = 0, sway = 0;
  var followX = 0, followY = 0; // turn toward the mouse
  var t = 0, dragging = false, lastX = 0, lastY = 0, raf = 0, visible = true;
  var mouse = { x: -9999, y: -9999, on: false };
  var LENS = 70; // reach of the pointer effect, px
  var HOLE = 22; // clear circle around the pointer, px

  // impulses travelling along links
  var pulses = [];
  var fire = function (from, hops) {
    var nb = neighbours[from];
    if (!nb.length) return;
    pulses.push({ a: from, b: nb[Math.floor(rand() * nb.length)], k: 0, hops: hops, speed: 0.035 + rand() * 0.03 });
  };

  var proj = new Array(nodes.length);
  var draw = function () {
    ctx.clearRect(0, 0, W, H);
    t += 0.016;
    if (!dragging && !still) sway = Math.sin(t * 0.25) * 0.55;
    offX += (dragX + followX - offX) * 0.06;
    offY += (dragY + sway + followY - offY) * 0.06;
    rotX = BASE_X + offX;
    rotY = BASE_Y + offY;
    var breathe = still ? 1 : 1 + Math.sin(t * 1.4) * 0.018;
    var cY = Math.cos(rotY), sY = Math.sin(rotY), cX = Math.cos(rotX), sX = Math.sin(rotX);
    var k = scale * breathe;

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var x1 = n.x * cY - n.z * sY;
      var z1 = n.x * sY + n.z * cY;
      var y2 = n.y * cX - z1 * sX;
      var z2 = n.y * sX + z1 * cX;
      var persp = 3 / (3 + z2);
      var px = cx + x1 * k * persp, py = cy - y2 * k * persp;
      // magnifier: points near the mouse grow and lean outward
      var lens = 0;
      if (mouse.on) {
        var mdx = px - mouse.x, mdy = py - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < LENS) {
          lens = 1 - md / LENS;
          lens *= lens;
          // push points out of a small clear circle, squeezing them softly toward its rim
          var nd = HOLE + md * (LENS - HOLE) / LENS;
          var f = md > 0.01 ? nd / md : 0;
          px = mouse.x + mdx * f;
          py = mouse.y + mdy * f;
        }
      }
      var p = proj[i] || (proj[i] = {});
      p.x = px; p.y = py; p.z = z2; p.lens = lens; p.i = i;
    }

    // links, batched by strength (front links stronger), lens links in rose
    var near = new Path2D(), mid = new Path2D(), far = new Path2D(), hot = new Path2D();
    for (var e = 0; e < edges.length; e++) {
      var A = proj[edges[e][0]], B = proj[edges[e][1]];
      // keep the clear circle clear: skip links that would cross it
      if (mouse.on && (A.lens > 0 || B.lens > 0)) {
        var sx = B.x - A.x, sy = B.y - A.y, sl = sx * sx + sy * sy || 1;
        var u = Math.max(0, Math.min(1, ((mouse.x - A.x) * sx + (mouse.y - A.y) * sy) / sl));
        var qx = A.x + sx * u - mouse.x, qy = A.y + sy * u - mouse.y;
        if (qx * qx + qy * qy < (HOLE - 3) * (HOLE - 3)) continue;
      }
      var path = A.lens > 0.3 && B.lens > 0.3 ? hot : (A.z + B.z) / 2 < -0.3 ? near : (A.z + B.z) / 2 < 0.3 ? mid : far;
      path.moveTo(A.x, A.y);
      path.lineTo(B.x, B.y);
    }
    ctx.lineCap = 'round';
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = 'rgba(' + SAGE + ', 0.14)'; ctx.stroke(far);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = 'rgba(' + SAGE + ', 0.26)'; ctx.stroke(mid);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(' + SAGE + ', 0.40)'; ctx.stroke(near);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = 'rgba(' + ROSE_DEEP + ', 0.45)'; ctx.stroke(hot);

    // points, batched by colour and depth (4 levels, far first); lens points drawn on top
    var buckets = [[], [], [], [], [], [], [], []]; // [sage x4 depths, rose x4 depths]
    var lensPts = [];
    for (var o = 0; o < proj.length; o++) {
      var P = proj[o];
      if (P.lens > 0.05) { lensPts.push(P); continue; }
      var lv = Math.max(0, Math.min(3, Math.floor((1.2 - P.z) / 0.6)));
      buckets[(nodes[P.i].blush ? 4 : 0) + lv].push(P);
    }
    for (var bk = 0; bk < 8; bk++) {
      var level = bk % 4, rose = bk >= 4;
      var rad = (rose ? 1.9 : 1.5) * (0.65 + level * 0.25);
      var dots = new Path2D();
      buckets[bk].forEach(function (P) {
        dots.moveTo(P.x + rad, P.y);
        dots.arc(P.x, P.y, rad, 0, Math.PI * 2);
      });
      ctx.fillStyle = 'rgba(' + (rose ? ROSE : SAGE) + ',' + (0.3 + level * 0.18).toFixed(2) + ')';
      ctx.fill(dots);
    }
    // faint ring marking the clear circle
    if (mouse.on) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(' + SAGE + ', 0.28)';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, HOLE - 4, 0, Math.PI * 2);
      ctx.stroke();
    }
    lensPts.forEach(function (P) {
      var r = (nodes[P.i].blush ? 1.9 : 1.5) * (1 + P.lens * 0.8);
      ctx.fillStyle = 'rgba(' + (nodes[P.i].blush || P.lens > 0.4 ? ROSE_DEEP : SAGE) + ',' + (0.6 + P.lens * 0.4).toFixed(2) + ')';
      ctx.beginPath();
      ctx.arc(P.x, P.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // impulses: a bright dot with a soft glow running along a link, then hopping on
    if (!still) {
      if (rand() < 0.12 && pulses.length < 24) fire(Math.floor(rand() * nodes.length), 3 + Math.floor(rand() * 4));
      for (var q = pulses.length - 1; q >= 0; q--) {
        var pu = pulses[q];
        pu.k += pu.speed;
        var PA = proj[pu.a], PB = proj[pu.b];
        var gx = PA.x + (PB.x - PA.x) * Math.min(pu.k, 1), gy = PA.y + (PB.y - PA.y) * Math.min(pu.k, 1);
        ctx.fillStyle = 'rgba(' + ROSE + ', 0.28)';
        ctx.beginPath();
        ctx.arc(gx, gy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(' + ROSE_DEEP + ', 0.95)';
        ctx.beginPath();
        ctx.arc(gx, gy, 2.6, 0, Math.PI * 2);
        ctx.fill();
        if (pu.k >= 1) {
          pulses.splice(q, 1);
          if (pu.hops > 0) fire(pu.b, pu.hops - 1);
        }
      }
    }

    if (!still && visible && !document.hidden) raf = requestAnimationFrame(draw);
  };

  var start = function () {
    cancelAnimationFrame(raf);
    draw();
  };

  size();
  start();
  window.addEventListener('resize', function () { size(); if (still) draw(); });
  document.addEventListener('visibilitychange', start);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible) start();
    }).observe(canvas);
  }
  if (still) return;

  var local = function (e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };
  window.addEventListener('pointermove', function (e) {
    var m = local(e);
    mouse.x = m.x;
    mouse.y = m.y;
    mouse.on = e.pointerType === 'mouse' && m.x > -LENS && m.y > -LENS && m.x < W + LENS && m.y < H + LENS;
    if (e.pointerType === 'mouse' && !dragging) {
      // -1..1 from the brain's centre; a little anywhere on the page, more when over the brain
      var nx = Math.max(-1, Math.min(1, (m.x - W / 2) / (W / 2)));
      var ny = Math.max(-1, Math.min(1, (m.y - H / 2) / (H / 2)));
      var gain = mouse.on ? 1 : 0.45;
      followY = nx * 0.55 * gain;
      followX = ny * 0.3 * gain;
    }
    if (dragging) {
      dragY += (e.clientX - lastX) * 0.008;
      dragX = Math.max(-0.9, Math.min(0.9, dragX - (e.clientY - lastY) * 0.006));
      moved += Math.abs(e.clientX - lastX) + Math.abs(e.clientY - lastY);
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  canvas.addEventListener('pointerleave', function () { mouse.on = false; });

  // click / tap: a burst of impulses from the nearest point (not after a drag)
  var moved = 0;
  canvas.addEventListener('click', function (e) {
    if (moved > 6) return;
    var m = local(e), best = 0, bd = Infinity;
    proj.forEach(function (p, i) {
      var d = (p.x - m.x) * (p.x - m.x) + (p.y - m.y) * (p.y - m.y);
      if (d < bd) { bd = d; best = i; }
    });
    for (var b = 0; b < 8; b++) fire(best, 5 + Math.floor(rand() * 4));
  });

  // drag to turn it: right away with a mouse; on touch, hold still for a moment first,
  // so a quick swipe over the brain still works as a swipe (it opens Despre on the landing)
  var holdTimer = 0, touchDown = false, downX = 0, downY = 0;
  var startDrag = function (x, y) {
    dragging = true;
    moved = 0;
    lastX = x;
    lastY = y;
    canvas.classList.add('is-dragging');
  };
  var endDrag = function () {
    clearTimeout(holdTimer);
    touchDown = false;
    dragging = false;
    canvas.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') {
      startDrag(e.clientX, e.clientY);
      e.preventDefault();
      return;
    }
    touchDown = true;
    moved = 0;
    downX = lastX = e.clientX;
    downY = lastY = e.clientY;
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () {
      if (!touchDown) return;
      startDrag(lastX, lastY);
      if (navigator.vibrate) navigator.vibrate(8);
    }, 220);
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!touchDown || dragging) return;
    lastX = e.clientX;
    lastY = e.clientY;
    // moved before the hold kicked in: it's a swipe, not a drag
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 10) {
      clearTimeout(holdTimer);
      touchDown = false;
    }
  });
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
})();
