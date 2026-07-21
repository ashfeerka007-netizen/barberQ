import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, SkipForward, Clock, AlertTriangle, AlertCircle, Phone, Tag } from 'lucide-react';

export default function NowServingCard({ servingCustomer, onComplete, onSkip, currency = '₹' }) {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    if (!servingCustomer || !servingCustomer.started_at) {
      setElapsedSec(0);
      return;
    }

    const calcElapsed = () => {
      const started = new Date(servingCustomer.started_at).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - started) / 1000));
      setElapsedSec(diffSec);
    };

    calcElapsed();
    const interval = setInterval(calcElapsed, 1000);
    return () => clearInterval(interval);
  }, [servingCustomer]);

  if (!servingCustomer) {
    return (
      <div className="card card-hero" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem'
        }}>
          <Clock size={28} color="#94A3B8" />
        </div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'white' }}>No Active Customer</h3>
        <p style={{ fontSize: '0.85rem', color: '#94A3B8', maxWidth: '300px', margin: '0 auto 1.25rem' }}>
          Barber chair is currently open. Select a customer from the queue to start service.
        </p>
      </div>
    );
  }

  const totalSec = (servingCustomer.total_duration || 20) * 60;
  const remainingSec = totalSec - elapsedSec;
  const overtimeSec = elapsedSec - totalSec;

  const isOvertimeAmber = overtimeSec > 0 && overtimeSec <= 600; // 0 - 10 min overtime
  const isOvertimeRed = overtimeSec > 600; // > 10 min overtime

  const progressPercent = Math.min(100, Math.floor((elapsedSec / totalSec) * 100));

  const formatMinutesSeconds = (sec) => {
    const absSec = Math.abs(sec);
    const m = Math.floor(absSec / 60);
    const s = absSec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const startedTimeStr = servingCustomer.started_at 
    ? new Date(servingCustomer.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  const finishTimeStr = servingCustomer.estimated_finish 
    ? new Date(servingCustomer.estimated_finish).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '--:--';

  let alertBadgeClass = 'timer-normal';
  if (isOvertimeRed) alertBadgeClass = 'timer-red';
  else if (isOvertimeAmber) alertBadgeClass = 'timer-amber';

  return (
    <div className={`card card-hero ${alertBadgeClass}`} style={{ position: 'relative' }}>
      {/* Header Label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-serving" style={{ background: '#22C55E', color: 'white', border: 'none' }}>
            NOW SERVING
          </span>
          <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>
            {servingCustomer.token_number}
          </span>
        </div>
        {servingCustomer.is_priority && (
          <span className="badge" style={{ background: '#F97316', color: 'white', border: 'none' }}>
            VIP PRIORITY
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
        {/* Customer Details */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {servingCustomer.customer_name}
          </h2>
          {servingCustomer.phone && (
            <p style={{ fontSize: '0.825rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem' }}>
              <Phone size={13} /> {servingCustomer.phone}
            </p>
          )}

          {/* Selected Services Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
            {servingCustomer.services?.map((s, idx) => (
              <span key={idx} style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <Tag size={10} /> {s.service_name} ({s.duration}m)
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.825rem', color: '#CBD5E1' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>STARTED AT</span>
              <strong>{startedTimeStr}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>EXP. FINISH</span>
              <strong>{finishTimeStr}</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', color: '#94A3B8' }}>AMOUNT</span>
              <strong style={{ color: '#4ADE80' }}>{currency}{servingCustomer.total_price}</strong>
            </div>
          </div>
        </div>

        {/* Circular Timer Engine */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={isOvertimeRed ? '#EF4444' : isOvertimeAmber ? '#F59E0B' : '#3B82F6'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease' }}
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              color: isOvertimeRed ? '#EF4444' : isOvertimeAmber ? '#F59E0B' : 'white'
            }}>
              {overtimeSec > 0 ? `+${formatMinutesSeconds(overtimeSec)}` : formatMinutesSeconds(remainingSec)}
            </span>
            <span style={{ fontSize: '0.625rem', color: '#94A3B8', fontWeight: 600 }}>
              {overtimeSec > 0 ? 'OVERTIME' : 'REMAINING'}
            </span>
          </div>
        </div>
      </div>

      {/* Timer Overtime Alerts */}
      {isOvertimeAmber && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.2)',
          border: '1px solid #F59E0B',
          color: '#FDE68A',
          fontSize: '0.775rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertTriangle size={16} /> Service exceeded estimated {servingCustomer.total_duration} mins!
        </div>
      )}

      {isOvertimeRed && (
        <div style={{
          marginTop: '1rem',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.25)',
          border: '1px solid #EF4444',
          color: '#FECACA',
          fontSize: '0.775rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={16} /> Exceeded estimated time by 10+ minutes!
        </div>
      )}

      {/* Card Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
        <button 
          className="btn btn-success" 
          style={{ flex: 2, minWidth: '140px' }}
          onClick={() => onComplete(servingCustomer)}
        >
          <CheckCircle2 size={18} /> Mark Completed
        </button>
        <button 
          className="btn btn-outline" 
          style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', flex: 1 }}
          onClick={() => onSkip(servingCustomer)}
        >
          <SkipForward size={16} /> Skip
        </button>

        {servingCustomer.phone && (
          <a
            href={`tel:${servingCustomer.phone.replace(/[^0-9+]/g, '')}`}
            className="btn btn-outline"
            style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#60A5FA', padding: '0.5rem 0.75rem' }}
            title={`Call ${servingCustomer.customer_name}`}
          >
            <Phone size={16} />
          </a>
        )}
      </div>
    </div>
  );
}

