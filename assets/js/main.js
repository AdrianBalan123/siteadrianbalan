(function () {
  var header = document.querySelector('.site-header');
  if (header) {
    var btn = header.querySelector('.menu-btn');
    var setOpen = function (open) {
      header.dataset.open = String(open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Închide meniul' : 'Deschide meniul');
      btn.querySelector('.i-open').hidden = open;
      btn.querySelector('.i-close').hidden = !open;
    };
    btn.addEventListener('click', function () {
      setOpen(header.dataset.open !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.dataset.open === 'true') {
        setOpen(false);
        btn.focus();
      }
    });
    var onScroll = function () {
      header.dataset.scrolled = String(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Article search (Articole page)
  var search = document.getElementById('cauta');
  if (search) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.cards .card'));
    var empty = document.getElementById('fara-rezultate');
    var norm = function (s) {
      return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    };
    var index = cards.map(function (c) {
      return norm(c.dataset.search || c.textContent);
    });
    search.addEventListener('input', function () {
      var q = norm(search.value.trim());
      var shown = 0;
      cards.forEach(function (c, i) {
        var hit = !q || index[i].indexOf(q) !== -1;
        c.hidden = !hit;
        if (hit) shown++;
      });
      empty.hidden = shown > 0;
      empty.querySelector('span').textContent = search.value.trim();
    });
  }

  // Programare: compune mesajul din câmpuri și îl deschide în WhatsApp
  var form = document.getElementById('programare');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var val = function (id) {
        return document.getElementById(id).value.trim();
      };
      var picked = function (group) {
        return Array.prototype.map.call(
          form.querySelectorAll('[data-group="' + group + '"] input:checked'),
          function (c) { return c.value; }
        );
      };
      var zile = picked('zile').join(', ');
      var interval = picked('interval').join(', ').toLowerCase();
      var cand = zile && interval ? zile + ' (' + interval + ')' : zile || interval.charAt(0).toUpperCase() + interval.slice(1);

      // *text* = bold în WhatsApp
      var lines = ['Bună ziua! 👋', 'Aș dori să programez o ședință.', '', '*Nume:* ' + val('f-nume')];
      if (val('f-tema')) lines.push('*Temă:* ' + val('f-tema'));
      if (cand) lines.push('*Disponibilitate:* ' + cand);
      lines.push('', '*Mesaj:*', val('f-mesaj'), '', 'Mulțumesc!');
      window.open(form.action + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  // Prima pagină: primul scroll în jos (rotiță sau swipe) duce la pagina Despre
  var heroFull = document.querySelector('.hero-full');
  if (heroFull) {
    var next = heroFull.dataset.next;
    var going = false;
    // the browser may already have scrolled a bit when the event arrives
    var nearTop = function () {
      return window.scrollY < heroFull.offsetHeight / 2;
    };
    var go = function () {
      if (going) return;
      going = true;
      window.location.href = next;
    };
    window.addEventListener('wheel', function (e) {
      if (e.deltaY > 10 && nearTop()) go();
    }, { passive: true });
    var ty = null;
    window.addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (ty !== null && ty - e.touches[0].clientY > 60 && nearTop()) go();
    }, { passive: true });
  }

  // Carusel recenzii (pagina Despre): săgeți, buline, tastatură și swipe
  var stage = document.querySelector('.quote-stage');
  if (stage) {
    var slides = stage.querySelectorAll('.quote-slide');
    var controls = document.querySelector('.quote-controls');
    var dots = controls.querySelectorAll('.quote-dots button');
    var current = 0;
    var show = function (i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.classList.toggle('is-active', k === current);
        s.setAttribute('aria-hidden', String(k !== current));
      });
      dots.forEach(function (d, k) {
        if (k === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    };
    controls.hidden = false;

    // Schimbare automată la 7 s; se oprește cât timp mouse-ul/focusul e pe carusel,
    // când tab-ul nu e vizibil, și nu pornește deloc dacă utilizatorul a cerut mișcare redusă.
    var section = stage.closest('.quote-carousel');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timer = null;
    var paused = false;
    var stop = function () {
      clearInterval(timer);
      timer = null;
    };
    var start = function () {
      stop();
      if (reduced || paused || document.hidden) return;
      timer = setInterval(function () { show(current + 1); }, 7000);
    };
    var pause = function (v) {
      paused = v;
      start();
    };
    // while it moves on its own, don't make screen readers announce every change
    stage.setAttribute('aria-live', reduced ? 'polite' : 'off');
    section.addEventListener('mouseenter', function () { pause(true); });
    section.addEventListener('mouseleave', function () { pause(false); });
    section.addEventListener('focusin', function () { pause(true); stage.setAttribute('aria-live', 'polite'); });
    section.addEventListener('focusout', function () { pause(false); });
    document.addEventListener('visibilitychange', start);
    start();

    controls.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      show(b.dataset.dir ? current + Number(b.dataset.dir) : Number(b.dataset.i));
    });
    controls.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1));
      x0 = null;
      start(); // full 7 s on the review the visitor swiped to
    });
  }
})();

// "Alte articole" la finalul unui articol: citește lista curentă de articole
(function () {
  var box = document.getElementById('alte-articole');
  if (!box || !window.fetch) return;
  var slug = box.dataset.slug;
  var esc = function (s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  fetch('/data/articole.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (all) {
      all = all.filter(function (a) { return a.published !== false; });
      var i = all.findIndex(function (a) { return a.slug === slug; });
      var out = [];
      for (var k = 1; out.length < 3 && k < all.length; k++) out.push(all[(i + k + all.length) % all.length]);
      if (!out.length) return;
      box.querySelector('.cards').innerHTML = out.map(function (a) {
        var t = a.thumbnail
          ? '<img src="' + esc(a.thumbnail) + '" alt="" loading="lazy">'
          : '<div class="thumb-fallback"><svg viewBox="200 15 570 925" aria-hidden="true"><path d="M444 22 583 403h-27L444 90 268 580h-26zM207 432h214v20H207z" fill="currentColor"/><path d="M467 442h88c105 0 165 58 165 126 0 47-20 72-70 102 60 20 100 60 100 125 0 80-60 125-175 125H467z" fill="none" stroke="currentColor" stroke-width="20"/></svg></div>';
        return '<a href="/articole/' + esc(a.slug) + '.html" class="card"><div class="thumb">' + t + '</div><div class="card-body"><h3>' + esc(a.title) + '</h3>' + (a.excerpt ? '<p>' + esc(a.excerpt) + '</p>' : '') + '<span class="meta">' + (a.readingMinutes || 1) + ' min de citit</span></div></a>';
      }).join('');
      box.hidden = false;
    })
    .catch(function () {});
})();
