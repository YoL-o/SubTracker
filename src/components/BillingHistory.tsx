import React, { useState } from 'react';
import { Card, Button, Badge, Collapse } from 'react-bootstrap';
import { History, ChevronDown, ChevronUp, Calendar, X, Play, Pause } from 'lucide-react';
import { BillingHistory as BillingHistoryType } from '../types';
import { formatDate } from '../utils/dateUtils';
import { currencies } from '../data/categories';

interface BillingHistoryProps {
  history: BillingHistoryType[];
  defaultCurrency: string;
}

const BillingHistory: React.FC<BillingHistoryProps> = ({ history, defaultCurrency }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const currencySymbol = currencies.find(c => c.code === defaultCurrency)?.symbol || '$';

  const getTypeIcon = (type: BillingHistoryType['type']) => {
    switch (type) {
      case 'renewal': return <Calendar size={16} className="text-success" />;
      case 'cancellation': return <X size={16} className="text-danger" />;
      case 'trial_start': return <Play size={16} className="text-info" />;
      case 'trial_end': return <Pause size={16} className="text-warning" />;
      default: return <Calendar size={16} />;
    }
  };

  const getTypeBadge = (type: BillingHistoryType['type']) => {
    switch (type) {
      case 'renewal': return <Badge bg="success">Renewed</Badge>;
      case 'cancellation': return <Badge bg="danger">Canceled</Badge>;
      case 'trial_start': return <Badge bg="info">Trial Started</Badge>;
      case 'trial_end': return <Badge bg="warning">Trial Ended</Badge>;
      default: return <Badge bg="secondary">{type}</Badge>;
    }
  };

  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const recentHistory = sortedHistory.slice(0, 5);
  const olderHistory = sortedHistory.slice(5);

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="card-hover">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <History size={20} className="me-2" />
          Billing History
        </h5>
        <Badge bg="secondary">{history.length} events</Badge>
      </Card.Header>
      <Card.Body>
        <div className="timeline">
          {recentHistory.map((event) => (
            <div key={event.id} className="timeline-item">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-start">
                  <div className="me-3 mt-1">
                    {getTypeIcon(event.type)}
                  </div>
                  <div>
                    <div className="fw-medium">{event.subscriptionName}</div>
                    <small className="text-muted">
                      {formatDate(event.date)} • {event.paymentMethod}
                    </small>
                    {event.type === 'renewal' && (
                      <div className="mt-1">
                        <strong>{currencySymbol}{event.amount.toFixed(2)}</strong>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-end">
                  {getTypeBadge(event.type)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {olderHistory.length > 0 && (
          <>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-100 mt-3"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={16} className="me-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="me-2" />
                  Show {olderHistory.length} More Events
                </>
              )}
            </Button>

            <Collapse in={isExpanded}>
              <div className="mt-3">
                <div className="timeline">
                  {olderHistory.map((event) => (
                    <div key={event.id} className="timeline-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start">
                          <div className="me-3 mt-1">
                            {getTypeIcon(event.type)}
                          </div>
                          <div>
                            <div className="fw-medium">{event.subscriptionName}</div>
                            <small className="text-muted">
                              {formatDate(event.date)} • {event.paymentMethod}
                            </small>
                            {event.type === 'renewal' && (
                              <div className="mt-1">
                                <strong>{currencySymbol}{event.amount.toFixed(2)}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          {getTypeBadge(event.type)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Collapse>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default BillingHistory;