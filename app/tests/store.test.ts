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
