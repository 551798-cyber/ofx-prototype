// User-provided photos and titles, 22 September 2026. One prototype seller by request.
// Prices exclude personal bonus redemption; no unprovided descriptions invented.
export const checkoutCatalogSeller = 'vladimir';
export const checkoutCatalog = [
  {id:'premiataLaces',title:'Шнурки для кроссовок Premiata — Премиум качество',price:396,image:'catalog/premiata-laces.png'},
  {id:'flatLaces',title:'Плоские шнурки для кроссовок',price:490,image:'catalog/flat-laces.png'},
  {id:'textileDye',title:'Краска для ткани',price:150,image:'catalog/textile-dye.png'},
  {id:'tarrago',title:'Краска для обуви и подошвы Tarrago',price:300,image:'catalog/tarrago.png',sourceCrop:[0,551.5,945,945]},
  {id:'masterPolish',title:'Полировка/краска для обуви master италия',price:449,image:'catalog/master.png',sourceCrop:[0,638,945,772]},
  {id:'nikeBlack',title:'Nike Blazer City Low Lx черные',price:3590,image:'catalog/nike-black.png',sourceCrop:[0,551.5,945,945]},
  {id:'adidasHellstar',title:'Adidas Superstar Hellstar Black / White',price:3390,image:'catalog/adidas.png',sourceCrop:[0,551.5,945,945]},
].map(product=>({...product,seller:checkoutCatalogSeller,checkoutOnly:true,description:product.title}));
export const checkoutCatalogIds = checkoutCatalog.map(product=>product.id);
