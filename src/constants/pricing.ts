export const CURRENCY_SYMBOL = '₹';

export function formatPrice(price: number): string {
  const safePrice = (typeof price === 'number' && !isNaN(price)) ? price : 0;
  return `${CURRENCY_SYMBOL}${safePrice.toLocaleString('en-IN')}`;
}
