import React, { useState } from 'react';
import { Save, Volume2, Download, Upload, RotateCcw, Building, Clock, ShieldCheck, Bell } from 'lucide-react';
import { storageService } from '../services/storage';
import { announceCustomerTurn, playNotificationChime } from '../services/notification';

export default function SettingsView({ 
  settings, 
  onSaveSettings, 
  onResetData, 
  onClearQueue,
  onClearHistory,
  onResetTokenCounter,
  showToast 
}) {
  const [formData, setFormData] = useState({ ...settings });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
    showToast('Settings updated successfully!', 'success');
  };

  const handleTestVoice = () => {
    playNotificationChime();
    setTimeout(() => {
      announceCustomerTurn('Customer Name', '#Q-001', 1);
    }, 400);
  };

  const handleExportBackup = () => {
    const jsonStr = storageService.exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `BarberQ_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('JSON Backup downloaded!', 'success');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = storageService.importBackupData(event.target.result);
      if (res.success) {
        showToast('Backup restored successfully! Reloading data...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showToast(`Import failed: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>BarberQ Settings</h2>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
          Configure shop operating parameters, notifications, and data backups
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Business Setup */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={18} color="var(--primary)" /> Shop Brand & Business Information
          </h3>

          <div className="form-group">
            <label className="form-label">Shop Brand Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. BarberQ Pro Studio"
              value={formData.business_name || ''}
              onChange={e => handleChange('business_name', e.target.value)}
              required
            />
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
              This brand name appears in header bars, receipts, and WhatsApp notifications.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }} className="form-group">
            <div>
              <label className="form-label">Opening Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.opening_hours}
                onChange={e => handleChange('opening_hours', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Closing Time</label>
              <input
                type="time"
                className="form-control"
                value={formData.closing_hours}
                onChange={e => handleChange('closing_hours', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Buffer Time (m)</label>
              <input
                type="number"
                min="0"
                max="30"
                className="form-control"
                value={formData.buffer_time}
                onChange={e => handleChange('buffer_time', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Currency & Tax Config */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--secondary)" /> Country Code & Regional Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Default Country Code</label>
              <select
                className="form-control"
                value={formData.country_code || '+91'}
                onChange={e => handleChange('country_code', e.target.value)}
              >
                <option value="+91">+91 (India)</option>
                <option value="+1">+1 (USA / Canada)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+971">+971 (UAE)</option>
                <option value="+61">+61 (Australia)</option>
                <option value="+966">+966 (Saudi Arabia)</option>
                <option value="+49">+49 (Germany)</option>
                <option value="+33">+33 (France)</option>
                <option value="+81">+81 (Japan)</option>
                <option value="+65">+65 (Singapore)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select
                className="form-control"
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (UAE Dirham)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                className="form-control"
                value={formData.tax_percent}
                onChange={e => handleChange('tax_percent', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Notification & Audio Setup */}
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={18} color="var(--success)" /> Notification & Audio Engine
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.voice_announcement}
                onChange={e => handleChange('voice_announcement', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Text-to-Speech Voice Announcements</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Announce customer turns via speech synthesis when clicking "Call Next"
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.sound_effects}
                onChange={e => handleChange('sound_effects', e.target.checked)}
                style={{ width: 18, height: 18 }}
              />
              <div>
                <strong style={{ fontSize: '0.9rem' }}>Audio Chime Sound Effects</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Play audio chime on status change
                </p>
              </div>
            </label>

            <div style={{ marginTop: '0.5rem' }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={handleTestVoice}>
                <Volume2 size={16} /> Test Voice & Audio Chime
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem' }}>
          <Save size={18} /> Save Settings
        </button>
      </form>

      {/* Database Backup & Restore Section */}
      <div className="card" style={{ marginTop: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Database Backup & Recovery
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Export local database to JSON file or restore from previous backup file.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportBackup}>
            <Download size={16} /> Backup Database (JSON)
          </button>

          <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={16} /> Restore Database
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportBackup}
            />
          </label>
        </div>
      </div>

      {/* Dedicated Data & History Reset Management Panel */}
      <div className="card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--danger)' }}>
          Queue & History Reset Management
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Perform targeted reset of queue items, completed history records, token numbering, or full factory reset.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }}
            onClick={() => {
              if (window.confirm('Clear all entries from active Queue and reset Token Counter to #Q-001?')) {
                onClearQueue(true);
              }
            }}
          >
            <RotateCcw size={15} /> Clear Queue & Reset Tokens
          </button>

          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }}
            onClick={() => {
              if (window.confirm('Clear ALL completed visit history logs?')) {
                onClearHistory();
              }
            }}
          >
            <RotateCcw size={15} /> Clear History Logs
          </button>

          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ justifyContent: 'center' }}
            onClick={() => {
              onResetTokenCounter(1);
            }}
          >
            <RotateCcw size={15} /> Reset Token Count (#Q-001)
          </button>

          <button 
            type="button"
            className="btn btn-secondary btn-sm" 
            style={{ justifyContent: 'center' }}
            onClick={() => {
              if (window.confirm('PERMANENTLY RESET all data (Queue, History, Services & Settings) back to clean demo seed defaults?')) {
                onResetData();
              }
            }}
          >
            <RotateCcw size={15} /> Full Factory Reset
          </button>
        </div>
      </div>

    </div>
  );
}

