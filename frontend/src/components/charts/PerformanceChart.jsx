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
  const chartData = React.useMemo(() => {
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

    if (data && data.length > 0) {
      const allMonthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return data.map((item) => {
        const monthIndex = item._id?.month ? item._id.month - 1 : 0;
        return {
          monthName: allMonthsNames[monthIndex] || 'Mo',
          count: item.count || 0,
          value: item.value || 0
        };
      });
    }

    // Clean zero baseline for fresh accounts
    return months.map((m) => ({ monthName: m, count: 0 }));
  }, [data]);

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
          <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>
            {entry.monthName}
          </p>
          <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
            New Customers: <span style={{ color: '#2563eb' }}>{entry.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
        >
          <defs>
            <linearGradient id="blueCurvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#ffffff" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="monthName"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={{ stroke: '#f1f5f9' }}
            style={{ fontSize: '0.75rem', fontWeight: 500 }}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '0.75rem', fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#2563eb"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#blueCurvedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;
