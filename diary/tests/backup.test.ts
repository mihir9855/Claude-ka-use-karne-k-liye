import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { entriesToCsv, makeBackup, parseBackup } from '../src/core/backup';
import { makeEntry, sampleEntries } from '../src/core/diary';
import { newPerson } from '../src/core/profile';
import { APP_VERSION } from '../src/version';

const people = [{ ...newPerson('me', 'Mihir'), age: 32 }, newPerson('p2', 'Kavya')];
const NOW = new Date(2026, 9, 30, 9, 0, 0);

test('a backup can be restored exactly', () => {
  const entries = [...sampleEntries(NOW), makeEntry('5 roti', 'd', '2026-10-30', false, 5, 'b1', 'p2', 5)];
  const text = makeBackup({ entries, persons: people, activeId: 'p2', picks: { '2026-10-31|d': 'Dal fry' } }, APP_VERSION, NOW);
  const r = parseBackup(text);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.data.entries.length, entries.length);
    assert.deepEqual(r.data.persons, people);
    assert.equal(r.data.activeId, 'p2');
    assert.deepEqual(r.data.picks, { '2026-10-31|d': 'Dal fry' });
    assert.equal(r.data.appVersion, APP_VERSION);
  }
});

test('a bad backup is refused with a reason', () => {
  const bad = (t: string) => {
    const r = parseBackup(t);
    assert.equal(r.ok, false, t.slice(0, 30));
    return r.ok ? '' : r.error;
  };
  assert.match(bad('hello'), /not a backup/i);
  assert.match(bad('{"app":"other"}'), /not from Khana/i);
  assert.match(bad(JSON.stringify({ app: 'khana-diary', format: 99, persons: [], entries: [] })), /newer/i);
  assert.match(bad(JSON.stringify({ app: 'khana-diary', format: 1, persons: [], entries: [] })), /no profiles/i);
  assert.match(bad(JSON.stringify({ app: 'khana-diary', format: 1, persons: people, entries: [{ id: 'x', name: 'a', key: 'a', date: 'bad', slot: 'b' }] })), /meal.*damaged/i);
  assert.match(bad(JSON.stringify({ app: 'khana-diary', format: 1, persons: [{ id: 'x' }], entries: [] })), /profile.*damaged/i);
});

test('an unknown active person falls back to the first', () => {
  const t = JSON.stringify({ app: 'khana-diary', format: 1, persons: people, entries: [], activeId: 'ghost' });
  const r = parseBackup(t);
  assert.ok(r.ok && r.data.activeId === 'me');
});

test('the csv has one row per meal and quotes what needs it', () => {
  const e = [makeEntry('roti', 'd', '2026-10-30', false, 1000, 'x', 'me', 3), makeEntry('zzq, \"mix\" bowl', 'l', '2026-10-30', false, 500, 'y', 'p2')];
  const lines = entriesToCsv(e, people).split('\n');
  assert.equal(lines.length, 3);
  assert.match(lines[0], /^date,time,person,meal,dish/);
  assert.match(lines[1], /Kavya/);
  assert.match(lines[1], /"Zzq, ""mix"" bowl"/);
  assert.match(lines[2], /Mihir,Dinner,Roti ×3,3,/);
});

test('the app version matches package.json and app.json', () => {
  assert.equal(JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version, APP_VERSION);
  assert.equal(JSON.parse(readFileSync(new URL('../app.json', import.meta.url), 'utf8')).expo.version, APP_VERSION);
});
