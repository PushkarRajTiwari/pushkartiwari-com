// Shared behaviour for every page: scroll reveals, counters, card spotlight, Ctrl+K menu.
(function () {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = doc.dataset.root || '';
  const site = window.SITE || {};

  // Scroll reveal + count-up
  const countUp = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = end + suf; return; }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    if (e.target.matches('[data-count]')) countUp(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    io.observe(el);
  });

  // Cursor spotlight on tiles
  document.querySelectorAll('.tile').forEach((t) => t.addEventListener('pointermove', (e) => {
    const r = t.getBoundingClientRect();
    t.style.setProperty('--mx', e.clientX - r.left + 'px');
    t.style.setProperty('--my', e.clientY - r.top + 'px');
  }));

  // Toast
  const toast = document.createElement('div');
  toast.className = 'toast'; toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  let toastTimer;
  window.showToast = (msg) => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  window.copyEmail = () => {
    const done = () => showToast('Email copied: ' + site.email);
    if (navigator.clipboard) navigator.clipboard.writeText(site.email).then(done, () => { location.href = 'mailto:' + site.email; });
    else location.href = 'mailto:' + site.email;
  };

  // Command palette
  const go = (href) => () => { location.href = root + href; };
  const items = [
    { g: 'Page', t: 'Home', run: go('index.html') },
    { g: 'Page', t: 'Work', run: go('work.html') },
    { g: 'Case study', t: 'Batch modernization', run: go('work/batch-modernization.html') },
    { g: 'Case study', t: 'rag-service', run: go('work/rag-service.html') },
    { g: 'Page', t: 'Experience', run: go('experience.html') },
    { g: 'Page', t: 'About', run: go('about.html') },
    { g: 'Page', t: 'Contact', run: go('contact.html') },
    { g: 'Action', t: 'Download resume', run: () => { const a = document.createElement('a'); a.href = root + site.resume; a.download = ''; a.click(); } },
    { g: 'Action', t: 'Copy email address', run: () => copyEmail() },
    { g: 'Link', t: 'Open GitHub', run: () => window.open(site.github, '_blank', 'noopener') },
    { g: 'Link', t: 'Open LinkedIn', run: () => window.open(site.linkedin, '_blank', 'noopener') },
  ];
  if (document.getElementById('term')) items.push({ g: 'Action', t: 'Replay the batch run', run: () => { document.getElementById('term').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); window.replayBatch && window.replayBatch(); } });

  const pal = document.createElement('div');
  pal.className = 'palette';
  pal.innerHTML = '<div class="palette-box" role="dialog" aria-modal="true" aria-label="Command menu">' +
    '<input type="text" placeholder="Type a command or search…" aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="pal-list" autocomplete="off" spellcheck="false">' +
    '<ul id="pal-list" role="listbox"></ul>' +
    '<div class="foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div></div>';
  document.body.appendChild(pal);
  const input = pal.querySelector('input'), list = pal.querySelector('ul');
  let shown = items, sel = 0, lastFocus = null;
  const render = () => {
    const q = input.value.trim().toLowerCase();
    shown = items.filter((it) => (it.t + ' ' + it.g).toLowerCase().includes(q));
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = shown.length ? shown.map((it, i) =>
      `<li role="option" id="pal-${i}" aria-selected="${i === sel}" data-i="${i}"><span>${it.t}</span><span class="g">${it.g}</span></li>`).join('')
      : '<li class="empty" aria-disabled="true">No matches</li>';
    input.setAttribute('aria-activedescendant', shown.length ? 'pal-' + sel : '');
    const cur = list.querySelector('[aria-selected="true"]'); cur && cur.scrollIntoView({ block: 'nearest' });
  };
  const open = () => { lastFocus = document.activeElement; pal.classList.add('open'); input.value = ''; sel = 0; render(); input.focus(); };
  const close = () => { pal.classList.remove('open'); lastFocus && lastFocus.focus && lastFocus.focus(); };
  const run = (i) => { const it = shown[i]; if (!it) return; close(); it.run(); };
  window.openPalette = open;
  input.addEventListener('input', () => { sel = 0; render(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % Math.max(1, shown.length); render(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + shown.length) % Math.max(1, shown.length); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); run(sel); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
  list.addEventListener('click', (e) => { const li = e.target.closest('[data-i]'); if (li) run(+li.dataset.i); });
  list.addEventListener('mousemove', (e) => { const li = e.target.closest('[data-i]'); if (li && +li.dataset.i !== sel) { sel = +li.dataset.i; render(); } });
  pal.addEventListener('click', (e) => { if (e.target === pal) close(); });
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('open') ? close() : open(); }
  });
  document.querySelectorAll('[data-palette]').forEach((b) => b.addEventListener('click', open));
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
  document.querySelectorAll('.k-mod').forEach((k) => { k.textContent = isMac ? '⌘' : 'Ctrl'; });
  // Copy buttons
  document.querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', () => {
    const text = b.dataset.copy;
    const fallback = () => { const r = document.createRange(); const t = b.parentElement.querySelector('a'); if (t) { r.selectNodeContents(t); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } showToast('Press Ctrl+C to copy'); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast('Copied ' + text), fallback); else fallback();
  }));

  // Contact form: there is no server, so compose the message in the visitor's email app.
  const form = document.getElementById('contact-form');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = (n) => form.elements[n].value.trim();
    const subject = 'Website message from ' + v('name');
    const body = v('message') + '\n\n— ' + v('name') + ' (' + v('email') + ')';
    location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });

  // Highlight the current section in a case study's contents list
  const toc = document.querySelectorAll('.toc a');
  if (toc.length) {
    const map = new Map([...toc].map((a) => [a.getAttribute('href').slice(1), a]));
    const tio = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { toc.forEach((a) => a.classList.remove('on')); const a = map.get(e.target.id); a && a.classList.add('on'); }
    }), { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); el && tio.observe(el); });
  }
})();
