import React, { useState, useEffect } from 'react';
import { Scissors, Volume2, VolumeX, Moon, Sun, Smartphone, Monitor } from 'lucide-react';

export default function HeaderBar({ 
  settings, 
  onToggleVoice, 
  theme, 
  onToggleTheme, 
  viewMode, 
  onToggleViewMode 
}) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="header-logo-icon">
          <Scissors size={22} />
        </div>
        <div>
          <h1 className="header-title">{settings?.business_name || 'BarberQ Pro'}</h1>
          <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {timeStr} • Smart Queue
          </span>
        </div>
      </div>

      <div className="header-actions">
        {/* Voice Announcement Toggle */}
        <button 
          className={`icon-btn ${settings?.voice_announcement ? 'active' : ''}`}
          onClick={onToggleVoice}
          title={settings?.voice_announcement ? 'Voice Announcements On' : 'Voice Announcements Muted'}
        >
          {settings?.voice_announcement ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Theme Dark/Light Toggle */}
        <button 
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* View Mode Switcher (Mobile Container vs Desktop Expanded) */}
        <button 
          className="icon-btn"
          onClick={onToggleViewMode}
          title={viewMode === 'mobile' ? 'Expand to Desktop View' : 'Switch to Mobile Frame'}
        >
          {viewMode === 'mobile' ? <Monitor size={18} /> : <Smartphone size={18} />}
        </button>
      </div>
    </header>
  );
}
