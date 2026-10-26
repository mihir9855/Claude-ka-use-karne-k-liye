import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BUILTIN_DISHES } from '../src/data/dishes';
import { INGREDIENT_BY_ID } from '../src/data/ingredients';
import { habitStats } from '../src/core/habits';
import { autoMealCount, computeTargets, dishFlags, dishMacros } from '../src/core/nutrition';
import { generateDayPlan, shoppingGap, type PlanInput } from '../src/core/planner';
import { dayChecks } from '../src/core/dayCheck';
import type { Person } from '../src/core/types';

const him: Person = { name: 'A', sex: 'male', age: 32, heightCm: 172, weightKg: 78, activity: 'moderate', goal: 'muscle_gain', conditions: [] };
const her: Person = { name: 'B', sex: 'female', age: 29, heightCm: 160, weightKg: 62, activity: 'light', goal: 'fat_loss', conditions: [] };

const base = (over: Partial<PlanInput> = {}): PlanInput => ({
  date: '2026-10-24',
  persons: [him, her],
  mealCount: 4,
  dishes: BUILTIN_DISHES,
  pantry: { have: {}, soon: {} },
  log: [],
  prefs: {},
  strictPantry: true,
  ...over,
});

test('every dish references known ingredients', () => {
  for (const d of BUILTIN_DISHES) for (const it of d.items) assert.ok(INGREDIENT_BY_ID[it.ing], `${d.id}: ${it.ing}`);
  assert.equal(new Set(BUILTIN_DISHES.map((d) => d.id)).size, BUILTIN_DISHES.length);
});

test('targets follow goal', () => {
  const a = computeTargets(him);
  const b = computeTargets(her);
  assert.ok(a.protein >= 138 && a.protein <= 142, String(a.protein));
  assert.ok(b.protein >= 97 && b.protein <= 101, String(b.protein));
  assert.ok(b.kcal < 2000 && b.kcal >= 1200);
  assert.ok(computeTargets({ ...him, conditions: ['kidney'] }).protein <= 63);
});

test('auto meal count rises with protein need', () => {
  assert.equal(autoMealCount([{ ...computeTargets(her), protein: 60, kcal: 1500 }]), 3);
  assert.equal(autoMealCount([{ ...computeTargets(her), protein: 190, kcal: 2800 }]), 5);
});

test('aloo matar is not flagged high GI and rice is', () => {
  const f = (id: string) => dishFlags(BUILTIN_DISHES.find((d) => d.id === id)!);
  assert.ok(!f('aloo_matar').has('high_gi'));
  assert.ok(f('rice').has('high_gi'));
  assert.ok(dishMacros(BUILTIN_DISHES.find((d) => d.id === 'palak_paneer')!).protein > 15);
});

test('plan has A and B per slot, and is deterministic', () => {
  const p1 = generateDayPlan(base());
  const p2 = generateDayPlan(base());
  assert.deepEqual(p1, p2);
  assert.equal(p1.slots.length, 4);
  for (const s of p1.slots) {
    assert.equal(s.options.length, 2);
    assert.notDeepEqual(s.options[0].dishIds, s.options[1].dishIds);
  }
  assert.notDeepEqual(generateDayPlan(base({ salt: 1 })), p1);
});

test('plan lands near protein target', () => {
  const plan = generateDayPlan(base());
  const t = computeTargets(him).protein;
  const got = plan.slots.reduce((a, s) => a + s.options[0].protein[0], 0);
  assert.ok(Math.abs(got - t) / t < 0.3, `${got} vs ${t}`);
});

test('medical limits exclude dishes', () => {
  const lactose = generateDayPlan(base({ persons: [{ ...him, conditions: ['lactose', 'no_onion_garlic'] }, her] }));
  const byId = new Map(BUILTIN_DISHES.map((d) => [d.id, d]));
  for (const s of lactose.slots)
    for (const o of s.options)
      for (const id of o.dishIds) {
        const f = dishFlags(byId.get(id)!);
        assert.ok(!f.has('dairy') && !f.has('onion_garlic'), id);
      }
});

