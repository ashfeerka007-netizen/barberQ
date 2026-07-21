import React from 'react';
import { X, Printer, Share2, Scissors, CheckCircle2 } from 'lucide-react';
import { generateCustomerWhatsAppLink } from '../services/notification';

export default function ReceiptModal({ isOpen, onClose, record, settings }) {
  if (!isOpen || !record) return null;

  const currency = settings?.currency || '₹';
  const shopName = settings?.business_name || 'BarberQ Pro';

  const completedDate = record.completed_time 
    ? new Date(record.completed_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
    : new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const { whatsappUrl } = generateCustomerWhatsAppLink(
      record.phone, 
      record.customer_name, 
      record.token_number, 
      0, 
      shopName
    );
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h3 className="modal-title">Customer Receipt</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div 
          id="thermal-receipt" 
          style={{
            background: '#FFF8F0',
            color: '#1E293B',
            fontFamily: 'monospace',
            padding: '1.25rem',
            borderRadius: '8px',
            border: '1px dashed #CBD5E1',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.03)',
            marginBottom: '1.25rem'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #94A3B8', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif', fontWeight: 800 }}>{shopName}</h2>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Smart Barber Queue Receipt</p>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.35rem', color: '#1E3A8A' }}>
              TOKEN: {record.token_number}
            </div>
          </div>

          <div style={{ fontSize: '0.8rem', lineHeight: '1.6', marginBottom: '0.75rem' }}>
            <div><strong>Customer:</strong> {record.customer_name}</div>
            {record.phone && <div><strong>Phone:</strong> {record.phone}</div>}
            <div><strong>Date:</strong> {completedDate}</div>
            <div><strong>Barber:</strong> Master Stylist #1</div>
          </div>

          <div style={{ borderTop: '1px dashed #94A3B8', borderBottom: '1px dashed #94A3B8', padding: '0.5rem 0', margin: '0.5rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '0.35rem' }}>
              <span>SERVICE</span>
              <span>PRICE</span>
            </div>
            {record.services?.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '0.2rem' }}>
                <span>{s.service_name} ({s.duration}m)</span>
                <span>{currency}{s.price}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
            <span>TOTAL PAID</span>
            <span style={{ color: '#16A34A' }}>{currency}{record.actual_price || record.total_price}</span>
          </div>

          <div style={{ textAlign: 'center', fontSize: '0.725rem', color: '#64748B', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px dashed #94A3B8' }}>
            Thank you for visiting {shopName}! <br />
            Have a great day ahead 💈
          </div>
        </div>

        {/* Modal Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={handleShareWhatsApp}>
            <Share2 size={16} /> WhatsApp
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={16} /> Print Thermal
          </button>
        </div>
      </div>
    </div>
  );
}
