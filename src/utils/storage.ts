import { Subscription, AppSettings } from '../types';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrackr_subscriptions',
  SETTINGS: 'subtrackr_settings',
};

export const loadSubscriptions = (): Subscription[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load subscriptions:', error);
    return [];
  }
};

export const saveSubscriptions = (subscriptions: Subscription[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
  } catch (error) {
    console.error('Failed to save subscriptions:', error);
  }
};

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {
      darkMode: false,
      currency: 'USD',
      reminders: {
        enabled: true,
        daysBeforeRenewal: 3,
        browserNotifications: false,
      },
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      darkMode: false,
      currency: 'USD',
      reminders: {
        enabled: true,
        daysBeforeRenewal: 3,
        browserNotifications: false,
      },
    };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const exportToCSV = (subscriptions: Subscription[]): string => {
  const headers = [
    'Name',
    'Amount',
    'Currency',
    'Billing Cycle',
    'Next Billing Date',
    'Category',
    'Payment Method',
    'Is Free Trial',
    'Trial End Date',
    'Is Active',
    'Total Spent',
    'Auto Renew'
  ];

  const csvContent = [
    headers.join(','),
    ...subscriptions.map(sub => [
      `"${sub.name}"`,
      sub.amount,
      sub.currency,
      sub.billingCycle,
      sub.nextBillingDate,
      `"${sub.category}"`,
      `"${sub.paymentMethod}"`,
      sub.isFreeTrial,
      sub.trialEndDate || '',
      sub.isActive,
      sub.totalSpent,
      sub.autoRenew
    ].join(','))
  ].join('\n');

  return csvContent;
};

export const downloadCSV = (subscriptions: Subscription[]): void => {
  const csvContent = exportToCSV(subscriptions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `subtrackr_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};