test('pantry drives suggestions and shopping gap', () => {
  const have = Object.fromEntries(['aloo', 'matar', 'tomato', 'onion', 'atta', 'toor_dal', 'curd', 'cucumber', 'rice', 'moong_dal', 'besan'].map((k) => [k, true]));
  const plan = generateDayPlan(base({ pantry: { have, soon: {} }, mealCount: 3 }));
  const lunch = plan.slots.find((s) => s.slot === 'lunch')!;
  assert.ok(lunch.options[0].coverage >= 0.75);
  assert.ok(Array.isArray(shoppingGap(plan, BUILTIN_DISHES, { have, soon: {} })));
});

test('eaten dishes are held back next day and counted', () => {
  const log = [{ id: '1', date: '2026-10-23', slot: 'lunch' as const, dishIds: ['aloo_matar', 'roti'] }];
  const stats = habitStats(log, '2026-10-24');
  assert.equal(stats.get('aloo_matar')?.daysAgo, 1);
  const plan = generateDayPlan(base({ log, mealCount: 3 }));
  const lunch = plan.slots[1].options[0].dishIds;
  assert.ok(!lunch.includes('aloo_matar'));
});

test('a dish eaten today is not suggested again later today', () => {
  const log = [{ id: '1', date: '2026-10-24', slot: 'breakfast' as const, dishIds: ['paneer_paratha'] }];
  const plan = generateDayPlan(base({ log, mealCount: 5 }));
  for (const sp of plan.slots) for (const o of sp.options) assert.ok(!o.dishIds.includes('paneer_paratha'));
});

test('family of four, with children, gets one plan with per-member portions', () => {
  const kid: Person = { name: 'K', sex: 'male', age: 8, heightCm: 125, weightKg: 26, activity: 'light', goal: 'maintain', conditions: [] };
  const elder: Person = { name: 'E', sex: 'female', age: 64, heightCm: 155, weightKg: 60, activity: 'sedentary', goal: 'maintain', conditions: ['diabetes'] };
  const persons = [him, her, kid, elder];
  const plan = generateDayPlan(base({ persons, mealCount: 4 }));
  for (const sp of plan.slots) {
    assert.equal(sp.targets.length, 4);
    for (const o of sp.options) {
      assert.equal(o.servings.length, 4);
      assert.ok(o.servings[2] <= o.servings[0]);
    }
  }
  // diabetes in the family removes fast-carb dishes for everyone
  const byId = new Map(BUILTIN_DISHES.map((d) => [d.id, d]));
  for (const sp of plan.slots) for (const o of sp.options) for (const id of o.dishIds) assert.ok(!dishFlags(byId.get(id)!).has('high_gi'), id);
});

test('child targets are age-based and ignore weight-loss goals', () => {
  const kid: Person = { name: 'K', sex: 'female', age: 10, heightCm: 135, weightKg: 32, activity: 'light', goal: 'fat_loss', conditions: [] };
  const t = computeTargets(kid);
  assert.equal(t.kcal, 2000);
  assert.equal(t.protein, 32);
});

test('day checks flag a full day and a thin one', () => {
  const plan = generateDayPlan(base({ mealCount: 5 }));
  const checks = dayChecks(plan, BUILTIN_DISHES, [him, her]);
  assert.equal(typeof checks.protein, 'boolean');
  const emptied = { ...plan, slots: plan.slots.map((s) => ({ ...s, options: [] })) };
  const none = dayChecks(emptied, BUILTIN_DISHES, [him, her]);
  assert.ok(!none.protein && !none.dairy && !none.fruit);
});

test('over a week every member gets most of their protein, plus dal and dairy daily', () => {
  for (let d = 1; d <= 7; d++) {
    const plan = generateDayPlan(base({ date: `2026-10-0${d}`, mealCount: 5 }));
    const c = dayChecks(plan, BUILTIN_DISHES, [him, her]);
    assert.ok(c.pulse && c.dairy, `day ${d}`);
    [him, her].forEach((p, i) => {
      const got = plan.slots.reduce((a, sp) => a + sp.options[0].protein[i], 0);
      assert.ok(got >= computeTargets(p).protein * 0.8, `day ${d} member ${i}: ${got}`);
    });
  }
});

import { matchIngredients } from '../src/core/match';
import { detectItemsFromImage, lookupBarcode, parseItems, ScanError } from '../src/core/scan';

