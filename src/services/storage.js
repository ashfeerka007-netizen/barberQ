// Storage & Persistence Manager for BarberQ Pro

const STORAGE_KEYS = {
  SERVICES: 'barberq_services_v1',
  QUEUE: 'barberq_queue_v1',
  HISTORY: 'barberq_history_v1',
  SETTINGS: 'barberq_settings_v1',
  TOKEN_COUNTER: 'barberq_token_counter_v1'
};

// Default Seed Services as specified in prompt
export const DEFAULT_SERVICES = [
  {
    service_id: 'srv_1',
    service_name: 'Hair Cut',
    category: 'Hair',
    price: 150,
    duration: 20,
    description: 'Classic professional haircut and styling',
    color_badge: '#3B82F6',
    status: 'Active'
  },
  {
    service_id: 'srv_2',
    service_name: 'Premium Hair Cut',
    category: 'Hair',
    price: 250,
    duration: 30,
    description: 'Precision haircut with hair wash and scalp massage',
    color_badge: '#1D4ED8',
    status: 'Active'
  },
  {
    service_id: 'srv_3',
    service_name: 'Beard Trim',
    category: 'Beard',
    price: 80,
    duration: 10,
    description: 'Beard shaping, line-up and mustache trim',
    color_badge: '#F97316',
    status: 'Active'
  },
  {
    service_id: 'srv_4',
    service_name: 'Hair Wash',
    category: 'Hair',
    price: 100,
    duration: 10,
    description: 'Deep conditioning scalp wash and blow dry',
    color_badge: '#0EA5E9',
    status: 'Active'
  },
  {
    service_id: 'srv_5',
    service_name: 'Hair Coloring',
    category: 'Color',
    price: 600,
    duration: 60,
    description: 'Full hair color treatment with premium dye',
    color_badge: '#8B5CF6',
    status: 'Active'
  },
  {
    service_id: 'srv_6',
    service_name: 'Facial',
    category: 'Facial',
    price: 700,
    duration: 45,
    description: 'Cleansing herbal facial mask and skin hydration',
    color_badge: '#EC4899',
    status: 'Active'
  },
  {
    service_id: 'srv_7',
    service_name: 'Head Massage',
    category: 'Spa',
    price: 250,
    duration: 20,
    description: 'Relaxing Ayurvedic warm oil head and neck massage',
    color_badge: '#10B981',
    status: 'Active'
  },
  {
    service_id: 'srv_8',
    service_name: 'Kids Hair Cut',
    category: 'Hair',
    price: 120,
    duration: 15,
    description: 'Fun and gentle haircut for children under 12',
    color_badge: '#F59E0B',
    status: 'Active'
  },
  {
    service_id: 'srv_9',
    service_name: 'Premium Grooming Package',
    category: 'Package',
    price: 1200,
    duration: 90,
    description: 'Complete package: Haircut, Beard Trim, Facial, Wash & Massage',
    color_badge: '#6366F1',
    status: 'Active'
  }
];

// Default App Settings
export const DEFAULT_SETTINGS = {
  business_name: 'BarberQ Pro Studio',
  opening_hours: '09:00',
  closing_hours: '21:00',
  buffer_time: 5, // minutes between customers
  country_code: '+91',
  currency: '₹',
  tax_percent: 0,
  voice_announcement: true,
  sound_effects: true,
  push_notifications: true,
  auto_call_next: false,
  barber_chairs: 1
};

