import React, { useState, useEffect } from 'react';
import { X, Plus, Check, Clock, Tag, User, Phone, Sparkles } from 'lucide-react';
import { estimateNewCustomerTimes } from '../services/queueEngine';

export default function AddCustomerModal({ 
  isOpen, 
  onClose, 
  services = [], 
  queue = [], 
  onAddCustomer,
  currency = '₹',
  bufferMinutes = 5,
  defaultCountryCode = '+91'
}) {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [isPriority, setIsPriority] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const activeServices = services.filter(s => s.status === 'Active');
  const categories = ['All', ...new Set(activeServices.map(s => s.category))];

  // Sync default country code
  useEffect(() => {
    if (defaultCountryCode) {
      setCountryCode(defaultCountryCode);
    }
  }, [defaultCountryCode]);

  // Auto select first service when opening
  useEffect(() => {
    if (isOpen && activeServices.length > 0 && selectedServiceIds.length === 0) {
      setSelectedServiceIds([activeServices[0].service_id]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleService = (id) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length === 1) return; // Must have at least 1 service
      setSelectedServiceIds(selectedServiceIds.filter(sId => sId !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
  };

  const selectedServices = activeServices.filter(s => selectedServiceIds.includes(s.service_id));
  
  // Real-time calculation of Wait Time, Total Price, Finish Time
  const estimation = estimateNewCustomerTimes(queue, selectedServices, bufferMinutes);

  const formatTimeStr = (isoStr) => {
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim() || selectedServices.length === 0) return;

    let finalPhone = phone.trim();
    if (finalPhone && !finalPhone.startsWith('+')) {
      finalPhone = `${countryCode} ${finalPhone}`;
    }

    onAddCustomer({
      customer_name: customerName.trim(),
      phone: finalPhone,
      services: selectedServices,
      is_priority: isPriority,
      notes: notes.trim(),
      total_duration: estimation.total_duration,
      total_price: estimation.total_price
    });

    // Reset Form
    setCustomerName('');
    setPhone('');
    setIsPriority(false);
    setNotes('');
    onClose();
  };

  const filteredServices = selectedCategory === 'All'
    ? activeServices
    : activeServices.filter(s => s.category === selectedCategory);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Add Customer to Queue</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Select customer details & required services
            </span>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Customer Name */}
          <div className="form-group">
            <label className="form-label">
              <User size={14} style={{ display: 'inline', marginRight: 4 }} /> Customer Name *
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Customer Name"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Mobile Number & Country Code & VIP Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="form-group">
            <div>
              <label className="form-label">
                <Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Mobile (Optional)
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <select
                  className="form-control"
                  style={{ width: '85px', padding: '0.4rem 0.2rem', fontSize: '0.8rem' }}
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                >
                  <option value="+91">+91 (IN)</option>
                  <option value="+1">+1 (US)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+971">+971 (AE)</option>
                  <option value="+61">+61 (AU)</option>
                  <option value="+966">+966 (SA)</option>
                  <option value="+49">+49 (DE)</option>
                  <option value="+33">+33 (FR)</option>
                  <option value="+81">+81 (JP)</option>
                  <option value="+65">+65 (SG)</option>
                </select>
                <input
                  type="tel"
                  className="form-control"
                  style={{ flex: 1 }}
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="form-label">Priority Status</label>
              <button
                type="button"
                className={`btn ${isPriority ? 'btn-secondary' : 'btn-outline'}`}
                style={{ width: '100%', height: '42px', padding: '0 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setIsPriority(!isPriority)}
              >
                <Sparkles size={14} /> {isPriority ? 'VIP Priority On' : 'Standard'}
              </button>
            </div>
          </div>

          {/* Service Selection Section */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ margin: 0 }}>
                <Tag size={14} style={{ display: 'inline', marginRight: 4 }} /> Select Services *
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                {selectedServices.length} selected
              </span>
            </div>

            {/* Category Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    padding: '0.25rem 0.65rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: '1px solid var(--border-color)',
                    background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-card)',
                    color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredServices.map(srv => {
                const isSelected = selectedServiceIds.includes(srv.service_id);
                return (
                  <div
                    key={srv.service_id}
                    onClick={() => toggleService(srv.service_id)}
                    style={{
                      padding: '0.65rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {srv.service_name}
                      </span>
                      {isSelected && <Check size={14} color="var(--primary)" />}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}><Clock size={11} style={{ display: 'inline' }} /> {srv.duration} min</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{currency}{srv.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Wait Time & Price Summary Card */}
          <div style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>TOTAL PRICE</span>
                <strong style={{ fontSize: '1.1rem', color: '#4ADE80' }}>{currency}{estimation.total_price}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>EST. DURATION</span>
                <strong style={{ fontSize: '1.1rem' }}>{estimation.total_duration} m</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#94A3B8', display: 'block' }}>EST. WAIT TIME</span>
                <strong style={{ fontSize: '1.1rem', color: '#F97316' }}>~{estimation.estimated_wait_minutes} m</strong>
              </div>
            </div>
            <div style={{
              marginTop: '0.75rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              justify: 'space-between',
              fontSize: '0.75rem',
              color: '#CBD5E1'
            }}>
              <span>Expected Start: <strong>{formatTimeStr(estimation.estimated_start)}</strong></span>
              <span>Expected Finish: <strong>{formatTimeStr(estimation.estimated_finish)}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-secondary" style={{ flex: 2 }}>
              <Plus size={18} /> Join Virtual Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
