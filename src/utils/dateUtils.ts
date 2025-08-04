import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(relativeTime);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const formatDate = (date: string): string => {
  return dayjs(date).format('MMM DD, YYYY');
};

export const formatRelativeDate = (date: string): string => {
  return dayjs(date).fromNow();
};

export const getDaysUntil = (date: string): number => {
  return dayjs(date).diff(dayjs(), 'day');
};

export const isUpcoming = (date: string, days: number = 7): boolean => {
  const targetDate = dayjs(date);
  const now = dayjs();
  const futureDate = now.add(days, 'day');
  
  return targetDate.isSameOrAfter(now) && targetDate.isSameOrBefore(futureDate);
};

export const isPastDue = (date: string): boolean => {
  return dayjs(date).isBefore(dayjs(), 'day');
};

export const getNextBillingDate = (
  currentDate: string,
  billingCycle: 'monthly' | 'yearly' | 'custom',
  customDays?: number
): string => {
  const current = dayjs(currentDate);
  
  switch (billingCycle) {
    case 'monthly':
      return current.add(1, 'month').format('YYYY-MM-DD');
    case 'yearly':
      return current.add(1, 'year').format('YYYY-MM-DD');
    case 'custom':
      return current.add(customDays || 30, 'day').format('YYYY-MM-DD');
    default:
      return current.add(1, 'month').format('YYYY-MM-DD');
  }
};

export const getCalendarMonth = (date: Date): Date[][] => {
  const start = dayjs(date).startOf('month').startOf('week');
  const end = dayjs(date).endOf('month').endOf('week');
  
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  for (let day = start; day.isSameOrBefore(end); day = day.add(1, 'day')) {
    currentWeek.push(day.toDate());
    
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  
  return weeks;
};