// Seed initial Queue data for immediate out-of-the-box demo experience
const createInitialSeedData = () => {
  const now = new Date();
  
  // Sample initial queue item currently in service
  const servingStart = new Date(now.getTime() - 12 * 60 * 1000); // started 12 min ago
  const sampleServing = {
    queue_id: 'q_seed_1',
    token_number: '#Q-001',
    customer_name: 'Customer Name',
    phone: '+91 9876543210',
    arrival_time: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
    started_at: servingStart.toISOString(),
    status: 'In Service',
    is_priority: true,
    services: [DEFAULT_SERVICES[0], DEFAULT_SERVICES[2]], // Hair Cut (20m) + Beard Trim (10m) = 30m
    total_duration: 30,
    total_price: 230,
    notes: 'Prefers scissors on top'
  };

  const sampleWaiting1 = {
    queue_id: 'q_seed_2',
    token_number: '#Q-002',
    customer_name: 'Rahul Sharma',
    phone: '+91 9812345678',
    arrival_time: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
    status: 'Waiting',
    is_priority: false,
    services: [DEFAULT_SERVICES[1]], // Premium Hair Cut (30m)
    total_duration: 30,
    total_price: 250,
    notes: ''
  };

  const sampleWaiting2 = {
    queue_id: 'q_seed_3',
    token_number: '#Q-003',
    customer_name: 'David Miller',
    phone: '+91 9988776655',
    arrival_time: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
    status: 'Waiting',
    is_priority: false,
    services: [DEFAULT_SERVICES[0], DEFAULT_SERVICES[3]], // Hair Cut (20m) + Wash (10m) = 30m
    total_duration: 30,
    total_price: 250,
    notes: 'Fade cut on sides'
  };

  return [sampleServing, sampleWaiting1, sampleWaiting2];
};

// Seed sample completed visits history
const createInitialHistoryData = () => {
  const today = new Date();
  const history = [];

  const names = ['Vikram Verma', 'Karan Johar', 'Arjun Kapoor', 'Siddharth R.', 'Nikhil Sen'];
  const timesAgo = [180, 140, 90, 45, 10]; // mins ago

  names.forEach((name, idx) => {
    const visitDate = new Date(today.getTime() - timesAgo[idx] * 60 * 1000);
    const srv = DEFAULT_SERVICES[idx % DEFAULT_SERVICES.length];
    history.push({
      history_id: `hist_${idx + 1}`,
      queue_id: `q_hist_${idx + 1}`,
      token_number: `#Q-00${idx + 1}`,
      customer_name: name,
      phone: `+91 97000${idx}1122`,
      completed_time: visitDate.toISOString(),
      actual_duration: srv.duration,
      actual_price: srv.price,
      services: [srv],
      notes: 'Completed satisfied'
    });
  });

  return history;
};

// Data Store Accessors
export const storageService = {
  // Services
  getServices: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
      return DEFAULT_SERVICES;
    }
    return JSON.parse(raw);
  },
  saveServices: (services) => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  },

  // Queue
  getQueue: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  },
  saveQueue: (queue) => {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  },

  // History
  getHistory: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  },
  saveHistory: (history) => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  // Settings
  getSettings: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  },
  saveSettings: (settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Token Counter
  getAndIncrementTokenCounter: () => {
    let count = parseInt(localStorage.getItem(STORAGE_KEYS.TOKEN_COUNTER) || '1', 10);
    const tokenStr = `#Q-${String(count).padStart(3, '0')}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN_COUNTER, String(count + 1));
    return tokenStr;
  },

  resetTokenCounter: (startVal = 1) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN_COUNTER, String(startVal));
  },

  // Clear operations
  clearQueue: () => {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
  },

  clearHistory: () => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  },

  // Backup JSON export
  exportBackupData: () => {
    const data = {
      services: storageService.getServices(),
      queue: storageService.getQueue(),
      history: storageService.getHistory(),
      settings: storageService.getSettings(),
      token_counter: localStorage.getItem(STORAGE_KEYS.TOKEN_COUNTER) || '1',
      exported_at: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  },

  // Restore JSON import
  importBackupData: (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.services) localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(parsed.services));
      if (parsed.queue) localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(parsed.queue));
      if (parsed.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
      if (parsed.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
      if (parsed.token_counter) localStorage.setItem(STORAGE_KEYS.TOKEN_COUNTER, String(parsed.token_counter));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Reset to seed defaults
  resetToDefaults: () => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.TOKEN_COUNTER, '1');
  }
};

