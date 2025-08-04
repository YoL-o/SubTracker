export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'custom';
  customDays?: number;
  nextBillingDate: string;
  category: string;
  paymentMethod: string;
  isFreeTrial: boolean;
  trialEndDate?: string;
  isActive: boolean;
  description?: string;
  icon?: string;
  createdAt: string;
  totalSpent: number;
  autoRenew: boolean;
  sharedWith?: SharedUser[];
  splitCost?: boolean;
  userShare?: number;
  originalCurrency?: string;
  originalAmount?: number;
  exchangeRate?: number;
}

export interface SharedUser {
  id: string;
  name: string;
  email?: string;
  share: number;
  color: string;
}

export interface BillingHistory {
  id: string;
  subscriptionId: string;
  subscriptionName: string;
  amount: number;
  currency: string;
  date: string;
  type: 'renewal' | 'cancellation' | 'trial_start' | 'trial_end';
  paymentMethod: string;
}

export interface Budget {
  id: string;
  name: string;
  limit: number;
  currency: string;
  period: 'monthly' | 'yearly';
  categories?: string[];
  warningThreshold: number; // percentage (e.g., 80 for 80%)
  isActive: boolean;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface ReminderSettings {
  enabled: boolean;
  daysBeforeRenewal: number;
  browserNotifications: boolean;
}

export interface AppSettings {
  darkMode: boolean;
  currency: string;
  reminders: ReminderSettings;
  budget?: Budget;
  exchangeRateApiKey?: string;
  autoConvertCurrency: boolean;
}