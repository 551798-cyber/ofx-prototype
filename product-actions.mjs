export const chatQuestions = ['Где и когда можно посмотреть?', 'Сегодня можно посмотреть?', 'Завтра можно посмотреть?'];

export function toggleFavorite(state, id) {
  state.favorites ||= [];
  const selected = !state.favorites.includes(id);
  state.favorites = selected ? [...state.favorites, id] : state.favorites.filter(value => value !== id);
  return selected;
}

export function setupProductActions({ app, state, products, sellers, image, icon, cropAsset, productPhoto, escape, money, hidePurchaseToast }) {
  const layer = document.querySelector('#chat-layer');
  const toast = document.querySelector('#favorite-toast');
  let timer, opener, chatId;
  const chatArt = (rect, className = '') => cropAsset('interactions/chat-reference.png', rect, className);
  const heart = () => cropAsset('interactions/favorite-reference.png', [736,138,58,58], 'favorite-heart');
  function fitChat() {
    if (layer.hidden) return;
    const device = document.querySelector('#device').getBoundingClientRect();
    const viewport = window.visualViewport;
    const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
    const height = Math.max(0, Math.min(device.height, visibleBottom - device.top)) / (device.width / 375);
    layer.style.height = `${height}px`;
    layer.classList.toggle('chat-compact', height < 480);
  }
  window.visualViewport?.addEventListener('resize', fitChat);
  window.visualViewport?.addEventListener('scroll', fitChat);
  new ResizeObserver(fitChat).observe(document.querySelector('#device'));

  function favoriteButton(p) {
    const selected = state.favorites?.includes(p.id) || false;
    return `<button class="button square favorite-button" data-action="favorite" data-id="${p.id}" aria-label="${selected ? 'Убрать из избранного' : 'В избранное'}" aria-pressed="${selected}">${selected ? heart() : icon('0fd6b.svg')}</button>`;
  }
  function hideToast() { clearTimeout(timer); toast.hidden = true; }
  function favorite(id, button) {
    const selected = toggleFavorite(state, id);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', selected ? 'Убрать из избранного' : 'В избранное');
    button.innerHTML = selected ? heart() : icon('0fd6b.svg');
    hidePurchaseToast();
    // Repeated taps restart the timer; the video keeps the toast on removal too.
    hideToast();
    toast.hidden = false;
    document.querySelector('#announcement').textContent = selected ? 'Объявление добавлено в избранное' : 'Объявление удалено из избранного';
    timer = setTimeout(hideToast, 4500);
  }
  function close() {
    if (layer.hidden) return;
    state.chatDrafts[chatId] = layer.querySelector('input').value;
    layer.hidden = true;
    layer.innerHTML = '';
    app.inert = false;
    app.classList.remove('chat-underlay');
    if (opener?.isConnected) opener.focus({preventScroll:true});
  }
  function open(id, trigger) {
    if (!products[id]) return;
    hideToast(); hidePurchaseToast();
    chatId = id; opener = trigger;
    state.chatDrafts ||= {};
    const p = products[id], seller = sellers[p.seller];
    layer.innerHTML = `<section class="seller-chat" role="dialog" aria-modal="true" aria-label="Чат с продавцом" tabindex="-1">
      <header class="chat-header"><button class="chat-close" data-chat-close aria-label="Закрыть чат">${image('info/close.svg')}</button><div class="chat-thumbnail">${productPhoto(p)}${seller.avatar ? cropAsset(seller.avatar.image,seller.avatar.crop,'chat-avatar') : ''}</div><div class="chat-heading"><h1>${escape(seller.name)}</h1><p><span class="chat-product-title">${escape(p.title)}</span><span class="chat-product-price"> · ${money(p.price)}</span></p></div></header>
      <main class="chat-content"><div class="chat-empty">${chatArt([314,701,326,253],'chat-illustration')}<p>${escape(seller.response || 'Отвечает около 30 минут')}</p></div></main>
      <section class="chat-compose"><h2>Спросите у продавца</h2><div class="chat-suggestions">${chatQuestions.map((q,i)=>`<button data-chat-question="${i}">${q}</button>`).join('')}</div><div class="chat-input-row"><button disabled aria-label="Добавить вложение" title="Вложения не подключены в прототипе">${chatArt([37,1874,49,53],'chat-tool')}</button><input aria-label="Сообщение" placeholder="Сообщение" autocomplete="off" value="${escape(state.chatDrafts[id] || '')}"><button disabled aria-label="Камера" title="Камера не подключена в прототипе">${chatArt([751,1877,63,50],'chat-camera')}</button><button disabled aria-label="Голосовое сообщение" title="Запись не подключена в прототипе">${chatArt([847,1874,46,58],'chat-mic')}</button></div><span class="sr-only">Это прототип. Сообщения не отправляются. Быстрый вопрос заполняет поле сообщения.</span></section>
    </section>`;
    layer.hidden = false;
    fitChat();
    app.classList.add('chat-underlay'); app.inert = true;
    layer.querySelector('[role=dialog]').focus({preventScroll:true});
  }
  layer.addEventListener('click', event => {
    if (event.target.closest('[data-chat-close]')) close();
    const question = event.target.closest('[data-chat-question]');
    if (question) {
      const input = layer.querySelector('input');
      input.value = chatQuestions[Number(question.dataset.chatQuestion)];
      state.chatDrafts[chatId] = input.value;
    }
  });
  layer.addEventListener('input', event => { if (event.target.matches('input')) state.chatDrafts[chatId] = event.target.value; });
  layer.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const controls = [...layer.querySelectorAll('button:not(:disabled),input')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement.matches('[role=dialog]'))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  return { favoriteButton, favorite, open, close, hideToast };
}
