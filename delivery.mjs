import { sellerMapPage, courierPage, courierSelection, sellerAddress } from './delivery-modes.mjs?v=1';

export const pickupPoints = {
  avito: { id: 'avito', carrier: 'Авито', title: 'Авито', address: 'Лесная пр-д, 25к3', label: 'Пункт выдачи Авито, Лесная пр-д, 25к3', timing: '1–2 дня', delivery: 100, storage: '10 дней', hint: 'Лучшая цена', deliveryIcon: 'delivery/56c9e.png', x: 55, y: 61 },
  post: { id: 'post', carrier: 'Почта России', title: 'Почта России', address: 'Кожевническая, 5', label: 'Почта России, Кожевническая, 5', timing: '2–4 дня', delivery: 120, storage: '10 дней', hint: 'Заказывали в прошлый раз', deliveryIcon: 'delivery/139e1.png', x: 20, y: 33 },
  yandex: { id: 'yandex', carrier: 'Яндекс', title: 'Яндекс Доставка', address: 'Санкт-Петербург, Пулковское шоссе, 71к2', label: 'Яндекс Доставка, Пулковское шоссе, 71к2', timing: '4–7 дней', delivery: 1, oldPrice: 719, storage: '7 дней', hint: 'При оплате кошельком', deliveryIcon: '60d3d.png', x: 77, y: 38 },
};

