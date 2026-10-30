import assert from 'node:assert/strict';
import test from 'node:test';
import { LIBRARY } from '../src/data/library';
import { entryLabel, readMessage, streak, todayMenu, upcomingMeals } from '../src/core/diary';
import { allowed, computeTargets, newPerson } from '../src/core/profile';
import { dayMenu, hints, learned, makeEntry, match, nextSlot, sampleEntries, slotAt, splitNames, suggest, totalsFor, weekMenu, ymd, type Entry } from '../src/core/diary';

const T = { kcal: 2000, protein: 60, carbs: 250, fat: 60, fiber: 28 };
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
  assert.equal(match('moonlight special'), null);
  assert.equal(match(''), null);
  assert.equal(match('dal')?.[0], 'Dal tadka'); // the usual meaning of a bare "dal"
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
  const c = makeEntry('moonlight special', 'b', '2026-10-30');
  assert.equal(c.kcal, null);
  assert.equal(c.name, 'Moonlight special');
});

test('totals count only matched dishes of that day', () => {
  const e = [makeEntry('poha', 'b', '2026-10-30'), makeEntry('moonlight special', 'b', '2026-10-30'), makeEntry('upma', 'b', '2026-10-29')];
  const t = totalsFor(e, '2026-10-30');
  assert.equal(t.kcal, e[0].kcal);
  assert.equal(t.unknown, 1);
});

test('slots follow the clock and skip meals already logged', () => {
  assert.equal(slotAt(8), 'b');
  assert.equal(slotAt(10), 'm');
  assert.equal(slotAt(13), 'l');
  assert.equal(slotAt(16), 's');
  assert.equal(slotAt(21), 'd');
  const today = ymd(NOW);
  assert.equal(nextSlot([], NOW), 'b');
  assert.equal(nextSlot([makeEntry('poha', 'b', today)], NOW), 'm');
});

test('suggestions follow habit, and avoid what was just eaten', () => {
  const entries: Entry[] = [];
  for (let d = 10; d >= 4; d--) entries.push(makeEntry(d % 3 === 0 ? 'Upma' : 'Poha', 'b', `2026-10-${String(30 - d).padStart(2, '0')}`));
  const s = suggest(entries, 'b', T, NOW);
  assert.equal(s.length, 3);
  assert.equal(s[0].name, 'Poha');
  assert.ok(s[0].why.some((w) => /often have it at breakfast/i.test(w.text)));
  // after eating Poha today it drops down
  const after = suggest([...entries, makeEntry('Poha', 'b', ymd(NOW))], 'b', T, NOW);
  assert.notEqual(after[0].name, 'Poha');
});

test('with no history the library still gives ideas for the meal', () => {
  for (const slot of ['b', 'l', 's', 'd'] as const) {
    const s = suggest([], slot, T, NOW);
    assert.equal(s.length, 3, slot);
    assert.ok(s.every((x) => x.why.some((w) => /New idea/.test(w.text))));
  }
});

test('low protein pulls protein-rich dishes up', () => {
  const s = suggest([], 'l', { ...T, protein: 90 }, NOW);
  assert.ok(s.every((x) => (x.protein ?? 0) >= 10), s.map((x) => `${x.name} ${x.protein}`).join(', '));
});

test('sample meals teach habits', () => {
  const sample = sampleEntries(NOW);
  assert.ok(sample.length > 45 && sample.every((e) => e.sample));
  const l = learned(sample);
  assert.equal(l.days, 14);
  assert.ok(l.top && l.top.n >= 4);
  assert.ok(l.usual.b && l.usual.d);
});

test('the day menu does not offer one dish for two meals', () => {
  const m = dayMenu([], T, new Date(2026, 9, 30, 7, 0, 0));
  assert.equal(m.length, 5);
  const firsts = m.map((x) => x.options[0].name);
  assert.equal(new Set(firsts).size, firsts.length, firsts.join(', '));
  assert.ok(m.every((x) => x.options.length === 3));
  // meals already logged are left out
  const done = dayMenu([makeEntry('poha', 'b', '2026-10-30')], T, new Date(2026, 9, 30, 7, 0, 0));
  assert.deepEqual(done.map((x) => x.slot), ['m', 'l', 's', 'd']);
});

