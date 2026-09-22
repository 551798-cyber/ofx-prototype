export function isCheckoutItemSelected(selections, id) {
  return selections[id] !== false;
}

export function selectedCheckoutCart(cart, selections) {
  return cart.filter(id => isCheckoutItemSelected(selections, id));
}

export function toggleCheckoutItem(selections, id) {
  const selected = !isCheckoutItemSelected(selections, id);
  selections[id] = selected;
  return selected;
}
