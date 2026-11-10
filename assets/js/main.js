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

  // Card de articol apăsat: poza lui „devine” coperta articolului (tranziție între pagini, unde e suportată)
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('a.card');
    if (!c || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
    var img = c.querySelector('.thumb img');
    if (img) img.style.viewTransitionName = 'article-cover';
  });
  // back/forward cache restores the page as it was: clear the name so the next click works
  window.addEventListener('pageshow', function () {
    document.querySelectorAll('.thumb img').forEach(function (img) { img.style.viewTransitionName = ''; });
  });

  // Articole: căutare + filtre pe teme (se combină), numărul de rezultate și paginare
  var search = document.getElementById('cauta');
  if (search) {
    var list = document.querySelector('.article-list');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.card'));
    var empty = document.getElementById('fara-rezultate');
    var count = document.getElementById('numar-articole');
    var chips = Array.prototype.slice.call(document.querySelectorAll('.topic-filters button'));
    var pager = document.getElementById('paginare');
    var tools = document.querySelector('.article-tools');
    var PER_PAGE = 12;
    var topic = '';
    var page = Math.max(1, parseInt(new URLSearchParams(location.search).get('pagina'), 10) || 1);
    var norm = function (s) {
      return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    var index = cards.map(function (c) {
      return norm(c.dataset.search || c.textContent);
    });
    var chevron = function (d) {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
    };
    var pageButton = function (p, label, cls, current) {
      return '<button type="button" class="' + cls + '" data-p="' + p + '"' + (current ? ' aria-current="page"' : '') + '>' + label + '</button>';
    };
    var apply = function () {
      var q = norm(search.value.trim());
      var filtered = Boolean(q || topic);
      var hits = cards.filter(function (c, i) {
        return (!q || index[i].indexOf(q) !== -1) && (!topic || index[i].indexOf(topic) !== -1);
      });
      // page 1 of the full list also holds the large "newest" card
      var extra = filtered ? 0 : 1;
      var pages = Math.max(1, Math.ceil((hits.length - extra) / PER_PAGE));
      page = Math.min(page, pages);
      var from = page === 1 ? 0 : extra + (page - 1) * PER_PAGE;
      var to = extra + page * PER_PAGE;
      cards.forEach(function (c) { c.hidden = true; });
      hits.slice(from, to).forEach(function (c) { c.hidden = false; });
      // the first article is shown large only on page 1, when nothing is filtered
      list.classList.toggle('is-filtered', filtered || page > 1);
      empty.hidden = hits.length > 0;
      count.textContent = hits.length === 1 ? '1 articol' : hits.length + ' articole';

      pager.hidden = pages < 2;
      var html = pageButton(page - 1, chevron('m15 18-6-6 6-6') + '<span>Înapoi</span>', 'page-step', false);
      for (var p = 1; p <= pages; p++) {
        // up to 7 pages: all of them; more: first, last and the pages around the current one
        if (pages <= 7 || p === 1 || p === pages || Math.abs(p - page) <= 1) html += pageButton(p, p, 'page-num', p === page);
        else if (Math.abs(p - page) === 2) html += '<span class="page-gap" aria-hidden="true">…</span>';
      }
      html += pageButton(page + 1, '<span>Înainte</span>' + chevron('m9 18 6-6-6-6'), 'page-step', false);
      pager.innerHTML = html;
      pager.querySelectorAll('.page-step')[0].disabled = page === 1;
      pager.querySelectorAll('.page-step')[1].disabled = page === pages;
      pager.querySelectorAll('.page-num').forEach(function (b) { b.setAttribute('aria-label', 'Pagina ' + b.dataset.p); });

      var url = new URL(location.href);
      if (page > 1) url.searchParams.set('pagina', page);
      else url.searchParams.delete('pagina');
      history.replaceState(null, '', url);
    };
    pager.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      page = Number(b.dataset.p);
      apply();
      var top = tools.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
    // hide topics that match no article
    chips.forEach(function (b) {
      var q = b.dataset.q;
      if (q && !index.some(function (t) { return t.indexOf(q) !== -1; })) b.hidden = true;
      b.addEventListener('click', function () {
        topic = q;
        page = 1;
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        apply();
      });
    });
    search.addEventListener('input', function () {
      page = 1;
      apply();
    });
    apply();
  }

  // Servicii: un link spre #serviciu (de ex. servicii.html#evaluari) deschide cardul respectiv
  var openService = function () {
    var target = location.hash ? document.getElementById(location.hash.slice(1)) : null;
    if (target && target.matches('details.service')) {
      target.open = true;
      target.scrollIntoView({ block: 'start' });
    }
  };
  if (document.querySelector('details.service')) {
    openService();
    window.addEventListener('hashchange', openService);
  }

  // Distribuie articolul: linkurile folosesc adresa reală a paginii, „copiază” pune linkul în clipboard
  document.querySelectorAll('.share').forEach(function (share) {
    var here = location.origin + location.pathname;
    var shareTitle = share.getAttribute('data-share-title');
    share.querySelector('[data-share="whatsapp"]').href = 'https://wa.me/?text=' + encodeURIComponent(shareTitle + ' ' + here);
    share.querySelector('[data-share="facebook"]').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(here);
    var copyBtn = share.querySelector('[data-share="copy"]');
    var copyTimer;
    copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.querySelector('.share-copied').textContent = 'Link copiat';
        copyBtn.classList.add('is-copied');
        clearTimeout(copyTimer);
        copyTimer = setTimeout(function () {
          copyBtn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(here).then(done, function () {});
      else {
        var t = document.createElement('textarea');
        t.value = here;
        document.body.appendChild(t);
        t.select();
        try {
          document.execCommand('copy');
          done();
        } catch (e) {}
        t.remove();
      }
    });
  });

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
      if (picked('format').length) lines.push('*Format:* ' + picked('format')[0]);
      if (cand) lines.push('*Disponibilitate:* ' + cand);
      lines.push('', '*Mesaj:*', val('f-mesaj'), '', 'Mulțumesc!');
      window.open(form.action + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    });
  }

  // Prima pagină: butoanele au exact lățimea celui mai lung rând din paragraful de deasupra
  var lead = document.querySelector('.hero-full .hero-lead');
  var actions = document.querySelector('.hero-full .hero-actions');
  if (lead && actions && document.createRange) {
    var fit = function () {
      actions.style.width = '';
      var range = document.createRange();
      range.selectNodeContents(lead);
      var rects = Array.prototype.slice.call(range.getClientRects());
      if (!rects.length) return;
      var left = Math.min.apply(null, rects.map(function (r) { return r.left; }));
      var right = Math.max.apply(null, rects.map(function (r) { return r.right; }));
      actions.style.width = Math.ceil(right - left) + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
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
    var supportsCrossDoc = 'onpagereveal' in window; // cross-document view transitions (Chrome, Edge)
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var go = function () {
      if (going) return;
      going = true;
      if (supportsCrossDoc || reduced) {
        window.location.href = next;
        return;
      }
      // other browsers: slide the page up ourselves, then open Despre (already downloaded)
      document.documentElement.classList.add('leaving');
      setTimeout(function () { window.location.href = next; }, 380);
    };
    // mark this navigation so the CSS can use the "scroll up" animation
    window.addEventListener('pageswap', function (e) {
      if (e.viewTransition && e.activation && new URL(e.activation.entry.url).pathname === '/despre.html') {
        e.viewTransition.types.add('to-about');
      }
    });
    // coming back with the back button: undo the fallback animation
    window.addEventListener('pageshow', function () {
      going = false;
      document.documentElement.classList.remove('leaving');
    });
    window.addEventListener('wheel', function (e) {
      if (e.deltaY > 10 && nearTop()) go();
    }, { passive: true });
    var ty = null;
    window.addEventListener('touchstart', function (e) { ty = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (document.querySelector('.hero-brain.is-dragging')) return; // turning the brain, not swiping
      if (ty !== null && ty - e.touches[0].clientY > 60 && nearTop()) go();
    }, { passive: true });
  }

  // Despre: dacă ai venit de pe prima pagină, scroll în sus (sau glisare în jos) când ești sus
  // de tot te duce înapoi. Doar dacă pagina stătea deja sus, nu când ajungi sus din inerție.
  (function () {
    if (location.pathname !== '/despre.html') return;
    var ref = '';
    try { ref = document.referrer ? new URL(document.referrer).pathname : ''; } catch (err) {}
    var cameFromHome = (ref === '/' || ref === '/index.html') && document.referrer.indexOf(location.origin) === 0;
    if (!cameFromHome) return;
    var supportsCrossDoc = 'onpagereveal' in window;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var going = false;
    // since when the page has been resting at the very top (0 = not at the top);
    // updated from scroll events, which arrive after the wheel event that caused them
    var topSince = window.scrollY <= 0 ? Date.now() : 0;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 0) topSince = 0;
      else if (!topSince) topSince = Date.now();
    }, { passive: true });
    var settledAtTop = function () {
      return topSince > 0 && window.scrollY <= 0 && Date.now() - topSince > 400;
    };
    var open = function () {
      if (history.length > 1) history.back();
      else window.location.href = '/';
    };
    var back = function () {
      if (going) return;
      going = true;
      if (supportsCrossDoc || reduced) return open();
      document.documentElement.classList.add('leaving-down');
      setTimeout(open, 380);
    };
    window.addEventListener('pageswap', function (e) {
      if (!e.viewTransition || !e.activation) return;
      var to = new URL(e.activation.entry.url).pathname;
      if (to === '/' || to === '/index.html') e.viewTransition.types.add('to-landing');
    });
    window.addEventListener('pageshow', function () {
      going = false;
      document.documentElement.classList.remove('leaving-down');
    });
    window.addEventListener('wheel', function (e) {
      if (e.deltaY < -10 && settledAtTop()) back();
    }, { passive: true });
    var ty = null;
    window.addEventListener('touchstart', function (e) {
      ty = settledAtTop() ? e.touches[0].clientY : null;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (ty !== null && e.touches[0].clientY - ty > 70) back();
    }, { passive: true });
  })();

  // Carusel recenzii (pagina Despre): săgeți, buline, tastatură și swipe
  var stage = document.querySelector('.quote-stage');
  if (stage) {
    var slides = stage.querySelectorAll('.quote-slide');
    var controls = document.querySelector('.quote-controls');
    var dots = controls.querySelectorAll('.quote-dots button');
    var current = 0;
    // the stage is as tall as the review on show (short reviews leave no empty space)
    var fit = function () {
      stage.style.height = slides[current].offsetHeight + 'px';
    };
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
      fit();
    };
    controls.hidden = false;
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

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
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';
  var book = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>';
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
          ? '<img src="' + esc(a.thumbnail) + '" srcset="' + [384, 640, 828].map(function (w) { return '/_vercel/image?url=' + encodeURIComponent(a.thumbnail) + '&w=' + w + '&q=75 ' + w + 'w'; }).join(', ') + '" sizes="(max-width: 760px) 100vw, 380px" onerror="this.onerror=null;this.removeAttribute(&quot;srcset&quot;)" alt="" loading="lazy" decoding="async">'
          : '<div class="thumb-fallback"><svg viewBox="200 15 570 925" aria-hidden="true"><path d="M444 22 583 403h-27L444 90 268 580h-26zM207 432h214v20H207z" fill="currentColor"/><path d="M467 442h88c105 0 165 58 165 126 0 47-20 72-70 102 60 20 100 60 100 125 0 80-60 125-175 125H467z" fill="none" stroke="currentColor" stroke-width="20"/></svg></div>';
        return '<a href="/articole/' + esc(a.slug) + '.html" class="card"><div class="thumb">' + t + '<span class="card-arrow" aria-hidden="true">' + arrow + '</span></div><div class="card-body"><h3>' + esc(a.title) + '</h3><span class="meta">' + book + ' ' + (a.readingMinutes || 1) + ' min de citit</span></div></a>';
      }).join('');
      box.hidden = false;
    })
    .catch(function () {});
})();