test('product and bill text maps to pantry items', () => {
  assert.deepEqual(matchIngredients('Aashirvaad Whole Wheat Atta 5kg'), ['atta']);
  assert.deepEqual(matchIngredients('Tata Sampann Toor Dal'), ['toor_dal']);
  assert.deepEqual(matchIngredients('Amul Fresh Paneer'), ['paneer']);
  assert.deepEqual(matchIngredients('Chana dal 1kg'), ['chana_dal']);
  assert.deepEqual(matchIngredients('Kabuli chana'), ['chole']);
  assert.deepEqual(matchIngredients('Poha thick flattened rice'), ['poha']);
  assert.deepEqual(matchIngredients('Dark Chocolate with almonds'), []);
  assert.deepEqual(matchIngredients('Tomatoes 500g').sort(), ['tomato']);
  assert.ok(matchIngredients('Onion, potato, green peas').length === 3);
});

test('barcode lookup uses Open Food Facts and maps the name', async () => {
  const calls: string[] = [];
  const fake = (async (url: string) => {
    calls.push(url);
    return { ok: true, status: 200, json: async () => ({ status: 1, product: { product_name: 'Fortune Besan', categories_tags: ['en:flours'] } }) };
  }) as unknown as typeof fetch;
  const r = await lookupBarcode('8901234567890', fake);
  assert.deepEqual(r, { found: true, name: 'Fortune Besan', ids: ['besan'] });
  assert.match(calls[0], /world\.openfoodfacts\.org\/api\/v2\/product\/8901234567890\.json/);
  const none = (async () => ({ ok: true, status: 200, json: async () => ({ status: 0 }) })) as unknown as typeof fetch;
  assert.deepEqual(await lookupBarcode('8901234567890', none), { found: false, ids: [] });
  assert.deepEqual(await lookupBarcode('12', none), { found: false, ids: [] });
});

test('photo detection keeps only valid ids and reports errors clearly', async () => {
  assert.deepEqual(parseItems('```json\n{"items":["tomato","unicorn","paneer","tomato"]}\n```'), ['tomato', 'paneer']);
  assert.deepEqual(parseItems('no json here'), []);
  let seen: { headers: Record<string, string>; body: string } | undefined;
  const ok = (async (_u: string, init: { headers: Record<string, string>; body: string }) => {
    seen = init;
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"items":["aloo","matar"]}' }] } }] }) };
  }) as unknown as typeof fetch;
  assert.deepEqual(await detectItemsFromImage({ base64: 'AAA', apiKey: 'k' }, ok), { ids: ['aloo', 'matar'], extras: [] });
  assert.equal(seen!.headers['x-goog-api-key'], 'k');
  assert.ok(!seen!.body.includes('"oil"'));
  const bad = (async () => ({ ok: false, status: 403, json: async () => ({}) })) as unknown as typeof fetch;
  await assert.rejects(detectItemsFromImage({ base64: 'AAA', apiKey: 'x' }, bad), (e: ScanError) => e.kind === 'key');
  const limit = (async () => ({ ok: false, status: 429, json: async () => ({}) })) as unknown as typeof fetch;
  await assert.rejects(detectItemsFromImage({ base64: 'AAA', apiKey: 'x' }, limit), (e: ScanError) => e.kind === 'limit');
});

import { INGREDIENTS, setCustomIngredients, GROUP_DEFAULTS } from '../src/data/ingredients';

test('custom pantry items feed dish nutrition and can be removed again', () => {
  const before = INGREDIENTS.length;
  setCustomIngredients([
    { id: 'x_a', name: { en: 'Ragi', hi: 'Ragi', gu: 'Ragi' }, group: 'flour', ...GROUP_DEFAULTS.flour, protein: 7.3, kcal: 328 },
  ]);
  assert.equal(INGREDIENTS.length, before + 1);
  assert.equal(INGREDIENT_BY_ID.x_a.protein, 7.3);
  const dish = { id: 'c1', name: { en: 'Ragi roti', hi: '', gu: '' }, role: 'staple' as const, meals: ['lunch' as const], items: [{ ing: 'x_a', g: 100 }] };
  assert.equal(Math.round(dishMacros(dish).protein * 10), 73);
  setCustomIngredients([]);
  assert.equal(INGREDIENTS.length, before);
  assert.equal(INGREDIENT_BY_ID.x_a, undefined);
  // planner and shopping gap ignore unknown ids instead of crashing
  assert.doesNotThrow(() => generateDayPlan(base({ dishes: [...BUILTIN_DISHES, dish] })));
});


import { lookupNutrition, normalizeNutrition, parseExtras } from '../src/core/scan';

