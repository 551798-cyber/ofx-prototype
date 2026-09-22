import { products, sellers, productRecommendations, checkoutRecommendations, demoPricing } from './content.js?v=recommendations-1';
import { checkoutCatalogSeller } from './checkout-catalog.mjs?v=1';
import { bundlePage, bundleProgress, prepareBundleCatalog } from './bundle.mjs?v=catalog-1';
import { listingBody } from './listing.js?v=recommendations-1';
import { calculateTotals } from './pricing.mjs?v=recommendations-1';
import { setupDelivery } from './delivery.mjs?v=modes-1';
import { selectDeliveryMethod } from './delivery-modes.mjs?v=1';
import { setupPayment, paymentIcon, paymentMethods } from './payment.mjs?v=payment-1';
import { setupInfoSheets } from './info-sheets.mjs?v=info-1';

const app = document.querySelector('#app');
const bundleLayer = document.querySelector('#bundle-layer');
let bundleCheckoutScroll = 0;
const activeMain = () => (state.screen === 'bundle' ? bundleLayer : app).querySelector('main');
const state = { screen: 'product', productId: 'sneakers', cart: [], quantities: {}, stack: [], bonusEnabled: true, discountsExpanded: true, deliverySelections: {}, paymentMethod: 'wallet', bundleSellers: [checkoutCatalogSeller], bundleSeller: null, bundleRecommendations: [] };
const money = n => `${new Intl.NumberFormat('ru-RU', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).format(n)} ₽`;
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image = (file, className = '', alt = '') => `<img src="assets/${escape(file)}" class="${className}" alt="${escape(alt)}" draggable="false">`;
// Screenshot regions use the displayed 945×2048 coordinate space. The original
// 1290×2796 PNG bytes stay unchanged; only original graphic regions are clipped.
function cropAsset(file, [x,y,w,h], className = '', alt = '') {
  return `<span class="asset-crop ${className}"><img src="assets/${escape(file)}" alt="${escape(alt)}" draggable="false" style="width:${945/w*100}%;height:${2048/h*100}%;left:${-x/w*100}%;top:${-y/h*100}%"></span>`;
}
function productPhoto(p, className = '', square = true) {
  if (p.imageCrop) { const c = p.imageCrop; return `<span class="product-image-crop ${className}"><img src="assets/${escape(p.image)}" alt="${escape(p.title)}" style="width:${c.width}%;height:${c.height}%;left:${c.left}%;top:${c.top}%"></span>`; }
  if (p.screenshotPhoto) return cropAsset(p.image, square ? [0,551.5,945,945] : [0,394,945,1260],className,p.title);
  if (p.sourceCrop && p.checkoutOnly) return `<span class="catalog-photo ${className}"><span style="height:${p.sourceCrop[3]/p.sourceCrop[2]*100}%">${cropAsset(p.image,p.sourceCrop,'',p.title)}</span></span>`;
  if (p.sourceCrop) {
    const [x,y,w,h] = p.sourceCrop, size = Math.min(w,h);
    const crop = square && p.realListing ? [x+(w-size)/2,y+(h-size)/2,size,size] : p.sourceCrop;
    return cropAsset(p.image,crop,className,p.title);
  }
  return image(p.image,className,p.title);
}
function productPreview(p, content, className) {
  return p.checkoutOnly
    ? `<div class="${className}" title="${escape(p.title)}">${content}</div>`
    : `<button class="${className}" data-action="product" data-id="${p.id}" aria-label="Открыть товар: ${escape(p.title)}">${content}</button>`;
}
const icon = (file, small = false) => image(file, `icon${small ? ' small' : ''}`);
const later = 'disabled title="Подключим в следующей итерации"';
const countLabel = n => `${n} ${n % 10 === 1 && n % 100 !== 11 ? 'товар' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'товара' : 'товаров'}`;
const stars = () => `<span class="stars">${[0,1,2,3].map(() => image('4f8d0.svg')).join('')}${image('def63.svg')}</span>`;
const gap = () => '<div class="space"></div>';

const quantity = id => state.quantities[id] || 0;
const cartCount = () => state.cart.reduce((sum, id) => sum + quantity(id), 0);
const bundleCount = () => state.cart.filter(id => products[id].seller === state.bundleSeller).reduce((sum,id) => sum + quantity(id),0);

