import React from 'react';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { CreditCard, Calendar } from 'lucide-react';
import { Subscription } from '../types';
import { getMonthlyAmount, formatCurrencyAmount } from '../utils/currencyUtils';
import { formatDate, getDaysUntil } from '../utils/dateUtils';

interface PaymentMethodTrackerProps {
  subscriptions: Subscription[];
  defaultCurrency: string;
}

const PaymentMethodTracker: React.FC<PaymentMethodTrackerProps> = ({
  subscriptions,
  defaultCurrency,
}) => {
  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);

  // Group subscriptions by payment method
  const groupedByPaymentMethod = activeSubscriptions.reduce((groups, sub) => {
    const method = sub.paymentMethod;
    if (!groups[method]) {
      groups[method] = [];
    }
    groups[method].push(sub);
    return groups;
  }, {} as Record<string, Subscription[]>);

  // Get upcoming renewals (next 30 days) grouped by payment method
  const upcomingRenewals = activeSubscriptions
    .filter(sub => getDaysUntil(sub.nextBillingDate) <= 30 && getDaysUntil(sub.nextBillingDate) >= 0)
    .sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate));

  const upcomingByPaymentMethod = upcomingRenewals.reduce((groups, sub) => {
    const method = sub.paymentMethod;
    if (!groups[method]) {
      groups[method] = [];
    }
    groups[method].push(sub);
    return groups;
  }, {} as Record<string, Subscription[]>);

  if (Object.keys(groupedByPaymentMethod).length === 0) {
    return null;
  }

  return (
    <Row>
      <Col lg={6} className="mb-4">
        <Card className="card-hover h-100">
          <Card.Header>
            <h5 className="mb-0">
              <CreditCard size={20} className="me-2" />
              Payment Methods
            </h5>
          </Card.Header>
          <Card.Body>
            {Object.entries(groupedByPaymentMethod).map(([method, subs]) => {
              const totalMonthly = subs.reduce((total, sub) => total + getMonthlyAmount(sub, defaultCurrency), 0);

              return (
                <div key={method} className="mb-3 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">{method}</h6>
                    <Badge bg="primary">{subs.length} subscription{subs.length > 1 ? 's' : ''}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">Monthly total:</small>
                    <strong>{formatCurrencyAmount(totalMonthly, defaultCurrency)}</strong>
                  </div>
                </div>
              );
            })}
          </Card.Body>
        </Card>
      </Col>

      <Col lg={6} className="mb-4">
        <Card className="card-hover h-100">
          <Card.Header>
            <h5 className="mb-0">
              <Calendar size={20} className="me-2" />
              Upcoming Deductions (30 days)
            </h5>
          </Card.Header>
          <Card.Body>
            {Object.keys(upcomingByPaymentMethod).length === 0 ? (
              <p className="text-muted text-center py-3">
                No upcoming renewals in the next 30 days.
              </p>
            ) : (
              Object.entries(upcomingByPaymentMethod).map(([method, subs]) => (
                <div key={method} className="mb-3">
                  <h6 className="text-primary mb-2">{method}</h6>
                  <ListGroup variant="flush">
                    {subs.map(sub => (
                      <ListGroup.Item key={sub.id} className="px-0 py-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-medium">{sub.name}</div>
                            <small className="text-muted">
                              {formatDate(sub.nextBillingDate)} ({getDaysUntil(sub.nextBillingDate)} days)
                            </small>
                          </div>
                          <div className="text-end">
                            <div className="fw-bold">
                              {formatCurrencyAmount(getMonthlyAmount(sub, defaultCurrency), defaultCurrency)}
                            </div>
                            {sub.splitCost && (
                              <small className="text-muted">
                                Your share: {sub.userShare}%
                              </small>
                            )}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </div>
              ))
            )}
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentMethodTracker;