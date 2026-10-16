import assert from 'node:assert/strict';
import {calculateTotals} from '../pricing.mjs';

const products = {
  nike:{price:3590,seller:'vladimir',bonusPerUnit:17},
  coat:{price:3700,seller:'vladimir'},pants:{price:3700,seller:'vladimir'},
  carhartt:{price:3700,seller:'kirill'},kirillPants:{price:3700,seller:'kirill'},hat:{price:1049,seller:'kirill'},
};
const [coat,pants] = ['coat','pants'];
const sellers = {vladimir:{delivery:1},kirill:{delivery:100}};
const demoPricing = {productDiscount:3000,bonusDiscount:1000};
const price = (quantities, overrides={}) => calculateTotals({cart:Object.keys(quantities).filter(id=>quantities[id]),quantities,products,sellers,demoPricing,bundleSellers:['vladimir'],paymentMethod:'wallet',...overrides});
assert.equal(price({nike:1,[coat]:1}).bundleDiscount,0);
const three=price({nike:1,[coat]:1,[pants]:1});
assert.equal(three.bundleCounts.vladimir,3);
assert.deepEqual(three.unitPrices,{nike:2692.5,[coat]:2775,[pants]:2775});
assert.equal(three.subtotal,10990);
assert.equal(three.bundleDiscount,2747.5);
assert.equal(three.discount,0);
assert.equal(three.delivery,1);
assert.equal(three.bonus,17);
assert.equal(three.walletDiscount,100);
assert.equal(three.total,8126.5);
assert.equal(Object.entries(three.unitPrices).reduce((sum,[,p])=>sum+p,0)-three.walletDiscount-three.bonus+three.delivery,three.total);
assert.equal(price({nike:1,[coat]:1,[pants]:1},{bonusEnabled:false}).total,8143.5);
assert.equal(price({nike:1,[coat]:1,[pants]:1},{paymentMethod:'cash'}).total,8226.5);
assert.equal(price({nike:1,[coat]:2}).bundleDiscount,2747.5);
assert.equal(price({nike:1,[coat]:1,hat:1}).bundleDiscount,0); // Other sellers don't satisfy the threshold.
const mixed=price({nike:1,[coat]:1,[pants]:1,hat:1});
assert.equal(mixed.unitPrices.hat,1049);
assert.equal(mixed.discount,314); // Legacy demo discount only on the unrelated seller.
assert.equal(mixed.bundleDiscount,2747.5);
assert.equal(mixed.delivery,101);
assert.equal(price({nike:1,[coat]:1,[pants]:1},{deliverySelections:{vladimir:{delivery:120}}}).delivery,120);
const below=price({nike:1,[coat]:1,[pants]:0});
assert.equal(below.bundleDiscount,0);
assert.equal(below.unitPrices.nike,3590);
assert.equal(below.unitPrices[coat],3700);
const kirill=price({carhartt:1,kirillPants:1,hat:1},{bundleSellers:['kirill']});
assert.equal(kirill.bundleDiscount,2112.25);
assert.equal(kirill.discount,0); // No double percentage for a legacy seller.
assert.equal(price({}).total,0);
console.log('27 bundle pricing assertions passed');
