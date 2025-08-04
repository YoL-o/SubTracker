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
}