function totals() {
  return calculateTotals({ ...state, products, sellers, demoPricing });
}

function statusBar(checkout) {
  return checkout
    ? `<div class="status checkout" aria-hidden="true"><span class="time">9:41</span>${image('38b88.svg','system-image')}</div>`
    : `<div class="status" aria-hidden="true"><span class="time">12:22</span>${image('b3485.svg','location')}${image('774cb.svg','battery')}${image('b9b18.svg','wifi')}${image('4226f.svg','signal')}</div>`;
}

function header(checkout = false) {
  const pill = state.cart.length ? `<button class="cart-pill" data-action="checkout" aria-label="Открыть чекаут: ${countLabel(cartCount())}"><span class="cart-thumbs">${state.cart.slice(0, 3).map(id => productPhoto(products[id])).join('')}</span><span>${countLabel(cartCount())}</span></button>` : '';
  return `<header class="topbar">${statusBar(checkout)}<nav class="nav" aria-label="Навигация"><button class="back" data-action="back" aria-label="Назад" ${state.stack.length ? '' : 'disabled'}>${icon(checkout ? '47ca6.svg' : '08eba.svg')}</button>${checkout ? '<h1 tabindex="-1">Безопасная сделка</h1>' : pill}${checkout ? '' : `<button class="share" ${later} aria-label="Поделиться">${icon('f20b4.svg')}</button>`}</nav></header>`;
}

