import React, { useState, useEffect, lazy, Suspense } from 'react';
import confetti from 'canvas-confetti';
import HeaderBar from './components/HeaderBar';
import BottomNav from './components/BottomNav';
import AddCustomerModal from './components/AddCustomerModal';
import Toast from './components/Toast';

const DashboardView = lazy(() => import('./views/DashboardView'));
const QueueView = lazy(() => import('./views/QueueView'));
const ServicesView = lazy(() => import('./views/ServicesView'));
const HistoryView = lazy(() => import('./views/HistoryView'));
const SettingsView = lazy(() => import('./views/SettingsView'));

import { storageService } from './services/storage';
import { calculateQueueTimings } from './services/queueEngine';
import { announceCustomerTurn, playNotificationChime, sendBrowserNotification } from './services/notification';

import './styles/global.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [viewMode, setViewMode] = useState('mobile');

  // App State
  const [settings, setSettings] = useState(() => storageService.getSettings());
  const [services, setServices] = useState(() => storageService.getServices());
  const [queue, setQueue] = useState(() => {
    const raw = storageService.getQueue();
    return calculateQueueTimings(raw, settings?.buffer_time || 5);
  });
  const [history, setHistory] = useState(() => storageService.getHistory());

  // Modal & Toast state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Sync theme attribute to HTML element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Recalculate queue timings automatically every 15 seconds to update elapsed/remaining times
  useEffect(() => {
    const interval = setInterval(() => {
      setQueue(prev => calculateQueueTimings(prev, settings?.buffer_time || 5));
    }, 15000);
    return () => clearInterval(interval);
  }, [settings]);

  // Persistent saving of Queue when changed
  const updateQueueState = (newQueue) => {
    const recalculated = calculateQueueTimings(newQueue, settings?.buffer_time || 5);
    setQueue(recalculated);
    storageService.saveQueue(recalculated);
  };

  // Action: Add New Customer to Queue
  const handleAddCustomer = (customerData) => {
    const tokenNumber = storageService.getAndIncrementTokenCounter();
    const newCustomer = {
      queue_id: `q_${Date.now()}`,
      token_number: tokenNumber,
      customer_name: customerData.customer_name,
      phone: customerData.phone,
      arrival_time: new Date().toISOString(),
      status: 'Waiting',
      is_priority: customerData.is_priority,
      services: customerData.services,
      total_duration: customerData.total_duration,
      total_price: customerData.total_price,
      notes: customerData.notes || ''
    };

    const updated = [...queue, newCustomer];
    updateQueueState(updated);
    showToast(`Added ${customerData.customer_name} (${tokenNumber}) to Queue!`, 'success');
  };

  // Action: Start Service for Customer
  const handleStartService = (customer) => {
    const updated = queue.map(q => {
      if (q.queue_id === customer.queue_id) {
        return {
          ...q,
          status: 'In Service',
          started_at: new Date().toISOString()
        };
      }
      return q;
    });

    updateQueueState(updated);

    if (settings.sound_effects) playNotificationChime();
    if (settings.voice_announcement) {
      announceCustomerTurn(customer.customer_name, customer.token_number, 1);
    }

    sendBrowserNotification(
      'Service Started',
      `Now serving ${customer.customer_name} (${customer.token_number})`
    );

    showToast(`Now serving ${customer.customer_name}`, 'success');
  };

  // Action: Complete Service
  const handleCompleteService = (customer) => {
    // 1. Move customer from queue to history
    const completedRecord = {
      history_id: `hist_${Date.now()}`,
      queue_id: customer.queue_id,
      token_number: customer.token_number,
      customer_name: customer.customer_name,
      phone: customer.phone,
      completed_time: new Date().toISOString(),
      actual_duration: customer.total_duration,
      actual_price: customer.total_price,
      services: customer.services,
      notes: customer.notes
    };

    const newHistory = [completedRecord, ...history];
    setHistory(newHistory);
    storageService.saveHistory(newHistory);

    // 2. Remove from active queue
    const newQueue = queue.filter(q => q.queue_id !== customer.queue_id);
    updateQueueState(newQueue);

    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    if (settings.sound_effects) playNotificationChime();
    showToast(`Completed service for ${customer.customer_name}!`, 'success');
  };

  // Action: Skip Customer
  const handleSkipCustomer = (customer) => {
    // Move skipped customer to bottom of waiting list
    const remaining = queue.filter(q => q.queue_id !== customer.queue_id);
    const skippedCustomer = {
      ...customer,
      status: 'Skipped'
    };

    const newQueue = [...remaining, skippedCustomer];
    updateQueueState(newQueue);
    showToast(`Customer ${customer.customer_name} skipped`, 'warning');
  };

  // Action: Call Next Customer
  const handleCallNext = () => {
    const waitingCustomer = queue.find(q => q.status === 'Waiting');
    if (!waitingCustomer) {
      showToast('No customers waiting in queue', 'warning');
      return;
    }

    // Check if someone is already in service
    const activeServing = queue.find(q => q.status === 'In Service');
    if (activeServing) {
      if (window.confirm(`Complete current service for ${activeServing.customer_name} and start next?`)) {
        handleCompleteService(activeServing);
      } else {
        return;
      }
    }

    handleStartService(waitingCustomer);
  };

  // Action: Save Service (Add / Edit)
  const handleSaveService = (serviceData) => {
    const existingIndex = services.findIndex(s => s.service_id === serviceData.service_id);
    let updated;
    if (existingIndex >= 0) {
      updated = [...services];
      updated[existingIndex] = serviceData;
    } else {
      updated = [...services, serviceData];
    }
    setServices(updated);
    storageService.saveServices(updated);
    showToast(`Service "${serviceData.service_name}" saved`, 'success');
  };

  // Action: Delete Service
  const handleDeleteService = (serviceId) => {
    const updated = services.filter(s => s.service_id !== serviceId);
    setServices(updated);
    storageService.saveServices(updated);
    showToast('Service deleted', 'info');
  };

  // Action: Re-Queue Customer from History
  const handleReQueueCustomer = (histRecord) => {
    handleAddCustomer({
      customer_name: histRecord.customer_name,
      phone: histRecord.phone,
      services: histRecord.services || [],
      is_priority: false,
      total_duration: histRecord.actual_duration || 20,
      total_price: histRecord.actual_price || 150
    });
    setActiveTab('queue');
  };

  // Action: Delete customer from queue
  const handleDeleteCustomerFromQueue = (queueId) => {
    const updated = queue.filter(q => q.queue_id !== queueId);
    updateQueueState(updated);
    showToast('Customer removed from queue', 'info');
  };

  // Action: Delete individual history record
  const handleDeleteHistoryItem = (historyId) => {
    const updated = history.filter(h => h.history_id !== historyId);
    setHistory(updated);
    storageService.saveHistory(updated);
    showToast('History record deleted', 'info');
  };

  // Action: Clear entire visit history
  const handleClearHistory = () => {
    setHistory([]);
    storageService.clearHistory();
    showToast('All visit history records cleared!', 'warning');
  };

  // Action: Clear entire queue (and optionally reset token counter)
  const handleClearQueue = (resetTokenCounter = true) => {
    updateQueueState([]);
    storageService.clearQueue();
    if (resetTokenCounter) {
      storageService.resetTokenCounter(1);
    }
    showToast(resetTokenCounter ? 'Active queue cleared and token counter reset to #Q-001!' : 'Active queue cleared!', 'warning');
  };

  // Action: Clear finished/skipped queue entries only
  const handleClearCompletedQueueEntries = () => {
    const active = queue.filter(q => q.status === 'Waiting' || q.status === 'In Service');
    updateQueueState(active);
    showToast('Cleared completed and skipped queue cards', 'info');
  };

  // Action: Reset Token Counter
  const handleResetTokenCounter = (startVal = 1) => {
    storageService.resetTokenCounter(startVal);
    showToast(`Token counter reset to #Q-${String(startVal).padStart(3, '0')}`, 'success');
  };

  // Action: Save Settings
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    // Recalculate queue with new buffer time
    setQueue(calculateQueueTimings(queue, newSettings.buffer_time || 5));
  };

  // Action: Reset Seed Data (Full Factory Reset)
  const handleResetData = () => {
    storageService.resetToDefaults();
    showToast('All data reset to default seed values! Reloading...', 'info');
    setTimeout(() => window.location.reload(), 800);
  };

  const waitingCount = queue.filter(q => q.status === 'Waiting').length;

  return (
    <div className={`app-container ${viewMode === 'mobile' ? 'mobile-mode' : 'desktop-mode'}`}>
      
      {/* Toast Feedback Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Bar */}
      <HeaderBar
        settings={settings}
        onToggleVoice={() => handleSaveSettings({ ...settings, voice_announcement: !settings.voice_announcement })}
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'mobile' ? 'desktop' : 'mobile')}
      />

      {/* Main Tab Content */}
      <main className="app-content">
        <Suspense fallback={<div className="loading-container">Loading...</div>}>
          {activeTab === 'dashboard' && (
            <DashboardView
              queue={queue}
              history={history}
              services={services}
              onCompleteService={handleCompleteService}
              onSkipCustomer={handleSkipCustomer}
              onOpenAddCustomer={() => setIsAddModalOpen(true)}
              currency={settings.currency}
            />
          )}

          {activeTab === 'queue' && (
            <QueueView
              queue={queue}
              onUpdateQueue={updateQueueState}
              onStartService={handleStartService}
              onCompleteService={handleCompleteService}
              onSkipCustomer={handleSkipCustomer}
              onDeleteCustomer={handleDeleteCustomerFromQueue}
              onClearQueue={handleClearQueue}
              onClearCompletedQueue={handleClearCompletedQueueEntries}
              onResetTokenCounter={handleResetTokenCounter}
              onCallNext={handleCallNext}
              onOpenAddCustomer={() => setIsAddModalOpen(true)}
              settings={settings}
              currency={settings.currency}
            />
          )}

          {activeTab === 'services' && (
            <ServicesView
              services={services}
              onSaveService={handleSaveService}
              onDeleteService={handleDeleteService}
              currency={settings.currency}
            />
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onReQueueCustomer={handleReQueueCustomer}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              onClearHistory={handleClearHistory}
              settings={settings}
              currency={settings.currency}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onResetData={handleResetData}
              onClearQueue={handleClearQueue}
              onClearHistory={handleClearHistory}
              onResetTokenCounter={handleResetTokenCounter}
              showToast={showToast}
            />
          )}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        waitingCount={waitingCount}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        services={services}
        queue={queue}
        onAddCustomer={handleAddCustomer}
        currency={settings.currency}
        bufferMinutes={settings.buffer_time || 5}
        defaultCountryCode={settings.country_code || '+91'}
      />

    </div>
  );
}
