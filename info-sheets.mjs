// Informational sheets never change checkout, bonus, or payment state.
export function setupInfoSheets({ app, image }) {
  const layer = document.querySelector('#info-layer');
  let opener = null;
  let dragY = null;

  function close() {
    layer.hidden = true;
    layer.innerHTML = '';
    app.inert = false;
    dragY = null;
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  }

  function saveContent() {
    return `<div class="save-hero" aria-hidden="true">${image('info/save-background.png','save-background')}${image('info/save-hero.png','save-illustration')}</div>
      <div class="save-copy"><h2 id="info-title">Продавец получит деньги<br>не сразу</h2><p>А только когда вы заберёте товар.<br>При оформлении заказа банк просто<br>заморозит деньги на карте.</p></div>
      <div class="save-page-indicator" aria-hidden="true"><span></span><span></span></div>`;
  }

  function bonusContent() {
    return `<div class="bonus-hero" aria-hidden="true">${image('info/bonus-banner.png')}</div>
      <div class="bonus-copy"><h2 id="info-title">Начисление бонусов</h2><ul>
        <li>${image('info/b69d1.svg')}<span>Купите товар со значком акции</span></li>
        <li>${image('info/a6f56.svg')}<span>Выберите списать или начислить, по умолчанию начисляем по 10% от покупки</span></li>
        <li>${image('info/850bc.svg')}<span>1 бонус = 1 рублю</span></li>
      </ul></div>`;
  }

  layer.addEventListener('click', event => {
    if (event.target.closest('[data-info-close]')) close();
  });
  layer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const buttons = [...layer.querySelectorAll('button:not([tabindex="-1"])')];
    const first = buttons[0], last = buttons.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement.matches('[role="dialog"]'))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  layer.addEventListener('pointerdown', event => {
    const grip = event.target.closest('.info-grip');
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

  return { open(kind, trigger) {
    if (!['save', 'bonus'].includes(kind)) return;
    opener = trigger;
    layer.innerHTML = `<button class="info-scrim" data-info-close aria-label="Закрыть информацию" tabindex="-1"></button>
      <section class="info-sheet ${kind}-sheet" role="dialog" aria-modal="true" aria-labelledby="info-title" tabindex="-1">
        <button class="sheet-grip info-grip" data-info-close aria-label="Закрыть шторку"><span></span></button>
        ${kind === 'save' ? `<button class="info-close" data-info-close aria-label="Закрыть шторку">${image('info/close.svg')}</button>` : ''}
        <div class="info-sheet-body">${kind === 'save' ? saveContent() : bonusContent()}</div>
        <footer class="info-sheet-footer"><button class="button primary" data-info-close>${kind === 'save' ? 'Закрыть' : 'Круто!'}</button><div class="home-indicator" aria-hidden="true"></div></footer>
      </section>`;
    layer.hidden = false;
    app.inert = true;
    layer.querySelector('[role="dialog"]').focus({ preventScroll: true });
  } };
}
