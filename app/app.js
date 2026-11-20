// Leonida 55 v2 — GTA VI trophy guide and tracker. Plain ES module, no libraries.
// Runtime network use: none. The only fetch is this app's own data/trophies.json.
const KEY = 'leonida55-v2';
const DATA = 'data/trophies.json';

// The five trophies PlayStation tracks with a number (label, target, trophy id).
const METERS = [
  { key: 'stunts', label: 'Stunts', target: 250, trophy: 15 },
  { key: 'range', label: 'Shooting Range gold medals', target: 42, trophy: 17 },
  { key: 'waink', label: 'WAiNK It locations', target: 100, trophy: 31 },
  { key: 'vehicles', label: 'Vehicles discovered', target: 100, trophy: 35 },
  { key: 'challenges', label: 'Challenges completed', target: 50, trophy: 32 },
];

const KIND_LIST = [
  ['all', 'All kinds'],
  ['story', 'Story'],
  ['activity', 'Activities'],
  ['collectible', 'Collectibles'],
  ['crime', 'Crime'],
  ['exploration', 'Exploration'],
  ['money', 'Money'],
  ['misc', 'Misc'],
  ['completion', 'Completion'],
  ['platinum', 'Platinum'],
];

const ROADMAP = {
  1: { title: 'Stage 1 — Story first', hours: 'About 50–60 hours', text: 'Play the story through. Chapter trophies, named missions and the five side-character strands all land here.' },
  2: { title: 'Stage 2 — Open-world sweep', hours: 'About 60–80 hours', text: 'Activities, races, exploration, crime and the one possibly-missable trophy. Do the meditation spots as you find them.' },
  3: { title: 'Stage 3 — Collectibles', hours: 'About 20–30 hours', text: 'Cards, WAiNK It check-ins and vehicle discovery. Slow and steady, best done while sweeping the map.' },
  4: { title: 'Stage 4 — Money and 100%', hours: 'About 20–30 hours', text: 'Launder the marked bills, spend across the shops, buy the garages, then close out the 100% checklist.' },
  5: { title: 'Stage 5 — Cryptic and platinum', hours: 'A few hours, plus waiting on guides', text: 'The cryptic hidden trophies, whose methods launch-day guides had not confirmed yet, and the platinum itself.' },
};

const el = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

let all = [];
let saved = readSaved();

function readSaved() {
  const blank = { earned: [], notes: {}, counters: {}, spoiler: true, selected: 15, page: 'checklist', kind: 'all', grade: 'all', query: '', missableOnly: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank;
    const parsed = JSON.parse(raw);
    return { ...blank, ...parsed, notes: parsed.notes ?? {}, counters: parsed.counters ?? {} };
  } catch {
    return blank;
  }
}

function store() {
  localStorage.setItem(KEY, JSON.stringify(saved));
}

function find(id) {
  return all.find((t) => t.id === id);
}

function earnedIds() {
  return new Set(saved.earned);
}

function hiddenFromView(t) {
  return t.hidden && saved.spoiler && !earnedIds().has(t.id);
}

function meterFor(trophyId) {
  return METERS.find((m) => m.trophy === trophyId) ?? null;
}

function passesFilters(t) {
  if (saved.kind !== 'all' && t.kind !== saved.kind) return false;
  if (saved.grade !== 'all' && t.grade !== saved.grade) return false;
  if (saved.missableOnly && !t.missable) return false;
  if (saved.query) {
    const q = saved.query.toLowerCase();
    if (!`${t.name} ${t.description} ${t.guide}`.toLowerCase().includes(q)) return false;
  }
  return true;
}

function drawScoreboard() {
  const done = earnedIds();
  el('earnedNumber').textContent = String(done.size);
  el('meterFill').style.width = `${(done.size / all.length) * 100}%`;
  const perGrade = {};
  for (const t of all) perGrade[t.grade] = (perGrade[t.grade] ?? 0) + (done.has(t.id) ? 1 : 0);
  el('gradeLine').innerHTML = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `<span>${cap(g)} ${perGrade[g] ?? 0}/${all.filter((t) => t.grade === g).length}</span>`)
    .join('');
  const left = all.length - done.size;
  el('remainingLine').textContent = left === 0
    ? 'Platinum earned — Vice Got a Price! is yours.'
    : `${left} ${left === 1 ? 'trophy' : 'trophies'} left until the platinum.`;
}

function drawKinds() {
  el('kindRow').innerHTML = KIND_LIST.map(([key, label]) =>
    `<button type="button" data-kind="${key}" class="${saved.kind === key ? 'current' : ''}">${label}</button>`).join('');
  el('kindRow').querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => { saved.kind = b.dataset.kind; store(); drawKinds(); drawChecklist(); }));
}

