import { checkoutCatalog, checkoutCatalogIds } from './checkout-catalog.mjs?v=1';
import { recommendationProducts, recommendationSellers } from './recommendation-listings.mjs?v=1';
// Меняйте фотографии, цены, названия и продавцов здесь.
// Nike, продавец и checkout-catalog — из скриншотов пользователя;
// остальные рекомендации пока демо из Figma.
// Реальные покупки не подключены.
export const products = {
  ...recommendationProducts,
  ...Object.fromEntries(checkoutCatalog.map(product=>[product.id,product])),
  carhartt: { id: 'carhartt', title: 'Зимняя куртка carhartt', price: 3700, seller: 'kirill', image: 'bundle/coat.png' },
  pants: { id: 'pants', title: 'Штаны домашние коричневые', price: 3700, seller: 'kirill', image: 'bundle/pants.jpg', imageCrop: { width: 136.97, height: 170, left: -19.55, top: -62.46 } },
  sneakers: {
    id: 'sneakers', title: 'Кроссовки Nike blazer city low LX', price: 3590, bonusPerUnit: 17, seller: 'vladimir',
    image: 'listing/IMG_0247.PNG', screenshotPhoto: true,
    gallery: ['listing/IMG_0247.PNG', 'listing/IMG_0248.PNG', 'listing/IMG_0249.PNG', 'listing/IMG_0250.PNG', 'listing/IMG_0251.PNG'],
    sourceListingId: '8167968370', city: 'Санкт-Петербург', availability: 'В наличии: несколько',
    description: 'Кроссовки Nike blazer city low LX /Кеды найк блейзер сити низкие ликс НА РУКАХ',
    properties: [['Состояние', 'Хорошее'], ['Сезон', 'Демисезон, Любой'], ['Размер', '43'], ['Материал основной части', 'Натуральная замша'], ['Бренд', 'Nike'], ['Цвет', 'Чёрный']],
    realListing: true, maxDiscountPrice:3410, installment:898, deliveryLabel:'От 1 ₽, от 2 дней', benefits:['fitting','installment','returns'], walletDelivery:true,
    deliveryIntro:'Может приехать завтра', deliveryOld:439,
    deliveryOptions:[{label:'Самовывоз',tone:'purple',carrier:'От продавца',price:1},{label:'Лучшая цена',tone:'green',carrier:'Яндекс Доставка',old:489,price:1,timing:'2–5 дней'},{carrier:'Доставка в пункт выдачи',old:439,price:1}],
  },
  margielaWhite: { id: 'margielaWhite', title: 'Кроссовки Maison Margiela replica whi…', price: 3790, seller: 'vladimir', image: 'listing/IMG_0244.PNG', sourceCrop: [66,454,365,365], city: 'Санкт-Петербург' },
  margielaBlack: { id: 'margielaBlack', title: 'Кроссовки maison margiela replica bla…', price: 3790, seller: 'vladimir', image: 'listing/IMG_0244.PNG', sourceCrop: [515,454,365,365], city: 'Санкт-Петербург' },
  balance: { id: 'balance', title: 'Кроссовки мужские New Balance', price: 3000, seller: 'shoes', image: '6cfc3.png' },
  balance2002: { id: 'balance2002', title: 'Оригинальные New Balance 2002R', price: 12000, seller: 'shoes', image: '44fea.jpg' },
  blue: { id: 'blue', title: 'Кроссовки мужские', price: 3000, seller: 'shoes', image: 'd0a2e.jpg' },
  hat: { id: 'hat', title: 'Шапка бини WIP docker', price: 1049, seller: 'kirill', image: '40697.png' },
  light: { id: 'light', title: 'Фонарь для велосипеда Cyc...', price: 1000, seller: 'kirill', image: 'bce16.png' },
  pixel: { id: 'pixel', title: 'Google Pixel 7 Pro 12/512 ГБ', price: 59900, seller: 'kirill', image: '6c449.png' },
  skirt: { id: 'skirt', title: 'Юбка-шорты новые', price: 320, seller: 'kirill', image: '1be5a.jpg' },
  beret: { id: 'beret', title: 'Берет stussy новый', price: 1890, seller: 'kirill', image: '77eaa.png' },
  jacket: { id: 'jacket', title: 'Пуховик зимний', price: 13020, seller: 'kirill', image: '639c9.png' },
};
export const sellers = {
  ...recommendationSellers,
  vladimir: { name: 'Владимир Петербургский | VPETERBURGSKIY', rating: '5,0', reviewCount: '374 отзыва', listingCount: '11 объявлений', since: 'На Авито с декабря 2018', followers: '181 подписчик', carrier: 'Яндекс', delivery: 1, deliveryIcon: '60d3d.png', timing: '2–5 дней', address: 'Мирской переулок, 10', online:true, canCall:true, avatar:{image:'listing/IMG_0245.PNG',crop:[40,806,207,207]}, discountCopy:'Скидка 5% при заказе от 2 товаров', badges: ['916 продаж с Авито Доставкой', 'Эковклад: −413 кг CO₂', 'яПомогаю', 'Надёжный продавец'] },
  shoes: { name: 'Название магазина', carrier: 'Авито', delivery: 320, deliveryIcon: '96df1.png', timing: '1–2 дня', address: 'Мирской переулок, 10' },
  kirill: { name: 'Кирилл Нагорнов', carrier: 'Яндекс', delivery: 100, deliveryIcon: '60d3d.png', timing: 'сегодня', address: 'Мирской переулок, 10' },
};
export const productRecommendations = ['balance', 'balance2002', 'blue'];
export const checkoutRecommendations = [...checkoutCatalogIds, 'hat', 'light', 'pixel', 'skirt', 'beret', 'jacket'];
// В макете суммы пока не согласованы. В черновике скидки ограничены суммой
// товаров, итог в строке и кнопке оплаты всегда вычисляется одинаково.
export const demoPricing = { productDiscount: 3000, bonusDiscount: 1000 };
