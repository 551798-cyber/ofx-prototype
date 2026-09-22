import { WALLET_DISCOUNT } from './pricing.mjs?v=payment-1';

export const paymentMethods = [
  { id: 'sbp', title: 'СБП', subtitle: 'Оплата в приложении банка', icon: 'e6483.svg', badge: 'удобно' },
  { id: 'wallet', title: 'Кошелёк', subtitle: 'На балансе 4 000 ₽', icon: '85ab0.svg', badge: `−${WALLET_DISCOUNT} ₽` },
  { id: 'sber', title: 'Сбербанк', subtitle: 'Оплата в приложении банка', icon: 'af960.svg', addon: true },
  { id: 'tbank', title: 'Т-Банк', subtitle: 'Оплата в приложении банка', icon: '115e7.svg', addon: true },
  { id: 'cash', title: 'Наличными продавцу', subtitle: '', icon: 'methods-reference.png' },
  { id: 'new-card', title: 'Новая карта', subtitle: 'Visa, Mastercard, МИР' },
];

export function paymentIcon(id, image) {
  const method = paymentMethods.find(method => method.id === id) || paymentMethods[1];
  return `<span class="payment-symbol payment-symbol-${method.id}" aria-hidden="true">${method.id === 'new-card' ? `<span class="add-discount">${image('06527.svg')}</span>` : image(`payment/${method.icon}`, 'payment-brand')}${method.addon ? image('payment/5d093.svg', 'payment-addon') : ''}</span>`;
}

export function setupPayment({ app, state, image, onSelect }) {
  const layer = document.querySelector('#payment-layer');
  let opener = null;
  let dragY = null;

  function close() {
    layer.hidden = true;
    layer.innerHTML = '';
    app.inert = false;
    dragY = null;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  function choose(id) {
    if (!paymentMethods.some(method => method.id === id)) return;
    close();
    onSelect(id);
  }

  layer.addEventListener('click', event => {
    if (event.target.closest('[data-payment-close]')) close();
    // Selecting the already checked method should also dismiss the sheet.
    const row = event.target.closest('.payment-option');
    if (row && !layer.hidden) choose(row.dataset.method);
  });
  layer.addEventListener('change', event => {
    if (event.target.matches('input[name="payment-method"]')) choose(event.target.value);
  });
  layer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const first = layer.querySelector('.payment-close');
      const last = layer.querySelector('input:checked');
      if (event.shiftKey && (document.activeElement === first || document.activeElement.matches('[role="dialog"]'))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  layer.addEventListener('pointerdown', event => {
    const grip = event.target.closest('.payment-grip');
    if (!grip) return;
    dragY = event.clientY;
    grip.setPointerCapture(event.pointerId);
  });
  layer.addEventListener('pointerup', event => {
    if (dragY === null) return;
    const delta = (event.clientY - dragY) / (document.querySelector('#viewport').clientWidth / 375);
    dragY = null;
    if (delta > 30) close();
  });
  layer.addEventListener('pointercancel', () => { dragY = null; });

  return { open(trigger) {
    opener = trigger;
    layer.innerHTML = `<button class="payment-scrim" data-payment-close aria-label="Закрыть способы оплаты" tabindex="-1"></button>
      <section class="payment-sheet" role="dialog" aria-modal="true" aria-labelledby="payment-title" tabindex="-1">
        <div class="payment-grip" aria-hidden="true"><span></span></div>
        <header class="payment-header"><button class="payment-close" data-payment-close aria-label="Закрыть способы оплаты">${image('payment/f21ac.svg')}</button><h2 id="payment-title">Счета и карты</h2></header>
        <div class="payment-options" role="radiogroup" aria-label="Способ оплаты">${paymentMethods.map(method => `<label class="payment-option" data-method="${method.id}">${paymentIcon(method.id, image)}<span class="payment-copy"><span class="payment-title">${method.title}${method.badge ? `<span class="payment-badge">${method.badge}</span>` : ''}</span>${method.subtitle ? `<span class="payment-subtitle">${method.subtitle}</span>` : ''}</span><input type="radio" name="payment-method" value="${method.id}" aria-label="${method.title}" ${state.paymentMethod === method.id ? 'checked' : ''}></label>`).join('')}</div>
        <div class="payment-home"><div class="home-indicator" aria-hidden="true"></div></div>
      </section>`;
    layer.hidden = false;
    app.inert = true;
    layer.querySelector('[role="dialog"]').focus({ preventScroll: true });
  } };
}
