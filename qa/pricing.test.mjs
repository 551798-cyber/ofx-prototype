import assert from 'node:assert/strict';
import { calculateTotals } from '../pricing.mjs';

const products = {
  nike: { price: 3590, seller: 'vladimir', bonusPerUnit: 17 },
  margiela: { price: 3790, seller: 'vladimir' },
  hat: { price: 1049, seller: 'kirill' },
};
const sellers = { vladimir: { delivery: 1 }, kirill: { delivery: 100 } };
const demoPricing = { productDiscount: 3000, bonusDiscount: 1000 };
const price = (quantities, bonusEnabled = true) => calculateTotals({ cart: Object.keys(quantities).filter(id => quantities[id]), quantities, products, sellers, demoPricing, bonusEnabled });

assert.equal(price({ nike: 1 }).total, 3574);
assert.equal(price({ nike: 1 }, false).bonus, 0);
assert.equal(price({ nike: 1 }, false).total, 3591);
assert.equal(price({ nike: 1, hat: 1 }).discount, 0);
assert.equal(price({ nike: 1, hat: 1 }).availableBonus, 127);
const three = price({ nike: 1, margiela: 1, hat: 1 });
assert.equal(three.discount, 314);
assert.equal(three.bonus, 127);
assert.equal(three.total, 8089); // Preserves the exact amount in the user's screenshot.
assert.equal(price({ nike: 1, margiela: 1, hat: 1 }, false).total, 8216);
assert.equal(price({ nike: 1, hat: 2 }).discount, 629);
assert.equal(price({ nike: 1, hat: 2 }).total, 4923);
assert.equal(price({ nike: 1, hat: 1 }, false).discount, 0);
assert.equal(price({ nike: 1, hat: 0 }).delivery, 1);
assert.equal(price({}).total, 0);
// The user explicitly retained existing seller eligibility; real-only orders stay excluded.
assert.equal(price({ nike: 3 }).discount, 0);
const deliveryOrder = { cart: ['nike','hat'], quantities: {nike: 2, hat: 1}, products, sellers, demoPricing };
assert.equal(calculateTotals({ ...deliveryOrder, deliverySelections: {vladimir: {delivery:120}} }).delivery, 220);
assert.equal(calculateTotals({ ...deliveryOrder, deliverySelections: {vladimir: {delivery:120},kirill: {delivery:1}} }).delivery, 121);
assert.equal(calculateTotals({ ...deliveryOrder, cart:['hat'], deliverySelections: {vladimir: {delivery:120}} }).delivery, 100);
assert.equal(sellers.vladimir.delivery, 1); // Choosing a point does not mutate defaults.
const walletPrice = quantities => calculateTotals({ cart: Object.keys(quantities), quantities, products, sellers, demoPricing, paymentMethod: 'wallet' });
assert.equal(walletPrice({ nike:1 }).walletDiscount, 100);
assert.equal(walletPrice({ nike:1 }).total, 3474);
assert.equal(walletPrice({ nike:1, margiela:1, hat:1 }).discount, 314);
assert.equal(walletPrice({ nike:1, margiela:1, hat:1 }).productDiscount, 414);
assert.equal(walletPrice({ nike:1, margiela:1, hat:1 }).bonus, 127);
assert.equal(walletPrice({ nike:1, margiela:1, hat:1 }).total, 7989);
assert.equal(walletPrice({}).walletDiscount, 0);
assert.equal(walletPrice({}).total, 0);
for (const paymentMethod of ['sbp','sber','tbank','cash','new-card']) {
  const result = calculateTotals({ ...deliveryOrder, paymentMethod });
  assert.equal(result.walletDiscount, 0);
  assert.equal(result.total, calculateTotals(deliveryOrder).total);
}
const cheapOrder = { cart:['cheap'],quantities:{cheap:1},products:{cheap:{price:50,seller:'vladimir'}},sellers,demoPricing,paymentMethod:'wallet' };
assert.equal(calculateTotals(cheapOrder).walletDiscount, 50);
assert.equal(calculateTotals(cheapOrder).total, 1); // Never discounts delivery or produces a negative product price.
assert.equal(calculateTotals({...deliveryOrder,paymentMethod:'wallet',bonusEnabled:false}).total, calculateTotals({...deliveryOrder,bonusEnabled:false}).total-100);
console.log('40 pricing assertions passed');
