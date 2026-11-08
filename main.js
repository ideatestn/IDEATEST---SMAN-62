/* =====================================================================
   IDEATEST - main.js  (logika tampilan; TIDAK berisi konten)
   Konten diedit di data.js. File ini dimuat setelah data.js.
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CATS = ['Ekonomi', 'Politik/HI', 'Sosial-Budaya', 'Hukum/HAM', 'Teknologi/Lingkungan'];
const LVLS = ['Pemula', 'Menengah', 'Mahir'];
const TYPES = ['Kebijakan', 'Nilai', 'Pernyataan'];
const NAV = [['index.html', 'Beranda', 'fa-house'], ['edukasi.html', 'Edukasi', 'fa-book-open'], ['vault.html', 'Bank Mosi', 'fa-vault'], ['dokumentasi.html', 'Galeri', 'fa-photo-film'], ['pengurus.html', 'Pengurus', 'fa-users']];
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const totalMembers = () => COMMITTEE_DATA.flatMap((g) => g.subs.flatMap((s) => s.members)).length;
const galleryItems = () => (typeof GALLERY_DATA !== 'undefined' ? GALLERY_DATA : []).filter((g) => safeSrc(g.src));
const motionById = (id) => MOTIONS_DATA.find((m) => String(m.id) === String(id));
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Hanya izinkan path relatif lokal (img/, media/) atau embed YouTube. */
function safeSrc(s) {
  if (!s || typeof s !== 'string') return '';
  if (/^(img|media)\/[\w\-./ ]+$/i.test(s) && !s.includes('..')) return s;
  if (/^https:\/\/(www\.youtube(-nocookie)?\.com\/embed\/[\w-]+)(\?[\w=&-]*)?$/i.test(s)) return s;
  return '';
}

