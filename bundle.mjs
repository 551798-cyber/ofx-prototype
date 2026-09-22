import { checkoutCatalogIds } from './checkout-catalog.mjs?v=1';
export const bundleRecommendations = checkoutCatalogIds;

// Never reassign real catalogue items to another seller or create duplicate IDs.
export function prepareBundleCatalog(products, sellerId) {
  return bundleRecommendations.filter(id=>products[id]?.seller === sellerId);
}

export function bundleProgress(count) {
  const remaining = Math.max(0, 3 - count);
  return remaining ? `Добавьте еще ${remaining} ${remaining === 1 ? 'товар' : 'товара'} до скидки в 25%` : 'Скидка применена';
}

export function bundlePage({ products, sellers, quantity, count, recommendations, productPhoto, productPreview, quantityStepper, image, money, escape }) {
  return `<button class="bundle-scrim" data-action="back" aria-label="Закрыть подборку" tabindex="-1"></button><section class="bundle-sheet" role="dialog" aria-modal="true" aria-labelledby="bundle-title" tabindex="-1"><button class="sheet-grip bundle-grip" data-action="back" aria-label="Закрыть шторку"><span></span></button><header class="bundle-header"><h1 id="bundle-title">Вместе дешевле</h1><button class="bundle-close" data-action="back" aria-label="Закрыть подборку">${image('info/close.svg','icon')}</button></header>
    <main class="screen-scroll bundle-scroll" aria-label="Вместе дешевле" tabindex="-1"><p class="bundle-progress" aria-live="polite">${bundleProgress(count)}</p>
    <div class="checkout-grid bundle-grid">${recommendations.map(id => {
      const p = products[id];
      return `<article class="checkout-rec compact-catalog">${productPreview(p,productPhoto(p,'card-picture'),'card-open') }<div class="rec-info">${productPreview(p,`<strong>${money(p.price)}</strong><p class="name">${escape(p.description)}</p>`,'card-open')}<div class="rec-control" data-id="${id}">${quantity(id) ? quantityStepper(id,true) : `<button class="rec-buy" data-action="bundle-add" data-id="${id}" aria-label="В корзину: ${escape(p.title)}">В корзину</button>`}</div></div></article>`;
    }).join('')}</div></main></section>`;
}