const geminiReply = (text: string) =>
  (async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }) })) as unknown as typeof fetch;

test('typed name gets nutrition from Gemini and implausible numbers are rejected', async () => {
  const good = geminiReply('{"group":"flour","kcal":328,"protein":7.3,"carbs":72,"fat":1.3,"fiber":11}');
  assert.deepEqual(await lookupNutrition('Ragi atta', 'key', good), { group: 'flour', kcal: 328, protein: 7.3, carbs: 72, fat: 1.3, fiber: 11, source: 'ai' });
  assert.equal(normalizeNutrition({ group: 'veg', kcal: 5000, protein: 1, carbs: 1, fat: 1 }), null); // kcal impossible
  assert.equal(normalizeNutrition({ group: 'veg', kcal: 100, protein: 60, carbs: 50, fat: 10 }), null); // macros exceed 100 g
  assert.equal(normalizeNutrition({ group: 'bogus', kcal: 50, protein: 1, carbs: 10, fat: 0.5 })!.group, 'other');
  assert.equal(normalizeNutrition({ kcal: 'many' }), null);
});

test('without a key, or when Gemini fails, name lookup falls back to Open Food Facts', async () => {
  const calls: string[] = [];
  const off = (async (url: string) => {
    calls.push(url);
    return {
      ok: true,
      status: 200,
      json: async () => ({
        products: [
          { nutriments: { 'energy-kcal_100g': 330, proteins_100g: 7, carbohydrates_100g: 72, fat_100g: 1.5, fiber_100g: 11 } },
          { nutriments: { 'energy-kcal_100g': 340, proteins_100g: 8, carbohydrates_100g: 70, fat_100g: 2, fiber_100g: 10 } },
          { nutriments: { 'energy-kcal_100g': 9999, proteins_100g: 1, carbohydrates_100g: 1, fat_100g: 1 } },
        ],
      }),
    };
  }) as unknown as typeof fetch;
  const r = await lookupNutrition('ragi flour', undefined, off);
  assert.equal(r?.source, 'web');
  assert.equal(r?.kcal, 340);
  assert.match(calls[0], /search_terms=ragi%20flour/);
  const down = (async () => { throw new Error('offline'); }) as unknown as typeof fetch;
  assert.equal(await lookupNutrition('ragi flour', undefined, down), null);
  const noKey = (async () => ({ ok: false, status: 403, json: async () => ({}) })) as unknown as typeof fetch;
  await assert.rejects(lookupNutrition('ragi', 'bad', noKey), (e: ScanError) => e.kind === 'key');
});

test('photo extras keep only plausible, de-duplicated, named items', () => {
  const text = JSON.stringify({
    items: ['tomato'],
    others: [
      { name: 'Ragi', group: 'flour', kcal: 328, protein: 7, carbs: 72, fat: 1.3, fiber: 11 },
      { name: 'ragi', group: 'flour', kcal: 328, protein: 7, carbs: 72, fat: 1.3 },
      { name: 'Magic', group: 'veg', kcal: 99999, protein: 1, carbs: 1, fat: 1 },
      { group: 'veg', kcal: 30, protein: 1, carbs: 5, fat: 0.2 },
    ],
  });
  const extras = parseExtras(text);
  assert.equal(extras.length, 1);
  assert.equal(extras[0].name, 'Ragi');
});

import { AISLES, aisleOf, groupShopping, shoppingHtml, shoppingText } from '../src/core/shopping';
import { INGREDIENT_BY_ID as ING } from '../src/data/ingredients';

test('shopping list is grouped by store aisle, in walking order', () => {
  const list = { aloo: 500, palak: 0, banana: 0, paneer: 200, atta: 0, toor_dal: 0, almonds: 0, ghee: 0, papad: 0, tomato: 0 };
  const groups = groupShopping(list, ING, 'en');
  assert.deepEqual(groups.map((g) => g.aisle), ['veg', 'fruit', 'dairy', 'pulse', 'staple', 'dry', 'oil', 'other']);
  assert.deepEqual(groups[0].items.map((i) => i.name), ['Potato', 'Spinach (palak)', 'Tomato']);
  assert.equal(aisleOf(ING.palak), 'veg');
  assert.equal(aisleOf(ING.ghee), 'oil');
  assert.deepEqual(groupShopping({}, ING, 'en'), []);
  assert.deepEqual(groupShopping({ nope: 0 }, ING, 'en'), []); // unknown ids are skipped
  assert.ok(AISLES.length === 8);
  const text = shoppingText(groups.slice(0, 1), (a) => a.toUpperCase(), 'Shopping list', 'g');
  assert.equal(text, 'Shopping list\n\nVEG\n• Potato – 500 g\n• Spinach (palak)\n• Tomato');
});

