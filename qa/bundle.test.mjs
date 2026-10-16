import assert from 'node:assert/strict';
import {bundlePage, bundleProgress, bundleRecommendations} from '../bundle.mjs';

assert.equal(bundleProgress(0), 'Добавьте еще 3 товара до скидки в 25%');
assert.equal(bundleProgress(1), 'Добавьте еще 2 товара до скидки в 25%');
assert.equal(bundleProgress(2), 'Добавьте еще 1 товар до скидки в 25%');
assert.equal(bundleProgress(3), 'Скидка применена');
assert.equal(bundleProgress(4), 'Скидка применена');
assert.equal(new Set(bundleRecommendations).size, 7);
const sheet = bundlePage({count:1,recommendations:[],image:src=>`<img src="${src}">`});
assert.match(sheet, /role="dialog" aria-modal="true" aria-labelledby="bundle-title"/);
assert.match(sheet, /class="bundle-scrim" data-action="back"/);
assert.match(sheet, /class="sheet-grip bundle-grip"/);
assert.match(sheet, /id="bundle-title">Вместе дешевле/);
assert.match(sheet, /info\/close.svg/);
assert.match(sheet, /Добавьте еще 2 товара до скидки в 25%/);
assert.match(sheet, /class="screen-scroll bundle-scroll"/);
console.log('13 bundle assertions passed');