function drawNextUp() {
  const done = earnedIds();
  const rest = all
    .filter((t) => !done.has(t.id) && t.id !== 1)
    .sort((a, b) => a.stage - b.stage || a.id - b.id)
    .slice(0, 5);
  if (rest.length === 0) {
    el('nextStrip').innerHTML = '<b>Next up:</b> nothing left — the platinum is yours.';
    return;
  }
  el('nextStrip').innerHTML = `<b>Next up:</b> ${rest.map((t) =>
    `<button type="button" data-next="${t.id}" title="Mark earned">#${t.id} ${esc(hiddenFromView(t) ? 'Hidden trophy' : t.name)}</button>`).join('')} — tap one to tick it off.`;
  el('nextStrip').querySelectorAll('[data-next]').forEach((b) =>
    b.addEventListener('click', () => flipEarned(Number(b.dataset.next))));
}

function drawChecklist() {
  const done = earnedIds();
  const list = el('checklist');
  list.innerHTML = '';
  const visible = all.filter(passesFilters);
  el('countNote').textContent = `Showing ${visible.length} of ${all.length} trophies — ${done.size} earned. Tick a box to save your progress in this browser.`;
  el('noResults').hidden = visible.length !== 0;
  for (const t of visible) {
    const li = document.createElement('li');
    if (done.has(t.id)) li.classList.add('done');
    if (saved.selected === t.id) li.classList.add('picked');
    const masked = hiddenFromView(t);
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = done.has(t.id);
    box.setAttribute('aria-label', `Earned: ${masked ? 'hidden trophy' : t.name}`);
    box.addEventListener('change', (e) => { e.stopPropagation(); flipEarned(t.id); });
    const mid = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tname';
    name.innerHTML = `<span class="tnum">#${t.id}</span>${masked ? '<span class="masked">Hidden trophy — earn it to reveal</span>' : esc(t.name)}`;
    const desc = document.createElement('div');
    desc.className = 'tdesc';
    desc.textContent = masked ? 'Hidden on PlayStation until earned.' : t.description;
    const tags = document.createElement('div');
    tags.className = 'ttags';
    tags.innerHTML = `<span class="pill">${cap(t.kind)}</span>`
      + (t.hidden ? '<span class="pill grey">Hidden</span>' : '')
      + (t.missable ? '<span class="pill alert">Possibly missable</span>' : '')
      + (t.count != null ? `<span class="pill num">PSN count: ${t.count.toLocaleString('en-US')}</span>` : '')
      + `<span class="pill">Stage ${t.stage}</span>`;
    mid.append(name, desc, tags);
    const grade = document.createElement('div');
    grade.className = `glabel ${t.grade}`;
    grade.textContent = cap(t.grade);
    li.append(box, mid, grade);
    li.addEventListener('click', (e) => {
      if (e.target === box) return;
      saved.selected = t.id;
      store();
      drawChecklist();
      drawDetail();
    });
    list.append(li);
  }
}

function flipEarned(id) {
  const done = new Set(saved.earned);
  if (done.has(id)) done.delete(id);
  else done.add(id);
  saved.earned = [...done].sort((a, b) => a - b);
  store();
  drawScoreboard();
  drawNextUp();
  drawChecklist();
  drawDetail();
  if (saved.page !== 'checklist') goTo(saved.page);
}

