(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) document.documentElement.classList.add('js');

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#yr').textContent = new Date().getFullYear();

  /* mobile menu */
  var burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', o);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  /* typing text */
  var words = ['Artificial Intelligence', 'Machine Learning', 'AI Engineering', 'Smart Agriculture'];
  var out = $('#typed'), w = 0, c = 0, del = false;
  function type() {
    var word = words[w];
    out.textContent = word.slice(0, c);
    var wait = del ? 40 : 85;
    if (!del && c === word.length) { del = true; wait = 1400; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; wait = 350; }
    else c += del ? -1 : 1;
    setTimeout(type, wait);
  }
  if (reduce) { out.textContent = words[0]; } else { type(); }

  /* skill rings: set value, animate on reveal */
  var skills = $$('.skill');
  function setRing(s, on) {
    var p = parseInt(s.getAttribute('data-p'), 10);
    var arc = $('.arc', s), txt = $('b', s);
    s.style.setProperty('--p', 0);
    arc.style.setProperty('--p', on ? p : 0);
    if (!on) { txt.textContent = '0%'; return; }
    if (reduce) { txt.textContent = p + '%'; return; }
    var t0 = null;
    (function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / 1500, 1);
      txt.textContent = Math.round(p * (1 - Math.pow(1 - k, 3))) + '%';
      if (k < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  skills.forEach(function (s) {
    var p = s.getAttribute('data-p');
    $('.arc', s).style.setProperty('--p', p);   /* visible by default */
  });

  /* count-up stats (runs once when About opens) */
  var counted = false, nums = $$('.stats b');
  function countUp() {
    if (counted) return; counted = true;
    nums.forEach(function (b) {
      var n = parseInt(b.getAttribute('data-n'), 10);
      if (reduce) { b.textContent = n; return; }
      var t0 = null;
      (function step(t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / 1200, 1);
        b.textContent = Math.round(n * k);
        if (k < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }
  if (!reduce) nums.forEach(function (b) { b.textContent = '0'; });

  /* angled section entrance, driven by scroll position
     (measures the flat .stage wrapper, so the 3D tilt never blocks it) */
  var stages = $$('.stage');
  function check() {
    var vh = window.innerHeight;
    stages.forEach(function (st) {
      var r = st.getBoundingClientRect();
      var visible = r.top < vh * 0.78 && r.bottom > vh * 0.18;
      var was = st.classList.contains('in');
      if (visible && !was) {
        st.classList.add('in');
        if (st.querySelector('#about')) countUp();
        if (st.querySelector('#skills')) skills.forEach(function (s) { setRing(s, true); });
      } else if (!visible && was && (r.top > vh || r.bottom < 0)) {
        st.classList.remove('in');
        if (st.querySelector('#skills')) skills.forEach(function (s) { setRing(s, false); });
      }
    });
  }
  if (reduce) {
    stages.forEach(function (s) { s.classList.add('in'); });
  } else {
    /* rings start empty on JS pages, then fill when Skills opens */
    skills.forEach(function (s) { setRing(s, false); });
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    /* safety net: never leave content hidden */
    setTimeout(function () {
      if (!document.documentElement.classList.contains('js')) return;
      var any = stages.some(function (s) { return s.classList.contains('in'); });
      if (!any && window.scrollY > 0) check();
    }, 2000);
  }

  /* neural-network background in hero */
  var netOn = true, cv = $('#net');
  if (cv && !reduce) {
    var cx = cv.getContext('2d'), pts = [], mx = -999, my = -999, W = 0, H = 0;
    var size = function () {
      var r = cv.parentNode.getBoundingClientRect(), d = window.devicePixelRatio || 1;
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
      pts = [];
      for (var i = 0, n = Math.min(70, Math.round(W * H / 16000)); i < n; i++)
        pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
    };
    var line = function (a, b, c, d, al) {
      cx.strokeStyle = 'rgba(255,255,255,' + al + ')'; cx.beginPath(); cx.moveTo(a, b); cx.lineTo(c, d); cx.stroke();
    };
    var draw = function () {
      if (netOn) {
        cx.clearRect(0, 0, W, H);
        pts.forEach(function (p, i) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
          cx.fillStyle = 'rgba(255,255,255,.7)'; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 6.283); cx.fill();
          for (var j = i + 1; j < pts.length; j++) {
            var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
            if (d < 16900) line(p.x, p.y, q.x, q.y, .22 * (1 - d / 16900));
          }
          var ax = p.x - mx, ay = p.y - my, md = ax * ax + ay * ay;
          if (md < 19600) line(p.x, p.y, mx, my, .5 * (1 - md / 19600));
        });
      }
      requestAnimationFrame(draw);
    };
    size(); draw();
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
    }, { passive: true });
  }

  /* back to top */
  var totop = $('#totop');
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* progress bar, cursor glow, nav highlight */
  var bar = $('#progress'), glow = $('#glow');
  var links = $$('#nav a[href^="#"]');
  var secs = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? window.scrollY / h * 100 : 0) + '%';
    totop.classList.toggle('show', window.scrollY > 600);
    netOn = window.scrollY < window.innerHeight;
    var y = window.scrollY + window.innerHeight * 0.4, cur = '';
    secs.forEach(function (s) { if (s && s.getBoundingClientRect().top + window.scrollY <= y) cur = s.id; });
    links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  window.addEventListener('pointermove', function (e) {
    glow.style.setProperty('--x', e.clientX + 'px');
    glow.style.setProperty('--y', e.clientY + 'px');
  }, { passive: true });
})();