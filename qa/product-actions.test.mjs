import assert from 'node:assert/strict';
import { toggleFavorite, chatQuestions } from '../product-actions.mjs';

const state = {cart:['sneakers'],quantities:{sneakers:1}};
assert.equal(toggleFavorite(state,'sneakers'),true);
assert.deepEqual(state.favorites,['sneakers']);
assert.equal(toggleFavorite(state,'rickLaces'),true);
assert.equal(toggleFavorite(state,'sneakers'),false);
assert.deepEqual(state.favorites,['rickLaces']);
for (let i=0;i<100;i++) toggleFavorite(state,'washBag');
assert.deepEqual(state.favorites,['rickLaces']);
assert.deepEqual(state.cart,['sneakers']);
assert.deepEqual(state.quantities,{sneakers:1});
assert.equal(chatQuestions.length,3);
assert.equal(new Set(chatQuestions).size,3);
console.log('Favorites toggle, per-product isolation, repeated taps and cart independence passed');
