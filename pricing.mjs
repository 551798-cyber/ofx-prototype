// The plus flow enables 25% within its seller group; other demo rules stay intact.
export const WALLET_DISCOUNT = 100;

export function calculateTotals({ cart, quantities, products, sellers, demoPricing, bonusEnabled = true, deliverySelections = {}, paymentMethod = null, bundleSellers = [] }) {
  const quantity = id => quantities[id] || 0;
  const count = cart.reduce((sum, id) => sum + quantity(id), 0);
  const subtotal = cart.reduce((sum, id) => sum + products[id].price * quantity(id), 0);
  const groupIds = [...new Set(cart.map(id => products[id].seller))];
  const bundleCounts = Object.fromEntries(groupIds.map(seller => [seller, cart.filter(id => products[id].seller === seller).reduce((sum,id) => sum + quantity(id),0)]));
  const activeBundleSellers = new Set(bundleSellers.filter(seller => bundleCounts[seller] >= 3));
  const unitPrices = Object.fromEntries(cart.map(id => [id, activeBundleSellers.has(products[id].seller) ? Math.round(products[id].price * 75) / 100 : products[id].price]));
  const bundleDiscount = Math.round(cart.reduce((sum,id) => sum + (products[id].price - unitPrices[id]) * quantity(id),0) * 100) / 100;
  const delivery = groupIds.reduce((sum, id) => sum + (deliverySelections[id]?.delivery ?? sellers[id].delivery), 0);
  const isLegacyDemo = id => products[id].seller !== 'vladimir' && !products[id].realListing;
  const demoSubtotal = cart.filter(isLegacyDemo).reduce((sum, id) => sum + products[id].price * quantity(id), 0);
  const previousDiscount = Math.min(demoPricing.productDiscount, Math.floor(demoSubtotal * .3));
  // Never stack the legacy demo percentage and the new 25% on the same goods.
  const legacySubtotal = cart.filter(id => isLegacyDemo(id) && !activeBundleSellers.has(products[id].seller)).reduce((sum,id) => sum + products[id].price * quantity(id),0);
  const discount = count >= 3 ? Math.min(demoPricing.productDiscount, Math.floor(legacySubtotal * .3)) : 0;
  const listingBonus = cart.reduce((sum, id) => sum + (products[id].bonusPerUnit || 0) * quantity(id), 0);
  // Keep the pre-existing bonus amount independent of the new visibility threshold.
  const availableBonus = listingBonus + Math.min(demoPricing.bonusDiscount, Math.floor((demoSubtotal - previousDiscount) * .15));
  const bonus = bonusEnabled ? availableBonus : 0;
  const walletDiscount = paymentMethod === 'wallet' ? Math.min(WALLET_DISCOUNT, Math.max(0, subtotal - discount - bundleDiscount - bonus)) : 0;
  const productDiscount = Math.round((discount + bundleDiscount + walletDiscount) * 100) / 100;
  const total = Math.round((subtotal - productDiscount - bonus + delivery) * 100) / 100;
  return { count, subtotal, delivery, discount, bundleDiscount, bundleCounts, unitPrices, walletDiscount, productDiscount, availableBonus, bonus, total };
}