function drawDetail() {
  const pane = el('detailPane');
  const t = find(saved.selected) ?? all[0];
  if (!t) { pane.innerHTML = ''; return; }
  const done = earnedIds();
  if (hiddenFromView(t)) {
    pane.innerHTML = `
      <span class="pill grey">Hidden trophy #${t.id}</span>
      <h2>Hidden trophy</h2>
      <p class="odesc">Hidden on PlayStation until earned.</p>
      <p>Spoiler-safe mode is on, so this trophy stays masked until you earn it. Its name, description and guide are hidden on purpose.</p>
      <div class="btnrow">
        <button type="button" id="earnedReveal">I earned it — reveal</button>
        <button type="button" class="plain" id="spoilerOff">Turn spoiler-safe off</button>
      </div>`;
    el('earnedReveal').addEventListener('click', () => flipEarned(t.id));
    el('spoilerOff').addEventListener('click', () => {
      saved.spoiler = false; el('spoilerSafe').checked = false; store(); drawChecklist(); drawDetail();
    });
    return;
  }
  const meter = meterFor(t.id);
  const meterHtml = meter
    ? `<h3>Your progress</h3><p class="progline"><input type="number" id="meterInput" min="0" max="${meter.target}" value="${saved.counters[meter.key] ?? 0}"> of ${meter.target} ${esc(meter.label.toLowerCase())} — ${Math.min(100, Math.round(((saved.counters[meter.key] ?? 0) / meter.target) * 100))}%</p>`
    : (t.count != null ? `<h3>Your progress</h3><p class="progline">PSN tracks this one to ${t.count.toLocaleString('en-US')}. Tick the box above when it pops.</p>` : '');
  const note = saved.notes[t.id] ?? '';
  pane.innerHTML = `
    <span class="glabel ${t.grade}">${cap(t.grade)}</span>
    <span class="pill">${cap(t.kind)}</span>
    ${t.hidden ? '<span class="pill grey">Hidden</span>' : ''}
    ${t.missable ? '<span class="pill alert">Possibly missable</span>' : ''}
    <h2>#${t.id} ${esc(t.name)}</h2>
    <p class="odesc">Official description: “${esc(t.description)}”</p>
    <h3>Guide</h3>
    <p>${esc(t.guide)}</p>
    ${t.missable ? '<p class="alertbox"><b>Missable watch:</b> the only trophy any guide flags as possibly missable (PowerPyx / GTABase, unconfirmed). Meditate at each spot as you find it and keep a manual save before big missions.</p>' : ''}
    <h3>Sources</h3>
    <p class="cite">${esc(t.sources)}</p>
    ${meterHtml}
    <h3>Your note</h3>
    <textarea id="noteBox" placeholder="Your own note for this trophy — where you are up to, what to try next…">${esc(note)}</textarea>
    <div class="btnrow">
      <button type="button" id="markToggle">${done.has(t.id) ? 'Mark as not earned' : 'Mark as earned'}</button>
      <button type="button" class="plain" id="stepBack">Previous trophy</button>
      <button type="button" class="plain" id="stepFwd">Next trophy</button>
    </div>`;
  el('markToggle').addEventListener('click', () => flipEarned(t.id));
  el('stepBack').addEventListener('click', () => stepTrophy(-1));
  el('stepFwd').addEventListener('click', () => stepTrophy(1));
  el('noteBox').addEventListener('input', (e) => {
    saved.notes[t.id] = e.target.value;
    store();
  });
  const input = el('meterInput');
  if (input) {
    input.addEventListener('change', () => {
      saved.counters[meter.key] = Math.max(0, Math.min(meter.target, Number(input.value) || 0));
      store();
      drawDetail();
    });
  }
}

function stepTrophy(direction) {
  const index = all.findIndex((t) => t.id === saved.selected);
  const next = all[(index + direction + all.length) % all.length];
  saved.selected = next.id;
  store();
  drawChecklist();
  drawDetail();
}

function drawRoadmap() {
  const done = earnedIds();
  const cards = [1, 2, 3, 4, 5].map((n) => {
    const list = all.filter((t) => t.stage === n).sort((a, b) => a.id - b.id);
    const got = list.filter((t) => done.has(t.id)).length;
    const pct = Math.round((got / list.length) * 100);
    return `<div class="stage"><h3>${ROADMAP[n].title}</h3><p class="when">${ROADMAP[n].hours} — ${got}/${list.length} earned</p>
      <div class="stagebar"><div style="width:${pct}%"></div></div>
      <p>${ROADMAP[n].text}</p>
      <ul>${list.map((t) => `<li class="${done.has(t.id) ? 'done' : ''}">${done.has(t.id) ? '✓ ' : '○ '}#${t.id} ${esc(hiddenFromView(t) ? 'Hidden trophy' : t.name)}</li>`).join('')}</ul></div>`;
  }).join('');
  el('otherBody').innerHTML = `
    <div class="card"><h2>Roadmap to the platinum</h2>
    <p>About 200 hours in total, in five stages, built from the official descriptions: story first, then the open world, then collectibles, then money and 100%, then the cryptic trophies and the platinum. PowerPyx rates the platinum 4 out of 10 for difficulty (PowerPyx trophy guide, 19 Nov 2026). Work the stages in order and the checklist fills itself in.</p></div>
    <div class="stagegrid">${cards}</div>`;
}

