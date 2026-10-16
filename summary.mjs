// Layout: Figma 1649:102173 / 102272 / 102373. All amounts come from pricing.mjs.
export function orderSummary({ totals: t, state, products, cart, image, productPhoto, money, countLabel, escape }) {
  const arrow = () => image('b764d.svg', 'summary-arrow');
  const value = (amount, isDiscount = false, chevron = true) => `<span class="summary-value ${isDiscount ? 'discount' : ''}"><span>${isDiscount && amount ? '−' : ''}${money(amount)}</span>${chevron ? arrow() : ''}</span>`;
  const row = (label, content, action, attrs = '', extra = '') => `<button type="button" class="total-row summary-row ${extra}" data-action="${action}" ${attrs}><span class="summary-label">${label}</span>${content}</button>`;
  const detail = (label, amount) => `<div class="total-row summary-row subdiscount"><span class="summary-label">${escape(label)}</span><span class="summary-value ${amount < 0 ? 'discount' : ''}" data-detail-amount="${amount}">${amount < 0 ? '−' : ''}${money(Math.abs(amount))}</span></div>`;
  const multipleProducts = t.count > 1;
  const deliveryModes = new Set(cart.map(id => state.deliveryModes?.[products[id].seller] || 'pickup'));
  const selfOnly = deliveryModes.size === 1 && deliveryModes.has('self');
  const shippingLabel = selfOnly ? 'Самовывоз' : deliveryModes.size === 1 && deliveryModes.has('courier') ? 'Доставка курьером' : deliveryModes.size > 1 ? 'Отправка товаров' : 'Отправка в пункт выдачи';
  // Illustrative breakdown requested for the prototype, not new delivery charges.
  // Derive its discount from the existing payable fee so pricing never changes.
  const protection = t.count ? 169 : 0;
  const shipping = t.count ? Math.max(selfOnly ? 0 : 300, t.delivery - protection) : 0;
  const deliveryDiscount = Math.round((protection + shipping - t.delivery) * 100) / 100;
  const goodsDiscount = Math.round((t.discount + t.walletDiscount) * 100) / 100;
  const bundleIds = cart.filter(id => t.unitPrices[id] < products[id].price).slice(0, 3);
  const thumbnails = t.bundleDiscount ? `<span class="summary-thumbs" aria-hidden="true">${bundleIds.map(id => `<span class="summary-thumb">${productPhoto(products[id])}</span>`).join('')}</span>` : '';
  const promo = state.promoEditing
    ? `<form class="total-row promo-form" data-promo-form novalidate><label class="sr-only" for="promo-code">Введите промокод</label><input id="promo-code" name="promo" value="${escape(state.promoDraft)}" placeholder="Введите промокод" maxlength="32" autocomplete="off" autocapitalize="characters" spellcheck="false" enterkeyhint="done"><button type="submit" class="sr-only" tabindex="-1">Применить промокод</button></form>`
    : row(state.promoCode ? `Промокод ${escape(state.promoCode)}` : 'Промокод', state.promoCode ? value(t.promoDiscount, true) : '<span class="summary-apply">Применить</span>', 'promo-edit', 'aria-label="'+(state.promoCode ? 'Изменить промокод '+escape(state.promoCode) : 'Применить промокод')+'"', 'summary-promo');
  return `<section class="totals summary" aria-label="Расчёт заказа">
    <h2 class="summary-heading">Стоимость</h2>
    ${multipleProducts ? row(countLabel(t.count), value(t.subtotal), 'summary-products', `data-summary-products aria-expanded="${state.productsExpanded}" aria-controls="product-details"`) : `<div class="total-row summary-row" data-summary-products><span class="summary-label">${countLabel(t.count)}</span>${value(t.subtotal, false, false)}</div>`}
    ${multipleProducts ? `<div id="product-details" class="summary-details product-details" ${state.productsExpanded ? '' : 'hidden'}>${cart.map(id => detail(`${products[id].title}${state.quantities[id] > 1 ? ` × ${state.quantities[id]}` : ''}`, products[id].price * state.quantities[id])).join('')}</div>` : ''}
    ${row('Скидки на товары', value(goodsDiscount, !!goodsDiscount), 'toggle-discounts', `aria-expanded="${!!(state.discountsExpanded && goodsDiscount)}" aria-controls="discount-details"`, 'discount-disclosure')}
    <div id="discount-details" class="summary-details" ${state.discountsExpanded && goodsDiscount ? '' : 'hidden'}>
      ${t.discount ? row('Хватамба', value(t.discount, true), 'summary-discount-info', 'data-discount="legacy"', 'subdiscount') : ''}
      ${t.walletDiscount ? detail('Скидки кошельком', -t.walletDiscount) : ''}
    </div>
    ${row('Авито Доставка', value(t.delivery), 'summary-delivery', `aria-expanded="${state.deliveryExpanded}" aria-controls="delivery-details"`)}
    <div id="delivery-details" class="summary-details" ${state.deliveryExpanded ? '' : 'hidden'}>${detail('Программа защиты', protection)}${detail(shippingLabel, shipping)}${detail('Скидка на доставку', -deliveryDiscount)}</div>
    ${row(`Скидка за количество${thumbnails}`, t.bundleDiscount ? value(t.bundleDiscount, true) : '<span class="summary-apply">Применить</span>', 'bundle', 'aria-haspopup="dialog" data-discount-offer', 'summary-bundle')}
    ${promo}
    <div class="total-row summary-row summary-bonus"><button type="button" class="summary-label bonus-info-trigger" data-action="bonus-info" aria-haspopup="dialog">Скидка бонусами</button><span class="summary-value"><span class="${state.bonusEnabled ? 'discount' : 'summary-bonus-available'}" data-bonus-amount>${state.bonusEnabled ? (t.bonus ? '−' : '') + money(t.bonus) : '+ ' + new Intl.NumberFormat('ru-RU').format(t.availableBonus) + ' Б'}</span><button type="button" class="bonus-switch" data-action="toggle-bonus" role="switch" aria-label="Скидка бонусами" aria-checked="${state.bonusEnabled}"><span class="bonus-track"></span><span class="bonus-knob"></span></button></span></div>
    <div class="total-row total-last"><span>Итого</span><strong data-total="${t.total}">${money(t.total)}</strong></div>
  </section>`;
}