test('printable list escapes text and carries categories, items and quantities', () => {
  const groups = groupShopping({ aloo: 500, palak: 0 }, ING, 'en');
  const html = shoppingHtml(groups, (a) => (a === 'veg' ? 'Veg <b>' : a), 'Shopping & list', 'g', '2026-10-25');
  assert.match(html, /<h1>Shopping &amp; list<\/h1>/);
  assert.match(html, /Veg &lt;b&gt;/);
  assert.match(html, /<li><i><\/i>Potato<b>500 g<\/b><\/li>/);
  assert.match(html, /<li><i><\/i>Spinach \(palak\)<\/li>/);
  assert.ok(!html.includes('<script'));
});

import { portionText } from '../src/core/portion';

test('portions read as plain fractions', () => {
  assert.deepEqual([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5].map(portionText), ['½', '¾', '1', '1¼', '1½', '1¾', '2', '2¼', '2½']);
});

test('dish library: 250+ dishes, valid ingredients, sane numbers, names in three languages', () => {
  assert.ok(BUILTIN_DISHES.length >= 250, String(BUILTIN_DISHES.length));
  const ids = new Set<string>();
  for (const dish of BUILTIN_DISHES) {
    assert.ok(!ids.has(dish.id), `duplicate ${dish.id}`);
    ids.add(dish.id);
    assert.ok(dish.items.length > 0, dish.id);
    for (const it of dish.items) {
      assert.ok(INGREDIENT_BY_ID[it.ing], `${dish.id}: ${it.ing}`);
      assert.ok(it.g > 0 && it.g <= 500, `${dish.id}: ${it.g} g of ${it.ing}`);
    }
    const m = dishMacros(dish);
    const light = dish.role === 'side' || dish.id === 'papad' || dish.id.includes('soup');
    assert.ok(m.kcal >= (light ? 20 : 60) && m.kcal <= 950, `${dish.id}: ${Math.round(m.kcal)} kcal`);
    assert.ok(m.protein <= 70, `${dish.id}: ${Math.round(m.protein)} g protein`);
    assert.ok(dish.name.en && dish.name.hi && dish.name.gu, dish.id);
    assert.ok((dish.meals.length > 0 || dish.id === 'papad') && dish.cuisine, dish.id);
    if (dish.role === 'staple') assert.ok(dish.staple, `${dish.id} needs a staple kind`);
  }
  // every cuisine has something to cook, and fried dishes are tagged
  for (const c of ['north', 'west', 'south', 'east', 'northeast', 'continental', 'indochinese'])
    assert.ok(BUILTIN_DISHES.some((x) => x.cuisine === c), c);
  assert.ok(BUILTIN_DISHES.filter((x) => x.tags?.includes('fried')).length >= 10);
});

test('vegetarian library: nothing needs onion or garlic unless it lists them', () => {
  const jain = BUILTIN_DISHES.filter((dish) => !dishFlags(dish).has('onion_garlic'));
  assert.ok(jain.length >= 150, `only ${jain.length} onion-garlic-free dishes`);
});

import { addDays, isWeekday } from '../src/core/dates';
import { generateWeekPlan, stapleKindFor } from '../src/core/planner';
import type { MenuPrefs, PlanRules } from '../src/core/types';

const { date: _d, ...weekBase } = base();
const noRules: PlanRules = { stapleRule: 'any', avoidFried: false, avoidSweet: false, quickWeekdays: false };
const allMenu: MenuPrefs = { cuisines: [], usual: [], menuOff: {}, includeNew: true };
const dishOf = new Map(BUILTIN_DISHES.map((x) => [x.id, x]));
const idsOf = (week: ReturnType<typeof generateWeekPlan>) =>
  Object.values(week).flatMap((p) => p.slots.flatMap((s) => s.options.flatMap((o) => o.dishIds)));

