import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Subscription, AppSettings } from './types';
import { loadSubscriptions, saveSubscriptions, loadSettings, saveSettings, downloadCSV } from './utils/storage';
import { getNextBillingDate, isUpcoming } from './utils/dateUtils';
import AppNavbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AddSubscriptionModal from './components/AddSubscriptionModal';
import CalendarView from './components/CalendarView';
import Analytics from './components/Analytics';
import FreeTrials from './components/FreeTrials';
import Settings from './components/Settings';

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    currency: 'USD',
    reminders: {
      enabled: true,
      daysBeforeRenewal: 3,
      browserNotifications: false,
    },
  });
  const [activeView, setActiveView] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load data on mount
  useEffect(() => {
    const loadedSubscriptions = loadSubscriptions();
    const loadedSettings = loadSettings();
    
    setSubscriptions(loadedSubscriptions);
    setSettings(loadedSettings);
  }, []);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', settings.darkMode ? 'dark' : 'light');
  }, [settings.darkMode]);

  // Check for reminders
  useEffect(() => {
    if (!settings.reminders.enabled) return;

    const checkReminders = () => {
      const upcomingRenewals = subscriptions.filter(sub => 
        sub.isActive && 
        !sub.isFreeTrial && 
        isUpcoming(sub.nextBillingDate, settings.reminders.daysBeforeRenewal)
      );

      const expiringSoonTrials = subscriptions.filter(sub => 
        sub.isFreeTrial && 
        sub.isActive && 
        sub.trialEndDate &&
        isUpcoming(sub.trialEndDate, settings.reminders.daysBeforeRenewal)
      );

      if (settings.reminders.browserNotifications && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          upcomingRenewals.forEach(sub => {
            new Notification('SubTrackr Reminder', {
              body: `${sub.name} renews soon - ${sub.nextBillingDate}`,
              icon: '/favicon.ico',
            });
          });

          expiringSoonTrials.forEach(sub => {
            if (sub.trialEndDate) {
              new Notification('SubTrackr Trial Reminder', {
                body: `${sub.name} free trial ends soon - ${sub.trialEndDate}`,
                icon: '/favicon.ico',
              });
            }
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    };

    // Check reminders daily
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000);
    checkReminders(); // Check immediately

    return () => clearInterval(interval);
  }, [subscriptions, settings.reminders]);

  const handleSaveSubscription = (subscription: Subscription) => {
    let updatedSubscriptions: Subscription[];
    
    if (editingSubscription) {
      updatedSubscriptions = subscriptions.map(sub => 
        sub.id === subscription.id ? subscription : sub
      );
    } else {
      updatedSubscriptions = [...subscriptions, subscription];
    }
    
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);
    setEditingSubscription(undefined);
  };

  const handleDeleteSubscription = (id: string) => {
    const updatedSubscriptions = subscriptions.filter(sub => sub.id !== id);
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);
  };

  const handleRenewSubscription = (id: string) => {
    const updatedSubscriptions = subscriptions.map(sub => {
      if (sub.id === id) {
        const nextBillingDate = getNextBillingDate(
          sub.nextBillingDate,
          sub.billingCycle,
          sub.customDays
        );
        
        return {
          ...sub,
          nextBillingDate,
          totalSpent: sub.totalSpent + sub.amount,
        };
      }
      return sub;
    });
    
    setSubscriptions(updatedSubscriptions);
    saveSubscriptions(updatedSubscriptions);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowAddModal(true);
  };

  const handleAddSubscription = () => {
    setEditingSubscription(undefined);
    setShowAddModal(true);
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleToggleDarkMode = () => {
    const newSettings = { ...settings, darkMode: !settings.darkMode };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleExportData = () => {
    downloadCSV(subscriptions);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',');
        
        const importedSubscriptions: Subscription[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          if (values.length >= headers.length) {
            const subscription: Subscription = {
              id: `imported_${Date.now()}_${i}`,
              name: values[0].replace(/"/g, ''),
              amount: parseFloat(values[1]) || 0,
              currency: values[2] || 'USD',
              billingCycle: values[3] as 'monthly' | 'yearly' | 'custom',
              nextBillingDate: values[4] || new Date().toISOString().split('T')[0],
              category: values[5].replace(/"/g, '') || 'Other',
              paymentMethod: values[6].replace(/"/g, '') || 'Credit Card',
              isFreeTrial: values[7] === 'true',
              trialEndDate: values[8] || undefined,
              isActive: values[9] === 'true',
              description: '',
              createdAt: new Date().toISOString(),
              totalSpent: parseFloat(values[10]) || 0,
              autoRenew: values[11] === 'true',
            };
            importedSubscriptions.push(subscription);
          }
        }
        
        const updatedSubscriptions = [...subscriptions, ...importedSubscriptions];
        setSubscriptions(updatedSubscriptions);
        saveSubscriptions(updatedSubscriptions);
        
        alert(`Successfully imported ${importedSubscriptions.length} subscriptions!`);
      } catch (error) {
        alert('Error importing CSV file. Please check the format and try again.');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleViewChange = (view: string) => {
    if (view === 'add') {
      handleAddSubscription();
      return;
    }
    if (view === 'export') {
      handleExportData();
      return;
    }
    setActiveView(view);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'calendar':
        return (
          <CalendarView
            subscriptions={subscriptions}
            defaultCurrency={settings.currency}
          />
        );
      case 'analytics':
        return (
          <Analytics
            subscriptions={subscriptions}
            defaultCurrency={settings.currency}
          />
        );
      case 'trials':
        return (
          <FreeTrials
            subscriptions={subscriptions}
            onEditSubscription={handleEditSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            defaultCurrency={settings.currency}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        );
      default:
        return (
          <Dashboard
            subscriptions={subscriptions}
            onAddSubscription={handleAddSubscription}
            onEditSubscription={handleEditSubscription}
            onDeleteSubscription={handleDeleteSubscription}
            onRenewSubscription={handleRenewSubscription}
            defaultCurrency={settings.currency}
          />
        );
    }
  };

  return (
    <div className="min-vh-100">
      <AppNavbar
        darkMode={settings.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <Container fluid className="px-0">
        <Row className="g-0">
          <Col lg={2} className="d-none d-lg-block">
            <Sidebar
              activeView={activeView}
              onViewChange={handleViewChange}
              isOpen={false}
              onClose={() => {}}
            />
          </Col>
          
          <Col lg={10} className="main-content">
            {renderActiveView()}
          </Col>
        </Row>
      </Container>

      {/* Mobile Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Add/Edit Subscription Modal */}
      <AddSubscriptionModal
        show={showAddModal}
        onHide={() => {
          setShowAddModal(false);
          setEditingSubscription(undefined);
        }}
        onSave={handleSaveSubscription}
        editingSubscription={editingSubscription}
      />
    </div>
  );
}

export default App;