// Intro animations start when the page is actually shown (not while it is prerendered in the background),
// and Acasă ⇄ Despre navigations get their own "scroll" transitions.
(function (d) {
  var show = function () { d.documentElement.classList.add('revealed'); };
  if (d.prerendering) d.addEventListener('prerenderingchange', show, { once: true });
  else show();
  addEventListener('pagereveal', function (e) {
    var a = window.navigation && navigation.activation;
    var from = a && a.from && a.from.url ? new URL(a.from.url).pathname : '';
    var home = function (p) { return p === '/' || p === '/index.html'; };
    if (!e.viewTransition) return;
    if (home(from) && location.pathname === '/despre.html') e.viewTransition.types.add('to-about');
    if (from === '/despre.html' && home(location.pathname)) {
      e.viewTransition.types.add('to-landing');
      d.documentElement.classList.add('no-intro');
    }
  });
})(document);
