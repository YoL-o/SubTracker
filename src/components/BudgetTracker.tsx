import React from 'react';
import { Card, ProgressBar, Alert, Badge } from 'react-bootstrap';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Subscription, Budget } from '../types';
import { currencies } from '../data/categories';

interface BudgetTrackerProps {
  subscriptions: Subscription[];
  budget?: Budget;
  defaultCurrency: string;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  subscriptions,
  budget,
  defaultCurrency,
}) => {
  if (!budget || !budget.isActive) return null;

  const currencySymbol = currencies.find(c => c.code === defaultCurrency)?.symbol || '$';
  
  // Calculate current spending
  const currentSpending = subscriptions
    .filter(sub => sub.isActive && !sub.isFreeTrial)
    .reduce((total, sub) => {
      let monthlyAmount = sub.amount;
      if (sub.billingCycle === 'yearly') {
        monthlyAmount = sub.amount / 12;
      } else if (sub.billingCycle === 'custom' && sub.customDays) {
        monthlyAmount = (sub.amount / sub.customDays) * 30;
      }
      
      // Apply user share if subscription is shared
      if (sub.splitCost && sub.userShare) {
        monthlyAmount = monthlyAmount * (sub.userShare / 100);
      }
      
      return total + monthlyAmount;
    }, 0);

  const budgetUsedPercentage = (currentSpending / budget.limit) * 100;
  const isOverBudget = budgetUsedPercentage > 100;
  const isNearLimit = budgetUsedPercentage >= budget.warningThreshold;

  const getProgressVariant = () => {
    if (isOverBudget) return 'danger';
    if (isNearLimit) return 'warning';
    return 'success';
  };

  return (
    <Card className="card-hover mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <Target size={20} className="me-2 text-primary" />
            <h6 className="mb-0">Monthly Budget</h6>
          </div>
          <Badge bg={getProgressVariant()}>
            {budgetUsedPercentage.toFixed(1)}%
          </Badge>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">
              {currencySymbol}{currentSpending.toFixed(2)} of {currencySymbol}{budget.limit.toFixed(2)}
            </span>
            <span className="text-muted">
              {currencySymbol}{(budget.limit - currentSpending).toFixed(2)} remaining
            </span>
          </div>
          <ProgressBar
            variant={getProgressVariant()}
            now={Math.min(budgetUsedPercentage, 100)}
            className="budget-progress"
          />
        </div>

        {isOverBudget && (
          <Alert variant="danger" className="py-2 mb-0">
            <AlertTriangle size={16} className="me-2" />
            <small>
              <strong>Budget exceeded!</strong> You're {currencySymbol}{(currentSpending - budget.limit).toFixed(2)} over your monthly limit.
            </small>
          </Alert>
        )}

        {isNearLimit && !isOverBudget && (
          <Alert variant="warning" className="py-2 mb-0">
            <TrendingUp size={16} className="me-2" />
            <small>
              <strong>Approaching budget limit.</strong> You've used {budgetUsedPercentage.toFixed(1)}% of your monthly budget.
            </small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default BudgetTracker;