test('targets follow the profile and the goal', () => {
  const base = { ...newPerson('a'), sex: 'male' as const, age: 30, heightCm: 175, weightKg: 75, activity: 'light' as const };
  const keep = computeTargets(base);
  const lose = computeTargets({ ...base, goal: 'lose' });
  const gain = computeTargets({ ...base, goal: 'gain' });
  assert.ok(lose.kcal < keep.kcal && keep.kcal < gain.kcal);
  assert.ok(lose.protein > keep.protein - 1 && gain.protein > keep.protein);
  assert.ok(keep.kcal > 2000 && keep.kcal < 3000, String(keep.kcal));
  const kidney = computeTargets({ ...base, conditions: ['kidney'] });
  assert.ok(kidney.protein <= Math.round(75 * 0.8));
  const diabetic = computeTargets({ ...base, conditions: ['diabetes'] });
  assert.equal(diabetic.fiber, keep.fiber + 5);
  const f = computeTargets({ ...base, sex: 'female', heightCm: 160, weightKg: 58 });
  assert.ok(f.kcal < keep.kcal);
});

test('no dairy and no gluten rule dishes out by name', () => {
  assert.equal(allowed('Palak paneer', ['lactose']), false);
  assert.equal(allowed('Dal tadka', ['lactose']), true);
  assert.equal(allowed('Plain paratha', ['gluten']), false);
  assert.equal(allowed('Poha', ['gluten']), true);
  for (const slot of ['b', 'l', 'd'] as const) {
    const s = suggest([], slot, T, NOW, 3, ['lactose']);
    assert.ok(s.every((x) => allowed(x.name, ['lactose'])), s.map((x) => x.name).join(', '));
  }
});

test('the week menu covers seven days with variety', () => {
  const week = weekMenu(sampleEntries(NOW), T, {}, NOW);
  assert.equal(week.length, 7);
  assert.equal(week[0].date, ymd(NOW));
  // the same lunch dish does not repeat on back-to-back days
  const lunches = week.map((d) => d.slots.find((s) => s.slot === 'l')?.chosen?.name).filter(Boolean);
  for (let i = 1; i < lunches.length; i++) assert.notEqual(lunches[i], lunches[i - 1]);
  assert.ok(week.slice(1).every((d) => d.slots.length === 5 && d.kcal > 800));
});

test('swapped dishes stay in the week menu, and logged meals show as eaten', () => {
  const picks = { [`${ymd(new Date(2026, 9, 31))}|d`]: 'Dal fry' };
  const week = weekMenu([makeEntry('poha', 'b', ymd(NOW))], T, picks, NOW);
  assert.equal(week[1].slots.find((s) => s.slot === 'd')?.chosen?.name, 'Dal fry');
  assert.equal(week[0].slots[0].eaten?.[0].name, 'Poha');
});

test('typed names and typos still find the dish', () => {
  assert.equal(match('rice')?.[0], 'Steamed rice');
  assert.equal(match('daal')?.[0], 'Dal tadka');
  assert.equal(match('rtice')?.[0], 'Steamed rice');
  assert.equal(match('chai')?.[0], 'Chai');
  assert.equal(match('roti')?.[0], 'Roti (2)');
  assert.equal(match('paneer sabji'), null);
});

test('the meal is read from the words in the message', () => {
  const r = readMessage('eat daal rtice in lunch', 'b');
  assert.equal(r.slot, 'l');
  assert.deepEqual(r.items.map((x) => `${x.slot}:${x.name}`), ['l:daal', 'l:rtice']);
  assert.deepEqual(readMessage('chai in evening snacks', 'b').items, [{ name: 'chai', slot: 's' }]);
  assert.deepEqual(readMessage('roti sabji for dinner', 'b').items.map((x) => x.slot), ['d', 'd']);
  assert.deepEqual(readMessage('poha for breakfast, dal rice in lunch', 'd').items.map((x) => `${x.slot}:${x.name}`), ['b:poha', 'l:dal', 'l:rice']);
  assert.deepEqual(readMessage('maine aaj nashta me poha khaya', 'd').items, [{ name: 'poha', slot: 'b' }]);
  // no meal named: the fallback is used
  assert.deepEqual(readMessage('poha, chai', 'l').items.map((x) => x.slot), ['l', 'l']);
  assert.deepEqual(readMessage('', 'l').items, []);
  assert.deepEqual(readMessage('lunch', 'b').items, []);
});

test('the streak counts days in a row up to today', () => {
  const e = (back: number) => makeEntry('poha', 'b', ymd(new Date(2026, 9, 30 - back)));
  assert.equal(streak([], NOW), 0);
  assert.equal(streak([e(0), e(1), e(2)], NOW), 3);
  assert.equal(streak([e(1), e(2)], NOW), 2); // today is not logged yet, the streak is still alive
  assert.equal(streak([e(0), e(2)], NOW), 1);
  assert.equal(streak([e(3)], NOW), 0);
});

function logLunch(date: string, text: string): Entry[] {
  const batch = `b-${date}`;
  return readMessage(text, 'l').items.map((it) => makeEntry(it.name, it.slot, date, false, 0, batch));
}

