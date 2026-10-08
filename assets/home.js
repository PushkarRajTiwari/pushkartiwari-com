// Homepage: interactive terminal, before/after slider, live RAG diagram.
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const site = window.SITE || {};
  const root = document.documentElement.dataset.root || '';

  /* ---------- Terminal ---------- */
  const out = document.getElementById('term-out');
  const form = document.getElementById('term-form');
  const cmd = document.getElementById('term-cmd');
  const bar = document.getElementById('term-bar');
  if (out && form) {
    const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const print = (html) => { const p = document.createElement('p'); p.innerHTML = html; out.appendChild(p); out.scrollTop = out.scrollHeight; };
    const prompt = (text) => print('<span class="t-p">❯</span> ' + esc(text));
    const link = (href, text, ext) => `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;

    const batch = [
      ['<span class="t-dim">[02:00:00]</span> Loading 7 jobs · Clean Architecture pipeline', 6],
      ['<span class="t-dim">[02:00:01]</span> <span class="t-c">job 1/7</span> extract     <span class="t-ok">✓</span> 4m 12s', 20],
      ['<span class="t-dim">[02:04:13]</span> <span class="t-c">job 2/7</span> transform   <span class="t-ok">✓</span> 6m 40s', 36],
      ['<span class="t-dim">[02:10:53]</span> <span class="t-c">job 3/7</span> validate    <span class="t-ok">✓</span> 5m 02s', 52],
      ['<span class="t-dim">[02:15:55]</span> <span class="t-c">job 4/7</span> aggregate   <span class="t-ok">✓</span> 8m 31s', 72],
      ['<span class="t-dim">[02:24:26]</span> <span class="t-c">jobs 5–7</span> publish    <span class="t-ok">✓</span> 5m 34s', 100],
      ['', 100],
      ['<span class="t-ok">✔ Completed</span> in <span class="t-y">00:30:00</span>  <span class="t-dim">(was 01:30:00 on SSIS)</span>', 100],
    ];
    let timers = [];
    const stop = () => { timers.forEach(clearTimeout); timers = []; };
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const hint = () => print('<span class="t-dim">Illustrative replay of the SSIS → .NET Core migration.\nType</span> <span class="t-c">help</span> <span class="t-dim">or tap a command below.</span>');

    function replay() {
      stop(); out.innerHTML = ''; bar.style.width = '0%';
      prompt('dotnet run --project Batch.Runner -- --nightly');
      if (reduce) { batch.forEach(([l]) => print(l)); bar.style.width = '100%'; hint(); return; }
      let t = 500;
      batch.forEach(([l, pct]) => { later(() => { print(l); bar.style.width = pct + '%'; }, t); t += 480; });
      later(hint, t + 300);
    }
    window.replayBatch = replay;

    const cmds = {
      help: () => print(
        'Commands:\n' +
        '  <span class="t-c">whoami</span>      who I am\n' +
        '  <span class="t-c">projects</span>    case studies and what\'s next\n' +
        '  <span class="t-c">skills</span>      the stack I work in\n' +
        '  <span class="t-c">experience</span>  roles and outcomes\n' +
        '  <span class="t-c">contact</span>     email, LinkedIn, GitHub\n' +
        '  <span class="t-c">resume</span>      download my resume\n' +
        '  <span class="t-c">replay</span>      run the batch job again\n' +
        '  <span class="t-c">clear</span>       clear the screen'),
      whoami: () => print(
        '<span class="t-y">Pushkar Raj Tiwari</span>\nSenior Software Engineer · Charlotte, NC\n' +
        '9+ years of full-stack C#, .NET and Angular: APIs, Angular front ends, SQL Server, SSIS and Kafka integrations.\n' +
        'Mostly regulated financial services, where security, testing and release discipline are part of the feature.\n' +
        'Now building hands-on with AI.'),
      projects: () => print(
        '<span class="t-ok">●</span> ' + link(root + 'work/batch-modernization.html', 'batch-modernization') + '  SSIS → .NET Core · 1.5 h → 30 min\n' +
        '<span class="t-y">●</span> ' + link(root + 'work/rag-service.html', 'rag-service') + '          Spring AI RAG · in progress\n' +
        '<span class="t-dim">○ mcp-server           next, built in Kiro</span>'),
      skills: () => print(
        '<span class="t-dim">.NET & backend</span>  C#, .NET 8, ASP.NET Core, Clean Architecture, Dapper, EF\n' +
        '<span class="t-dim">Front end</span>       Angular, Angular Material, TypeScript, RxJS, reactive forms\n' +
        '<span class="t-dim">Data</span>            SQL Server, T-SQL, stored procedures, query tuning, SSIS\n' +
        '<span class="t-dim">Integration</span>     Kafka (consumer), REST, JWT, role-based access\n' +
        '<span class="t-dim">Quality</span>         xUnit, NUnit, Moq, SonarQube, CI/CD\n' +
        '<span class="t-dim">Cloud & AI</span>      Azure (AZ-900, AI-900), Copilot, Devin, Spring AI (learning)'),
      experience: () => print(
        '<span class="t-y">2022–now</span>   Senior Software Engineer · Wells Fargo\n' +
        '<span class="t-y">2020–2022</span>  Software Engineer · Wells Fargo\n' +
        '<span class="t-y">2018–2019</span>  Integration Developer · CUNA Mutual Group\n' +
        '<span class="t-dim">earlier</span>    Infosys · Noble Idea Solution\n' + link(root + 'experience.html', 'Full timeline →')),
      contact: () => print(
        'email     ' + link('mailto:' + site.email, site.email) + '\n' +
        'linkedin  ' + link(site.linkedin, 'LinkedIn', true) + '\n' +
        'github    ' + link(site.github, site.github.replace('https://', ''), true) + '\n' +
        link(root + 'contact.html', 'Send a message →')),
      resume: () => { print('Downloading <span class="t-c">' + site.resume + '</span> …'); const a = document.createElement('a'); a.href = root + site.resume; a.download = ''; a.click(); },
      replay: () => replay(),
      clear: () => { stop(); out.innerHTML = ''; },
      ls: () => print('work/  experience  about  contact  resume.pdf'),
      'sudo hire pushkar': () => { print('<span class="t-ok">Permission granted.</span> Opening contact…'); later(() => { location.href = root + 'contact.html'; }, 900); },
    };
    const alias = { 'cat about.txt': 'whoami', about: 'whoami', work: 'projects', cls: 'clear', 'cv': 'resume', '?': 'help' };
    const history = []; let hi = 0;

    function exec(raw) {
      const text = raw.trim(); if (!text) return;
      stop(); prompt(text); history.push(text); hi = history.length;
      const key = text.toLowerCase().replace(/\s+/g, ' ');
      const fn = cmds[key] || cmds[alias[key]];
      if (fn) fn();
      else if (key.startsWith('sudo')) print('<span class="t-err">Nice try.</span> <span class="t-dim">Try</span> <span class="t-c">sudo hire pushkar</span>');
      else print('<span class="t-err">command not found:</span> ' + esc(text) + ' <span class="t-dim">· type</span> <span class="t-c">help</span>');
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); exec(cmd.value); cmd.value = ''; });
    cmd.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' && history.length) { e.preventDefault(); hi = Math.max(0, hi - 1); cmd.value = history[hi]; }
      else if (e.key === 'ArrowDown' && history.length) { e.preventDefault(); hi = Math.min(history.length, hi + 1); cmd.value = history[hi] || ''; }
      else if (e.key === 'Tab' && cmd.value) {
        const m = Object.keys(cmds).find((k) => k.startsWith(cmd.value.toLowerCase()));
        if (m) { e.preventDefault(); cmd.value = m; }
      }
    });
    document.querySelectorAll('[data-cmd]').forEach((b) => b.addEventListener('click', () => exec(b.dataset.cmd)));
    document.getElementById('term-replay').addEventListener('click', replay);
    out.addEventListener('click', (e) => { if (!e.target.closest('a') && !getSelection().toString()) cmd.focus({ preventScroll: true }); });
    replay();
  }

  /* ---------- Before / after slider ---------- */
  const cmp = document.getElementById('compare');
  if (cmp) {
    const range = cmp.querySelector('input');
    const set = (v) => { cmp.style.setProperty('--pos', v + '%'); range.setAttribute('aria-valuetext', v < 50 ? 'Mostly showing before: 1 hour 30 minutes' : 'Mostly showing after: 30 minutes'); };
    range.addEventListener('input', () => set(range.value));
    set(range.value);
    // A gentle sweep the first time it scrolls into view, to show it can be dragged.
    if (!reduce) {
      let touched = false;
      range.addEventListener('pointerdown', () => { touched = true; }, { once: true });
      range.addEventListener('keydown', () => { touched = true; }, { once: true });
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) return; io.disconnect();
        const t0 = performance.now(), from = 50;
        (function step(t) {
          if (touched) return;
          const p = Math.min(1, (t - t0) / 2400);
          const v = from + Math.sin(p * Math.PI * 2) * 32 * (1 - p);
          range.value = v; set(v.toFixed(1));
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      }, { threshold: 0.6 });
      io.observe(cmp);
    }
  }

  /* ---------- Live RAG diagram ---------- */
  const flow = document.getElementById('rag-flow');
  if (flow) {
    const note = document.getElementById('rag-note');
    const stages = [...flow.querySelectorAll('.stage')];
    let auto = null, idx = 0, userPicked = false;
    const show = (i) => {
      idx = i;
      stages.forEach((s, j) => { s.classList.toggle('on', j === i); s.setAttribute('aria-pressed', j === i); });
      note.innerHTML = '<b>' + stages[i].textContent + '.</b> ' + stages[i].dataset.note;
    };
    const stopAuto = () => { clearInterval(auto); auto = null; };
    const pick = (i) => { userPicked = true; stopAuto(); show(i); };
    stages.forEach((s, i) => {
      s.addEventListener('mouseenter', () => pick(i));
      s.addEventListener('focus', () => pick(i));
      s.addEventListener('click', () => pick(i));
    });
    show(0);
    if (!reduce) {
      const io = new IntersectionObserver((es) => {
        if (es[0].isIntersecting && !auto && !userPicked) auto = setInterval(() => show((idx + 1) % stages.length), 2400);
        else if (!es[0].isIntersecting) stopAuto();
      }, { threshold: 0.4 });
      io.observe(flow);
    }
  }
})();