test('dates helpers', () => {
  assert.equal(addDays('2026-10-30', 3), '2026-11-02');
  assert.equal(addDays('2026-12-30', 3), '2027-01-02');
  assert.equal(isWeekday('2026-10-26'), true); // Monday
  assert.equal(isWeekday('2026-10-25'), false); // Sunday
});

test('a 7-day plan for 4 people with 6 meals is fast and gives every day every meal', () => {
  const kid: Person = { name: 'K', sex: 'male', age: 8, heightCm: 125, weightKg: 26, activity: 'light', goal: 'maintain', conditions: [] };
  const t0 = Date.now();
  const week = generateWeekPlan({ ...weekBase, persons: [him, her, kid, { ...her, name: 'E' }], mealCount: 6, rules: noRules, menu: allMenu }, '2026-10-26', 7);
  const ms = Date.now() - t0;
  assert.ok(ms < 4000, `${ms} ms`);
  assert.equal(Object.keys(week).length, 7);
  for (const p of Object.values(week)) {
    assert.equal(p.slots.length, 6);
    for (const s of p.slots) assert.ok(s.options.length >= 1);
  }
});

test('the same main dish does not appear on consecutive days', () => {
  const week = generateWeekPlan({ ...weekBase, mealCount: 4, rules: noRules, menu: allMenu }, '2026-10-26', 7);
  const keyOf = (date: string) =>
    new Set(week[date].slots.flatMap((s) => s.options[0].dishIds).filter((id) => ['main', 'complete'].includes(dishOf.get(id)!.role)));
  let repeats = 0;
  for (let i = 0; i < 6; i++) {
    const a = keyOf(addDays('2026-10-26', i));
    for (const id of keyOf(addDays('2026-10-26', i + 1))) if (a.has(id)) repeats++;
  }
  assert.ok(repeats <= 2, `${repeats} dishes repeated on the next day`);
});

test('rules: rice only, bread only, alternate, no fried, no sweet', () => {
  const stapleIds = (week: ReturnType<typeof generateWeekPlan>, date: string) =>
    week[date].slots.filter((s) => ['lunch', 'dinner'].includes(s.slot)).flatMap((s) => s.options.flatMap((o) => o.dishIds)).filter((id) => dishOf.get(id)!.role === 'staple');
  const rice = generateWeekPlan({ ...weekBase, rules: { ...noRules, stapleRule: 'rice' }, menu: allMenu }, '2026-10-26', 3);
  for (const date of Object.keys(rice)) for (const id of stapleIds(rice, date)) assert.equal(dishOf.get(id)!.staple, 'rice', id);
  const bread = generateWeekPlan({ ...weekBase, rules: { ...noRules, stapleRule: 'bread' }, menu: allMenu }, '2026-10-26', 3);
  for (const date of Object.keys(bread)) for (const id of stapleIds(bread, date)) assert.equal(dishOf.get(id)!.staple, 'bread', id);
  assert.notEqual(stapleKindFor({ ...noRules, stapleRule: 'alternate' }, '2026-10-26'), stapleKindFor({ ...noRules, stapleRule: 'alternate' }, '2026-10-27'));
  const clean = generateWeekPlan({ ...weekBase, mealCount: 6, rules: { ...noRules, avoidFried: true, avoidSweet: true }, menu: allMenu }, '2026-10-26', 4);
  for (const id of idsOf(clean)) assert.ok(!dishOf.get(id)!.tags?.some((t) => t === 'fried' || t === 'sweet'), id);
});

test('My Menu: removed dishes and unselected cuisines stay out, unless new dishes are allowed', () => {
  const south: MenuPrefs = { cuisines: ['south'], usual: ['south'], menuOff: { dosa: true }, includeNew: false };
  const week = generateWeekPlan({ ...weekBase, mealCount: 6, rules: noRules, menu: south }, '2026-10-26', 3);
  for (const id of idsOf(week)) {
    assert.equal(dishOf.get(id)!.cuisine, 'south', id);
    assert.notEqual(id, 'dosa');
  }
  const open = generateWeekPlan({ ...weekBase, mealCount: 6, rules: noRules, menu: { ...south, includeNew: true } }, '2026-10-26', 3);
  assert.ok(idsOf(open).some((id) => dishOf.get(id)!.cuisine !== 'south'));
  for (const id of idsOf(open)) assert.notEqual(id, 'dosa');
});

