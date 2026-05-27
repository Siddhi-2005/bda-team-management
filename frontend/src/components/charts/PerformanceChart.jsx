import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PerformanceChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>No customer trend yet</h4>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '360px' }}>
            Add leads from the Leads page. This chart will show monthly lead count and pipeline value.
          </p>
        </div>
      </div>
    );
  }

  // Format months for the X-axis
  const formatXAxis = (tickItem) => {
    if (!tickItem) return '';
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[tickItem - 1] || '';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div 
          className="glass-card" 
          style={{ 
            padding: '12px', 
            background: '#111122', 
            border: '1px solid var(--accent-primary)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>
            Performance Metrics
          </p>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
            Leads Acquired: <span style={{ color: 'var(--accent-primary)' }}>{payload[0].value}</span>
          </p>
          {payload[1] && (
            <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', marginTop: '4px' }}>
              Potential Value: <span style={{ color: 'var(--accent-secondary)' }}>₹{payload[1].value.toLocaleString('en-IN')}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-secondary)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--accent-secondary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="_id.month" 
            tickFormatter={formatXAxis} 
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="var(--accent-primary)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorCount)" 
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="var(--accent-secondary)" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