function drawMissables() {
  const t = find(28);
  const done = earnedIds();
  el('otherBody').innerHTML = `
    <div class="card flagcard"><h2>Missable watch — 1 trophy flagged</h2>
    <p><b>#28 ${esc(t.name)}</b> — ${esc(t.description)} <span class="glabel ${t.grade}">${cap(t.grade)}</span> ${done.has(28) ? '✓ Earned' : 'Not earned yet'}</p>
    <p>${esc(t.guide)}</p>
    <p class="cite">${esc(t.sources)}</p>
    <p class="alertbox"><b>Honest hedge:</b> the possibly-missable flag comes from PowerPyx and GTABase and is unconfirmed. planetgta6 (19 Nov 2026) says there is no reliable list of missable trophies so far. Do not treat this as a confirmed missable — treat it as the one trophy worth doing early, with a manual save kept before big missions.</p></div>
    <div class="card"><h2>Why the other 54 are safe</h2>
    <p>Story trophies pop from playing the chapters and named missions, which cannot be missed by playing the story. There are no online trophies at all, so nothing depends on servers or other players. Collectibles, activities and crime trophies stay available after the story ends, and the 100% checklist can be finished in free roam. The one habit that covers every unknown: keep a manual save before big missions, so a missed step costs a reload instead of a replay.</p></div>
    <div class="card"><h2>How this page was built</h2>
    <p>Missable flags here come from the official descriptions plus the launch-day guides named beside each trophy. Where a guide had not confirmed a method by 19 Nov 2026, this guide says so instead of guessing. The missable page names one trophy and explains why, and leaves the rest unflagged.</p></div>`;
}

function drawSavePage() {
  const done = earnedIds();
  const notesWritten = Object.values(saved.notes).filter((n) => n && n.trim()).length;
  el('otherBody').innerHTML = `
    <div class="card"><h2>Save and counters</h2>
    <p>Progress saves in this browser (localStorage) the moment you tick a box. Export downloads a file with your earned trophies, notes and counters; import reads one back. Nothing leaves your browser unless you export it.</p>
    <p><b>${done.size} of ${all.length} earned</b> — ${notesWritten} ${notesWritten === 1 ? 'note' : 'notes'} written.</p>
    <div class="btnrow">
      <button type="button" id="exportAgain">Export progress</button>
      <button type="button" id="wipeAll" class="plain">Reset all progress</button>
    </div></div>
    <div class="card"><h2>PSN progress counters</h2>
    <p>Five trophies track a number on PlayStation. Enter your numbers here and the guide pane shows them beside each trophy.</p>
    <div class="countgrid">${METERS.map((m) => {
      const value = saved.counters[m.key] ?? 0;
      const pct = Math.min(100, Math.round((value / m.target) * 100));
      return `<div class="counter"><h3>${m.label}</h3><p style="margin:0;font-size:12px;color:var(--soft)">Trophy #${m.trophy} — target ${m.target}</p>
        <input type="number" data-meter="${m.key}" min="0" max="${m.target}" value="${value}" aria-label="${m.label}">
        <div class="cbar"><div style="width:${pct}%"></div></div><p style="margin:4px 0 0;font-size:12px">${value} / ${m.target} — ${pct}%</p></div>`;
    }).join('')}</div></div>
    <div class="card"><h2>Your notes</h2>
    <p>${notesWritten === 0 ? 'No notes yet. Open any trophy in the checklist and write one in its guide pane.' : Object.entries(saved.notes).filter(([, n]) => n && n.trim()).map(([id, n]) => `<b>#${id} ${esc((find(Number(id)) ?? { name: '' }).name)}:</b> ${esc(n)}`).join('<br>')}</p></div>`;
  el('exportAgain').addEventListener('click', exportProgress);
  el('wipeAll').addEventListener('click', () => {
    if (!window.confirm('Reset all progress, notes and counters?')) return;
    saved.earned = []; saved.notes = {}; saved.counters = {};
    store(); drawEverything(); goTo('save');
  });
  el('otherBody').querySelectorAll('[data-meter]').forEach((input) =>
    input.addEventListener('change', () => {
      const meter = METERS.find((m) => m.key === input.dataset.meter);
      saved.counters[meter.key] = Math.max(0, Math.min(meter.target, Number(input.value) || 0));
      store(); drawSavePage();
    }));
}

