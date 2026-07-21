import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Clock, Tag, Check, X, ShieldAlert } from 'lucide-react';
import ServiceModal from '../components/ServiceModal';

export default function ServicesView({
  services = [],
  onSaveService,
  onDeleteService,
  currency = '₹'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serviceToEdit, setServiceToEdit] = useState(null);

  const categories = ['All', 'Hair', 'Beard', 'Facial', 'Color', 'Spa', 'Package'];

  const filteredServices = services.filter(srv => {
    const matchesSearch = srv.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (srv.description && srv.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || srv.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setServiceToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    setServiceToEdit(srv);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (srv) => {
    onSaveService({
      ...srv,
      status: srv.status === 'Active' ? 'Inactive' : 'Active'
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* View Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Services Catalogue</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Manage pricing, service durations, categories and active state
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      {/* Search & Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search service by title or details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.775rem',
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
      </div>

      {/* Service Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
        {filteredServices.map(srv => {
          const isActive = srv.status === 'Active';
          return (
            <div 
              key={srv.service_id} 
              className="card"
              style={{
                opacity: isActive ? 1 : 0.65,
                borderTop: `4px solid ${srv.color_badge || 'var(--primary)'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                <div>
                  <span 
                    className="badge" 
                    style={{ 
                      background: `${srv.color_badge}15`, 
                      color: srv.color_badge, 
                      border: `1px solid ${srv.color_badge}30`,
                      marginBottom: '0.35rem' 
                    }}
                  >
                    {srv.category}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{srv.service_name}</h3>
                </div>
                <strong style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                  {currency}{srv.price}
                </strong>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', minHeight: '36px' }}>
                {srv.description || 'Standard barbershop grooming service.'}
              </p>

              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                paddingTop: '0.65rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
                  <Clock size={14} /> {srv.duration} Minutes
                </span>

                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {/* Status Toggle */}
                  <button 
                    className={`btn btn-sm ${isActive ? 'btn-outline' : 'btn-ghost'}`}
                    style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => handleToggleStatus(srv)}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </button>

                  <button className="icon-btn" style={{ width: 30, height: 30 }} onClick={() => handleOpenEdit(srv)}>
                    <Edit2 size={13} />
                  </button>

                  <button 
                    className="icon-btn" 
                    style={{ width: 30, height: 30, color: 'var(--danger)' }}
                    onClick={() => {
                      if (window.confirm(`Delete service "${srv.service_name}"?`)) {
                        onDeleteService(srv.service_id);
                      }
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB for New Service */}
      <button className="fab" onClick={handleOpenAdd} title="Add New Service">
        <Plus size={26} />
      </button>

      {/* Add / Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={serviceToEdit}
        onSaveService={onSaveService}
        currency={currency}
      />

    </div>
  );
}
