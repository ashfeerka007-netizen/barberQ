import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, Send, X, ExternalLink, Check, Copy, AlertCircle } from 'lucide-react';
import { generateCustomerWhatsAppLink, makePhoneCallLink } from '../services/notification';

export default function ContactModal({ 
  isOpen, 
  onClose, 
  customer, 
  settings 
}) {
  if (!isOpen || !customer) return null;

  const shopName = settings?.business_name || 'BarberQ Pro';
  const phone = customer.phone || '';
  const customerName = customer.customer_name || 'Valued Customer';
  const tokenNumber = customer.token_number || '#Q-000';
  const waitMinutes = customer.estimated_wait_minutes || 0;

  const [templateType, setTemplateType] = useState('READY');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const linkObj = generateCustomerWhatsAppLink(phone, customerName, tokenNumber, waitMinutes, shopName, templateType);
    setCustomText(linkObj.rawMessage);
  }, [templateType, customer, shopName]);

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedCustom = encodeURIComponent(customText);
  const whatsappAppUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone.replace(/[^0-9]/g, '')}?text=${encodedCustom}`
    : `https://wa.me/?text=${encodedCustom}`;

  const whatsappWebUrl = cleanPhone 
    ? `https://web.whatsapp.com/send?phone=${cleanPhone.replace(/[^0-9]/g, '')}&text=${encodedCustom}`
    : `https://web.whatsapp.com/send?text=${encodedCustom}`;

  const smsUrl = `sms:${cleanPhone}?body=${encodedCustom}`;
  const phoneCallUrl = makePhoneCallLink(phone);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content card" 
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%', padding: '1.25rem' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>
              {tokenNumber}
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Contact {customerName}
            </h3>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {!phone ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>No phone number registered for this customer.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Quick Call Action Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              padding: '0.85rem 1rem',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'block' }}>DIRECT CALL</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{phone}</strong>
              </div>
              <a 
                href={phoneCallUrl} 
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
              >
                <Phone size={15} /> Call Now
              </a>
            </div>

            {/* WhatsApp Notification Setup */}
            <div>
              <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MessageSquare size={16} color="#22C55E" /> Select WhatsApp Message Template:
              </label>

              {/* Template Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {[
                  { id: 'READY', label: '📢 Turn Ready' },
                  { id: 'REMINDER', label: '⏰ Wait Reminder' },
                  { id: 'ADDED', label: '👋 Queue Confirmed' },
                  { id: 'COMPLETED', label: '✨ Service Complete' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    style={{
                      padding: '0.4rem 0.6rem',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      border: templateType === t.id ? '2px solid var(--success)' : '1px solid var(--border-color)',
                      background: templateType === t.id ? 'rgba(34, 197, 94, 0.12)' : 'var(--bg-card)',
                      color: templateType === t.id ? 'var(--success)' : 'var(--text-main)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onClick={() => setTemplateType(t.id)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Message Box Editor */}
              <div className="form-group" style={{ position: 'relative' }}>
                <textarea
                  className="form-control"
                  rows={4}
                  style={{ fontSize: '0.825rem', fontFamily: 'inherit', resize: 'vertical' }}
                  value={customText}
                  onChange={e => setCustomText(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  style={{
                    position: 'absolute',
                    right: 8,
                    bottom: 8,
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '0.2rem 0.5rem',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  {copied ? <Check size={12} color="green" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Launch Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <a
                href={whatsappAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success"
                style={{ textDecoration: 'none', justifyContent: 'center', padding: '0.75rem' }}
              >
                <Send size={16} /> Open WhatsApp App
              </a>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={whatsappWebUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                >
                  <ExternalLink size={14} /> WhatsApp Web
                </a>
                <a
                  href={smsUrl}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                >
                  <MessageSquare size={14} /> Cellular SMS
                </a>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
