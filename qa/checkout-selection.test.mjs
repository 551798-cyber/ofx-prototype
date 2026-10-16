import assert from 'node:assert/strict';
import { isCheckoutItemSelected, selectedCheckoutCart, toggleCheckoutItem } from '../checkout-selection.mjs';

const selections = {};
const cart = ['sneakers', 'premiataLaces', 'flatLaces'];
assert.equal(isCheckoutItemSelected(selections, 'sneakers'), true);
assert.deepEqual(selectedCheckoutCart(cart, selections), cart);
assert.equal(toggleCheckoutItem(selections, 'sneakers'), false);
assert.equal(isCheckoutItemSelected(selections, 'sneakers'), false);
assert.deepEqual(selectedCheckoutCart(cart, selections), ['premiataLaces', 'flatLaces']);
assert.equal(toggleCheckoutItem(selections, 'sneakers'), true);
assert.deepEqual(selectedCheckoutCart(cart, selections), cart);
console.log('Checkout item selection toggles and filters payment items');
