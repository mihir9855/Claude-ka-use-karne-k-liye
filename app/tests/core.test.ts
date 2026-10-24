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
