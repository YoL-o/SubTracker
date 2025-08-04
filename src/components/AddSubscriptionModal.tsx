import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { Subscription } from '../types';
import { categories, paymentMethods, currencies } from '../data/categories';
import dayjs from 'dayjs';

interface AddSubscriptionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (subscription: Subscription) => void;
  editingSubscription?: Subscription;
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  show,
  onHide,
  onSave,
  editingSubscription,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    currency: 'USD',
    billingCycle: 'monthly' as 'monthly' | 'yearly' | 'custom',
    customDays: '',
    nextBillingDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
    category: 'Entertainment',
    paymentMethod: 'Credit Card',
    isFreeTrial: false,
    trialEndDate: '',
    isActive: true,
    description: '',
    autoRenew: true,
    splitCost: false,
    userShare: 100,
    sharedWith: [] as any[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingSubscription) {
      setFormData({
        name: editingSubscription.name,
        amount: editingSubscription.amount.toString(),
        currency: editingSubscription.currency,
        billingCycle: editingSubscription.billingCycle,
        customDays: editingSubscription.customDays?.toString() || '',
        nextBillingDate: editingSubscription.nextBillingDate,
        category: editingSubscription.category,
        paymentMethod: editingSubscription.paymentMethod,
        isFreeTrial: editingSubscription.isFreeTrial,
        trialEndDate: editingSubscription.trialEndDate || '',
        isActive: editingSubscription.isActive,
        description: editingSubscription.description || '',
        autoRenew: editingSubscription.autoRenew,
        splitCost: editingSubscription.splitCost || false,
        userShare: editingSubscription.userShare || 100,
        sharedWith: editingSubscription.sharedWith || [],
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        currency: 'USD',
        billingCycle: 'monthly',
        customDays: '',
        nextBillingDate: dayjs().add(1, 'month').format('YYYY-MM-DD'),
        category: 'Entertainment',
        paymentMethod: 'Credit Card',
        isFreeTrial: false,
        trialEndDate: '',
        isActive: true,
        description: '',
        autoRenew: true,
        splitCost: false,
        userShare: 100,
        sharedWith: [],
      });
    }
    setErrors({});
  }, [editingSubscription, show]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.billingCycle === 'custom' && (!formData.customDays || parseInt(formData.customDays) <= 0)) {
      newErrors.customDays = 'Custom days must be greater than 0';
    }

    if (formData.isFreeTrial && !formData.trialEndDate) {
      newErrors.trialEndDate = 'Trial end date is required for free trials';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const subscription: Subscription = {
      id: editingSubscription?.id || `sub_${Date.now()}`,
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      billingCycle: formData.billingCycle,
      customDays: formData.billingCycle === 'custom' ? parseInt(formData.customDays) : undefined,
      nextBillingDate: formData.nextBillingDate,
      category: formData.category,
      paymentMethod: formData.paymentMethod,
      isFreeTrial: formData.isFreeTrial,
      trialEndDate: formData.isFreeTrial ? formData.trialEndDate : undefined,
      isActive: formData.isActive,
      description: formData.description,
      createdAt: editingSubscription?.createdAt || new Date().toISOString(),
      totalSpent: editingSubscription?.totalSpent || 0,
      autoRenew: formData.autoRenew,
      splitCost: formData.splitCost,
      userShare: formData.userShare,
      sharedWith: formData.sharedWith,
    };

    onSave(subscription);
    onHide();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Service Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Netflix, Spotify, Adobe Creative Suite"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  isInvalid={!!errors.amount}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.amount}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Billing Cycle</Form.Label>
                <Form.Select
                  value={formData.billingCycle}
                  onChange={(e) => handleInputChange('billingCycle', e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {formData.billingCycle === 'custom' && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Custom Days *</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={formData.customDays}
                    onChange={(e) => handleInputChange('customDays', e.target.value)}
                    placeholder="e.g., 30, 90, 365"
                    isInvalid={!!errors.customDays}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.customDays}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Next Billing Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.nextBillingDate}
                  onChange={(e) => handleInputChange('nextBillingDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="isFreeTrial"
                  label="This is a free trial"
                  checked={formData.isFreeTrial}
                  onChange={(e) => handleInputChange('isFreeTrial', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          {formData.isFreeTrial && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trial End Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.trialEndDate}
                    onChange={(e) => handleInputChange('trialEndDate', e.target.value)}
                    isInvalid={!!errors.trialEndDate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.trialEndDate}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="splitCost"
                  label="This is a shared subscription"
                  checked={formData.splitCost}
                  onChange={(e) => handleInputChange('splitCost', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          {formData.splitCost && (
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Your Share (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="100"
                    value={formData.userShare}
                    onChange={(e) => handleInputChange('userShare', parseInt(e.target.value) || 100)}
                  />
                  <Form.Text className="text-muted">
                    You'll pay {formData.userShare}% of {currencies.find(c => c.code === formData.currency)?.symbol || '$'}{formData.amount} = {currencies.find(c => c.code === formData.currency)?.symbol || '$'}{((parseFloat(formData.amount) || 0) * (formData.userShare / 100)).toFixed(2)}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="isActive"
                  label="Active subscription"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="autoRenew"
                  label="Auto-renew enabled"
                  checked={formData.autoRenew}
                  onChange={(e) => handleInputChange('autoRenew', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add notes about this subscription..."
            />
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="btn-gradient">
            {editingSubscription ? 'Update Subscription' : 'Add Subscription'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddSubscriptionModal;