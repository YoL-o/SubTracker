import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { Settings as SettingsIcon, Save, Download, Upload, Target, DollarSign } from 'lucide-react';
import { AppSettings, Budget } from '../types';
import { currencies } from '../data/categories';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
  onExportData,
  onImportData,
}) => {
  const [formData, setFormData] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [budgetData, setBudgetData] = useState<Budget>(
    settings.budget || {
      id: 'default',
      name: 'Monthly Budget',
      limit: 0,
      currency: settings.currency,
      period: 'monthly',
      warningThreshold: 80,
      isActive: false,
    }
  );

  const handleSave = () => {
    const updatedSettings = {
      ...formData,
      budget: budgetData.isActive ? budgetData : undefined,
    };
    onUpdateSettings(updatedSettings);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReminderChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      reminders: { ...prev.reminders, [field]: value }
    }));
  };

  const handleBudgetChange = (field: string, value: any) => {
    setBudgetData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Container fluid className="py-4">
      <div className="mb-4">
        <h2 className="mb-0">Settings</h2>
        <p className="text-muted mb-0">Customize your SubTrackr experience</p>
      </div>

      {showSuccess && (
        <Alert variant="success" className="mb-4">
          Settings saved successfully!
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* General Settings */}
          <Card className="card-hover mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <SettingsIcon size={20} className="me-2" />
                General Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Default Currency</Form.Label>
                    <Form.Select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.symbol} {curr.name} ({curr.code})
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      This will be the default currency for new subscriptions
                    </Form.Text>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <Form.Select
                      value={formData.darkMode ? 'dark' : 'light'}
                      onChange={(e) => handleInputChange('darkMode', e.target.value === 'dark')}
                    >
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Choose your preferred color scheme
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="autoConvertCurrency"
                      label="Auto-convert currencies"
                      checked={formData.autoConvertCurrency}
                      onChange={(e) => handleInputChange('autoConvertCurrency', e.target.checked)}
                    />
                    <Form.Text className="text-muted">
                      Automatically convert foreign currencies to your default currency
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Budget Settings */}
          <Card className="card-hover mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Target size={20} className="me-2" />
                Budget Settings
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="budgetEnabled"
                  label="Enable monthly budget tracking"
                  checked={budgetData.isActive}
                  onChange={(e) => handleBudgetChange('isActive', e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Set a monthly spending limit and get warnings when approaching it
                </Form.Text>
              </Form.Group>

              {budgetData.isActive && (
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Monthly Budget Limit</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>
                          {currencies.find(c => c.code === formData.currency)?.symbol || '$'}
                        </InputGroup.Text>
                        <Form.Control
                          type="number"
                          min="0"
                          step="0.01"
                          value={budgetData.limit}
                          onChange={(e) => handleBudgetChange('limit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Warning Threshold</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type="number"
                          min="50"
                          max="95"
                          value={budgetData.warningThreshold}
                          onChange={(e) => handleBudgetChange('warningThreshold', parseInt(e.target.value) || 80)}
                        />
                        <InputGroup.Text>%</InputGroup.Text>
                      </InputGroup>
                      <Form.Text className="text-muted">
                        Get warned when you reach this percentage of your budget
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Reminder Settings */}
          <Card className="card-hover mb-4">
            <Card.Header>
              <h5 className="mb-0">Reminder Settings</h5>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="remindersEnabled"
                  label="Enable renewal reminders"
                  checked={formData.reminders.enabled}
                  onChange={(e) => handleReminderChange('enabled', e.target.checked)}
                />
                <Form.Text className="text-muted">
                  Get notified before your subscriptions renew
                </Form.Text>
              </Form.Group>

              {formData.reminders.enabled && (
                <>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Reminder Timing</Form.Label>
                        <Form.Select
                          value={formData.reminders.daysBeforeRenewal}
                          onChange={(e) => handleReminderChange('daysBeforeRenewal', parseInt(e.target.value))}
                        >
                          <option value={1}>1 day before</option>
                          <option value={3}>3 days before</option>
                          <option value={7}>1 week before</option>
                          <option value={14}>2 weeks before</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="browserNotifications"
                      label="Enable browser notifications"
                      checked={formData.reminders.browserNotifications}
                      onChange={(e) => handleReminderChange('browserNotifications', e.target.checked)}
                    />
                    <Form.Text className="text-muted">
                      Receive browser notifications (requires permission)
                    </Form.Text>
                  </Form.Group>
                </>
              )}
            </Card.Body>
          </Card>

          {/* Data Management */}
          <Card className="card-hover">
            <Card.Header>
              <h5 className="mb-0">Data Management</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Export Data</h6>
                  <p className="text-muted">
                    Download your subscription data as a CSV file for backup or analysis.
                  </p>
                  <Button
                    variant="outline-primary"
                    onClick={onExportData}
                  >
                    <Download size={18} className="me-2" />
                    Export to CSV
                  </Button>
                </Col>
                
                <Col md={6}>
                  <h6>Import Data</h6>
                  <p className="text-muted">
                    Import subscription data from a CSV file. This will add to your existing data.
                  </p>
                  <Form.Group>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={onImportData}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Quick Actions */}
          <Card className="card-hover mb-4">
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button
                  variant="primary"
                  className="btn-gradient"
                  onClick={handleSave}
                >
                  <Save size={18} className="me-2" />
                  Save Settings
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Tips */}
          <Card className="bg-light">
            <Card.Header>
              <h6 className="mb-0">💡 Pro Tips</h6>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <small>• Enable browser notifications to never miss a renewal reminder</small>
                </li>
                <li className="mb-2">
                  <small>• Export your data regularly as a backup</small>
                </li>
                <li className="mb-2">
                  <small>• Set reminders 3-7 days before renewal for best results</small>
                </li>
                <li>
                  <small>• Use dark mode to reduce eye strain during evening use</small>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Settings;