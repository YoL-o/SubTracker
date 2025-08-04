// Currency conversion utilities
export interface ExchangeRates {
  [key: string]: number;
}

// Mock exchange rates - in a real app, you'd fetch from an API
const mockExchangeRates: ExchangeRates = {
  'USD': 1,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110,
  'CAD': 1.25,
  'AUD': 1.35,
  'NGN': 411,
  'INR': 74,
  'ZAR': 14.5,
  'KES': 108,
  'GHS': 6.1,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates = mockExchangeRates
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to USD first, then to target currency
  const usdAmount = amount / rates[fromCurrency];
  return usdAmount * rates[toCurrency];
};

export const fetchExchangeRates = async (apiKey?: string): Promise<ExchangeRates> => {
  // In a real implementation, you'd use a service like:
  // https://api.exchangerate-api.com/v4/latest/USD
  // For now, return mock data
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockExchangeRates), 100);
  });
};

export const formatCurrencyAmount = (
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'NGN': '₦',
      'INR': '₹',
      'ZAR': 'R',
      'KES': 'KSh',
      'GHS': '₵',
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
};