function productPage() {
  const p = products[state.productId];
  const seller = sellers[p.seller];
  if (p.realListing) return `${header()}${listingBody(p, seller, {image,icon,cropAsset,productPhoto,productRec,money,escape,later})}<footer class="bottom"><div class="bottom-buttons"><button class="button primary buy" data-action="buy" data-id="${p.id}">Купить</button><button class="button square" ${later} aria-label="В избранное">${icon('0fd6b.svg')}</button><button class="button square" ${later} aria-label="Написать продавцу">${icon('e0764.svg')}</button></div><div class="home-indicator" aria-hidden="true"></div></footer>`;
  const recs = productRecommendations.filter(id => id !== p.id);
  if (p.id !== 'sneakers') recs.push('sneakers');
  return `${header()}<main class="screen-scroll" aria-label="Карточка товара" tabindex="-1">
    <div class="gallery horizontal"><div class="photo first ${p.galleryCrop ? 'cropped' : ''}">${productPhoto(p,'',false)}<span class="photo-count">1 из ${p.secondImage ? '8' : '1'}</span></div>${p.secondImage ? `<div class="photo second cropped">${image(p.secondImage,'',p.title)}</div>` : `<div class="photo second">${productPhoto(p)}</div>`}</div>
    <section class="pad"><p class="product-price"><strong>${money(p.price)}</strong></p><h1 class="product-title">${escape(p.title)}</h1><p class="availability">В наличии: несколько</p><div class="anchors">
      <button class="anchor" ${later}>${image('anchor-1-2268.svg')}От 130 ₽, от 1 дня</button><button class="anchor" ${later}>${image('anchor-1-175.svg')}Можно примерить</button>
      <button class="anchor" ${later}>${image('anchor-1-2315.svg')}От 1 876 ₽ × 4</button><button class="anchor" ${later}>${image('anchor-1-2325.svg')}4,9 · 349 отзывов</button><button class="anchor" ${later}>Ещё 1</button>
    </div></section>
    <section class="delivery-section"><div class="pad"><h2>Способ получения</h2><p>Может приехать завтра, от 130 ₽</p></div><div class="delivery-options horizontal"><button class="delivery-option" ${later}><div class="green">Лучшая цена</div><div class="muted">Авито</div><div class="cost">130 ₽, 1–2 дня</div></button><button class="delivery-option" ${later}><div class="purple">Вы уже выбирали</div><div class="muted">Почта России</div><div class="cost">480 ₽, 1–2 дня</div></button><button class="delivery-option" ${later}>Доставка<br>в пункт выдачи<div class="cost">от N ₽</div></button></div></section>
    <div style="height:40px"></div><section class="pad"><div class="credit"><h2>3 920 ₽ × 4 месяца</h2><p>Первый платёж — через 30 дней после получения заказа</p><span class="help">${icon('38ff4.svg')}</span><div class="months"><button class="button selected" ${later}>4 мес.</button><button class="button" ${later}>5 мес.</button><button class="button" ${later}>6 мес.</button></div><div class="payments"><div class="today"><div class="payment-bars"></div><strong>1 ₽</strong><p>Сегодня</p></div><div><div class="payment-bars rest"><i></i><i></i><i></i><i></i></div><strong>Дальше 4 платежа ежемесячно</strong><p>Всего с переплатой — 15 680 ₽</p></div></div><button class="button primary" ${later}>Купить с доставкой в рассрочку</button></div></section>
    ${gap()}<section class="seller-small pad"><h2>${escape(seller.name)} <span class="green">в сети</span></h2><div class="rating">4,4 ${stars()} N отзывов</div><p>Отвечает в течении N</p><div class="contact-buttons"><button class="button" ${later}>Позвонить</button><button class="button" ${later}>Написать</button></div></section>
    ${gap()}<section class="address pad"><div><span class="metro"></span> Метро <span class="muted">7 мин. ${image('b90f5.svg','icon small')}</span></div><p>Город, улица и дом</p><button ${later} style="color:#0099f7">Показать на карте</button></section>
    ${gap()}<section class="pad"><div class="badge"><div class="badge-image">${image('99e1b.png')}</div><div><h3>Заголовок</h3><p>Описание</p></div>${image('14405.svg','arrow')}</div></section>
    ${gap()}<section class="description pad"><h2>Характеристики</h2><div class="properties"><p><span>Состояние:</span>Текст</p><p><span>Производитель:</span>Текст</p>${[1,2,3].map(() => '<p><span>Тип автоусилителя:</span>Текст</p>').join('')}</div><h2>Описание</h2><p>Здесь какое-то описание товара...Здесь какое-то описание товара...Здесь какое-то описание товара</p></section>
    ${gap()}<section class="banner"><div class="banner-copy"><h2>Сюда писать заголовок</h2><p>Тут должно быть короткое описание того, что ты хочешь сказать пользователю</p><button class="button primary" ${later}>Текст</button></div><div class="banner-placeholder">Ваш контент</div></section>
    ${gap()}<section class="question pad"><h2>Спросите у продавца</h2><div class="question-box"><div class="question-text"><span>Здравствуйте! Ещё продаётся?!</span>${icon('69620.svg')}</div><div class="question-chips"><button class="button primary" ${later}>Еще продаёте?</button><button class="button primary" ${later}>Торг уместен?</button><button class="button primary" ${later}>Отправите Авито Доставкой?</button></div></div></section>
    ${gap()}<section class="seller-full pad"><h2>${escape(seller.name)}</h2>${image('616e0.png','avatar')}<div class="rating">4,4 ${stars()} N отзывов</div><p>N объявлений</p><button ${later} style="color:#0099f7;font-size:15px">Подписаться</button><div class="badges"><span>879 продаж с Авито Доставкой</span><span>10 лет на Авито</span><span>Документы проверены</span><span>Текст</span><span>Текст</span></div><h3>Екатерина Анисимова</h3><p>Контактное лицо</p></section>
    <div style="height:28px"></div><section class="recommendations"><h2 class="pad">Рекомендации <span class="round-arrow">${image('caa9b.svg')}</span></h2><div class="rec-tabs horizontal"><button class="button selected" ${later}>Похожие объявления</button><button class="button" ${later}>Такие же, как новые</button><button class="button" ${later}>С доставкой</button></div><div class="product-recs horizontal">${recs.map(productRec).join('')}</div></section>
    <section class="item-info"><button class="button" ${later}>Пожаловаться на объявление</button><p>Объявление № 890 089 099</p></section>
  </main><footer class="bottom"><div class="bottom-buttons"><button class="button primary buy" data-action="buy" data-id="${p.id}">Купить</button><button class="button square" ${later} aria-label="В избранное">${icon('0fd6b.svg')}</button><button class="button square" ${later} aria-label="Написать продавцу">${icon('e0764.svg')}</button></div><div class="home-indicator" aria-hidden="true"></div></footer>`;
}

function productRec(id) {
  const p = products[id];
  return `<button class="product-rec" data-action="product" data-id="${id}" aria-label="Открыть товар: ${escape(p.title)}">${productPhoto(p,'product-rec-image')}<div class="product-rec-text"><p class="product-rec-title">${escape(p.title)}</p>${icon('4e51c.svg')}<strong>${money(p.price-(p.bonusPerUnit || 0))}</strong>${p.city || !p.realListing?`<p class="product-rec-meta">${image('75c0d.svg')} ${escape(p.city || 'Московская обл…')}</p>`:''}${p.city || p.realListing ? '' : '<p class="muted">25 августа, 18:35</p>'}</div></button>`;
}

