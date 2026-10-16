// Any nonempty code is accepted in this demo, as requested by the prototype owner.
export const normalizePromoCode = value => String(value ?? '').trim().toUpperCase();
export const isValidPromoCode = value => normalizePromoCode(value).length > 0;
export function promoDiscountFor(code, remainingGoodsAmount) {
  return isValidPromoCode(code) ? Math.round(Math.min(3000, Math.max(0, remainingGoodsAmount)) * 100) / 100 : 0;
}
