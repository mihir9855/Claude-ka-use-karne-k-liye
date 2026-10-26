import assert from 'node:assert/strict';
import { test } from 'node:test';
const mem = new Map<string,string>();
(globalThis as any).window = undefined;
import Module from 'node:module';
const orig = (Module as any)._load;
(Module as any)._load = function (req: string, ...a: any[]) {
  if (req === '@react-native-async-storage/async-storage')
    return { default: { getItem: async (k: string) => mem.get(k) ?? null, setItem: async (k: string, v: string) => void mem.set(k, v), removeItem: async (k: string) => void mem.delete(k) } };
  return orig.call(this, req, ...a);
};
test('finishing an item moves it to the shopping list, buying moves it back', async () => {
  const { useStore } = await import('../src/state/store');
  const s = () => useStore.getState();
  s().cyclePantry('paneer'); assert.ok(s().pantry.have.paneer);
  s().cyclePantry('paneer'); assert.ok(s().pantry.soon.paneer);
  s().cyclePantry('paneer');
  assert.equal(s().pantry.have.paneer, undefined);
  assert.equal(s().shopping.paneer, 0);
  s().addToShopping([{ id: 'aloo', g: 300 }, { id: 'paneer', g: 200 }]);
  assert.equal(s().shopping.aloo, 300);
  assert.equal(s().shopping.paneer, 200);
  s().markBought('aloo');
  assert.equal(s().shopping.aloo, undefined);
  assert.ok(s().pantry.have.aloo);
  s().addIngredient('Ragi atta', 'flour', undefined, 'buy');
  const id = s().customIngredients[0].id;
  assert.equal(s().shopping[id], 0);
  assert.equal(s().pantry.have[id], undefined);
  s().removeIngredient(id);
  assert.equal(s().shopping[id], undefined);
});

test('finishing sends an item to the buy list and reset clears everything', async () => {
  const { useStore } = await import('../src/state/store');
  const s = () => useStore.getState();
  s().togglePantry('curd');
  assert.ok(s().pantry.have.curd);
  s().finishItem('curd');
  assert.equal(s().pantry.have.curd, undefined);
  assert.equal(s().shopping.curd, 0);
  s().addIngredient('Ragi', 'flour');
  s().resetAll();
  assert.equal(s().onboarded, false);
  assert.deepEqual(s().shopping, {});
  assert.deepEqual(s().customIngredients, []);
  assert.equal(s().persons.length, 2);
});

test('makeWeek plans seven days, keeps eaten meals, and rules reach the planner', async () => {
  const { useStore } = await import('../src/state/store');
  const { todayStr, addDays } = await import('../src/core/dates');
  const s = () => useStore.getState();
  s().resetAll();
  s().setRules({ avoidFried: true });
  s().makeWeek();
  const today = todayStr();
  assert.equal(Object.keys(s().plans).length, 7);
  assert.ok(s().plans[addDays(today, 6)]);
  const slot = s().plans[today].slots[0];
  const eatenDish = slot.options[0].dishIds;
  s().logMeal(today, slot.slot, eatenDish);
  s().makeWeek();
  assert.deepEqual(s().plans[today].slots[0].options[0].dishIds, eatenDish);
  s().toggleMenuDish('idli');
  assert.equal(s().menu.menuOff.idli, true);
  s().toggleMenuDish('idli');
  assert.equal(s().menu.menuOff.idli, undefined);
  s().resetAll();
});

test('editing a dish\'s ingredients changes its nutrition everywhere, and reset brings it back', async () => {
  const { useStore, allDishes } = await import('../src/state/store');
  const { dishMacros } = await import('../src/core/nutrition');
  const s = () => useStore.getState();
  s().resetAll();
  const find = () => allDishes(s().customDishes, s().dishEdits).find((x) => x.id === 'aloo_matar')!;
  const before = dishMacros(find()).kcal;
  s().setDishItems('aloo_matar', [{ ing: 'aloo', g: 300 }, { ing: 'oil', g: 20 }]);
  assert.ok(dishMacros(find()).kcal !== before);
  assert.equal(find().items.length, 2);
  s().resetDishItems('aloo_matar');
  assert.equal(dishMacros(find()).kcal, before);
});
