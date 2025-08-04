import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { Calendar, CreditCard, AlertCircle, CheckCircle, Trash2, Edit } from 'lucide-react';
import { Subscription } from '../types';
import { formatDate, getDaysUntil, isPastDue, isUpcoming } from '../utils/dateUtils';
import { categories, currencies } from '../data/categories';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onRenew: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onRenew,
}) => {
  const daysUntil = getDaysUntil(subscription.nextBillingDate);
  const category = categories.find(cat => cat.name === subscription.category);
  const currency = currencies.find(curr => curr.code === subscription.currency);
  const isPastDueDate = isPastDue(subscription.nextBillingDate);
  const isUpcomingRenewal = isUpcoming(subscription.nextBillingDate, 7);

  const getBadgeVariant = () => {
    if (!subscription.isActive) return 'secondary';
    if (subscription.isFreeTrial) return 'warning';
    if (isPastDueDate) return 'danger';
    if (isUpcomingRenewal) return 'warning';
    return 'success';
  };

  const getBadgeText = () => {
    if (!subscription.isActive) return 'Inactive';
    if (subscription.isFreeTrial) return 'Free Trial';
    if (isPastDueDate) return 'Past Due';
    if (isUpcomingRenewal) return 'Due Soon';
    return 'Active';
  };

  return (
    <Card className="card-hover fade-in h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center">
            <span className="me-2" style={{ fontSize: '1.5rem' }}>
              {category?.icon || '📦'}
            </span>
            <div>
              <Card.Title className="mb-1 h5">{subscription.name}</Card.Title>
              <small className="text-muted">{subscription.category}</small>
            </div>
          </div>
          <Badge bg={getBadgeVariant()} className="ms-2">
            {getBadgeText()}
          </Badge>
        </div>

        <Row className="mb-3">
          <Col xs={6}>
            <div className="d-flex align-items-center text-muted small">
              <CreditCard size={14} className="me-1" />
              <span>{currency?.symbol || '$'}{subscription.amount}</span>
              <span className="ms-1">/{subscription.billingCycle}</span>
            </div>
          </Col>
          <Col xs={6}>
            <div className="d-flex align-items-center text-muted small">
              <Calendar size={14} className="me-1" />
              <span>{formatDate(subscription.nextBillingDate)}</span>
            </div>
          </Col>
        </Row>

        {subscription.isFreeTrial && subscription.trialEndDate && (
          <div className="alert alert-warning py-2 mb-3">
            <AlertCircle size={16} className="me-2" />
            <small>
              Trial ends {formatDate(subscription.trialEndDate)} 
              ({getDaysUntil(subscription.trialEndDate)} days)
            </small>
          </div>
        )}

        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-center small text-muted">
            <span>Days until renewal:</span>
            <span className={`fw-bold ${daysUntil <= 3 ? 'text-danger' : daysUntil <= 7 ? 'text-warning' : 'text-success'}`}>
              {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days`}
            </span>
          </div>
          <div className="progress mt-1" style={{ height: '4px' }}>
            <div
              className={`progress-bar ${daysUntil <= 3 ? 'bg-danger' : daysUntil <= 7 ? 'bg-warning' : 'bg-success'}`}
              style={{ width: `${Math.max(0, Math.min(100, (30 - daysUntil) / 30 * 100))}%` }}
            />
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">
            Total spent: {currency?.symbol || '$'}{subscription.totalSpent.toFixed(2)}
          </small>
          <div className="btn-group btn-group-sm">
            {isPastDueDate && (
              <Button
                variant="success"
                size="sm"
                onClick={() => onRenew(subscription.id)}
                title="Mark as Renewed"
              >
                <CheckCircle size={14} />
              </Button>
            )}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => onEdit(subscription)}
              title="Edit"
            >
              <Edit size={14} />
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => onDelete(subscription.id)}
              title="Delete"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SubscriptionCard;