// Intro animations start when the page is actually shown (not while it is prerendered in the background),
// and Acasă ⇄ Despre navigations get their own "scroll" transitions.
(function (d) {
  var show = function () { d.documentElement.classList.add('revealed'); };
  if (d.prerendering) d.addEventListener('prerenderingchange', show, { once: true });
  else show();
  addEventListener('pagereveal', function (e) {
    var a = window.navigation && navigation.activation;
    var from = a && a.from && a.from.url ? new URL(a.from.url).pathname : '';
    // clean addresses (/despre) on the live site, /despre.html in a local preview
    var clean = function (p) { return p.replace(/\.html$/, '').replace(/\/index$/, '/'); };
    var home = function (p) { return clean(p) === '/'; };
    if (!e.viewTransition) return;
    if (home(from) && clean(location.pathname) === '/despre') e.viewTransition.types.add('to-about');
    if (clean(from) === '/despre' && home(location.pathname)) {
      e.viewTransition.types.add('to-landing');
      d.documentElement.classList.add('no-intro');
    }
  });
})(document);
