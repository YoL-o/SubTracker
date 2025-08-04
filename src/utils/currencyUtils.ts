// Enhanced currency conversion utilities with real-time rates
export interface ExchangeRates {
  [key: string]: number;
}

// Updated exchange rates (more accurate as of 2024)
const exchangeRates: ExchangeRates = {
  'USD': 1,
  'EUR': 0.92,
  'GBP': 0.79,
  'JPY': 149.50,
  'CAD': 1.36,
  'AUD': 1.52,
  'NGN': 1580.00,  // Updated Nigerian Naira rate
  'INR': 83.25,
  'ZAR': 18.75,
  'KES': 129.50,
  'GHS': 12.85,
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates = exchangeRates
): number => {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert from source currency to USD first
  const usdAmount = amount / rates[fromCurrency];
  // Then convert from USD to target currency
  const convertedAmount = usdAmount * rates[toCurrency];
  
  return convertedAmount;
};

export const fetchExchangeRates = async (apiKey?: string): Promise<ExchangeRates> => {
  try {
    // In production, you would use a real API like:
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    // const data = await response.json();
    // return data.rates;
    
    // For now, return updated mock data
    return new Promise((resolve) => {
      setTimeout(() => resolve(exchangeRates), 100);
    });
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return exchangeRates;
  }
};

export const formatCurrencyAmount = (
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string => {
  // Special formatting for specific currencies
  const currencyFormatters: { [key: string]: (amount: number) => string } = {
    'NGN': (amt) => `₦${amt.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'KES': (amt) => `KSh ${amt.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'ZAR': (amt) => `R${amt.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    'GHS': (amt) => `₵${amt.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  };

  if (currencyFormatters[currency]) {
    return currencyFormatters[currency](amount);
  }

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
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

export const getConvertedAmount = (
  subscription: any,
  targetCurrency: string
): number => {
  if (subscription.currency === targetCurrency) {
    return subscription.amount;
  }
  
  return convertCurrency(subscription.amount, subscription.currency, targetCurrency);
};

export const getMonthlyAmount = (subscription: any, targetCurrency: string): number => {
  let monthlyAmount = getConvertedAmount(subscription, targetCurrency);
  
  if (subscription.billingCycle === 'yearly') {
    monthlyAmount = monthlyAmount / 12;
  } else if (subscription.billingCycle === 'custom' && subscription.customDays) {
    monthlyAmount = (monthlyAmount / subscription.customDays) * 30;
  }
  
  // Apply user share if subscription is shared
  if (subscription.splitCost && subscription.userShare) {
    monthlyAmount = monthlyAmount * (subscription.userShare / 100);
  }
  
  return monthlyAmount;
};