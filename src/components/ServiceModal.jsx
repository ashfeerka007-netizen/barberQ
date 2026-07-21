import React, { useState, useEffect } from 'react';
import { X, Save, Tag, Clock, IndianRupee, FileText } from 'lucide-react';

const CATEGORIES = ['Hair', 'Beard', 'Facial', 'Color', 'Spa', 'Package'];

const CATEGORY_COLORS = {
  Hair: '#3B82F6',
  Beard: '#F97316',
  Facial: '#EC4899',
  Color: '#8B5CF6',
  Spa: '#10B981',
  Package: '#6366F1'
};

export default function ServiceModal({ isOpen, onClose, serviceToEdit, onSaveService, currency = '₹' }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hair');
  const [price, setPrice] = useState(150);
  const [duration, setDuration] = useState(20);
  const [description, setDescription] = useState('');
  const [colorBadge, setColorBadge] = useState('#3B82F6');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.service_name || '');
      setCategory(serviceToEdit.category || 'Hair');
      setPrice(serviceToEdit.price || 100);
      setDuration(serviceToEdit.duration || 15);
      setDescription(serviceToEdit.description || '');
      setColorBadge(serviceToEdit.color_badge || CATEGORY_COLORS[serviceToEdit.category] || '#3B82F6');
      setStatus(serviceToEdit.status || 'Active');
    } else {
      setName('');
      setCategory('Hair');
      setPrice(150);
      setDuration(20);
      setDescription('');
      setColorBadge('#3B82F6');
      setStatus('Active');
    }
  }, [serviceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setColorBadge(CATEGORY_COLORS[cat] || '#3B82F6');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveService({
      service_id: serviceToEdit ? serviceToEdit.service_id : `srv_${Date.now()}`,
      service_name: name.trim(),
      category,
      price: Number(price) || 0,
      duration: Number(duration) || 5,
      description: description.trim(),
      color_badge: colorBadge,
      status
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {serviceToEdit ? 'Edit Service' : 'Add New Service'}
          </h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Service Name */}
          <div className="form-group">
            <label className="form-label">Service Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Premium Scalp Treatment"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: `1.5px solid ${category === cat ? CATEGORY_COLORS[cat] : 'var(--border-color)'}`,
                    background: category === cat ? CATEGORY_COLORS[cat] : 'var(--bg-card)',
                    color: category === cat ? 'white' : 'var(--text-main)',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price & Duration */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="form-group">
            <div>
              <label className="form-label">Price ({currency}) *</label>
              <input
                type="number"
                min="0"
                step="10"
                className="form-control"
                value={price}
                onChange={e => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="form-label">Duration (Minutes) *</label>
              <input
                type="number"
                min="5"
                step="5"
                className="form-control"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Brief details about the service..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Status Toggle */}
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="form-label" style={{ margin: 0 }}>Service Status</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${status === 'Active' ? 'btn-success' : 'btn-outline'}`}
                onClick={() => setStatus('Active')}
              >
                Active
              </button>
              <button
                type="button"
                className={`btn btn-sm ${status === 'Inactive' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setStatus('Inactive')}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              <Save size={18} /> {serviceToEdit ? 'Update Service' : 'Save Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
