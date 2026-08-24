// Devises Stripe sans sous-unite (le montant n'est jamais multiplie par 100).
// https://docs.stripe.com/currencies#zero-decimal
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg',
  'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
]);

export const toStripeUnitAmount = (amount: number, currency: string): number => {
  const isZeroDecimal = ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());
  return isZeroDecimal ? amount : Math.round(amount * 100);
};
