export const POPULAR_SERVICES = [
  {
    name: 'Netflix',
    logo: 'N',
    color: 'text-red-500 bg-red-500/10',
    plans: [
      { name: 'Standard with ads', price: 6.99, cycle: 'monthly' },
      { name: 'Standard', price: 15.49, cycle: 'monthly' },
      { name: 'Premium', price: 22.99, cycle: 'monthly' }
    ]
  },
  {
    name: 'Spotify',
    logo: 'S',
    color: 'text-green-500 bg-green-500/10',
    plans: [
      { name: 'Individual', price: 10.99, cycle: 'monthly' },
      { name: 'Duo', price: 14.99, cycle: 'monthly' },
      { name: 'Family', price: 16.99, cycle: 'monthly' },
      { name: 'Student', price: 5.99, cycle: 'monthly' }
    ]
  },
  {
    name: 'Amazon Prime',
    logo: 'A',
    color: 'text-blue-500 bg-blue-500/10',
    plans: [
      { name: 'Prime Monthly', price: 14.99, cycle: 'monthly' },
      { name: 'Prime Annual', price: 139.00, cycle: 'yearly' },
      { name: 'Prime Video Only', price: 8.99, cycle: 'monthly' }
    ]
  },
  {
    name: 'Disney+',
    logo: 'D',
    color: 'text-blue-400 bg-blue-400/10',
    plans: [
      { name: 'Basic (With Ads)', price: 7.99, cycle: 'monthly' },
      { name: 'Premium', price: 13.99, cycle: 'monthly' },
      { name: 'Premium Annual', price: 139.99, cycle: 'yearly' }
    ]
  },
  {
    name: 'YouTube Premium',
    logo: 'Y',
    color: 'text-red-600 bg-red-600/10',
    plans: [
      { name: 'Individual', price: 13.99, cycle: 'monthly' },
      { name: 'Family', price: 22.99, cycle: 'monthly' },
      { name: 'Annual', price: 139.99, cycle: 'yearly' }
    ]
  },
  {
    name: 'ChatGPT Plus',
    logo: 'C',
    color: 'text-emerald-500 bg-emerald-500/10',
    plans: [
      { name: 'Plus', price: 20.00, cycle: 'monthly' }
    ]
  }
];

// Rough fallback exchange rates against USD base.
export const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12
};

export function convertCurrency(usdAmount, targetCurrency) {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return usdAmount * rate;
}

export function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  } catch (e) {
    // Fallback if Intl fails
    return `${currency} ${amount.toFixed(2)}`;
  }
}
