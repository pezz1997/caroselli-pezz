#!/usr/bin/env node
/**
 * Genera i payload pronti per GHL create-post dai caroselli AI & BUSINESS.
 *
 *   node build-payloads.js                  -> payload + calendario
 *   node build-payloads.js --start 2026-08-10 --time 19:00 --days 1,3,5
 *
 * Zero dipendenze. Legge ai-business-captions.json, scrive PAYLOAD-GHL-ai-business.json.
 */

const fs = require('fs');
const path = require('path');

const ACCOUNTS = {
  instagram_solutions: '6a738abb9135aba45b86cf91_bGnPTyIaf1qnKhcUORv9_17841441112084082',
  facebook_page:       '6a64f65a28d1eed590cc5f00_bGnPTyIaf1qnKhcUORv9_104351878983276_page',
  google_business:     '6a738b505fe38cc25ac0fd54_bGnPTyIaf1qnKhcUORv9_1579852681553179225',
};

// Instagram + Facebook prendono il carosello intero. Google Business NO: una sola immagine.
const CAROUSEL_ACCOUNTS = [ACCOUNTS.instagram_solutions, ACCOUNTS.facebook_page];

const arg = (name, def) => {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : def;
};

const START   = arg('start', '2026-08-10');       // primo giorno di pubblicazione
const TIME    = arg('time', '19:00');             // ora locale Europe/Rome
const DAYS    = arg('days', '1,3,5').split(',').map(Number); // lun, mer, ven
const USER_ID = arg('user', 'ewYKioZqnIvTCzD9CU8A');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'ai-business-captions.json'), 'utf8'));
const BASE = data.meta.baseUrl;

// Europe/Rome e' UTC+2 in ora legale (fino al 25/10/2026), UTC+1 dopo.
function toUtcIso(dateStr, timeStr) {
  const [Y, M, D] = dateStr.split('-').map(Number);
  const [h, m]    = timeStr.split(':').map(Number);
  const dstEnd    = Date.UTC(2026, 9, 25, 1, 0, 0);      // 25/10/2026 01:00 UTC
  const naive     = Date.UTC(Y, M - 1, D, h, m, 0);
  const offsetH   = naive < dstEnd ? 2 : 1;
  return new Date(naive - offsetH * 3600 * 1000).toISOString();
}

// Genera le date che cadono nei giorni della settimana scelti, a partire da START.
function schedule(n) {
  const out = [];
  const d = new Date(START + 'T12:00:00Z');
  while (out.length < n) {
    if (DAYS.includes(d.getUTCDay())) {
      out.push(d.toISOString().slice(0, 10));
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

const dates = schedule(data.caroselli.length);

const payloads = data.caroselli.map((c, i) => {
  const media = Array.from({ length: c.slide }, (_, s) => ({
    url: `${BASE}/${c.id}-${String(s + 1).padStart(2, '0')}.jpg`,
    type: 'image',
  }));

  const summary = `${c.caption}\n\n${c.hashtag.join(' ')}`;

  if (summary.length > 2200) {
    console.warn(`  ATTENZIONE ${c.id}: caption ${summary.length} caratteri, limite Instagram 2200`);
  }

  return {
    _id: c.id,
    _titolo: c.titolo,
    _cta: c.cta,
    _data: dates[i],
    _caratteri: summary.length,
    _altText: c.altText,
    accountIds: CAROUSEL_ACCOUNTS,
    type: 'post',
    status: 'scheduled',
    userId: USER_ID,
    summary,
    media,
    followUpComment: c.primoCommento,
    scheduleDate: toUtcIso(dates[i], TIME),
  };
});

fs.writeFileSync(
  path.join(__dirname, 'PAYLOAD-GHL-ai-business.json'),
  JSON.stringify(payloads, null, 2)
);

console.log(`\nCAROSELLI AI & BUSINESS — ${payloads.length} post pronti\n`);
console.log('data        ora    id   slide  car.   cta            titolo');
console.log('-'.repeat(88));
for (const p of payloads) {
  console.log(
    `${p._data}  ${TIME}  ${p._id.padEnd(4)} ${String(p.media.length).padEnd(6)} ` +
    `${String(p._caratteri).padEnd(6)} ${p._cta.padEnd(14)} ${p._titolo}`
  );
}
const cta = payloads.map(p => p._cta);
const dup = cta.filter((v, i) => cta.indexOf(v) !== i);
console.log('\nParole CTA duplicate:', dup.length ? [...new Set(dup)].join(', ') : 'nessuna');
console.log(`Slide totali: ${payloads.reduce((a, p) => a + p.media.length, 0)}`);
console.log(`Ultimo post: ${payloads[payloads.length - 1]._data}`);
console.log(`\nScritto: PAYLOAD-GHL-ai-business.json`);