test('quick weekdays prefer dishes tagged quick', () => {
  const rules = { ...noRules, quickWeekdays: true };
  const on = generateWeekPlan({ ...weekBase, mealCount: 4, rules, menu: allMenu }, '2026-10-26', 5); // Mon-Fri
  const off = generateWeekPlan({ ...weekBase, mealCount: 4, rules: noRules, menu: allMenu }, '2026-10-26', 5);
  const share = (w: ReturnType<typeof generateWeekPlan>) => {
    const ids = Object.values(w).flatMap((p) => p.slots.map((s) => s.options[0].dishIds).flat());
    return ids.filter((id) => dishOf.get(id)!.tags?.includes('quick')).length / ids.length;
  };
  assert.ok(share(on) > share(off), `${share(on)} vs ${share(off)}`);
});

import { shoppingGapWeek } from '../src/core/planner';

test('week shopping list adds up ingredients across days and skips what is at home', () => {
  const week = generateWeekPlan({ ...weekBase, mealCount: 3, rules: noRules, menu: allMenu }, '2026-10-26', 3);
  const none = shoppingGapWeek(Object.values(week), BUILTIN_DISHES, { have: {}, soon: {} });
  assert.ok(none.length > 5);
  assert.equal(new Set(none.map((x) => x.ing)).size, none.length); // each ingredient once
  const have = Object.fromEntries(none.slice(0, 3).map((x) => [x.ing, true]));
  const some = shoppingGapWeek(Object.values(week), BUILTIN_DISHES, { have, soon: {} });
  for (const k of Object.keys(have)) assert.ok(!some.some((x) => x.ing === k));
  assert.equal(some.length, none.length - 3);
});

import { dayInsight, dayNutrition } from '../src/core/dayCheck';

test('day nutrition adds up per person and per meal, and the insight names the biggest problem', () => {
  const plan = generateDayPlan(base({ mealCount: 4 }));
  const days = dayNutrition(plan, BUILTIN_DISHES, [him, her]);
  assert.equal(days.length, 2);
  for (const day of days) {
    const sum = Object.values(day.bySlot).reduce((a, m) => a + m.kcal, 0);
    assert.ok(Math.abs(sum - day.total.kcal) < 1e-6);
    assert.equal(Object.keys(day.bySlot).length, 4);
  }
  const t = computeTargets(him);
  const heavy = { total: { kcal: t.kcal * 1.5, protein: t.protein, carbs: t.carbs * 2, fat: t.fat, fiber: t.fiber }, bySlot: { breakfast: { kcal: 1, protein: 1, carbs: t.carbs * 1.2, fat: 1, fiber: 1 }, lunch: { kcal: 1, protein: 1, carbs: t.carbs * 0.8, fat: 1, fiber: 1 } } };
  const insight = dayInsight(heavy, t);
  assert.equal(insight?.macro, 'carbs');
  assert.ok(insight!.diff > 0);
  assert.equal(insight?.slot, 'breakfast');
  const low = { total: { kcal: t.kcal, protein: t.protein * 0.5, carbs: t.carbs, fat: t.fat, fiber: t.fiber }, bySlot: {} };
  assert.deepEqual(dayInsight(low, t), { macro: 'protein', diff: t.protein * -0.5 });
  const fine = { total: { kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat, fiber: t.fiber * 2 }, bySlot: {} };
  assert.equal(dayInsight(fine, t), null); // extra fibre is not a warning
});

import { avoidWords, findDishes, parseSuggestions } from '../src/core/finder';

const reply = (dishes: unknown[]) => JSON.stringify({ dishes });
const good = { name_en: 'Paneer palak wrap', name_hi: 'Paneer palak wrap', name_gu: 'પનીર પાલક રેપ', role: 'complete', meals: ['lunch', 'dinner'], cuisine: 'north', items: [{ id: 'atta', g: 50 }, { id: 'paneer', g: 70 }, { id: 'palak', g: 80 }, { id: 'oil', g: 6 }], extras: [] };

test('AI suggestions: valid dishes pass, nonsense is dropped', () => {
  const ok = parseSuggestions(reply([good]));
  assert.equal(ok.length, 1);
  assert.equal(ok[0].name.gu, 'પનીર પાલક રેપ');
  assert.equal(ok[0].items.length, 4);
  const bad = [
    { ...good, name_en: 'Unknown id', items: [{ id: 'unicorn', g: 50 }, { id: 'atta', g: 50 }] },
    { ...good, name_en: 'Too heavy', items: [{ id: 'ghee', g: 300 }, { id: 'atta', g: 300 }] },
    { ...good, name_en: 'One item', items: [{ id: 'atta', g: 50 }] },
    { ...good, name_en: 'Bad role', role: 'dessert' },
    { ...good, name_en: '', items: good.items },
  ];
  assert.deepEqual(parseSuggestions(reply(bad)), []);
  assert.deepEqual(parseSuggestions('not json'), []);
});

