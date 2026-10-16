import assert from 'node:assert/strict';
import { calculateTotals } from '../pricing.mjs';

const products = {
  nike: { price: 3590, seller: 'vladimir', bonusPerUnit: 17 },
  coat: { price: 3700, seller: 'vladimir' },
  pants: { price: 3700, seller: 'vladimir' },
  cheap: { price: 50, seller: 'other', realListing: true },
};
const sellers = { vladimir: { delivery: 175 }, other: { delivery: 35 } };
const order = { cart: ['nike', 'coat', 'pants'], quantities: { nike: 1, coat: 1, pants: 1 }, products, sellers,
  demoPricing: { productDiscount: 3000, bonusDiscount: 1000 }, bundleSellers: ['vladimir'], paymentMethod: 'wallet' };
const baseline = calculateTotals(order);
assert.equal(baseline.total, 8300.5);
const applied = calculateTotals({ ...order, promoCode: 'IVANZOLO' });
assert.equal(applied.total, 5300.5, 'Promo must actually reduce the payable amount');
assert.equal(applied.promoDiscount, 3000);
for (const key of ['discount','bundleDiscount','walletDiscount','bonus','delivery','unitPrices']) {
  assert.deepEqual(applied[key], baseline[key], `Promo must preserve previous ${key}`);
}
assert.equal(calculateTotals({ ...order, promoCode: ' ivanzolo ' }).total, 5300.5);
assert.equal(calculateTotals({ ...order, promoCode: 'SALE' }).total, 5300.5);
assert.equal(calculateTotals({ ...order, promoCode: 'ЛЕТО2026' }).total, 5300.5);
assert.equal(calculateTotals({ ...order, promoCode: '   ' }).total, 8300.5);
assert.equal(calculateTotals({ ...order, promoCode: '' }).total, 8300.5);
assert.equal(calculateTotals({ ...order, promoCode: 'IVANZOLO', bonusEnabled: false }).total, 5317.5);
assert.equal(calculateTotals({ ...order, promoCode: 'IVANZOLO', paymentMethod: 'sbp' }).total, 5400.5);
const single = calculateTotals({ ...order, cart: ['nike'], promoCode: 'IVANZOLO' });
assert.equal(single.bundleDiscount, 0);
assert.equal(single.total, 648);
const cheap = calculateTotals({ ...order, cart: ['cheap'], quantities: { cheap: 1 }, paymentMethod: 'sbp', promoCode: 'IVANZOLO' });
assert.equal(cheap.promoDiscount, 50);
assert.equal(cheap.total, 35, 'Promo never discounts delivery or produces a negative total');
const empty = calculateTotals({ ...order, cart: [], quantities: {}, promoCode: 'IVANZOLO' });
assert.equal(empty.promoDiscount, 0);
assert.equal(empty.total, 0);
assert.equal(calculateTotals({ ...order, promoCode: 'IVANZOLO' }).total, 5300.5, 'Applying the same code does not stack it');
console.log('Promo stacking, removal, normalization, cart changes and delivery boundaries passed');