function quantityStepper(id, recommendation = false) {
  return `<div class="stepper ${recommendation ? 'recommendation-stepper' : ''}" role="group" aria-label="Количество: ${escape(products[id].title)}"><button data-action="decrease" data-id="${id}" aria-label="Уменьшить количество: ${escape(products[id].title)}">${image('40866.svg')}</button><span class="quantity-value">${quantity(id)}</span><button data-action="increase" data-id="${id}" aria-label="Увеличить количество: ${escape(products[id].title)}">${image('61cb0.svg')}</button></div>`;
}

function recommendationControl(id) {
  return quantity(id) > 0
    ? quantityStepper(id, true)
    : `<button class="rec-buy" data-action="add-recommendation" data-id="${id}" aria-label="Купить: ${escape(products[id].title)}">Купить</button>`;
}

function checkoutItem(id) {
  const p = products[id];
  const unitPrice = totals().unitPrices[id];
  const price = unitPrice < p.price ? `<strong aria-label="Цена со скидкой">${money(unitPrice)}</strong><s aria-label="Цена без скидки">${money(p.price)}</s>` : `<strong>${money(p.price)}</strong>`;
  return `<article class="checkout-item" data-product-id="${id}">${productPreview(p,productPhoto(p),`checkout-image ${p.galleryCrop ? 'cropped' : ''}`)}<div class="checkout-item-info"><p class="checkout-price">${price}</p>${productPreview(p,escape(p.title),'checkout-item-title')}${quantityStepper(id)}</div>${image('29bf1.svg','checkmark')}</article>`;
}

function sellerGroup(sellerId) {
  const seller = { ...sellers[sellerId], ...state.deliverySelections[sellerId] };
  const ids = state.cart.filter(id => products[id].seller === sellerId);
  const mode = state.deliveryModes?.[sellerId] || 'pickup';
  const tabs = [['self','Самовывоз'],['pickup','Пункт выдачи'],['courier','Курьером']].map(([method,label])=>`<button data-action="delivery-mode" data-seller="${sellerId}" data-method="${method}" class="${mode===method?'selected':''}" aria-pressed="${mode===method}">${label}</button>`).join('');
  const title = mode === 'self' ? 'Адрес продавца' : mode === 'courier' ? 'Ваш адрес' : `${money(seller.delivery)} · <span class="carrier">${seller.carrier}${seller.deliveryIcon?`<span class="carrier-icon ${seller.deliveryIcon === '96df1.png' ? 'avito-carrier' : ''}">${image(seller.deliveryIcon)}</span>`:''}</span>, ${seller.timing}`;
  // Общее оформление доставки на группу, как в макете 34/35.
  return `<section class="seller-group" data-seller="${sellerId}" aria-label="Товары продавца ${escape(seller.name)}"><div class="group-products">${ids.map(checkoutItem).join('')}</div><div class="delivery-tabs" aria-label="Способ получения">${tabs}</div><div class="delivery-address"><strong>${title}</strong><p>${escape(seller.address || 'Выберите пункт выдачи')}</p><button class="delivery-next" data-action="delivery" data-seller="${sellerId}" aria-label="Изменить доставку">${image('126b9.svg')}</button></div></section>`;
}

function checkoutRec(id, index) {
  const p = products[id];
  if (p.checkoutOnly) return `<article class="checkout-rec compact-catalog">${productPreview(p,productPhoto(p,'card-picture'),'card-open')}<div class="rec-info">${productPreview(p,`<strong>${money(p.price)}</strong><p class="name">${escape(p.description)}</p>`,'card-open')}<div class="rec-control" data-id="${id}" data-recommendation="${index}">${recommendationControl(id)}</div></div></article>`;
  return `<article class="checkout-rec"><button class="card-open" data-action="product" data-id="${id}" aria-label="Открыть товар: ${escape(p.title)}">${productPhoto(p,'card-picture')}</button><div class="rec-info"><button class="card-open" data-action="product" data-id="${id}"><strong>${money(p.price)}</strong><p class="name">${escape(p.title)}</p></button>${image('93c6e.svg','rec-heart')}<p class="seller">${sellers[p.seller].name}</p><div class="rec-control" data-id="${id}" data-recommendation="${index}">${recommendationControl(id)}</div></div></article>`;
}

