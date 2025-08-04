import React from 'react';
import { Card, ProgressBar, Alert, Badge } from 'react-bootstrap';
import { TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Subscription, Budget } from '../types';
import { getMonthlyAmount, formatCurrencyAmount } from '../utils/currencyUtils';

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

  // Calculate current spending
  const currentSpending = subscriptions
    .filter(sub => sub.isActive && !sub.isFreeTrial)
    .reduce((total, sub) => total + getMonthlyAmount(sub, defaultCurrency), 0);

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
              {formatCurrencyAmount(currentSpending, defaultCurrency)} of {formatCurrencyAmount(budget.limit, defaultCurrency)}
            </span>
            <span className="text-muted">
              {formatCurrencyAmount(budget.limit - currentSpending, defaultCurrency)} remaining
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
              <strong>Budget exceeded!</strong> You're {formatCurrencyAmount(currentSpending - budget.limit, defaultCurrency)} over your monthly limit.
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