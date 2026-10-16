import assert from 'node:assert/strict';
import {checkoutCatalog,checkoutCatalogIds,checkoutCatalogSeller} from '../checkout-catalog.mjs';
import {prepareBundleCatalog} from '../bundle.mjs';
import {calculateTotals} from '../pricing.mjs';
import {products as appProducts,checkoutRecommendations,productRecommendations} from '../content.js';
const products=Object.fromEntries(checkoutCatalog.map(p=>[p.id,p]));
assert.equal(checkoutCatalog.length,7);
assert.equal(new Set(checkoutCatalogIds).size,7);
assert(checkoutCatalog.every(p=>p.checkoutOnly && p.seller===checkoutCatalogSeller && p.description===p.title));
assert.deepEqual(checkoutCatalog.map(p=>p.price),[396,490,150,300,449,3590,3390]);
const original=structuredClone(products);
assert.deepEqual(prepareBundleCatalog(products,checkoutCatalogSeller),checkoutCatalogIds);
assert.deepEqual(prepareBundleCatalog(products,'kirill'),[]);
assert.deepEqual(products,original);
assert(checkoutCatalogIds.every(id=>checkoutRecommendations.includes(id) && appProducts[id].checkoutOnly));
assert(productRecommendations.every(id=>!checkoutCatalogIds.includes(id)));
assert.equal(new Set(checkoutRecommendations).size,checkoutRecommendations.length);
const totals=quantities=>calculateTotals({cart:Object.keys(quantities),quantities,products,sellers:{vladimir:{delivery:1}},demoPricing:{productDiscount:3000,bonusDiscount:1000},bundleSellers:['vladimir'],paymentMethod:'wallet'});
let combos=0;
for(let a=0;a<7;a++)for(let b=a+1;b<7;b++)for(let c=b+1;c<7;c++){
  const ids=[a,b,c].map(i=>checkoutCatalogIds[i]);
  const result=totals(Object.fromEntries(ids.map(id=>[id,1])));
  assert.equal(result.bundleDiscount,result.subtotal*.25);
  assert.equal(result.delivery,1);
  assert.equal(result.discount,0);
  assert.equal(result.bonus,0); // Screenshot bonus prices must not be applied twice.
  combos++;
}
const two=totals({premiataLaces:1,flatLaces:1});
assert.equal(two.bundleDiscount,0);
const three=totals({premiataLaces:1,flatLaces:1,textileDye:1});
assert.equal(three.total,678);
assert.equal(three.bundleDiscount,259);
assert.equal(totals({premiataLaces:3}).bundleDiscount,297); // Existing unit-count threshold retained.
console.log(`Catalogue checks passed, including all ${combos} three-item combinations`);