function checkoutTotals(t = totals()) {
  const offer = `<div class="total-row ${t.productDiscount ? 'subdiscount' : ''}" data-discount-offer><button class="total-label bundle-offer" data-action="bundle"><span class="add-discount">${image('06527.svg')}</span>Скидка 25% от 3 товаров</button>${t.bundleDiscount ? `<span class="discount" data-bundle-discount>−${money(t.bundleDiscount)}</span>` : ''}</div>`;
  return `<section class="totals" aria-label="Расчёт заказа">
    <div class="total-row"><span>${countLabel(cartCount())}</span><span>${money(t.subtotal)}</span></div>
    ${t.productDiscount ? `<div class="total-row"><button class="total-label discount-disclosure" data-action="toggle-discounts" aria-expanded="${state.discountsExpanded}" aria-controls="discount-details">Скидки на товары ${image('84108.svg','chevron')}</button><span class="discount">−${money(t.productDiscount)}</span></div><div id="discount-details" ${state.discountsExpanded ? '' : 'hidden'}>${t.discount ? `<div class="total-row subdiscount"><span class="total-label">${icon('9c494.svg')}Хватамба</span><span class="discount">−${money(t.discount)}</span></div>` : ''}${t.walletDiscount ? `<div class="total-row subdiscount"><span class="total-label">${image('payment/85ab0.svg','wallet-discount-icon')}Скидка с кошельком</span><span class="discount">−${money(t.walletDiscount)}</span></div>` : ''}${offer}</div>` : offer}
    <div class="total-row"><span class="total-label"><button class="bonus-switch" data-action="toggle-bonus" role="switch" aria-label="Скидка бонусами" aria-checked="${state.bonusEnabled}"><span class="bonus-track"></span><span class="bonus-knob"></span></button><button class="bonus-info-trigger" data-action="bonus-info" aria-haspopup="dialog">Скидка бонусами ${image('b764d.svg','chevron')}</button></span><span class="${t.bonus ? 'discount' : ''}" data-bonus-amount>${t.bonus ? '−' : ''}${money(t.bonus)}</span></div>
    <div class="total-row"><span class="total-label">Авито Доставка ${image('84108.svg','chevron')}</span><span>${money(t.delivery)}</span></div>
    <div class="total-row total-last"><span>Итого</span><strong data-total="${t.total}">${money(t.total)}</strong></div>
  </section>`;
}

function refreshCheckoutTotals(action) {
  const main = app.querySelector('main');
  const scrollTop = main.scrollTop;
  const t = totals();
  app.querySelector('.totals').outerHTML = checkoutTotals(t);
  app.querySelector('.pay-button').textContent = `Оплатить ${money(t.total)}`;
  main.scrollTop = scrollTop;
  app.querySelector(`[data-action="${action}"]`)?.focus({ preventScroll: true });
}

function checkoutPage() {
  const t = totals();
  const groupIds = [...new Set(state.cart.map(id => products[id].seller))];
  return `${header(true)}<main class="screen-scroll checkout-scroll" aria-label="Чекаут" tabindex="-1"><button class="guarantee" data-action="save-info" aria-haspopup="dialog">${image('9eab2.svg')}<span>15 минут на проверку · 3 дня на возврат</span></button><div class="seller-groups">${groupIds.map(sellerGroup).join('')}</div>
    ${checkoutTotals(t)}
    <section class="checkout-recs"><h2>Может заинтересовать</h2><div class="checkout-grid">${checkoutRecommendations.map(checkoutRec).join('')}</div></section>
  </main><footer class="bottom checkout-bottom"><button class="payment-logo" data-action="payment" aria-label="Способ оплаты" aria-haspopup="dialog" title="${paymentMethods.find(method => method.id === state.paymentMethod).title}">${paymentIcon(state.paymentMethod, image)}</button><button class="button primary pay-button" ${later}>Оплатить ${money(t.total)}</button><div class="home-indicator" aria-hidden="true"></div></footer>`;
}

let toastTimer;
function hidePurchaseToast() {
  clearTimeout(toastTimer);
  document.querySelector('#purchase-toast').hidden = true;
  document.querySelector('#announcement').textContent = '';
}

