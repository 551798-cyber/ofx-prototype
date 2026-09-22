// Transcribed from IMG_0264–IMG_0283. Missing source fields stay absent.
export const listingRecommendations = ['rickLaces', 'washBag', 'nikeBuckles', 'margielaWhite', 'margielaBlack'];
const photo = name => `listing/${name}.PNG`;
export const recommendationProducts = {
  rickLaces: {
    id: 'rickLaces', title: 'Шнурки Rick Owens оригинал', price: 249, bonusPerUnit: 8, maxDiscountPrice: 241,
    seller: 'goodstudio', realListing: true, image: photo('IMG_0274'), screenshotPhoto: true,
    gallery: ['IMG_0274','IMG_0275','IMG_0276'].map(photo), availability: 'В наличии: несколько',
    deliveryLabel: 'От 19 ₽, от 5 дней', deliveryDays: '5 дней', deliveryOld: 99, installment: 63, postpay: true,
    deliveryOptions: [
      {label:'Лучшая цена',tone:'green',carrier:'5Post',old:99,price:19,timing:'5–11 дней'},
      {label:'Вы уже выбирали',tone:'purple',carrier:'Яндекс Доставка',old:269,price:53},
      {label:'Самая быстрая',tone:'blue',carrier:'СДЭК',old:299,price:59},
    ],
    properties: [['Состояние','Новое с биркой'],['Подтип товара','Подтяжки'],['Бренд','Rick Owens'],['Цвет','Белый'],['Для кого','Унисекс'],['Материал','Текстиль']],
    description: 'Новые шнурки Rick Owens правильного цвета свежего фермерского молока\n\nОтправляю авито доставкой в день заказа!\n\nВ комплекте пара шнурков для одной пары обуви',
  },
  washBag: {
    id: 'washBag', title: 'Чехол для стирки обуви', price: 299, bonusPerUnit: 1, maxDiscountPrice: 293,
    seller: 'shoppingTour', realListing: true, image: photo('IMG_0272'), sourceCrop: [0,475,945,1098],
    gallery: [photo('IMG_0272')], galleryWidth:343, galleryPhotoWidth:292*945/1098,
    deliveryLabel:'От 35 ₽, от 4 дней', deliveryDays:'4 дней', deliveryOld:179, installment:75, condition:'Новое', noProductReviews:true,
    deliveryOptions: [
      {label:'Лучшая цена',tone:'green',carrier:'5Post',old:179,price:35,timing:'4–10 дней'},
      {carrier:'Доставка в пункт выдачи',old:179,price:35},
      {carrier:'Самовывоз с онлайн-оплатой',price:1},
    ],
    properties:[['Состояние','Новое с биркой'],['Цвет','Разноцветный'],['Для кого','Унисекс']],
    description:'Мешок для стирки обуви в стиральной машине\nПрактичный мешок для бережной стирки обуви: сохраняет шнурки и мелкие детали, защищает барабан от ударов и снижает шум…',
    descriptionExcerpt:true,
  },
  nikeBuckles: {
    id:'nikeBuckles', title:'Оригинальные пряжки на шнурки nike', price:1500, bonusPerUnit:7,
    seller:'bucklesSeller', realListing:true, image:photo('IMG_0277'), screenshotPhoto:true,
    gallery:['IMG_0277','IMG_0278'].map(photo), city:'Кострома',
    deliveryLabel:'От 1 ₽, от 1 дня', deliveryDays:'1 дня', deliveryOld:419, installment:375, postpay:true, condition:'Отличное', walletDelivery:true, benefits:['installment'],
    deliveryOptions:[
      {label:'Лучшая цена',tone:'green',carrier:'Яндекс Доставка',old:499,price:1,timing:'2–6 дней'},
      {label:'Самая быстрая',tone:'blue',carrier:'СДЭК',old:529,price:1,timing:'1–4 дня'},
      {carrier:'Доставка в пункт выдачи',old:439,price:1},
    ],
    properties:[['Состояние','Отличное'],['Высота','Стандартная'],['Бренд','Nike'],['Цвет','Бежевый'],['Для кого','Унисекс']],
    description:'Пряжки на шнурки, покупались в магазине Nike. В отличном состоянии.',
  },
};
export const recommendationSellers = {
  goodstudio:{name:'goodstudiobrand',rating:'5,0',reviewCount:'1844 отзыва',listingCount:'197 объявлений',response:'Отвечает на сообщения за несколько часов',carrier:'5Post',delivery:19,timing:'5–11 дней',badges:['4312 продаж с Авито Доставкой','Документы проверены','Надёжный продавец']},
  shoppingTour:{name:'Шоппинг тур',rating:'5,0',reviewCount:'14 отзывов',listingCount:'31 объявление',online:true,carrier:'5Post',delivery:35,timing:'4–10 дней',avatar:{image:photo('IMG_0271'),crop:[783,642,126,126]},badges:['153 продажи с Авито Доставкой','Документы проверены']},
  bucklesSeller:{name:'Пользователь',rating:'5,0',reviewCount:'61 отзыв',listingCount:'85 объявлений',response:'Отвечает на сообщения в течение дня',carrier:'Яндекс',delivery:1,deliveryIcon:'60d3d.png',timing:'2–6 дней',avatar:{image:photo('IMG_0282'),crop:[783,1535,127,127]},badges:[]},
};
