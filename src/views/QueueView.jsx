import React, { useState } from 'react';
import { Search, Plus, Play, CheckCircle2, SkipForward, ArrowUp, ArrowDown, Phone, Clock, Tag, Volume2, Share2, Trash2, RotateCcw, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';
import { moveQueueItem } from '../services/queueEngine';
import ContactModal from '../components/ContactModal';

export default function QueueView({
  queue = [],
  onUpdateQueue,
  onStartService,
  onCompleteService,
  onSkipCustomer,
  onDeleteCustomer,
  onClearQueue,
  onClearCompletedQueue,
  onResetTokenCounter,
  onCallNext,
  onOpenAddCustomer,
  settings,
  currency = '₹'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomerForContact, setSelectedCustomerForContact] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const filteredQueue = queue.filter(item => {
    const matchesSearch = 
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.token_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm));

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const waitingCount = queue.filter(q => q.status === 'Waiting').length;
  const completedOrSkippedCount = queue.filter(q => q.status === 'Completed' || q.status === 'Skipped').length;

  const handleMove = (idx, direction) => {
    const updated = moveQueueItem(queue, idx, direction);
    onUpdateQueue(updated);
  };

  const handleOpenContactModal = (customer) => {
    setSelectedCustomerForContact(customer);
    setIsContactModalOpen(true);
  };

  const formatTimeStr = (isoStr) => {
    if (!isoStr) return '--:--';
    return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'In Service':
        return <span className="badge badge-serving">In Service</span>;
      case 'Waiting':
        return <span className="badge badge-waiting">Waiting</span>;
      case 'Completed':
        return <span className="badge badge-completed">Completed</span>;
      case 'Skipped':
        return <span className="badge badge-skipped">Skipped</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Queue Management</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            {waitingCount} customer{waitingCount !== 1 ? 's' : ''} currently waiting in line
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm" onClick={onCallNext} disabled={waitingCount === 0}>
            <Volume2 size={16} /> Call Next
          </button>

          {queue.length > 0 && (
            <button 
              className="btn btn-outline btn-sm" 
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              onClick={() => {
                if (window.confirm('Reset/Clear entire active queue and reset customer token numbering?')) {
                  onClearQueue(true);
                }
              }}
              title="Clear all queue items & reset sequence"
            >
              <RotateCcw size={14} /> Clear Queue
            </button>
          )}
        </div>
      </div>

      {/* Queue Quick Reset & Cleanup Toolbar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: 'var(--bg-app)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Actions:</span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {completedOrSkippedCount > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }} onClick={onClearCompletedQueue}>
              <RefreshCw size={12} /> Clear Finished ({completedOrSkippedCount})
            </button>
          )}
          <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem' }} onClick={() => onResetTokenCounter(1)}>
            <Sparkles size={12} /> Reset Token Counter (#Q-001)
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by customer name, phone or token #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {['All', 'Waiting', 'In Service', 'Completed', 'Skipped'].map(st => (
            <button
              key={st}
              style={{
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.775rem',
                fontWeight: 600,
                border: '1px solid var(--border-color)',
                background: statusFilter === st ? 'var(--primary)' : 'var(--bg-card)',
                color: statusFilter === st ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Cards List */}
      {filteredQueue.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No Customers Found</h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto 1rem' }}>
            No queue entries match your search criteria. Add a customer to get started.
          </p>
          <button className="btn btn-secondary btn-sm" onClick={onOpenAddCustomer}>
            <Plus size={16} /> Add First Customer
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredQueue.map((item, idx) => {
            const isWaiting = item.status === 'Waiting';
            const isInService = item.status === 'In Service';
            const cleanPhone = (item.phone || '').replace(/[^0-9+]/g, '');

            return (
              <div 
                key={item.queue_id || idx} 
                className="card"
                style={{
                  borderLeft: isInService 
                    ? '4px solid var(--success)' 
                    : isWaiting 
                      ? '4px solid var(--primary)' 
                      : '1px solid var(--border-color)',
                  background: isInService ? 'var(--primary-light)' : 'var(--bg-card)'
                }}
              >
                {/* Top Row: Token, Name, Status, Priority */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {item.token_number}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>
                        {item.customer_name}
                      </h3>
                      {item.is_priority && (
                        <span className="badge" style={{ background: 'var(--secondary)', color: 'white' }}>
                          VIP
                        </span>
                      )}
                    </div>
                    {item.phone && (
                      <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} /> {item.phone}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getStatusBadge(item.status)}
                    <button 
                      className="icon-btn" 
                      style={{ width: 28, height: 28, color: 'var(--danger)' }} 
                      title="Remove customer from queue"
                      onClick={() => {
                        if (window.confirm(`Remove ${item.customer_name} (${item.token_number}) from queue?`)) {
                          onDeleteCustomer(item.queue_id);
                        }
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Services Selected Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.6rem 0' }}>
                  {item.services?.map((s, sIdx) => (
                    <span key={sIdx} style={{
                      fontSize: '0.725rem',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-light)'
                    }}>
                      {s.service_name} ({s.duration}m)
                    </span>
                  ))}
                </div>

                {/* Estimation Time Breakdown Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr',
                  gap: '0.5rem',
                  padding: '0.6rem 0.75rem',
                  background: 'var(--bg-app)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.75rem',
                  margin: '0.5rem 0 0.85rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem' }}>DURATION</span>
                    <strong>{item.total_duration} mins</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem' }}>AMOUNT</span>
                    <strong style={{ color: 'var(--success)' }}>{currency}{item.total_price}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem' }}>EST. START</span>
                    <strong>{formatTimeStr(item.estimated_start)}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.675rem' }}>EST. FINISH</span>
                    <strong style={{ color: 'var(--primary)' }}>{formatTimeStr(item.estimated_finish)}</strong>
                  </div>
                </div>

                {/* Action Buttons for Card */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {isWaiting && (
                    <>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onStartService(item)}>
                        <Play size={14} /> Start Service
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => onSkipCustomer(item)}>
                        <SkipForward size={14} /> Skip
                      </button>
                      {/* Reorder Buttons */}
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => handleMove(idx, -1)} disabled={idx === 0}>
                        <ArrowUp size={14} />
                      </button>
                      <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => handleMove(idx, 1)} disabled={idx === filteredQueue.length - 1}>
                        <ArrowDown size={14} />
                      </button>
                    </>
                  )}

                  {isInService && (
                    <button className="btn btn-success btn-sm" style={{ width: '100%' }} onClick={() => onCompleteService(item)}>
                      <CheckCircle2 size={16} /> Mark Completed
                    </button>
                  )}

                  {/* Phone Call Button */}
                  {cleanPhone && (
                    <a 
                      href={`tel:${cleanPhone}`}
                      className="icon-btn"
                      style={{ width: 32, height: 32, color: 'var(--primary)' }}
                      title={`Call ${item.customer_name}`}
                    >
                      <Phone size={14} />
                    </a>
                  )}

                  {/* Contact / WhatsApp Modal Button */}
                  {item.phone && (
                    <button 
                      className="icon-btn" 
                      style={{ width: 32, height: 32, color: 'var(--success)' }}
                      title="Call or Send WhatsApp Notification"
                      onClick={() => handleOpenContactModal(item)}
                    >
                      <MessageSquare size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact & WhatsApp Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        customer={selectedCustomerForContact}
        settings={settings}
      />

      {/* Floating Action Button to Add Customer */}
      <button className="fab" onClick={onOpenAddCustomer} title="Add Customer to Queue">
        <Plus size={26} />
      </button>

    </div>
  );
}