/* ---- tema terang/gelap ---- */
function syncTheme() {
  const dark = document.documentElement.classList.contains('dark');
  $$('.theme-btn').forEach((b) => { b.innerHTML = `<i class="fa-solid ${dark ? 'fa-moon' : 'fa-sun'}" aria-hidden="true"></i>`; b.setAttribute('aria-label', dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'); });
}
function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('ideatest-theme', dark ? 'dark' : 'light'); } catch (e) { /* abaikan */ }
  syncTheme();
}

/* ---- animasi muncul (dilewati bila reduced-motion atau IntersectionObserver tidak ada) ---- */
function reveal() {
  const els = $$('.reveal:not(.in-view), .rule:not(.in-view)');
  if (reduceMotion() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in-view')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }), { threshold: 0.08 });
  els.forEach((el) => io.observe(el));
}

/* ---- latar belakang tidak bisa diakses saat dialog/drawer terbuka ---- */
function setBackdropInert(on) {
  ['#main', '#footer-root', '.navbar'].forEach((s) => { const el = $(s); if (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  document.body.style.overflow = on ? 'hidden' : '';
}
const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,iframe,video[controls],[tabindex]:not([tabindex="-1"])';
function trapTab(e, box) {
  if (e.key !== 'Tab') return;
  const f = $$(FOCUSABLE, box).filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/* ---- dialog (galeri) ---- */
let lastFocus = null;
function modal(html, label) {
  let m = $('#modal');
  if (!m) {
    m = document.createElement('div'); m.id = 'modal'; m.className = 'modal'; m.hidden = true;
    m.innerHTML = '<div class="panel" role="dialog" aria-modal="true" aria-label="Detail"><button class="x" type="button" aria-label="Tutup"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button><div id="mbody"></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.x')) closeModal(); });
    m.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); else trapTab(e, m); });
  }
  lastFocus = document.activeElement;
  $('[role=dialog]', m).setAttribute('aria-label', label || 'Detail');
  $('#mbody').innerHTML = html;
  m.hidden = false; setBackdropInert(true);
  requestAnimationFrame(() => { m.classList.add('open'); $('.x', m).focus(); });
}
function closeModal() {
  const m = $('#modal'); if (!m || m.hidden) return;
  m.classList.remove('open'); m.hidden = true; $('#mbody').innerHTML = ''; setBackdropInert(false);
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

/* ---- navigasi & footer ---- */
function chrome() {
  const cur = location.pathname.split('/').pop() || 'index.html';
  const here = (h) => h === cur || (cur === 'mosi.html' && h === 'vault.html');
  const a = ([h, l]) => `<a href="${h}" class="nl ${here(h) ? 'on' : ''}" ${here(h) ? 'aria-current="page"' : ''}>${l}</a>`;
  const da = ([h, l, i]) => `<a href="${h}" class="nl ${here(h) ? 'on' : ''}" ${here(h) ? 'aria-current="page"' : ''}><i class="fa-solid ${i} w-8 acc" aria-hidden="true"></i>${l}</a>`;
  $('#nav-root').innerHTML = `
  <header class="navbar fixed top-3 inset-x-3 md:inset-x-8 z-40"><div class="grid grid-cols-[1fr_auto_1fr] items-center h-[4.5rem] px-4 md:px-8">
    <nav class="hidden md:flex gap-8" aria-label="Navigasi utama">${NAV.slice(0, 3).map(a).join('')}</nav>
    <button type="button" class="sq theme-btn md:hidden justify-self-start"></button>
    <a href="index.html" class="logo" aria-label="IDEATEST, ke beranda"><img class="logo-m" src="img/logo-128.png" alt="" width="44" height="44"><span><span class="logo-t">IDEATEST</span><span class="logo-s hidden sm:block">SMAN 62 JAKARTA</span></span></a>
    <div class="hidden md:flex gap-8 justify-end items-center"><nav class="flex gap-8" aria-label="Navigasi tambahan">${NAV.slice(3).map(a).join('')}</nav><button type="button" class="sq theme-btn"></button></div>
    <button type="button" id="burger" class="sq md:hidden justify-self-end" aria-label="Buka menu" aria-expanded="false" aria-controls="dpanel"><i class="fa-solid fa-bars" aria-hidden="true"></i></button>
  </div></header>
  <div id="drawer" class="md:hidden"><div id="dbg"></div><aside id="dpanel" role="dialog" aria-modal="true" aria-label="Menu"><button type="button" id="dclose" class="sq self-end mb-4" aria-label="Tutup menu"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button><nav aria-label="Menu seluler" class="flex flex-col">${NAV.map(da).join('')}</nav><button type="button" class="chip mt-8 self-start theme-btn" style="width:auto;height:auto"></button></aside></div>`;
  $$('.theme-btn').forEach((b) => b.addEventListener('click', toggleTheme));
  const dr = $('#drawer'), burger = $('#burger');
  const set = (open) => {
    dr.classList.toggle('open', open); burger.setAttribute('aria-expanded', String(open));
    ['#main', '#footer-root'].forEach((s) => { const el = $(s); if (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) $('#dclose').focus(); else if (dr.dataset.wasOpen) burger.focus();
    dr.dataset.wasOpen = open ? '1' : '';
  };
  burger.onclick = () => set(true); $('#dclose').onclick = () => set(false); $('#dbg').onclick = () => set(false);
  dr.addEventListener('keydown', (e) => { if (!dr.classList.contains('open')) return; if (e.key === 'Escape') set(false); else trapTab(e, $('#dpanel')); });
  syncTheme();
  const links = NAV.map(([h, l]) => `<a class="foot-l" href="${h}">${l}</a>`).join('');
  $('#footer-root').innerHTML = `
  <footer class="foot stone border-t text-center px-4 pt-16 pb-10" style="background:var(--bg-surface);border-color:var(--border-color)"><div class="rule mx-auto" style="opacity:1;transform:none;--gap:var(--bg-surface)"></div>
    <div class="logo justify-center mt-8"><img class="logo-m" src="img/logo-128.png" alt="" width="68" height="68" loading="lazy"><span class="logo-t text-xl">IDEATEST</span></div>
    <p class="acc font-bold mt-3">Membawa Suara, Mengukir Prestasi.</p>
    <p class="t-sub mt-2 text-sm">Indonesia Debate of Sixty Two<br>Ekstrakurikuler Debat SMAN 62 Jakarta</p>
    <nav class="foot-nav" aria-label="Tautan situs">${links}</nav>
    <div class="flex flex-wrap justify-center gap-3 mt-8 max-w-3xl mx-auto">${SOCIALS.map(([i, l, h, c]) => `<a class="social" href="${esc(h)}" target="_blank" rel="noopener noreferrer"><i class="${i} ${c}" aria-hidden="true"></i>${esc(l)}<span class="sr-only"> (buka di tab baru)</span></a>`).join('')}</div>
    <p class="meta mt-10">© 2026 IDEATEST SMAN 62 Jakarta</p></footer>`;
}

/* ======================= BERANDA ======================= */
function initIndex() {
  const g = galleryItems().length;
  const counts = { mosi: MOTIONS_DATA.length, pengurus: totalMembers(), divisi: COMMITTEE_DATA.length - 1, kuis: QUIZ_DATA.length };
  $$('[data-count]').forEach((e) => { e.textContent = counts[e.dataset.count]; });
  const gt = $('#galeri-teks'); if (gt) gt.textContent = g ? `${g} foto dan video kegiatan` : 'Belum ada dokumentasi yang diunggah';
  const rnd = $('#acak');
  if (rnd) rnd.addEventListener('click', (e) => { e.preventDefault(); location.href = `mosi.html?id=${MOTIONS_DATA[Math.floor(Math.random() * MOTIONS_DATA.length)].id}`; });
  const b = BRIEFING_DATA[0];
  $('#briefing').innerHTML = b
    ? `<span class="badge">${esc(b.tag)}</span>${b.date ? ` <span class="meta ml-2">${esc(b.date)}</span>` : ''}<h3 class="h-card text-2xl mt-5">${esc(b.title)}</h3><p class="t-sub mb-7">${esc(b.excerpt)}</p>
      <div class="flex flex-wrap items-center gap-x-8 gap-y-4"><a class="link" href="${esc(b.href)}">${esc(b.cta)} <i class="fa-solid fa-arrow-right text-xs ml-1" aria-hidden="true"></i></a>${b.related ? `<a class="link-q" href="${esc(b.related.href)}">${esc(b.related.label)}</a>` : ''}</div>`
    : '<p class="t-sub">Belum ada briefing.</p>';
}

/* ======================= EDUKASI ======================= */
function initEdukasi() {
  /* kartu A.R.E.L (flip) */
  $('#arel-grid').innerHTML = AREL_DATA.map((a, i) => `<div class="reveal flipwrap"><button type="button" class="flip" aria-pressed="false" aria-label="${esc(a.l)}: ${esc(a.t)}" aria-describedby="af${i}"><div class="flip-in">
    <div class="face front"><span class="letter" aria-hidden="true">${esc(a.l)}</span><h3 class="h-card mt-6">${esc(a.t)}</h3><p class="t-sub text-sm" id="af${i}">${esc(a.d)} ${esc(a.tip)}</p><p class="meta mt-auto pt-6"><i class="fa-solid fa-rotate mr-2 acc" aria-hidden="true"></i>Ketuk untuk melihat contoh</p></div>
    <div class="face back"><h3 class="h-card">Contoh ${esc(a.t)}</h3><p class="t-sub" id="ab${i}">${esc(a.x)}</p><p class="meta mt-auto pt-6"><i class="fa-solid fa-rotate-left mr-2 acc" aria-hidden="true"></i>Ketuk untuk kembali</p></div></div></button></div>`).join('');
  $$('#arel-grid .flip').forEach((b, i) => b.addEventListener('click', () => {
    const on = b.classList.toggle('on');
    b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-describedby', on ? `ab${i}` : `af${i}`);
    $('.front', b).setAttribute('aria-hidden', String(on)); $('.back', b).setAttribute('aria-hidden', String(!on));
  }));
  $$('#arel-grid .back').forEach((f) => f.setAttribute('aria-hidden', 'true'));

  /* contoh argumen lemah vs kuat */
  $('#arg-motion').textContent = ARG_EXAMPLE.motion;
  $('#arg-weak').innerHTML = `<p class="t-sub">“${esc(ARG_EXAMPLE.weak)}”</p><ul class="t-sub text-sm mt-4 space-y-2">${ARG_EXAMPLE.weakWhy.map((w) => `<li class="flex gap-3"><i class="fa-solid fa-xmark acc mt-1.5 text-xs" aria-hidden="true"></i><span>${esc(w)}</span></li>`).join('')}</ul>`;
  $('#arg-strong').innerHTML = `<dl class="arel-dl">${ARG_EXAMPLE.strong.map(([l, t]) => `<div><dt>${esc(l)}</dt><dd class="t-sub">${esc(t)}</dd></div>`).join('')}</dl>`;

  /* latihan A.R.E.L */
  const sel = $('#pr-motion'), q = new URLSearchParams(location.search).get('mosi');
  sel.innerHTML = MOTIONS_DATA.map((m) => `<option value="${m.id}">${esc(m.text.length > 90 ? m.text.slice(0, 88) + '…' : m.text)}</option>`).join('');
  if (q && motionById(q)) sel.value = q; else if (motionById(34)) sel.value = 34;
  const showMotion = () => { const m = motionById(sel.value); $('#pr-text').textContent = `“${m.text}”`; $('#pr-link').href = `mosi.html?id=${m.id}`; };
  sel.onchange = showMotion; showMotion();
  $('#pr-fields').innerHTML = AREL_CHECKS.map(([t, c], i) => `<div class="field"><label for="pf${i}"><b>${esc(AREL_DATA[i].l)}</b> ${esc(t)}</label><textarea id="pf${i}" rows="2" maxlength="600" placeholder="${esc(c)}"></textarea></div>`).join('');
  $('#pr-check').onclick = () => {
    const empty = AREL_CHECKS.findIndex((_, i) => !$(`#pf${i}`).value.trim());
    const out = $('#pr-out');
    if (empty >= 0) { out.innerHTML = `<p class="t-sub" role="alert">Isi bagian ${esc(AREL_CHECKS[empty][0])} dulu sebelum memeriksa.</p>`; $(`#pf${empty}`).focus(); return; }
    out.innerHTML = `<h4 class="font-bold mb-3">Periksa sendiri dengan kriteria ini</h4><ul class="checks">${AREL_CHECKS.map(([t, c], i) => `<li><label><input type="checkbox" class="pr-c"> <span><b>${esc(t)}:</b> ${esc(c)}</span></label></li>`).join('')}</ul><p class="meta mt-4" id="pr-score" aria-live="polite">0 dari ${AREL_CHECKS.length} kriteria kamu centang. Tulisanmu tidak dikirim atau disimpan.</p>`;
    $$('.pr-c', out).forEach((c) => c.addEventListener('change', () => { $('#pr-score').textContent = `${$$('.pr-c:checked', out).length} dari ${AREL_CHECKS.length} kriteria kamu centang. Tulisanmu tidak dikirim atau disimpan.`; }));
  };
  $('#pr-reset').onclick = () => { $$('#pr-fields textarea').forEach((t) => { t.value = ''; }); $('#pr-out').innerHTML = ''; };

  /* latihan sanggahan */
  $('#rb-claim').textContent = REBUT_DATA.claim;
  $('#rb-opts').innerHTML = REBUT_DATA.opts.map(([t], i) => `<button type="button" class="opt" data-i="${i}">${esc(t)}</button>`).join('');
  $('#rb-opts').onclick = (e) => {
    const b = e.target.closest('.opt'); if (!b) return; const i = +b.dataset.i;
    $$('#rb-opts .opt').forEach((o) => { o.classList.remove('good', 'bad'); o.removeAttribute('aria-current'); });
    b.classList.add(i === REBUT_DATA.best ? 'good' : 'bad');
    $('#rb-out').innerHTML = `<p class="t-sub"><b>${i === REBUT_DATA.best ? 'Tepat. ' : 'Belum tepat. '}</b>${esc(REBUT_DATA.opts[i][1])}</p>${i === REBUT_DATA.best ? '' : `<p class="t-sub mt-2">Jawaban terkuat: “${esc(REBUT_DATA.opts[REBUT_DATA.best][0])}”</p>`}`;
  };

  /* cek pemahaman */
  const quiz = $('#quiz'); let answered = 0, right = 0;
  quiz.innerHTML = QUIZ_DATA.map((q, qi) => `<fieldset class="qz"><legend><span class="meta">Pertanyaan ${qi + 1} dari ${QUIZ_DATA.length}</span><br>${esc(q.q)}</legend>${q.o.map((o, oi) => `<label class="qo"><input type="radio" name="q${qi}" value="${oi}"> <span>${esc(o)}</span></label>`).join('')}<div class="qw" id="qw${qi}" aria-live="polite"></div></fieldset>`).join('');
  quiz.addEventListener('change', (e) => {
    const r = e.target.closest('input[type=radio]'); if (!r) return;
    const qi = +r.name.slice(1), q = QUIZ_DATA[qi], ok = +r.value === q.a;
    const fs = r.closest('fieldset'); if (fs.dataset.done) return; fs.dataset.done = '1';
    $$('input', fs).forEach((x) => { x.disabled = true; });
    $$('.qo', fs).forEach((l, i) => { if (i === q.a) l.classList.add('good'); else if (i === +r.value) l.classList.add('bad'); });
    $(`#qw${qi}`).innerHTML = `<p class="t-sub text-sm"><b>${ok ? 'Benar. ' : 'Belum tepat. '}</b>${esc(q.why)}</p>`;
    answered++; if (ok) right++;
    $('#quiz-score').textContent = `Terjawab ${answered} dari ${QUIZ_DATA.length}. Benar: ${right}. Skor hanya berlaku di sesi ini dan tidak disimpan.`;
  });
  $('#quiz-reset').onclick = () => { answered = 0; right = 0; $$('fieldset', quiz).forEach((f) => { delete f.dataset.done; $$('input', f).forEach((x) => { x.disabled = false; x.checked = false; }); $$('.qo', f).forEach((l) => l.classList.remove('good', 'bad')); $('.qw', f).innerHTML = ''; }); $('#quiz-score').textContent = `Terjawab 0 dari ${QUIZ_DATA.length}.`; };
  $('#quiz-score').textContent = `Terjawab 0 dari ${QUIZ_DATA.length}.`;

  /* tab pembicara (ARIA lengkap, panah kiri/kanan) */
  $('#ap-note').textContent = FORMAT_NOTE;
  const tabs = $('#ap-tabs'), panel = $('#ap-panel'), keys = Object.keys(AP_DATA);
  tabs.innerHTML = keys.map((k) => `<button type="button" class="chip" role="tab" id="tab-${k}" aria-controls="ap-panel" data-k="${k}"><i class="fa-solid ${AP_DATA[k].icon} mr-2" aria-hidden="true"></i>${esc(AP_DATA[k].label)}</button>`).join('');
  const show = (k, focus) => {
    $$('.chip', tabs).forEach((t) => { const on = t.dataset.k === k; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
    panel.setAttribute('aria-labelledby', `tab-${k}`);
    panel.innerHTML = AP_DATA[k].roles.map(([t, r, d]) => `<article class="col reveal"><span class="badge">${esc(t)}</span><h3 class="h-card mt-4">${esc(r)}</h3><ul class="t-sub text-sm space-y-2 mt-3">${d.map((x) => `<li class="flex gap-3"><i class="fa-solid fa-check acc mt-1.5 text-xs" aria-hidden="true"></i><span>${esc(x)}</span></li>`).join('')}</ul></article>`).join('');
    reveal();
  };
  tabs.addEventListener('click', (e) => { const t = e.target.closest('.chip'); if (t) show(t.dataset.k); });
  tabs.addEventListener('keydown', (e) => {
    const i = keys.indexOf(document.activeElement.dataset.k); if (i < 0) return;
    const go = { ArrowRight: (i + 1) % keys.length, ArrowLeft: (i + keys.length - 1) % keys.length, Home: 0, End: keys.length - 1 }[e.key];
    if (go !== undefined) { e.preventDefault(); show(keys[go], true); }
  });
  show('aff');
}

/* ======================= BANK MOSI ======================= */
function initVault() {
  const g = $('#vault-grid');
  if (typeof MOTIONS_DATA === 'undefined') { g.innerHTML = '<div class="slab p-10 text-center md:col-span-2 lg:col-span-3"><p class="t-sub" role="alert">Data mosi gagal dimuat. Muat ulang halaman, atau hubungi admin bila masalah berlanjut.</p></div>'; return; }
  const P = new URLSearchParams(location.search);
  const st = { q: P.get('q') || '', cat: CATS.includes(P.get('cat')) ? P.get('cat') : '', lvl: LVLS.includes(P.get('lvl')) ? P.get('lvl') : '', type: TYPES.includes(P.get('tipe')) ? P.get('tipe') : '' };
  $('#q').value = st.q;
  $('#f-lvl').innerHTML = '<option value="">Semua tingkat</option>' + LVLS.map((x) => `<option>${x}</option>`).join(''); $('#f-lvl').value = st.lvl;
  $('#f-type').innerHTML = '<option value="">Semua jenis</option>' + TYPES.map((x) => `<option>${x}</option>`).join(''); $('#f-type').value = st.type;
  const match = (m, skip) => {
    if (skip !== 'cat' && st.cat && m.cat !== st.cat) return false;
    if (st.lvl && m.lvl !== st.lvl) return false;
    if (st.type && m.type !== st.type) return false;
    const hay = norm(`${m.text} ${m.cat} ${m.lvl} ${m.type}`), words = hay.split(/[^a-z0-9]+/);
    return norm(st.q).split(/\s+/).filter(Boolean).every((t) => (t.length <= 2 ? words.some((w) => w.startsWith(t)) : hay.includes(t)));
  };
  const active = () => st.q || st.cat || st.lvl || st.type;
  const draw = () => {
    const list = MOTIONS_DATA.filter((m) => match(m));
    $('#chips').innerHTML = [['', 'Semua']].concat(CATS.map((c) => [c, c])).map(([v, l]) => {
      const n = MOTIONS_DATA.filter((m) => match(m, 'cat') && (!v || m.cat === v)).length;
      return `<button type="button" class="chip ${st.cat === v ? 'on' : ''}" data-c="${esc(v)}" aria-pressed="${st.cat === v}">${esc(l)} <span class="cnt">${n}</span></button>`;
    }).join('');
    $('#counter').innerHTML = `Menampilkan <span>${list.length}</span> dari ${MOTIONS_DATA.length} mosi`;
    $('#reset').hidden = !active();
    g.innerHTML = list.length ? list.map((m) => `<a class="slab reveal text-left p-7 flex flex-col gap-6" href="mosi.html?id=${m.id}">
      <span class="flex items-center justify-between gap-3 w-full"><span class="badge">${esc(m.cat)}</span><span class="lvl"><i class="fa-solid fa-layer-group mr-1" aria-hidden="true"></i>${esc(m.lvl)}</span></span>
      <span class="h-card !mb-0 flex-1 block">“${esc(m.text)}”</span><span class="meta">${esc(m.type)}</span><span class="mini"><i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i>Lihat bedah mosi<span class="sr-only">: ${esc(m.text)}</span></span></a>`).join('')
      : '<div class="slab text-center p-12 md:col-span-2 lg:col-span-3"><i class="fa-solid fa-folder-open text-4xl acc mb-4" aria-hidden="true"></i><p class="t-sub font-semibold">Tidak ada mosi yang cocok dengan pencarian atau filter ini.</p><button type="button" class="btn mt-6" id="reset2">Reset filter</button></div>';
    const p = new URLSearchParams(); if (st.q) p.set('q', st.q); if (st.cat) p.set('cat', st.cat); if (st.lvl) p.set('lvl', st.lvl); if (st.type) p.set('tipe', st.type);
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
    reveal();
  };
  const reset = () => { st.q = st.cat = st.lvl = st.type = ''; $('#q').value = ''; $('#f-lvl').value = ''; $('#f-type').value = ''; draw(); };
  $('#chips').onclick = (e) => { const b = e.target.closest('.chip'); if (!b) return; st.cat = b.dataset.c; draw(); };
  $('#q').oninput = (e) => { st.q = e.target.value.trim(); draw(); };
  $('#f-lvl').onchange = (e) => { st.lvl = e.target.value; draw(); };
  $('#f-type').onchange = (e) => { st.type = e.target.value; draw(); };
  $('#reset').onclick = reset; g.addEventListener('click', (e) => { if (e.target.closest('#reset2')) reset(); });
  draw();
}

/* ======================= DETAIL MOSI ======================= */
function initMosi() {
  const root = $('#mosi-root'), id = new URLSearchParams(location.search).get('id'), m = id && motionById(id);
  if (!m) {
    document.title = 'Mosi tidak ditemukan | IDEATEST SMAN 62 Jakarta';
    root.innerHTML = '<div class="slab p-10 text-center"><h1 class="h-title !text-3xl">Mosi tidak ditemukan</h1><p class="t-sub mt-4">Tautan ini tidak cocok dengan mosi mana pun di Bank Mosi.</p><a class="btn mt-8" href="vault.html">Kembali ke Bank Mosi</a></div>'; return;
  }
  document.title = `${m.text.length > 70 ? m.text.slice(0, 68) + '…' : m.text} | Bank Mosi IDEATEST`;
  const md = $('meta[name=description]'); if (md) md.content = `Bedah mosi: ${m.text}`;
  const a = MOTION_ANALYSIS_DATA[m.id] || {};
  const sec = (title, icon, tag, body, open) => `<details class="dt" ${open ? 'open' : ''}><summary><i class="fa-solid ${icon}" aria-hidden="true"></i><span>${title}</span><em class="tag">${tag}</em></summary><div class="dt-b">${body}</div></details>`;
  const list = (arr) => `<ul class="t-sub list-disc pl-5 space-y-2">${arr.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
  const parts = [];
  if (a.d) parts.push(sec('Definisi & parameter', 'fa-book', 'Usulan framing', `<p class="t-sub">${esc(a.d)}</p>${m.type === 'Pernyataan' ? '<p class="note mt-4">Mosi ini berbentuk pernyataan. Pembicara pertama perlu membingkainya menjadi posisi yang jelas (misalnya apa yang akan dilakukan atau dinilai Dewan) sebelum argumen dibangun.</p>' : ''}`, true));
  if (a.bg) parts.push(sec('Latar belakang & status quo', 'fa-landmark', 'Fakta · perlu verifikasi', `<p class="t-sub">${esc(a.bg)}</p>`, true));
  if (a.aff || a.opp) parts.push(`<div class="grid md:grid-cols-2 gap-x-6">${a.aff ? sec('Kasus Afirmasi', 'fa-thumbs-up', 'Argumen hipotetis', `<p class="t-sub">${esc(a.aff)}</p>`, true) : ''}${a.opp ? sec('Kasus Oposisi', 'fa-thumbs-down', 'Argumen hipotetis', `<p class="t-sub">${esc(a.opp)}</p>`, true) : ''}</div>`);
  if (a.clash && a.clash.length) parts.push(sec('Titik clash & sanggahan', 'fa-bolt', 'Interpretasi debat', `${list(a.clash)}<p class="t-sub mt-4">Untuk tiap titik, siapkan sanggahan dari sisi tim kamu. <a class="link-q" href="edukasi.html#clash">Pelajari cara menyanggah dan menganalisis clash</a>.</p>`, false));
  const checks = a.check && a.check.length ? `<p class="t-sub mb-3">Sebelum memakai klaim faktual untuk mosi ini, periksa:</p>${list(a.check)}` : '<p class="t-sub">Belum ada daftar verifikasi untuk mosi ini. Anggap semua klaim faktual belum diverifikasi.</p>';
  const refs = a.refs && a.refs.length ? `<ul class="t-sub space-y-2 mt-4">${a.refs.filter((r) => /^https?:\/\//.test(r.url || '')).map((r) => `<li><a class="link-q" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.title)}</a>${r.date ? ` <span class="meta">(${esc(r.date)})</span>` : ''}</li>`).join('')}</ul>` : '<p class="t-sub mt-4 text-sm">Belum ada sumber yang ditautkan untuk mosi ini.</p>';
  parts.push(sec('Perlu diverifikasi & referensi', 'fa-clipboard-check', 'Cek sumber', checks + refs, true));
  const rel = (a.rel || []).map(motionById).filter(Boolean);
  const same = MOTIONS_DATA.filter((x) => x.cat === m.cat && x.id !== m.id && !rel.includes(x)).slice(0, Math.max(0, 3 - rel.length));
  const related = rel.concat(same).slice(0, 3);
  const idx = MOTIONS_DATA.indexOf(m), prev = MOTIONS_DATA[idx - 1], next = MOTIONS_DATA[idx + 1];
  const nav = (x, l, ic) => x ? `<a class="slab p-5 flex-1 ${l === 'Berikutnya' ? 'text-right' : ''}" href="mosi.html?id=${x.id}"><span class="meta block">${ic ? '' : ''}${l}</span><span class="t-sub text-sm block mt-1 line-clamp">${esc(x.text)}</span></a>` : '<span class="flex-1"></span>';
  root.innerHTML = `
    <nav class="crumb" aria-label="Jejak halaman"><a href="vault.html">Bank Mosi</a><i class="fa-solid fa-angle-right" aria-hidden="true"></i><span aria-current="page">${esc(m.cat)}</span></nav>
    <div class="flex gap-3 items-center flex-wrap mt-6"><span class="badge">${esc(m.cat)}</span><span class="lvl"><i class="fa-solid fa-layer-group mr-1" aria-hidden="true"></i>${esc(m.lvl)}</span><span class="meta">· ${esc(m.type)}</span></div>
    <h1 class="mosi-h">“${esc(m.text)}”</h1>
    <div class="flex flex-wrap items-center gap-x-6 gap-y-4 mt-8"><a class="btn" href="edukasi.html?mosi=${m.id}#latihan"><i class="fa-solid fa-pen-ruler" aria-hidden="true"></i>Latih dengan A.R.E.L</a><a class="link" href="edukasi.html#arel">Pelajari metode A.R.E.L</a><button type="button" class="link-q bare" id="copy">Salin tautan mosi</button><span id="copied" class="meta" role="status"></span></div>
    <p class="note mt-10"><i class="fa-solid fa-circle-info acc mr-2" aria-hidden="true"></i>${esc(ANALYSIS_NOTE)}</p>
    <div class="mt-8 space-y-4">${parts.join('')}</div>
    ${related.length ? `<section class="mt-16" aria-labelledby="rel-h"><h2 class="h-sec !text-xl" id="rel-h">Mosi terkait</h2><div class="grid md:grid-cols-3 gap-6 mt-6">${related.map((x) => `<a class="slab p-6 block" href="mosi.html?id=${x.id}"><span class="badge">${esc(x.cat)}</span><span class="h-card !text-base mt-4 block line-clamp">“${esc(x.text)}”</span></a>`).join('')}</div></section>` : ''}
    <div class="flex gap-4 mt-12 flex-col sm:flex-row">${nav(prev, 'Sebelumnya')}${nav(next, 'Berikutnya')}</div>`;
  $('#copy').onclick = async () => {
    const url = location.href, out = $('#copied');
    try { await navigator.clipboard.writeText(url); out.textContent = 'Tautan disalin.'; }
    catch (e) { out.textContent = 'Salin manual dari bilah alamat.'; }
    setTimeout(() => { out.textContent = ''; }, 2500);
  };
  reveal();
}

/* ======================= GALERI ======================= */
function initGallery() {
  const items = galleryItems(), grid = $('#gallery-grid');
  if (!items.length) {
    grid.className = '';
    grid.innerHTML = `<div class="slab empty p-10 md:p-14 text-center max-w-2xl mx-auto"><div class="tile mx-auto mb-6"><i class="fa-solid fa-camera" aria-hidden="true"></i></div><h2 class="h-card text-2xl">Dokumentasi belum diunggah</h2><p class="t-sub mt-3">Foto dan video kegiatan IDEATEST akan ditampilkan di sini setelah dokumentasi resmi disetujui untuk dipublikasikan.</p><div class="flex flex-wrap justify-center gap-x-8 gap-y-4 mt-8"><a class="link" href="https://www.instagram.com/ideatest62/" target="_blank" rel="noopener noreferrer">Ikuti @ideatest62 di Instagram<span class="sr-only"> (buka di tab baru)</span></a><a class="link-q" href="pengurus.html">Kenali pengurus</a></div></div>`;
    return;
  }
  const embed = (s) => /youtube/.test(s);
  const alt = (it) => esc(it.alt || it.title || 'Dokumentasi IDEATEST');
  const fail = 'onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'nodata\',textContent:\'Media tidak dapat dimuat\'}))"';
  const full = (it) => it.type === 'video' ? (embed(it.src) ? `<iframe src="${esc(it.src)}" allowfullscreen title="${alt(it)}"></iframe>` : `<video src="${esc(it.src)}" controls preload="metadata"></video>`) : `<img src="${esc(it.src)}" alt="${alt(it)}" ${fail}>`;
  const thumb = (it) => it.type === 'video' ? `<div class="nodata"><i class="fa-solid fa-video" aria-hidden="true"></i></div><span class="play" aria-hidden="true"><i class="fa-solid fa-circle-play"></i></span>` : `<img src="${esc(it.src)}" alt="${alt(it)}" loading="lazy" decoding="async" ${fail}>`;
  grid.innerHTML = items.map((it, i) => `<div class="reveal"><button type="button" class="gal block w-full text-left" data-i="${i}" aria-haspopup="dialog" aria-label="Buka ${esc(it.title || 'dokumentasi')}"><div class="matte"><div class="frame">${thumb(it)}</div></div>
    <div class="mt-5 flex items-center gap-3 flex-wrap"><span class="badge">${esc(it.tag || (it.type === 'video' ? 'Video' : 'Foto'))}</span>${it.date ? `<span class="meta">${esc(it.date)}</span>` : ''}</div>
    <h3 class="h-card mt-3 mb-0">${esc(it.title || '')}</h3></button></div>`).join('');
  grid.onclick = (e) => {
    const b = e.target.closest('[data-i]'); if (!b) return; const it = items[b.dataset.i];
    modal(`<div class="frame" style="aspect-ratio:16/10;border-radius:0">${full(it)}</div><div class="p-6 md:p-8"><div class="flex gap-3 items-center flex-wrap">${it.tag ? `<span class="badge">${esc(it.tag)}</span>` : ''}${it.date ? `<span class="meta">${esc(it.date)}</span>` : ''}</div><h2 class="h-card text-xl mt-3">${esc(it.title || '')}</h2>${it.desc ? `<p class="t-sub">${esc(it.desc)}</p>` : ''}</div>`, it.title);
  };
  reveal();
}

/* ======================= PENGURUS ======================= */
function initOrg() {
  const f = (k) => COMMITTEE_DATA.find((x) => x.group.startsWith(k));
  const isLead = (r) => /^(Ketua|Koordinator)/.test(r);
  const person = (m, tag = 'li') => `<${tag} class="slab person reveal ${isLead(m.r) ? 'lead' : ''}"><div class="tile" aria-hidden="true"><i class="fa-solid ${esc(m.i || 'fa-user')}"></i></div><div class="min-w-0"><p class="pname">${esc(m.n)}</p><p class="prole">${esc(m.r)}</p><p class="pclass">Kelas ${esc(m.k)}</p></div></${tag}>`;
  const division = (g, n) => {
    const [t, sub] = g.group.split(' (');
    return `<section aria-labelledby="dv${n}"><div class="div-h reveal"><div class="tile mx-auto mb-4" aria-hidden="true"><i class="fa-solid ${esc(g.icon)}"></i></div><h2 class="h-card text-lg !mb-1" id="dv${n}">${esc(t)}</h2>${sub ? `<p class="meta">${esc(sub.replace(')', ''))}</p>` : ''}</div>
      ${g.subs.map((s) => `${s.name ? `<h3 class="sub-h">${esc(s.name)}</h3>` : ''}<ul class="grid gap-5 plist">${s.members.map((m) => person(m)).join('')}</ul>`).join('')}</section>`;
  };
  const core = f('Pengurus Inti').subs[0].members;
  $('#org').innerHTML = `
    <section aria-labelledby="inti"><h2 class="sub-h !mt-0" id="inti">Pengurus Inti</h2><div class="org-top"><ul class="max-w-sm w-full plist">${person(core[0])}</ul><div class="vline" aria-hidden="true"></div>
      <ul class="pair plist">${core.slice(1).map((m) => `<li class="pc"><ul class="plist">${person(m)}</ul></li>`).join('')}</ul></div></section>
    <div class="rule mx-auto my-20"></div>
    <div class="grid lg:grid-cols-3 gap-12 items-start">${division(f('Divisi Perlombaan'), 1)}${division(f('Divisi Diklat'), 2)}${division(f('Divisi PDD'), 3)}</div>
    <p class="meta text-center mt-20">Total <span>${totalMembers()}</span> pengurus periode ${esc(COMMITTEE_PERIOD)}</p>`;
  reveal();
}

document.addEventListener('DOMContentLoaded', () => {
  if (typeof MOTIONS_DATA === 'undefined') { /* data.js gagal dimuat */ }
  chrome();
  if ($('#briefing')) initIndex();
  if ($('#arel-grid')) initEdukasi();
  if ($('#vault-grid')) initVault();
  if ($('#mosi-root')) initMosi();
  if ($('#gallery-grid')) initGallery();
  if ($('#org')) initOrg();
  reveal();
});
