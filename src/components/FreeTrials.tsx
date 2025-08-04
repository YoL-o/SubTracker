import React from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, ProgressBar } from 'react-bootstrap';
import { Clock, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { Subscription } from '../types';
import { formatDate, getDaysUntil } from '../utils/dateUtils';
import { getConvertedAmount, formatCurrencyAmount } from '../utils/currencyUtils';

interface FreeTrialsProps {
  subscriptions: Subscription[];
  onEditSubscription: (subscription: Subscription) => void;
  onDeleteSubscription: (id: string) => void;
  defaultCurrency: string;
}

const FreeTrials: React.FC<FreeTrialsProps> = ({
  subscriptions,
  onEditSubscription,
  onDeleteSubscription,
  defaultCurrency,
}) => {
  const freeTrials = subscriptions.filter(sub => sub.isFreeTrial && sub.isActive);
  const expiringSoon = freeTrials.filter(sub => 
    sub.trialEndDate && getDaysUntil(sub.trialEndDate) <= 3 && getDaysUntil(sub.trialEndDate) >= 0
  );

  const getTrialStatus = (trialEndDate: string) => {
    const daysLeft = getDaysUntil(trialEndDate);
    if (daysLeft < 0) return { status: 'expired', variant: 'danger', text: 'Expired' };
    if (daysLeft === 0) return { status: 'today', variant: 'danger', text: 'Expires Today' };
    if (daysLeft <= 3) return { status: 'warning', variant: 'warning', text: `${daysLeft} days left` };
    if (daysLeft <= 7) return { status: 'caution', variant: 'info', text: `${daysLeft} days left` };
    return { status: 'safe', variant: 'success', text: `${daysLeft} days left` };
  };

  const getProgressPercentage = (trialEndDate: string, createdAt: string) => {
    const totalDays = Math.abs(getDaysUntil(createdAt));
    const daysLeft = getDaysUntil(trialEndDate);
    const daysUsed = totalDays - daysLeft;
    return Math.min(100, Math.max(0, (daysUsed / totalDays) * 100));
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="mb-0">Free Trials</h2>
        <p className="text-muted mb-0">Monitor your trial subscriptions and avoid unwanted charges</p>
      </div>

      {/* Alert for expiring trials */}
      {expiringSoon.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <AlertTriangle size={18} className="me-2" />
          <strong>{expiringSoon.length} trial{expiringSoon.length > 1 ? 's' : ''} expiring soon!</strong>
          {' '}Don't forget to cancel if you don\'t want to be charged.
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Active Trials</h6>
                  <h3 className="mb-0 text-primary">{freeTrials.length}</h3>
                </div>
                <Clock size={32} className="text-primary opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Expiring Soon</h6>
                  <h3 className="mb-0 text-warning">{expiringSoon.length}</h3>
                </div>
                <AlertTriangle size={32} className="text-warning opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">Potential Savings</h6>
                  <h3 className="mb-0 text-success">
                    {formatCurrencyAmount(freeTrials.reduce((total, sub) => total + getConvertedAmount(sub, defaultCurrency), 0), defaultCurrency)}
                  </h3>
                </div>
                <CheckCircle size={32} className="text-success opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-3">
          <Card className="card-hover">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="card-title mb-0">This Month</h6>
                  <h3 className="mb-0 text-info">
                    {formatCurrencyAmount(freeTrials
                      .filter(sub => sub.billingCycle === 'monthly')
                      .reduce((total, sub) => total + getConvertedAmount(sub, defaultCurrency), 0), defaultCurrency)}
                  </h3>
                </div>
                <Calendar size={32} className="text-info opacity-75" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Free Trials List */}
      {freeTrials.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <Clock size={64} className="text-muted mb-3" />
            <h5>No active free trials</h5>
            <p className="text-muted">
              When you add subscriptions with free trials, they'll appear here with countdown timers.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {freeTrials
            .sort((a, b) => {
              if (!a.trialEndDate || !b.trialEndDate) return 0;
              return getDaysUntil(a.trialEndDate) - getDaysUntil(b.trialEndDate);
            })
            .map((trial) => {
              if (!trial.trialEndDate) return null;
              
              const trialStatus = getTrialStatus(trial.trialEndDate);
              const progressPercentage = getProgressPercentage(trial.trialEndDate, trial.createdAt);
              const daysLeft = getDaysUntil(trial.trialEndDate);
              
              return (
                <Col key={trial.id} lg={6} className="mb-4">
                  <Card className="card-hover h-100">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ fontSize: '1.5rem' }}>
                            {trial.category === 'Entertainment' ? '🎬' : 
                             trial.category === 'Music' ? '🎵' : 
                             trial.category === 'Gaming' ? '🎮' : '📦'}
                          </span>
                          <div>
                            <h5 className="mb-1">{trial.name}</h5>
                            <small className="text-muted">{trial.category}</small>
                          </div>
                        </div>
                        <Badge bg={trialStatus.variant}>
                          {trialStatus.text}
                        </Badge>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <small className="text-muted">Trial Progress</small>
                          <small className="text-muted">
                            {daysLeft < 0 ? 'Expired' : `${daysLeft} days remaining`}
                          </small>
                        </div>
                        <ProgressBar 
                          variant={trialStatus.variant}
                          now={progressPercentage}
                          style={{ height: '6px' }}
                        />
                      </div>

                      <Row className="mb-3">
                        <Col xs={6}>
                          <small className="text-muted">Will cost:</small>
                          <div className="fw-bold">
                            {formatCurrencyAmount(getConvertedAmount(trial, defaultCurrency), defaultCurrency)}
                            <span className="text-muted">/{trial.billingCycle}</span>
                          </div>
                        </Col>
                        <Col xs={6}>
                          <small className="text-muted">Trial ends:</small>
                          <div className="fw-bold">{formatDate(trial.trialEndDate)}</div>
                        </Col>
                      </Row>

                      {daysLeft <= 3 && daysLeft >= 0 && (
                        <Alert variant="warning" className="py-2 mb-3">
                          <AlertTriangle size={16} className="me-2" />
                          <small>
                            <strong>Action needed!</strong> Cancel before {formatDate(trial.trialEndDate)} to avoid charges.
                          </small>
                        </Alert>
                      )}

                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => onEditSubscription(trial)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => onDeleteSubscription(trial.id)}
                        >
                          Cancel Trial
                        </Button>
                        {daysLeft <= 7 && daysLeft >= 0 && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => {
                              // Convert to paid subscription
                              const updatedTrial = {
                                ...trial,
                                isFreeTrial: false,
                                trialEndDate: undefined,
                              };
                              onEditSubscription(updatedTrial);
                            }}
                          >
                            Keep
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
        </Row>
      )}
    </Container>
  );
};

export default FreeTrials;