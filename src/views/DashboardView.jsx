import React from 'react';
import { Users, Clock, CheckCircle2, TrendingUp, IndianRupee, Zap, Award, BarChart2, Plus } from 'lucide-react';
import NowServingCard from '../components/NowServingCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardView({ 
  queue = [], 
  history = [], 
  services = [], 
  onCompleteService, 
  onSkipCustomer, 
  onOpenAddCustomer,
  currency = '₹' 
}) {
  const servingCustomer = queue.find(q => q.status === 'In Service');
  const waitingCustomers = queue.filter(q => q.status === 'Waiting');
  const completedToday = history.filter(h => {
    const d = new Date(h.completed_time);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const totalRevenueToday = completedToday.reduce((sum, h) => sum + (h.actual_price || h.total_price || 0), 0);
  const totalCustomersToday = completedToday.length + (servingCustomer ? 1 : 0) + waitingCustomers.length;

  const avgWaitTime = waitingCustomers.length > 0 
    ? Math.round(waitingCustomers.reduce((sum, w) => sum + (w.estimated_wait_minutes || 0), 0) / waitingCustomers.length)
    : 0;

  // Chart Data Configuration
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const customersPerDayData = {
    labels: daysOfWeek,
    datasets: [{
      label: 'Daily Customers',
      data: [14, 18, 15, 22, 28, 35, 30],
      backgroundColor: 'rgba(30, 58, 138, 0.85)',
      borderRadius: 6,
    }]
  };

  const revenueLineData = {
    labels: daysOfWeek,
    datasets: [{
      label: `Revenue (${currency})`,
      data: [2100, 2800, 2400, 3500, 4200, 5800, 5100],
      borderColor: '#F97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Popular Services counts
  const serviceCounts = {};
  history.forEach(h => {
    h.services?.forEach(s => {
      serviceCounts[s.service_name] = (serviceCounts[s.service_name] || 0) + 1;
    });
  });

  const popularLabels = Object.keys(serviceCounts).length > 0 
    ? Object.keys(serviceCounts).slice(0, 5) 
    : ['Hair Cut', 'Beard Trim', 'Hair Wash', 'Facial', 'Hair Color'];

  const popularDataValues = Object.keys(serviceCounts).length > 0 
    ? Object.values(serviceCounts).slice(0, 5) 
    : [25, 18, 12, 8, 5];

  const popularServicesData = {
    labels: popularLabels,
    datasets: [{
      data: popularDataValues,
      backgroundColor: ['#3B82F6', '#F97316', '#0EA5E9', '#EC4899', '#8B5CF6'],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(0,0,0,0.05)' } }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Top Banner / Call Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Shop Overview</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Real-time barbershop queue statistics & performance analytics
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onOpenAddCustomer}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Metric Counters Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
        {/* Today's Customers */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>TODAY'S TOTAL</span>
            <Users size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{totalCustomersToday}</div>
          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>↑ +12% vs yesterday</span>
        </div>

        {/* Waiting Customers */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>IN QUEUE</span>
            <Clock size={16} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--secondary)' }}>
            {waitingCustomers.length}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Waiting turn</span>
        </div>

        {/* Completed Today */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>COMPLETED</span>
            <CheckCircle2 size={16} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)' }}>
            {completedToday.length}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Served today</span>
        </div>

        {/* Average Wait Time */}
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>AVG WAIT</span>
            <Zap size={16} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {avgWaitTime} <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>m</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Estimated wait</span>
        </div>

        {/* Today's Revenue */}
        <div className="card" style={{ padding: '1rem', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>REVENUE TODAY</span>
            <TrendingUp size={16} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            {currency}{totalRevenueToday.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>Calculated from completed haircuts</span>
        </div>
      </div>

      {/* NOW SERVING HERO CARD SECTION */}
      <NowServingCard 
        servingCustomer={servingCustomer}
        onComplete={onCompleteService}
        onSkip={onSkipCustomer}
        currency={currency}
      />

      {/* Queue Intelligence Summary */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--primary)" /> Queue Intelligence & Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.825rem' }}>
          <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>PEAK HOURS TODAY</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>4:00 PM - 7:30 PM</strong>
          </div>
          <div style={{ background: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.725rem' }}>AVG SERVICE TIME</span>
            <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>24 Minutes</strong>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        
        {/* Weekly Revenue Trend */}
        <div className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart2 size={16} color="var(--secondary)" /> Weekly Revenue ({currency})
          </h4>
          <div style={{ height: '180px' }}>
            <Line data={revenueLineData} options={chartOptions} />
          </div>
        </div>

        {/* Daily Customers */}
        <div className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Users size={16} color="var(--primary)" /> Customers Per Day
          </h4>
          <div style={{ height: '180px' }}>
            <Bar data={customersPerDayData} options={chartOptions} />
          </div>
        </div>

        {/* Most Popular Services */}
        <div className="card">
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>
            Most Popular Services
          </h4>
          <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={popularServicesData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

      </div>

    </div>
  );
}
