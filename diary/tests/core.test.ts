import assert from 'node:assert/strict';
import test from 'node:test';
import { LIBRARY } from '../src/data/library';
import { hints, learned, makeEntry, match, nextSlot, sampleEntries, slotAt, splitNames, suggest, totalsFor, ymd, type Entry } from '../src/core/diary';

const NOW = new Date(2026, 9, 30, 9, 0, 0); // a Friday morning

test('library has the dishes and numbers it needs', () => {
  assert.ok(LIBRARY.length >= 250);
  for (const d of LIBRARY) {
    assert.ok(d[1] > 0 && d[2] >= 0, d[0]);
    assert.ok(['co', 'ma', 'st', 'si', 'sn'].includes(d[3]), d[0]);
  }
});

test('typed names find the right dish, and unknown names stay unknown', () => {
  assert.equal(match('poha')?.[0], 'Poha');
  assert.equal(match('  POHA ')?.[0], 'Poha');
  assert.equal(match('dal tadka')?.[0], 'Dal tadka');
  assert.equal(match('idli')?.[0], 'Idli (3)');
  assert.equal(match('chai'), null);
  assert.equal(match(''), null);
  assert.equal(match('dal'), null); // too vague to guess
});

test('hints and splitting', () => {
  assert.ok(hints('dal').length > 0);
  assert.deepEqual(hints('d'), []);
  assert.deepEqual(splitNames('poha, chai; dal tadka\n roti ,'), ['poha', 'chai', 'dal tadka', 'roti']);
});

test('entries keep one key per dish and carry the library numbers', () => {
  const a = makeEntry('poha', 'b', '2026-10-30');
  const b = makeEntry('Poha', 'b', '2026-10-29');
  assert.equal(a.key, b.key);
  assert.equal(a.name, 'Poha');
  assert.ok(a.kcal! > 0);
  const c = makeEntry('chai', 'b', '2026-10-30');
  assert.equal(c.kcal, null);
  assert.equal(c.name, 'Chai');
});

test('totals count only matched dishes of that day', () => {
  const e = [makeEntry('poha', 'b', '2026-10-30'), makeEntry('chai', 'b', '2026-10-30'), makeEntry('upma', 'b', '2026-10-29')];
  const t = totalsFor(e, '2026-10-30');
  assert.equal(t.kcal, e[0].kcal);
  assert.equal(t.unknown, 1);
});

test('slots follow the clock and skip meals already logged', () => {
  assert.equal(slotAt(8), 'b');
  assert.equal(slotAt(13), 'l');
  assert.equal(slotAt(16), 's');
  assert.equal(slotAt(21), 'd');
  const today = ymd(NOW);
  assert.equal(nextSlot([], NOW), 'b');
  assert.equal(nextSlot([makeEntry('poha', 'b', today)], NOW), 'l');
});

test('suggestions follow habit, and avoid what was just eaten', () => {
  const entries: Entry[] = [];
  for (let d = 10; d >= 2; d--) entries.push(makeEntry(d % 3 === 0 ? 'Upma' : 'Poha', 'b', `2026-10-${String(30 - d).padStart(2, '0')}`));
  const s = suggest(entries, 'b', { kcal: 2000, protein: 60 }, NOW);
  assert.equal(s.length, 3);
  assert.equal(s[0].name, 'Poha');
  assert.ok(s[0].why.some((w) => /Often at breakfast/.test(w.text)));
  // after eating Poha today it drops down
  const after = suggest([...entries, makeEntry('Poha', 'b', ymd(NOW))], 'b', { kcal: 2000, protein: 60 }, NOW);
  assert.notEqual(after[0].name, 'Poha');
});

test('with no history the library still gives ideas for the meal', () => {
  for (const slot of ['b', 'l', 's', 'd'] as const) {
    const s = suggest([], slot, { kcal: 2000, protein: 60 }, NOW);
    assert.equal(s.length, 3, slot);
    assert.ok(s.every((x) => x.why.some((w) => /New idea/.test(w.text))));
  }
});

test('low protein pulls protein-rich dishes up', () => {
  const s = suggest([], 'l', { kcal: 2000, protein: 90 }, NOW);
  assert.ok(s.every((x) => (x.protein ?? 0) >= 10), s.map((x) => `${x.name} ${x.protein}`).join(', '));
});

test('sample meals teach habits', () => {
  const sample = sampleEntries(NOW);
  assert.ok(sample.length > 45 && sample.every((e) => e.sample));
  const l = learned(sample);
  assert.equal(l.days, 14);
  assert.ok(l.top && l.top.n >= 5);
  assert.ok(l.usual.b && l.usual.d);
});
