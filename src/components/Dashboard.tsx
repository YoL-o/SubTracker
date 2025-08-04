import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Plus, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import { Subscription } from '../types';
import SubscriptionCard from './SubscriptionCard';
import BudgetTracker from './BudgetTracker';
import PaymentMethodTracker from './PaymentMethodTracker';
import BillingHistory from './BillingHistory';
import { getDaysUntil, isPastDue, isUpcoming } from '../utils/dateUtils';
import { currencies } from '../data/categories';
import { BillingHistory as BillingHistoryType } from '../types';

interface DashboardProps {
  subscriptions: Subscription[];
  onAddSubscription: () => void;
  onEditSubscription: (subscription: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  onRenewSubscription: (id: string) => void;
  defaultCurrency: string;
  budget?: any;
  billingHistory?: BillingHistoryType[];
}

const Dashboard: React.FC<DashboardProps> = ({
  subscriptions,
  onAddSubscription,
  onEditSubscription,
  onDeleteSubscription,
  onRenewSubscription,
  defaultCurrency,
  budget,
  billingHistory = [],
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  const activeSubscriptions = subscriptions.filter(sub => sub.isActive);
  const freeTrials = subscriptions.filter(sub => sub.isFreeTrial && sub.isActive);
  const upcomingRenewals = activeSubscriptions.filter(sub => isUpcoming(sub.nextBillingDate, 7));
  const pastDue = activeSubscriptions.filter(sub => isPastDue(sub.nextBillingDate));

  const totalMonthlySpend = activeSubscriptions.reduce((total, sub) => {
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

  const totalYearlySpend = totalMonthlySpend * 12;
  const currencySymbol = currencies.find(c => c.code === defaultCurrency)?.symbol || '$';

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Dashboard</h2>
          <p className="text-muted mb-0">Manage your subscriptions and track expenses</p>
        </div>
        <Button variant="primary" className="btn-gradient" onClick={onAddSubscription}>
          <Plus size={18} className="me-2" />
          Add Subscription
        </Button>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="expense-card text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Monthly Spend</h6>
                  <h3 className="mb-0">{currencySymbol}{totalMonthlySpend.toFixed(2)}</h3>
                </div>
                <TrendingUp size={32} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="trial-card text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Yearly Projection</h6>
                  <h3 className="mb-0">{currencySymbol}{totalYearlySpend.toFixed(2)}</h3>
                </div>
                <Calendar size={32} className="opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="due-card text-white">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Active Subscriptions</h6>
                  <h3 className="mb-0">{activeSubscriptions.length}</h3>
                </div>
                <div className="text-end">
                  <Badge bg="light" text="dark" className="mb-1">
                    {freeTrials.length} Trials
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0 text-warning">Due Soon</h6>
                  <h3 className="mb-0">{upcomingRenewals.length}</h3>
                </div>
                <AlertTriangle size={32} className="text-warning opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {pastDue.length > 0 && (
        <Alert variant="danger" className="mb-4">
          <AlertTriangle size={18} className="me-2" />
          <strong>{pastDue.length} subscription{pastDue.length > 1 ? 's' : ''} past due!</strong>
          {' '}Please review and update your payment information.
        </Alert>
      )}

      {upcomingRenewals.length > 0 && pastDue.length === 0 && (
        <Alert variant="warning" className="mb-4">
          <Calendar size={18} className="me-2" />
          <strong>{upcomingRenewals.length} subscription{upcomingRenewals.length > 1 ? 's' : ''} renewing soon.</strong>
          {' '}Check your upcoming bills to avoid surprises.
        </Alert>
      )}

      {/* Budget Tracker */}
      <BudgetTracker
        subscriptions={subscriptions}
        budget={budget}
        defaultCurrency={defaultCurrency}
      />

      {/* Payment Method Tracker */}
      <PaymentMethodTracker
        subscriptions={subscriptions}
        defaultCurrency={defaultCurrency}
      />

      {/* Subscriptions Grid */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Your Subscriptions ({activeSubscriptions.length})</h4>
      </div>

      {activeSubscriptions.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Calendar size={64} className="text-muted mb-3" />
            <h5>No subscriptions yet</h5>
            <p className="text-muted">Start tracking your recurring payments by adding your first subscription.</p>
            <Button variant="primary" className="btn-gradient" onClick={onAddSubscription}>
              <Plus size={18} className="me-2" />
              Add Your First Subscription
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {activeSubscriptions
            .sort((a, b) => getDaysUntil(a.nextBillingDate) - getDaysUntil(b.nextBillingDate))
            .map((subscription) => (
              <Col key={subscription.id} lg={4} md={6} className="mb-4">
                <SubscriptionCard
                  subscription={subscription}
                  onEdit={onEditSubscription}
                  onDelete={onDeleteSubscription}
                  onRenew={onRenewSubscription}
                />
              </Col>
            ))}
        </Row>
      )}

      {/* Billing History */}
      {billingHistory.length > 0 && (
        <Row className="mt-4">
          <Col>
            <BillingHistory
              history={billingHistory}
              defaultCurrency={defaultCurrency}
            />
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;