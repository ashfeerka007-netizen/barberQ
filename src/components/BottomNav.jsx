import React from 'react';
import { LayoutDashboard, Users, Scissors, History, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, waitingCount }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'queue', label: 'Queue', icon: Users, badge: waitingCount },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <div className="nav-icon-wrapper">
              <Icon size={20} />
            </div>
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className="nav-badge">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