test('a few logged meals are enough to change the suggestions', () => {
  // two lunches of dal and rice, a day apart
  const entries = [...logLunch('2026-10-27', 'dal and rice in lunch'), ...logLunch('2026-10-28', 'rice dal lunch')];
  const s = suggest(entries, 'l', T, NOW, 3);
  assert.equal(s[0].name, 'Dal tadka + Steamed rice', s.map((x) => x.name).join(' | '));
  assert.deepEqual(s[0].items, ['Dal tadka', 'Steamed rice']);
  assert.ok(s[0].why.some((w) => /often have it at lunch/i.test(w.text)));
  assert.equal(learned(entries).usual.l?.name, 'Dal tadka + Steamed rice');
  // one single dish eaten once still moves up
  const one = suggest([makeEntry('Palak paneer', 'l', '2026-10-27')], 'l', T, NOW, 3);
  assert.equal(one[0].name, 'Palak paneer');
});

test("today's menu shows what was eaten and plans the rest, and it changes when you log", () => {
  const noon = new Date(2026, 9, 30, 12, 0, 0);
  const before = todayMenu([], T, noon);
  assert.equal(before.length, 5);
  assert.ok(before.every((m) => !m.eaten && m.options.length === 3));
  assert.equal(before[0].missed, true); // breakfast time has passed
  assert.equal(before[2].missed, false);
  const names = before.map((m) => m.options[0].name);
  assert.equal(new Set(names).size, 5, names.join(', '));
  const after = todayMenu(logLunch(ymd(noon), 'dal rice in lunch'), T, noon);
  assert.equal(after[2].eaten?.length, 2);
  assert.ok(after[2].options.length === 0);
  // what was eaten is not planned again for the other meals
  const planned = after.filter((m) => !m.eaten).map((m) => m.options[0].name);
  assert.ok(!planned.some((n) => /Dal tadka|Steamed rice/.test(n)), planned.join(', '));
});

test('messy messages: counts, glued words, units and typos', () => {
  const read = (t: string, f: 'b' | 'l' | 's' | 'd' = 'b') => readMessage(t, f).items.map((i) => {
    const e = makeEntry(i.name, i.slot, '2026-10-30', false, 0, 'x', undefined, i.qty);
    return `${i.slot}:${entryLabel(e)}:${e.kcal}`;
  });
  assert.deepEqual(read('Dalrice 5 chaati with arvar sabji in lunch'), ['l:Dal tadka:289', 'l:Steamed rice:207', 'l:Roti ×5:555', 'l:Arvar sabji:null']);
  assert.deepEqual(read('Black coffe one cu in evening snacks'), ['s:Black coffee:5']);
  assert.deepEqual(read('5 roti dinner'), ['d:Roti ×5:555']);
  assert.deepEqual(read('paneer sabji roti x3 dinner').slice(1), ['d:Roti ×3:333']);
  assert.deepEqual(read('dal 1 katori rice 2 plate lunch'), ['l:Dal tadka:289', 'l:Steamed rice ×2:414']);
  assert.deepEqual(read('two chai and 2 biscuits evening'), ['s:Chai ×2:120', 's:Biscuits ×2:80']);
  // a misspelt or split meal word still works
  assert.equal(readMessage('chole break fasrt', 'd').items[0].slot, 'b');
  assert.equal(readMessage('roti dinnr', 'b').items[0].slot, 'd');
});

test('a counted dish keeps its name for learning', () => {
  const e = makeEntry('roti', 'd', '2026-10-30', false, 0, 'x', undefined, 4);
  assert.equal(e.name, 'Roti (2)');
  assert.equal(e.key, makeEntry('roti', 'd', '2026-10-29').key);
  assert.equal(e.kcal, 444);
});

test('morning snack, evening snack and bare snack are told apart', () => {
  const slots = (t: string, h: number) => readMessage(t, 'b', new Date(2026, 9, 30, h, 0, 0)).items.map((i) => i.slot);
  assert.deepEqual(slots('banana morning snack', 15), ['m']);
  assert.deepEqual(slots('chai evening snack', 9), ['s']);
  assert.deepEqual(slots('makhana snack', 10), ['m']);
  assert.deepEqual(slots('makhana snack', 16), ['s']);
});

test('upcoming meals follow the clock and skip what is eaten', () => {
  const up = upcomingMeals([makeEntry('poha', 'b', '2026-10-30')], T, {}, new Date(2026, 9, 30, 9, 0, 0));
  assert.deepEqual(up.slice(0, 4).map((u) => u.slot), ['m', 'l', 's', 'd']);
});
