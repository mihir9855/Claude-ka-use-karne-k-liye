import assert from 'node:assert/strict';
import test from 'node:test';
import { addToList, defaultLists, readListCommand } from '../src/core/lists';

test('reads grocery commands in several forms', () => {
  const want = { list: 'Grocery', items: ['Rice', 'Daal', 'Sugar', 'Oil'] };
  assert.deepEqual(readListCommand('add grocery list rice, daal, sugar, oil'), want);
  assert.deepEqual(readListCommand('Add rice, daal, sugar and oil to grocery list'), want);
  assert.deepEqual(readListCommand('add rice daal sugar oil'.replace(/ /g, ',') + ' to my grocory list'), want);
  assert.deepEqual(readListCommand('grocery list: rice, daal, sugar, oil'), want);
  assert.deepEqual(readListCommand('add milk to list'), { list: 'Grocery', items: ['Milk'] });
});

test('other list names make their own list', () => {
  assert.deepEqual(readListCommand('add sofa, lamp to home list'), { list: 'Home', items: ['Sofa', 'Lamp'] });
});

test('meals are never taken for a list', () => {
  assert.equal(readListCommand('dal rice in lunch'), null);
  assert.equal(readListCommand('poha, chai'), null);
  assert.equal(readListCommand('what is on my list'), null);
  assert.equal(readListCommand('add grocery list'), null);
});

test('adding does not double items and revives ticked ones', () => {
  const a = addToList(defaultLists(), 'Grocery', ['Rice', 'Oil']);
  assert.equal(a.lists[0].items.length, 2);
  const b = addToList(a.lists, 'grocery', ['rice', 'Salt']);
  assert.deepEqual(b.added, ['Salt']);
  const ticked = { ...b.lists[0], items: b.lists[0].items.map((i) => (i.text === 'Rice' ? { ...i, done: true } : i)) };
  const c = addToList([ticked], 'Grocery', ['Rice']);
  assert.deepEqual(c.added, ['Rice']);
  assert.equal(c.lists[0].items.find((i) => i.text === 'Rice')?.done, false);
  assert.equal(addToList(c.lists, 'Home', ['Lamp']).lists.length, 2);
});