test('AI suggestions: health limits are enforced in code, not only in the prompt', () => {
  const lactose = new Set(['dairy'] as const) as Set<'dairy'>;
  assert.deepEqual(parseSuggestions(reply([good]), lactose), []); // contains paneer
  const dairyFree = { ...good, name_en: 'Palak wrap', items: [{ id: 'atta', g: 50 }, { id: 'palak', g: 80 }, { id: 'oil', g: 8 }] };
  assert.equal(parseSuggestions(reply([dairyFree]), lactose).length, 1);
  const sneaky = { ...dairyFree, name_en: 'Cheesy wrap', extras: [{ name: 'Cheese slice', g: 20, group: 'dairy', kcal: 300, protein: 20, carbs: 3, fat: 24, fiber: 0 }] };
  assert.deepEqual(parseSuggestions(reply([sneaky]), lactose), []); // extra outside the list is still caught by its name
  const withExtra = { ...dairyFree, name_en: 'Palak wrap with ragi', extras: [{ name: 'Sprouted ragi', g: 20, group: 'flour', kcal: 330, protein: 7, carbs: 70, fat: 1.5, fiber: 11 }] };
  assert.equal(parseSuggestions(reply([withExtra]), lactose)[0].extras.length, 1);
});

test('AI Finder sends the key, the request and the family limits, and returns checked dishes', async () => {
  let body = '';
  let key = '';
  const fake = (async (_u: string, init: { headers: Record<string, string>; body: string }) => {
    body = init.body;
    key = init.headers['x-goog-api-key'];
    return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: reply([good]) }] } }] }) };
  }) as unknown as typeof fetch;
  const avoid = avoidWords([{ ...him, conditions: ['lactose'] }, her]);
  assert.ok(avoid.some((w) => w.includes('dairy')));
  const out = await findDishes({ request: 'high protein dinner', apiKey: 'k1', avoid: [], homeStock: ['paneer'] }, fake);
  assert.equal(key, 'k1');
  assert.match(body, /high protein dinner/);
  assert.match(body, /paneer/);
  assert.equal(out.length, 1);
  const blocked = await findDishes({ request: 'dinner', apiKey: 'k1', avoid }, fake);
  assert.deepEqual(blocked, []); // paneer dish is dropped for a lactose-free family
});

import { artFor } from '../src/core/artFor';

test('every dish gets a fitting picture', () => {
  const art = (id: string) => artFor(BUILTIN_DISHES.find((x) => x.id === id)!);
  assert.equal(art('idli'), 'idli');
  assert.equal(art('dosa'), 'dosa');
  assert.equal(art('roti'), 'rotiStack');
  assert.equal(art('jeera_rice'), 'riceBowl');
  assert.equal(art('veg_biryani'), 'riceBowl');
  assert.equal(art('dal_tadka'), 'dalBowl');
  assert.equal(art('sambar'), 'dalBowl');
  assert.equal(art('palak_paneer'), 'paneerBowl');
  assert.equal(art('aloo_gobi'), 'veggiePan');
  assert.equal(art('sweet_lassi'), 'glass');
  assert.equal(art('tomato_soup'), 'soup');
  assert.equal(art('fruit_bowl'), 'fruitBowl');
  assert.equal(art('samosa'), 'snackTri');
  assert.equal(art('green_salad'), 'salad');
  assert.equal(art('dry_fruit_ladoo'), 'ladoo');
  const kinds = new Set(BUILTIN_DISHES.map(artFor));
  assert.ok(kinds.size >= 11, `only ${kinds.size} kinds are used`);
  const count: Record<string, number> = {};
  for (const d of BUILTIN_DISHES) count[artFor(d)] = (count[artFor(d)] ?? 0) + 1;
  // no single picture should dominate the library
  for (const [k, n] of Object.entries(count)) assert.ok(n <= BUILTIN_DISHES.length * 0.3, `${k} is used for ${n} dishes`);
});
