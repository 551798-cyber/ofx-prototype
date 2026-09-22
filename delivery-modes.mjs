// Demo addresses and slots from Figma section 43:53277, not live geolocation.
export const sellerAddress = 'Санкт-Петербург, ул Тюшина, 24';
export const recipientAddress = 'Москва, ул. Лесная, 7';
export const recipientDetails = 'ул. Лесная, 7, 8 подъезд, 5 эт.';
export const courierSlots = [
  {id:'today-fast',day:'Сегодня',time:'Как можно скорее, от 1 часа',delivery:349},
  {id:'today-evening',day:'Сегодня',time:'14:00–22:00',delivery:149},
  {id:'tomorrow-morning',day:'Завтра',time:'8:00–14:00',delivery:149},
  {id:'tomorrow-evening',day:'Завтра',time:'14:00–22:00',delivery:149},
  {id:'day3-morning',day:'7 сентября',time:'8:00–14:00',delivery:149},
  {id:'day3-evening',day:'7 сентября',time:'14:00–22:00',delivery:149},
  {id:'day3-all',day:'7 сентября',time:'8:00–22:00',delivery:49},
];
export function courierSelection(slotId = 'today-evening') {
  const slot = courierSlots.find(item => item.id === slotId) || courierSlots[1];
  return {method:'courier',address:recipientDetails,slotId:slot.id,delivery:slot.delivery,timing:`${slot.day}, ${slot.time}`};
}
export function selectDeliveryMethod(state, sellerId, method) {
  if (!['pickup','self','courier'].includes(method)) return false;
  state.deliveryModes ??= {};
  state.deliveryChoices ??= {};
  const current = state.deliveryModes[sellerId] || 'pickup';
  if (current === method) return false;
  const choices = state.deliveryChoices[sellerId] ??= {};
  choices[current] = state.deliverySelections[sellerId];
  state.deliveryModes[sellerId] = method;
  const next = choices[method] || (method === 'self' ? {method:'self',address:sellerAddress,delivery:1,timing:'Завтра'} : method === 'courier' ? courierSelection() : null);
  if (next) state.deliverySelections[sellerId] = {...next};
  else delete state.deliverySelections[sellerId];
  return true;
}

export function sellerMapPage({image,summary,photo}) {
  return `<section class="delivery-map-page seller-map" role="dialog" aria-modal="true" aria-label="Адрес продавца" tabindex="-1">
    <header class="delivery-map-header"><nav><button data-delivery-action="close" aria-label="Назад в чекаут">${image('delivery/e53e8.svg','icon')}</button><div class="seller-order-summary">${photo}<span>${summary}</span></div></nav><div class="delivery-map-tabs"><button disabled>Все</button><button class="selected" disabled>В пункт выдачи</button><button disabled>Курьер</button></div></header>
    <div class="pickup-map" aria-label="Демонстрационная карта адреса продавца">${image('delivery/38e5e.png','pickup-map-image')}<div class="seller-map-pin"><div class="seller-pin-caption"><strong>Самовывоз от продавца</strong><span>Завтра</span></div>${image('delivery-modes/seller-pin.svg')}</div></div>
    <div class="map-filters horizontal"><button disabled aria-label="Фильтры">${image('delivery/f5b4a.svg')}</button><button disabled>Службы доставки ${image('delivery/23189.svg')}</button><button disabled>Есть примерка</button><button disabled>Без выходных</button></div>
    <button class="seller-location" disabled aria-label="Моё местоположение — демонстрационная карта">${image('delivery-modes/location.svg')}</button>
    <section class="seller-map-detail"><div class="sheet-grip" aria-hidden="true"><span></span></div><div class="seller-map-copy"><h2>${sellerAddress}</h2><button data-delivery-action="copy-seller" aria-label="Скопировать адрес продавца">${image('delivery-modes/copy.svg')}</button><p>Адрес продавца</p><p class="seller-metro">${image('delivery-modes/metro.svg')}Белорусская, 5-7 мин.${image('delivery-modes/walk.svg')}</p><p class="seller-fee"><span>Безопасная сделка</span><span class="delivery-dots"></span><span>1 ₽</span></p></div><footer><button class="button primary" data-delivery-action="confirm-self">Доставить сюда</button></footer></section>
  </section>`;
}

export function courierPage({image,summary,photo,slotId,money}) {
  return `<section class="courier-page" role="dialog" aria-modal="true" aria-labelledby="courier-title" tabindex="-1"><header class="courier-header"><nav><button data-delivery-action="close" aria-label="Назад в чекаут">${image('delivery/e53e8.svg','icon')}</button><span>${summary}</span><div class="courier-order-photo">${photo}</div></nav><h1 id="courier-title">Ваш адрес</h1></header>
    <div class="courier-scroll"><div class="courier-address"><div><p>${image('delivery-modes/pin.svg')}<span>${recipientAddress}</span></p><button class="button" disabled title="Редактирование адреса подключим отдельным сценарием">Изменить</button></div></div>
      <div class="courier-slots" role="radiogroup" aria-label="Время доставки">${[...new Set(courierSlots.map(slot=>slot.day))].map(day=>`<section><h2>${day}</h2>${courierSlots.filter(slot=>slot.day===day).map(slot=>`<label class="courier-slot"><input type="radio" name="courier-slot" value="${slot.id}" ${slot.id===slotId?'checked':''} aria-label="${day}, ${slot.time}, ${money(slot.delivery)}"><span>${slot.time}</span><span class="delivery-dots"></span><span>${money(slot.delivery)}</span></label>`).join('')}</section>`).join('')}</div></div>
    <footer class="courier-footer"><button class="button primary" data-delivery-action="confirm-courier">Продолжить</button><button class="courier-terms" disabled title="Информационный экран пока не подключён">Условия доставки и возврата</button></footer></section>`;
}
