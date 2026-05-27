import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const TeamStatsChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataInfo = payload[0].payload;
      const target = dataInfo.target || 0;
      const achieved = dataInfo.achieved || 0;
      const pct = target > 0 ? Math.round((achieved / target) * 100) : 0;
      return (
        <div 
          className="glass-card" 
          style={{ 
            padding: '12px', 
            background: '#111122', 
            border: '1px solid var(--accent-primary)'
          }}
        >
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
            {dataInfo.name}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Target: <span style={{ color: '#fff', fontWeight: 600 }}>₹{target.toLocaleString('en-IN')}</span>
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Achieved: <span style={{ color: 'var(--success)', fontWeight: 600 }}>₹{achieved.toLocaleString('en-IN')}</span>
          </p>
          <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, marginTop: '8px' }}>
            Completion: {pct}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            wrapperStyle={{ fontSize: '0.85rem' }}
          />
          <Bar dataKey="target" name="Target (₹)" fill="rgba(108, 99, 255, 0.4)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="achieved" name="Achieved (₹)" fill="var(--success)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamStatsChart;
