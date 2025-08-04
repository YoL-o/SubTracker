import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, ListGroup } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Subscription } from '../types';
import { getCalendarMonth, formatDate } from '../utils/dateUtils';
import { currencies } from '../data/categories';
import dayjs from 'dayjs';

interface CalendarViewProps {
  subscriptions: Subscription[];
  defaultCurrency: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ subscriptions, defaultCurrency }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  const currencySymbol = currencies.find(c => c.code === defaultCurrency)?.symbol || '$';
  const weeks = getCalendarMonth(currentDate);
  
  const getSubscriptionsForDate = (date: Date) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');
    return subscriptions.filter(sub => 
      sub.isActive && sub.nextBillingDate === dateStr
    );
  };

  const handleDateClick = (date: Date) => {
    const subs = getSubscriptionsForDate(date);
    if (subs.length > 0) {
      setSelectedDate(date);
      setShowModal(true);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => dayjs(prev).subtract(1, 'month').toDate());
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => dayjs(prev).add(1, 'month').toDate());
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const selectedDateSubscriptions = selectedDate ? getSubscriptionsForDate(selectedDate) : [];
  const selectedDateTotal = selectedDateSubscriptions.reduce((total, sub) => total + sub.amount, 0);

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">Renewal Calendar</h2>
          <p className="text-muted mb-0">View upcoming subscription renewals</p>
        </div>
        <div>
          <Button variant="outline-primary" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
      </div>

      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft size={18} />
          </Button>
          
          <h4 className="mb-0">
            {dayjs(currentDate).format('MMMM YYYY')}
          </h4>
          
          <Button variant="outline-secondary" size="sm" onClick={goToNextMonth}>
            <ChevronRight size={18} />
          </Button>
        </Card.Header>
        
        <Card.Body className="p-0">
          {/* Calendar Header */}
          <Row className="g-0 bg-light">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <Col key={day} className="text-center py-2 border-end border-bottom">
                <small className="fw-bold text-muted">{day}</small>
              </Col>
            ))}
          </Row>
          
          {/* Calendar Body */}
          {weeks.map((week, weekIndex) => (
            <Row key={weekIndex} className="g-0">
              {week.map((date, dayIndex) => {
                const isCurrentMonth = dayjs(date).month() === dayjs(currentDate).month();
                const isToday = dayjs(date).isSame(dayjs(), 'day');
                const daySubscriptions = getSubscriptionsForDate(date);
                const hasSubscriptions = daySubscriptions.length > 0;
                
                return (
                  <Col 
                    key={dayIndex} 
                    className={`calendar-day border-end border-bottom ${hasSubscriptions ? 'has-subscription' : ''}`}
                    style={{ cursor: hasSubscriptions ? 'pointer' : 'default' }}
                    onClick={() => handleDateClick(date)}
                  >
                    <div className="p-2 h-100">
                      <div className={`d-flex justify-content-between align-items-start mb-1`}>
                        <span 
                          className={`small ${!isCurrentMonth ? 'text-muted' : ''} ${isToday ? 'fw-bold text-primary' : ''}`}
                        >
                          {dayjs(date).date()}
                        </span>
                        {isToday && (
                          <Badge bg="primary" className="rounded-pill" style={{ fontSize: '0.6rem' }}>
                            Today
                          </Badge>
                        )}
                      </div>
                      
                      {hasSubscriptions && (
                        <div>
                          {daySubscriptions.slice(0, 2).map((sub, index) => (
                            <div 
                              key={index}
                              className="subscription-indicator bg-primary text-white mb-1"
                            >
                              {sub.name.length > 10 ? sub.name.substring(0, 10) + '...' : sub.name}
                            </div>
                          ))}
                          
                          {daySubscriptions.length > 2 && (
                            <div className="subscription-indicator bg-secondary text-white">
                              +{daySubscriptions.length - 2} more
                            </div>
                          )}
                          
                          <div className="mt-1">
                            <small className="text-success fw-bold">
                              {currencySymbol}{daySubscriptions.reduce((total, sub) => total + sub.amount, 0).toFixed(2)}
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                  </Col>
                );
              })}
            </Row>
          ))}
        </Card.Body>
      </Card>

      {/* Day Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <Calendar size={20} className="me-2" />
            {selectedDate && formatDate(dayjs(selectedDate).format('YYYY-MM-DD'))}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {selectedDateSubscriptions.length > 0 ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Renewals ({selectedDateSubscriptions.length})</h6>
                <h6 className="mb-0 text-success">
                  Total: {currencySymbol}{selectedDateTotal.toFixed(2)}
                </h6>
              </div>
              
              <ListGroup variant="flush">
                {selectedDateSubscriptions.map((sub) => (
                  <ListGroup.Item key={sub.id} className="px-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{sub.name}</h6>
                        <small className="text-muted">{sub.category}</small>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold">{currencySymbol}{sub.amount}</div>
                        <small className="text-muted">{sub.billingCycle}</small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          ) : (
            <p className="text-muted text-center py-3">
              No renewals scheduled for this date.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default CalendarView;