function showPurchaseToast(message = 'Товар добавлен к покупке') {
  clearTimeout(toastTimer);
  document.querySelector('#purchase-toast').textContent = message;
  document.querySelector('#purchase-toast').hidden = false;
  document.querySelector('#announcement').textContent = message;
  toastTimer = setTimeout(hidePurchaseToast, 3000);
}

function changeCheckoutQuantity(id, delta, trigger) {
  const hadDiscount = totals().discount + totals().bundleDiscount > 0;
  const previous = quantity(id);
  const next = Math.max(0, previous + delta);
  if (next === previous) return;
  const main = app.querySelector('main');
  const recommendations = main.querySelector('.checkout-recs');
  const fromRecommendations = !!trigger.closest('.rec-control');
  const controlIndex = trigger.closest('.rec-control')?.dataset.recommendation;
  const oldScroll = main.scrollTop;
  const visibleOffset = recommendations.offsetTop - oldScroll;
  state.quantities[id] = next;
  if (next && !state.cart.includes(id)) state.cart.push(id);
  if (!next) state.cart = state.cart.filter(itemId => itemId !== id);
  if (!hadDiscount && totals().discount + totals().bundleDiscount > 0) state.discountsExpanded = true;

  const updated = document.createElement('template');
  updated.innerHTML = checkoutPage();
  for (const selector of ['.seller-groups', '.totals']) {
    app.querySelector(selector).replaceWith(updated.content.querySelector(selector));
  }
  app.querySelector('.pay-button').textContent = updated.content.querySelector('.pay-button').textContent;
  for (const control of recommendations.querySelectorAll('.rec-control')) {
    if (control.dataset.id !== id) continue;
    if (next > 0 && control.querySelector('.quantity-value')) {
      control.querySelector('.quantity-value').textContent = next;
    } else {
      control.innerHTML = recommendationControl(id);
    }
  }
  main.scrollTop = fromRecommendations ? recommendations.offsetTop - visibleOffset : oldScroll;
  // Keep keyboard focus without asking the browser to scroll to the replacement.
  if (!trigger.isConnected) {
    const focusTarget = fromRecommendations
      ? recommendations.querySelector(`[data-recommendation="${controlIndex}"] button[data-action="${next ? 'increase' : 'add-recommendation'}"]`)
      : app.querySelector(`.seller-groups button[data-id="${id}"][data-action="${trigger.dataset.action}"]`);
    (focusTarget || main).focus({ preventScroll: true });
  }
  if (previous === 0 && next > 0) showPurchaseToast();
  else {
    hidePurchaseToast();
    document.querySelector('#announcement').textContent = next
      ? `${products[id].title}: ${next} шт.`
      : `${products[id].title} удалён из покупки`;
  }
}

function render(scrollTop = 0) {
  hidePurchaseToast();
  const isBundle = state.screen === 'bundle';
  app.innerHTML = isBundle || state.screen === 'checkout' ? checkoutPage() : productPage();
  app.dataset.screen = state.screen;
  app.querySelector('main').scrollTop = isBundle ? bundleCheckoutScroll : scrollTop;
  bundleLayer.hidden = !isBundle;
  bundleLayer.innerHTML = isBundle ? bundlePage({products, sellers, quantity, count:bundleCount(), recommendations:state.bundleRecommendations, productPhoto, productPreview, quantityStepper, image, money, escape}) : '';
  app.inert = isBundle;
  if (isBundle) activeMain().scrollTop = scrollTop;
}

function changeBundleQuantity(id, delta, trigger) {
  const beforeCount = bundleCount();
  const previous = quantity(id);
  const next = Math.max(0, previous + delta);
  if (next === previous) return;
  state.quantities[id] = next;
  if (next && !state.cart.includes(id)) state.cart.push(id);
  if (!next) state.cart = state.cart.filter(itemId => itemId !== id);
  if (beforeCount < 3 && bundleCount() >= 3) state.discountsExpanded = true;
  const control = trigger.closest('.rec-control');
  if (previous && next) control.querySelector('.quantity-value').textContent = next;
  else {
    control.innerHTML = next ? quantityStepper(id,true) : `<button class="rec-buy" data-action="bundle-add" data-id="${id}" aria-label="В корзину: ${escape(products[id].title)}">В корзину</button>`;
    control.querySelector(next ? '[data-action=increase]' : 'button').focus({preventScroll:true});
  }
  bundleLayer.querySelector('.bundle-progress').textContent = bundleProgress(bundleCount());
  app.innerHTML = checkoutPage();
  app.querySelector('main').scrollTop = bundleCheckoutScroll;
  if (delta > 0) showPurchaseToast(beforeCount < 3 && bundleCount() >= 3 ? 'Скидка за товары успешно применилась' : 'Товар добавлен к покупке');
  else hidePurchaseToast();
}