export function setupDelivery({ app, state, render, image, icon, statusBar, money, escape, orderSummary }) {
  const layer = document.querySelector('#delivery-layer');
  let flow = null;
  let opener = null;
  let drag = null;
  let ignoreClick = false;

  function addressSheet() {
    const ids = ['avito', 'post'];
    if (flow.addressId === 'yandex') ids.push('yandex');
    return `<button class="delivery-scrim" data-delivery-action="close" aria-label="Закрыть выбор адреса" tabindex="-1"></button>
      <section class="address-sheet" role="dialog" aria-modal="true" aria-labelledby="address-title" tabindex="-1">
        <button class="sheet-grip" data-delivery-action="close" aria-label="Закрыть выбор адреса"><span></span></button>
        <h2 id="address-title">Адрес</h2>
        <div class="address-sheet-body"><div class="address-options" role="radiogroup" aria-label="Рекомендованные адреса">${ids.map(id => {
          const p = pickupPoints[id];
          return `<label class="address-option"><input type="radio" name="pickup-address" value="${id}" ${id === flow.addressId ? 'checked' : ''}><span><span class="address-option-title">${escape(p.label)}</span><span class="address-option-hint">${escape(p.hint)} · ${p.timing} · ${money(p.delivery)}</span></span></label>`;
        }).join('')}</div><button class="new-address" data-delivery-action="map">${image('delivery/add.svg')}<span>Добавить новый адрес</span></button></div>
        <footer class="address-sheet-footer"><button class="button primary" data-delivery-action="confirm-address">Выбрать</button><div class="home-indicator" aria-hidden="true"></div></footer>
      </section>`;
  }

  function mapPage() {
    const p = pickupPoints[flow.mapId];
    return `<section class="delivery-map-page" role="dialog" aria-modal="true" aria-label="Выбор пункта выдачи" tabindex="-1">
      <header class="delivery-map-header">${statusBar(true)}<nav><button data-delivery-action="back" aria-label="Назад к адресам">${icon('delivery/e53e8.svg')}</button><h1>Способ доставки</h1></nav><div class="delivery-map-tabs"><button disabled>Все</button><button class="selected" aria-current="page" disabled>Пункт выдачи</button><button disabled>Курьер</button></div></header>
      <div class="pickup-map" aria-label="Демонстрационная карта пунктов выдачи">${image('delivery/38e5e.png','pickup-map-image')}<div class="map-pins">${Object.values(pickupPoints).map(point => `<button class="pickup-pin" style="left:${point.x}%;top:${point.y}%" data-delivery-action="select-point" data-point="${point.id}" aria-label="Пункт выдачи: ${point.title}" aria-pressed="${p.id === point.id}"><span class="pin-caption"><strong>${point.title}</strong><span>${money(point.delivery)}, ${point.timing}</span></span>${image(p.id === point.id ? 'delivery/2002d.svg' : 'delivery/497e1.svg')}</button>`).join('')}</div></div>
      <div class="map-filters horizontal"><button disabled aria-label="Фильтры">${image('delivery/f5b4a.svg')}</button><button disabled>Службы доставки ${image('delivery/23189.svg')}</button><button disabled>Без выходных</button><button disabled>Есть примерка</button></div>
      <section class="pickup-detail ${flow.expanded ? 'expanded' : ''}" aria-labelledby="pickup-title">
        <button class="sheet-grip" data-delivery-action="expand" aria-expanded="${flow.expanded}" aria-controls="pickup-extra" aria-label="${flow.expanded ? 'Свернуть' : 'Развернуть'} карточку пункта"><span></span></button>
        <div class="pickup-detail-body"><div class="pickup-heading"><div><h2 id="pickup-title">${p.title}</h2><p>${escape(p.address)}</p></div>${image(p.deliveryIcon,'pickup-logo')}</div><div class="pickup-tags"><span>Доставка ${p.timing}</span><span>Хранение ${p.storage}</span></div>
          <div id="pickup-extra" ${flow.expanded ? '' : 'hidden'}><h3>Время работы</h3><p>Пн — вс: 9:00–21:00</p><h3>Особенности</h3><span class="pickup-feature">15 минут на проверку</span></div></div>
        <footer class="pickup-footer"><div class="pickup-price"><span>Авито Доставка${p.oldPrice ? ' с кошельком' : ''}</span><span>${p.oldPrice ? `<s>${money(p.oldPrice)}</s> ` : ''}<strong>${money(p.delivery)}</strong></span></div><button class="button primary" data-delivery-action="confirm-point">Доставить сюда</button><div class="home-indicator" aria-hidden="true"></div></footer>
      </section>
    </section>`;
  }

  function draw(focusSelector) {
    layer.innerHTML = flow.phase === 'seller-map' ? sellerMapPage({image,...orderSummary(flow.sellerId)}) : flow.phase === 'courier' ? courierPage({image,...orderSummary(flow.sellerId),slotId:flow.slotId,money}) : flow.phase === 'map' ? mapPage() : addressSheet();
    layer.hidden = false;
    app.inert = true;
    (layer.querySelector(focusSelector || '[role="dialog"]')).focus({ preventScroll: true });
  }

  function close() {
    layer.hidden = true;
    layer.innerHTML = '';
    app.inert = false;
    flow = null;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  function confirm(id) {
    const sellerId = flow.sellerId;
    const scrollTop = app.querySelector('main').scrollTop;
    state.deliverySelections[sellerId] = { ...pickupPoints[id] };
    close();
    render(scrollTop);
    app.querySelector(`[data-action="delivery"][data-seller="${sellerId}"]`)?.focus({ preventScroll: true });
    document.querySelector('#announcement').textContent = `Выбран пункт: ${pickupPoints[id].label}`;
  }

  function confirmCourier() {
    const sellerId = flow.sellerId;
    const scroll = app.querySelector('main').scrollTop;
    const selection = courierSelection(flow.slotId);
    state.deliverySelections[sellerId] = selection;
    close();
    render(scroll);
    app.querySelector(`[data-action="delivery"][data-seller="${sellerId}"]`)?.focus({preventScroll:true});
    document.querySelector('#announcement').textContent = `Курьер: ${selection.timing}, ${money(selection.delivery)}`;
  }

  function expand(value) {
    flow.expanded = value;
    const sheet = layer.querySelector('.pickup-detail');
    sheet.classList.toggle('expanded', value);
    layer.querySelector('#pickup-extra').hidden = !value;
    const grip = sheet.querySelector('.sheet-grip');
    grip.setAttribute('aria-expanded', String(value));
    grip.setAttribute('aria-label', `${value ? 'Свернуть' : 'Развернуть'} карточку пункта`);
  }

  layer.addEventListener('change', event => {
    if (event.target.matches('input[name="pickup-address"]')) flow.addressId = event.target.value;
    if (event.target.matches('input[name="courier-slot"]')) flow.slotId = event.target.value;
  });
  layer.addEventListener('click', event => {
    const button = event.target.closest('[data-delivery-action]');
    if (!button || !flow) return;
    if (ignoreClick) { ignoreClick = false; if (button.classList.contains('sheet-grip')) return; }
    const action = button.dataset.deliveryAction;
    if (action === 'close') close();
    else if (action === 'confirm-self') close();
    else if (action === 'confirm-courier') confirmCourier();
    else if (action === 'copy-seller') {
      navigator.clipboard.writeText(sellerAddress).then(()=>{document.querySelector('#announcement').textContent='Адрес скопирован';}).catch(()=>{document.querySelector('#announcement').textContent='Не удалось скопировать адрес';});
    }
    else if (action === 'map') { flow.phase = 'map'; draw(); }
    else if (action === 'back') { flow.phase = 'address'; draw(); }
    else if (action === 'select-point') { flow.mapId = button.dataset.point; draw(`[data-point="${flow.mapId}"]`); }
    else if (action === 'expand') expand(!flow.expanded);
    else if (action === 'confirm-address') confirm(flow.addressId);
    else if (action === 'confirm-point') confirm(flow.mapId);
  });
  layer.addEventListener('pointerdown', event => {
    const grip = event.target.closest('.sheet-grip');
    if (!grip) return;
    ignoreClick = false;
    drag = { y: event.clientY, grip };
    grip.setPointerCapture(event.pointerId);
  });
  layer.addEventListener('pointerup', event => {
    if (!drag || !flow) return;
    const delta = (event.clientY - drag.y) / (document.querySelector('#viewport').clientWidth / 375);
    drag = null;
    if (Math.abs(delta) < 30) return;
    ignoreClick = true;
    if (flow.phase === 'map') expand(delta < 0);
    else if (delta > 0) close();
  });
  layer.addEventListener('pointercancel', () => { drag = null; });
  layer.addEventListener('keydown', event => {
    if (!flow) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (flow.phase === 'map') { flow.phase = 'address'; draw(); } else close();
    }
    if (event.key === 'Tab') {
      const focusable = [...layer.querySelectorAll('button:not(:disabled):not([tabindex="-1"]),input')].filter(el => el.getClientRects().length && (el.type !== 'radio' || el.checked));
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && (document.activeElement === first || document.activeElement.matches('[role="dialog"]'))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  return { open(sellerId, trigger) {
    if (!state.cart.length || trigger.closest('.seller-group')?.dataset.seller !== sellerId) return;
    ignoreClick = false;
    opener = trigger;
    const selected = state.deliverySelections[sellerId]?.id;
    const mode = state.deliveryModes?.[sellerId] || 'pickup';
    flow = { sellerId, phase: mode==='self'?'seller-map':mode==='courier'?'courier':'address', addressId: selected || 'avito', mapId: selected || 'yandex', slotId:state.deliverySelections[sellerId]?.slotId || 'today-evening', expanded: false };
    draw();
  } };
}
