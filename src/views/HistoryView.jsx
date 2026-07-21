import React, { useState } from 'react';
import { Search, Download, FileText, Printer, RotateCcw, Calendar, Phone, Tag, CheckCircle2, Trash2, History, TrendingUp } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';
import { exportToCSV, exportToExcel, exportToPDF } from '../services/exportService';

export default function HistoryView({ 
  history = [], 
  onReQueueCustomer, 
  onDeleteHistoryItem,
  onClearHistory,
  settings, 
  currency = '₹' 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('All');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Search and date filtering
  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.token_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.includes(searchTerm)) ||
      item.services?.some(s => s.service_name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (dateFilter === 'Today') {
      const itemDate = new Date(item.completed_time).toDateString();
      const today = new Date().toDateString();
      return itemDate === today;
    }
    return true;
  });

  // Calculate totals
  const totalRevenue = filteredHistory.reduce((sum, item) => sum + Number(item.actual_price || item.total_price || 0), 0);
  const totalVisits = filteredHistory.length;

  // Export handlers
  const handleExportCSV = () => {
    const rows = filteredHistory.map(h => ({
      Token: h.token_number,
      Customer: h.customer_name,
      Phone: h.phone || 'N/A',
      Date: new Date(h.completed_time).toLocaleString(),
      Services: h.services?.map(s => s.service_name).join('; ') || '',
      Amount: h.actual_price || h.total_price || 0,
      DurationMins: h.actual_duration || h.total_duration || 0
    }));
    exportToCSV('BarberQ_Customer_History', rows);
  };

  const handleExportExcel = () => {
    const rows = filteredHistory.map(h => ({
      Token: h.token_number,
      Customer: h.customer_name,
      Phone: h.phone || 'N/A',
      Date: new Date(h.completed_time).toLocaleString(),
      Services: h.services?.map(s => s.service_name).join('; ') || '',
      Amount: h.actual_price || h.total_price || 0,
      DurationMins: h.actual_duration || h.total_duration || 0
    }));
    exportToExcel('BarberQ_Customer_History', rows, 'Customer History');
  };

  const handleExportPDF = () => {
    const headers = ['Token', 'Customer', 'Phone', 'Date', 'Amount'];
    const rows = filteredHistory.map(h => ({
      Token: h.token_number,
      Customer: h.customer_name,
      Phone: h.phone || 'N/A',
      Date: new Date(h.completed_time).toLocaleDateString(),
      Amount: `${currency}${h.actual_price || h.total_price || 0}`
    }));
    exportToPDF('Customer Visit History Report', headers, rows, 'BarberQ_History_Report');
  };

  const handleOpenReceipt = (record) => {
    setSelectedRecord(record);
    setIsReceiptOpen(true);
  };

  const handleClearAllHistoryClick = () => {
    if (window.confirm('Are you sure you want to PERMANENTLY CLEAR all visit history logs? This action cannot be undone.')) {
      onClearHistory();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Visit History & Reports</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Completed customer records, receipts, export options & history management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> CSV
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExportExcel}>
            <FileText size={14} /> Excel
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportPDF}>
            <Printer size={14} /> PDF
          </button>
          {history.length > 0 && (
            <button 
              className="btn btn-outline btn-sm" 
              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} 
              onClick={handleClearAllHistoryClick}
              title="Clear all visit history logs"
            >
              <Trash2 size={14} /> Clear History
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--primary-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--primary)' }}>
            <History size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Completed Visits</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{totalVisits}</h4>
          </div>
        </div>

        <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'var(--success-light)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', color: 'var(--success)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filtered Revenue</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)' }}>
              {currency}{totalRevenue}
            </h4>
          </div>
        </div>
      </div>

      {/* Search & Date Filter */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by customer, phone, token or service..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <select 
          className="form-control"
          style={{ width: '130px' }}
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        >
          <option value="All">All Time</option>
          <option value="Today">Today Only</option>
        </select>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <CheckCircle2 size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.1rem' }}>No Completed Visits Found</h3>
          <p style={{ fontSize: '0.85rem' }}>Completed customer queue sessions will automatically record here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredHistory.map(item => {
            const completedDateStr = new Date(item.completed_time).toLocaleString([], {
              dateStyle: 'medium',
              timeStyle: 'short'
            });

            return (
              <div key={item.history_id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {item.token_number}
                      </span>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{item.customer_name}</h3>
                    </div>
                    {item.phone && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={12} /> {item.phone}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.15rem', color: 'var(--success)' }}>
                      {currency}{item.actual_price || item.total_price}
                    </strong>
                  </div>
                </div>

                {/* Service Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: '0.5rem 0' }}>
                  {item.services?.map((s, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.725rem',
                      background: 'var(--bg-app)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-light)'
                    }}>
                      <Tag size={10} style={{ display: 'inline', marginRight: 3 }} /> {s.service_name}
                    </span>
                  ))}
                </div>

                {/* Date & Actions */}
                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={13} /> {completedDateStr}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenReceipt(item)} title="Print Receipt">
                      <Printer size={13} /> Receipt
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => onReQueueCustomer(item)} title="Add customer back to queue">
                      <RotateCcw size={13} /> Re-Queue
                    </button>
                    <button 
                      className="icon-btn" 
                      style={{ width: 28, height: 28, color: 'var(--danger)' }} 
                      onClick={() => {
                        if (window.confirm(`Delete history entry for ${item.customer_name}?`)) {
                          onDeleteHistoryItem(item.history_id);
                        }
                      }}
                      title="Delete History Entry"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        record={selectedRecord}
        settings={settings}
      />

    </div>
  );
}