function drawAbout() {
  el('otherBody').innerHTML = `
    <div class="card"><h2>About this guide</h2>
    <p>Leonida 55 covers the 55 PlayStation 5 trophies of Grand Theft Auto VI, which launched on 19 Nov 2026. The official list has been live on PlayStation Network since 18 Nov 2026. Names, descriptions and grades are shown exactly as PlayStation publishes them. Guide steps are our own words. Where a step goes beyond the official description, the guide names its source; where it could not be verified, it says so.</p>
    <p>28 trophies are hidden on PlayStation until earned. Only one trophy is reported as possibly missable (Positive Mental Attitude); no reliable missable list exists yet, so keep manual saves before big missions.</p>
    <p>This guide works fully offline. It loads no file from the network, runs no tracker and asks for no account. Your progress stays in this browser unless you export it.</p></div>
    <div class="card"><h2>Sources</h2>
    <ul class="sources">
      <li>Official trophy list: Exophase, Grand Theft Auto VI trophies, 18 Nov 2026 — names, descriptions and grades.</li>
      <li>Cross-check: PSNProfiles, Grand Theft Auto VI trophies, 18 Nov 2026 — the two lists agree on every name, description and grade; PSN counts where one exists.</li>
      <li>Cross-check: TrueAchievements, 18 Nov 2026, via planetgta6.com trophy tables, crawled 19 Nov 2026.</li>
      <li>How-to detail: Push Square, GTA 6 trophy guide and roadmap, 19 Nov 2026.</li>
      <li>How-to detail: KeenGamer, GTA 6 trophy guide and platinum roadmap, 19 Nov 2026.</li>
      <li>How-to detail: PowerPyx trophy guide, 19 Nov 2026 — difficulty 4 out of 10, about 200 hours to platinum; possibly-missable flag via GTABase, unconfirmed.</li>
      <li>Missable honesty: planetgta6.com, 19 Nov 2026 — no reliable list of missable trophies so far.</li>
    </ul></div>
    <div class="card"><h2>What this guide does not claim</h2>
    <p>How-to detail beyond the official descriptions is launch-day guide knowledge, not official text. For the cryptic trophies (Challenging Tank, Personal Best, Actions Speak Louder, Bad Luck I Guess, The Truth Is Out There, Ten Pin) the exact method had not been confirmed in any guide checked on 19 Nov 2026, and this guide says so beside each one instead of guessing. Check a current guide before chasing those.</p></div>`;
}

function goTo(page) {
  saved.page = page;
  store();
  document.querySelectorAll('#sections button').forEach((b) =>
    b.classList.toggle('current', b.dataset.page === page));
  el('controls').style.display = page === 'checklist' ? '' : 'none';
  el('page-checklist').hidden = page !== 'checklist';
  el('page-other').hidden = page === 'checklist';
  if (page === 'roadmap') drawRoadmap();
  if (page === 'missables') drawMissables();
  if (page === 'save') drawSavePage();
  if (page === 'about') drawAbout();
  if (location.hash !== `#/${page}`) history.replaceState(null, '', `#/${page}`);
}

function exportProgress() {
  const payload = {
    app: 'leonida55', version: 2, exportedAt: new Date().toISOString(),
    earned: saved.earned, notes: saved.notes, counters: saved.counters,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'leonida55-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = new Set(all.map((t) => t.id));
    if (Array.isArray(parsed.earned)) saved.earned = parsed.earned.filter((id) => ids.has(id));
    if (parsed.notes && typeof parsed.notes === 'object') saved.notes = parsed.notes;
    if (parsed.counters && typeof parsed.counters === 'object') saved.counters = parsed.counters;
    store();
    drawEverything();
    goTo(saved.page);
  } catch {
    window.alert('That file could not be read as Leonida 55 progress.');
  }
}

function drawEverything() {
  drawScoreboard();
  drawKinds();
  drawNextUp();
  drawChecklist();
  drawDetail();
}

async function start() {
  const doc = await (await fetch(DATA)).json();
  all = doc.trophies;
  el('query').value = saved.query;
  el('gradePick').value = saved.grade;
  el('onlyMissable').checked = saved.missableOnly;
  el('spoilerSafe').checked = saved.spoiler;
  el('query').addEventListener('input', (e) => { saved.query = e.target.value; store(); drawChecklist(); });
  el('gradePick').addEventListener('change', (e) => { saved.grade = e.target.value; store(); drawChecklist(); });
  el('onlyMissable').addEventListener('change', (e) => { saved.missableOnly = e.target.checked; store(); drawChecklist(); });
  el('spoilerSafe').addEventListener('change', (e) => { saved.spoiler = e.target.checked; store(); drawNextUp(); drawChecklist(); drawDetail(); });
  el('doExport').addEventListener('click', exportProgress);
  el('doImport').addEventListener('change', (e) => importProgress(e.target.files[0]));
  document.querySelectorAll('#sections button').forEach((b) =>
    b.addEventListener('click', () => goTo(b.dataset.page)));
  const hashPage = location.hash.replace('#/', '') || 'checklist';
  drawEverything();
  goTo(['checklist', 'roadmap', 'missables', 'save', 'about'].includes(hashPage) ? hashPage : 'checklist');
  window.addEventListener('hashchange', () => {
    const page = location.hash.replace('#/', '') || 'checklist';
    if (['checklist', 'roadmap', 'missables', 'save', 'about'].includes(page)) goTo(page);
  });
}

start();
