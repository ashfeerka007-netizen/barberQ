import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const bgColors = {
    success: '#16A34A',
    error: '#DC2626',
    warning: '#D97706',
    info: '#1E3A8A'
  };

  const Icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle,
    info: Info
  };

  const IconComp = Icons[toast.type] || Info;

  return (
    <div style={{
      position: 'fixed',
      top: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 300,
      width: '90%',
      maxWidth: '420px',
      background: bgColors[toast.type] || bgColors.info,
      color: 'white',
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-sm)',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <IconComp size={20} />
      <div style={{ flex: 1, fontSize: '0.875rem', fontWeight: 600 }}>
        {toast.message}
      </div>
      <button 
        style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  );
}
