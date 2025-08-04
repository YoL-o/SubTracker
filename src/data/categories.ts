import { Category } from '../types';

export const categories: Category[] = [
  { name: 'Entertainment', icon: '🎬', color: '#e74c3c' },
  { name: 'Music', icon: '🎵', color: '#9b59b6' },
  { name: 'Gaming', icon: '🎮', color: '#3498db' },
  { name: 'Productivity', icon: '💼', color: '#2ecc71' },
  { name: 'Cloud Storage', icon: '☁️', color: '#34495e' },
  { name: 'News & Media', icon: '📰', color: '#f39c12' },
  { name: 'Health & Fitness', icon: '💪', color: '#e67e22' },
  { name: 'Education', icon: '📚', color: '#16a085' },
  { name: 'Finance', icon: '💰', color: '#27ae60' },
  { name: 'Communication', icon: '💬', color: '#8e44ad' },
  { name: 'Design', icon: '🎨', color: '#e91e63' },
  { name: 'Development', icon: '⚡', color: '#607d8b' },
  { name: 'Other', icon: '📦', color: '#95a5a6' },
];

export const paymentMethods = [
  'Credit Card',
  'PayPal',
  'Bank Transfer',
  'Apple Pay',
  'Google Pay',
  'Cryptocurrency',
  'Gift Card',
  'Other',
];

export const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];