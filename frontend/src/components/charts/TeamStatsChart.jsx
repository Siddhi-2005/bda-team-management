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

const DEFAULT_TEAMS = [
  { name: 'Western Wolves', target: 2000000, achieved: 1200000 },
  { name: 'Southern Stars', target: 1500000, achieved: 480000 }
];

const TeamStatsChart = ({ data }) => {
  const chartData = (data && data.length > 0) ? data : DEFAULT_TEAMS;

  const formatYAxis = (val) => {
    if (val === 0) return '₹0';
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
    return `₹${val}`;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}>
          <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
            {entry.name}
          </p>
          <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
            Target: <span style={{ color: '#60a5fa', fontWeight: 600 }}>₹{entry.target?.toLocaleString('en-IN')}</span>
          </p>
          <p style={{ color: '#64748b', fontSize: '0.78rem' }}>
            Achieved: <span style={{ color: '#2563eb', fontWeight: 600 }}>₹{entry.achieved?.toLocaleString('en-IN')}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 12, right: 12, left: -10, bottom: 0 }}
          barGap={6}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={{ stroke: '#f1f5f9' }}
            style={{ fontSize: '0.75rem', fontWeight: 500 }}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
            style={{ fontSize: '0.72rem', fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '0.75rem', fontWeight: 600 }}
          />
          <Bar dataKey="target" name="Target (₹)" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
          <Bar dataKey="achieved" name="Achieved (₹)" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TeamStatsChart;
