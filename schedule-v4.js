#!/usr/bin/env node
/**
 * Scheduler caroselli v4 -> GHL Social Planner.
 * Legge tutti i qc-batch-*.json, scarta i SCARTATO, ordina, assegna 2 slot al giorno,
 * genera i payload create-post per il SOLO profilo pezzmarketingsolutions.
 *
 *   node schedule-v4.js                          anteprima
 *   node schedule-v4.js --start 2026-08-08       primo giorno
 *   node schedule-v4.js --slots 13:00,19:30      orari
 *   node schedule-v4.js --skip 1a,1b             gia programmati, salta
 *
 * Zero dipendenze.
 */

const fs = require('fs');
const path = require('path');

// SOLO pezzmarketingsolutions. Gli altri account restano fuori di proposito.
const ACCOUNT_PMS = '6a738abb9135aba45b86cf91_bGnPTyIaf1qnKhcUORv9_17841441112084082';
const BASE = 'https://raw.githubusercontent.com/pezz1997/caroselli-pezz/master/v4';
const MAX_SLIDE_API = 10;   // limite Meta per i publisher terzi
const MAX_CHARS = 2200;     // limite caption Instagram

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };

const START   = arg('start', '2026-08-08');
const SLOTS   = arg('slots', '13:00,19:30').split(',');
const SKIP    = arg('skip', '').split(',').filter(Boolean);
const USER_ID = arg('user', 'ewYKioZqnIvTCzD9CU8A');

function toUtcIso(dateStr, timeStr) {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const [h, m] = timeStr.split(':').map(Number);
  const dstEnd = Date.UTC(2026, 9, 25, 1, 0, 0);  // fine ora legale Italia
  const naive = Date.UTC(Y, M - 1, D, h, m, 0);
  return new Date(naive - (naive < dstEnd ? 2 : 1) * 3600 * 1000).toISOString();
}

// Raccoglie tutti i lotti QC prodotti dagli agenti.
const items = [];
for (const f of fs.readdirSync(__dirname).filter(f => /^qc-batch-.*\.json$/.test(f)).sort()) {
  const arr = JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8'));
  items.push(...(Array.isArray(arr) ? arr : [arr]));
}

const scartati = items.filter(c => c.verdetto === 'SCARTATO');
let ok = items.filter(c => c.verdetto === 'OK' && !SKIP.includes(c.id));

// Dedup: stessa parola CTA o titolo identico -> tiene il primo, segnala il secondo.
const visti = new Map(); const doppioni = [];
ok = ok.filter(c => {
  const k = (c.cta || '').toUpperCase();
  if (k && visti.has(k)) { doppioni.push([c.id, visti.get(k), k]); return false; }
  if (k) visti.set(k, c.id);
  return true;
});

// Alterna le categorie per non pubblicare due contenuti simili di fila.
const perCat = new Map();
for (const c of ok) {
  const k = c.categoria || 'altro';
  if (!perCat.has(k)) perCat.set(k, []);
  perCat.get(k).push(c);
}
const ordinati = [];
while (ordinati.length < ok.length) {
  for (const [, lista] of perCat) if (lista.length) ordinati.push(lista.shift());
}

const payloads = ordinati.map((c, i) => {
  const giorno = Math.floor(i / SLOTS.length);
  const slot = SLOTS[i % SLOTS.length];
  const d = new Date(START + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + giorno);
  const data = d.toISOString().slice(0, 10);

  const n = Math.min(c.slide, MAX_SLIDE_API);
  const media = Array.from({ length: n }, (_, s) => ({
    url: `${BASE}/${c.id}-${String(s + 1).padStart(2, '0')}.jpg`,
    type: 'image/jpeg',   // GHL vuole il MIME, non 'image': con 'image' risponde 422
  }));

  // L'agente a volte chiude gia' la caption col blocco hashtag: non raddoppiarlo.
  const tags = (c.hashtag || []).join(' ');
  const caption = c.caption.replace(/\s*(?:^|\n)#[^\n]*$/, '').trimEnd();
  const summary = tags ? `${caption}\n\n${tags}` : caption;
  if (summary.length > MAX_CHARS) console.warn(`  ${c.id}: caption ${summary.length} car., oltre il limite`);
  if (c.slide > MAX_SLIDE_API) console.warn(`  ${c.id}: ${c.slide} slide, l'API ne pubblica ${MAX_SLIDE_API}`);

  return {
    _id: c.id, _titolo: c.titolo, _cta: c.cta, _categoria: c.categoria,
    _data: data, _ora: slot, _caratteri: summary.length, _altText: c.altText,
    accountIds: [ACCOUNT_PMS],
    type: 'post',
    status: 'scheduled',
    userId: USER_ID,
    summary,
    media,
    followUpComment: c.primoCommento,
    scheduleDate: toUtcIso(data, slot),
  };
});

fs.writeFileSync(path.join(__dirname, 'PAYLOAD-v4.json'), JSON.stringify(payloads, null, 2));

console.log(`\nCAROSELLI v4 -> @pezzmarketingsolutions\n`);
console.log(`In lavorazione: ${items.length}   OK: ${ok.length}   Scartati: ${scartati.length}   Doppioni rimossi: ${doppioni.length}\n`);
if (scartati.length) {
  console.log('SCARTATI');
  for (const s of scartati) console.log(`  ${s.id}  ${s.motivo_scarto}`);
  console.log();
}
if (doppioni.length) {
  console.log('DOPPIONI');
  for (const [a, b, k] of doppioni) console.log(`  ${a} usa la stessa CTA "${k}" di ${b}`);
  console.log();
}
console.log('data        ora    id            slide  car.   cta            titolo');
console.log('-'.repeat(96));
for (const p of payloads) {
  console.log(`${p._data}  ${p._ora}  ${String(p._id).padEnd(13)} ${String(p.media.length).padEnd(6)} ${String(p._caratteri).padEnd(6)} ${String(p._cta).padEnd(14)} ${p._titolo}`);
}
console.log(`\nUltimo post: ${payloads.length ? payloads[payloads.length - 1]._data : '-'}`);
console.log(`Scritto: PAYLOAD-v4.json`);
