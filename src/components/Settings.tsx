import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Settings as SettingsIcon, Save, Download, Upload } from 'lucide-react';
import { AppSettings } from '../types';
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

  const handleSave = () => {
    onUpdateSettings(formData);
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