function navigate(screen, productId) {
  state.stack.push({ screen: state.screen, productId: state.productId, scroll: activeMain().scrollTop });
  state.screen = screen;
  if (productId) state.productId = productId;
  render();
  (screen === 'bundle' ? bundleLayer.querySelector('[role=dialog]') : activeMain()).focus({ preventScroll: true });
}

function goBack() {
  const wasBundle = state.screen === 'bundle';
  const prev = state.stack.pop();
  if (!prev) return;
  state.screen = prev.screen;
  state.productId = prev.productId;
  render(prev.scroll);
  const target = wasBundle ? app.querySelector('[data-action=bundle]') : null;
  (target || activeMain()).focus({preventScroll:true});
}

function add(id) {
  const hadDiscount = totals().discount + totals().bundleDiscount > 0;
  if (!state.cart.includes(id)) { state.cart.push(id); state.quantities[id] = 1; }
  if (!hadDiscount && totals().discount + totals().bundleDiscount > 0) state.discountsExpanded = true;
}

const deliveryFlow = setupDelivery({ app, state, render, image, icon, statusBar, money, escape, orderSummary(sellerId) {
  const ids = state.cart.filter(id=>products[id].seller===sellerId);
  const prices = totals().unitPrices;
  return {summary:`${countLabel(ids.reduce((n,id)=>n+quantity(id),0))} · ${money(ids.reduce((n,id)=>n+prices[id]*quantity(id),0))}`,photo:productPhoto(products[ids[0]])};
} });
const infoSheets = setupInfoSheets({ app, image });
const paymentFlow = setupPayment({ app, state, image, onSelect(id) {
  const hadDiscount = totals().productDiscount > 0;
  state.paymentMethod = id;
  if (!hadDiscount && totals().productDiscount > 0) state.discountsExpanded = true;
  refreshCheckoutTotals('payment');
  const button = app.querySelector('.payment-logo');
  button.innerHTML = paymentIcon(id, image);
  const title = paymentMethods.find(method => method.id === id).title;
  button.title = title;
  document.querySelector('#announcement').textContent = `Способ оплаты: ${title}. Итого ${money(totals().total)}. Это прототип, оплата не выполняется.`;
} });

function handleAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button || button.disabled) return;
  const { action, id } = button.dataset;
  if (action === 'bundle') {
    state.bundleSeller = checkoutCatalogSeller;
    if (!state.bundleSellers.includes(state.bundleSeller)) state.bundleSellers.push(state.bundleSeller);
    state.bundleRecommendations = prepareBundleCatalog(products, state.bundleSeller);
    bundleCheckoutScroll = app.querySelector('main').scrollTop;
    navigate('bundle');
  }
  else if (state.screen === 'bundle' && ['bundle-add','increase','decrease'].includes(action)) changeBundleQuantity(id, action === 'decrease' ? -1 : 1, button);
  else if (action === 'delivery-mode') {
    const sellerId = button.dataset.seller;
    if (selectDeliveryMethod(state,sellerId,button.dataset.method)) {
      const scroll = app.querySelector('main').scrollTop;
      render(scroll);
      app.querySelector(`[data-action="delivery-mode"][data-seller="${sellerId}"][data-method="${button.dataset.method}"]`).focus({preventScroll:true});
    }
  }
  else if (action === 'delivery') { hidePurchaseToast(); deliveryFlow.open(button.dataset.seller, button); }
  else if (action === 'payment') { hidePurchaseToast(); paymentFlow.open(button); }
  else if (action === 'save-info' || action === 'bonus-info') { hidePurchaseToast(); infoSheets.open(action === 'save-info' ? 'save' : 'bonus', button); }
  else if (action === 'back') {
    goBack();
  } else if (action === 'product' && !products[id].checkoutOnly) navigate('product', id);
  else if (action === 'checkout') navigate('checkout');
  else if (action === 'buy') { add(id); navigate('checkout'); }
  else if (action === 'toggle-discounts') {
    state.discountsExpanded = !state.discountsExpanded;
    refreshCheckoutTotals(action);
  } else if (action === 'toggle-bonus') {
    state.bonusEnabled = !state.bonusEnabled;
    refreshCheckoutTotals(action);
    document.querySelector('#announcement').textContent = state.bonusEnabled ? 'Списание бонусов включено' : 'Списание бонусов выключено';
  }
  else if (action === 'add-recommendation') {
    if (!quantity(id)) changeCheckoutQuantity(id, 1, button);
  } else if (action === 'increase' || action === 'decrease') {
    changeCheckoutQuantity(id, action === 'increase' ? 1 : -1, button);
  }
}
app.addEventListener('click', handleAction);
bundleLayer.addEventListener('click', handleAction);
bundleLayer.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); goBack(); return; }
  if (event.key !== 'Tab') return;
  const buttons = [...bundleLayer.querySelectorAll('button:not([tabindex="-1"]):not(:disabled)')];
  const first = buttons[0], last = buttons.at(-1);
  if (event.shiftKey && (document.activeElement === first || document.activeElement.matches('[role=dialog]'))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
});
let bundleDragY = null;
bundleLayer.addEventListener('pointerdown', event => {
  const grip = event.target.closest('.bundle-grip');
  if (!grip) return;
  bundleDragY = event.clientY;
  grip.setPointerCapture(event.pointerId);
});
bundleLayer.addEventListener('pointerup', event => {
  if (bundleDragY === null) return;
  const delta = (event.clientY - bundleDragY) / (document.querySelector('#viewport').clientWidth / 375);
  bundleDragY = null;
  if (delta > 30) goBack();
});
bundleLayer.addEventListener('pointercancel', () => { bundleDragY = null; });

function resize() {
  const viewport = document.querySelector('#viewport');
  const device = document.querySelector('#device');
  const scale = viewport.clientWidth / 375;
  device.style.height = `${viewport.clientHeight / scale}px`;
  device.style.transform = `scale(${scale})`;
}
new ResizeObserver(resize).observe(document.querySelector('#viewport'));
resize();

// Отдельный предварительный прогрев: первый переход показывает готовые ассеты.
const loadedImages = new Map();
function preloadImage(src) {
  if (loadedImages.has(src)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => { img.onload = null; img.onerror = null; reject(new Error(`Timeout: ${src}`)); }, 20000);
    img.onload = async () => {
      try { await img.decode(); clearTimeout(timeout); loadedImages.set(src,img); resolve(); }
      catch (error) { clearTimeout(timeout); reject(error); }
    };
    img.onerror = () => { clearTimeout(timeout); reject(new Error(`Image: ${src}`)); };
    img.src = src;
  });
}

async function start() {
  const loader = document.querySelector('#loader');
  const message = loader.querySelector('p');
  const progress = loader.querySelector('progress');
  document.querySelector('#retry').hidden = true;
  message.textContent = 'Загружаем прототип…';
  try {
    const response = await fetch('./assets.json?v=recommendations-1', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error('Asset manifest unavailable');
    const manifest = await response.json();
    const urls = [...new Set(manifest.assets.filter(a => a.kind === 'image' && a.used).map(a => a.path))];
    let cursor = 0, completed = 0;
    progress.max = urls.length; progress.value = 0;
    await Promise.all(Array.from({length:6}, async () => {
      while(cursor < urls.length) { const url = urls[cursor++]; await preloadImage(url); progress.value = ++completed; }
    }));
    await Promise.all(manifest.assets.filter(a => a.kind === 'font' && a.used).map(async font => {
      const faces = await document.fonts.load(`${font.weight} 15px "${font.family}"`, 'Товар 123 ₽');
      if (!faces.length) throw new Error(`Font unavailable: ${font.family} ${font.weight}`);
    }));
    await document.fonts.ready;
    render();
    await new Promise(requestAnimationFrame);
    app.inert = false; app.setAttribute('aria-busy','false'); loader.hidden = true;
  } catch (error) {
    console.error(error);
    message.textContent = 'Не удалось загрузить все ресурсы. Попробуйте ещё раз.';
    document.querySelector('#retry').hidden = false;
  }
}
document.querySelector('#retry').addEventListener('click', start);
start();
