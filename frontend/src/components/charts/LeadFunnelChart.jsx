import React from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const STAGE_CONFIG = {
  new: { label: 'New', color: '#0284c7' },
  contacted: { label: 'Conta.', color: '#d97706' },
  qualified: { label: 'Quali.', color: '#7c3aed' },
  proposal: { label: 'Propo.', color: '#ea580c' },
  negotiation: { label: 'Negot.', color: '#0ea5e9' },
  won: { label: 'Won', color: '#059669' }
};

const LeadFunnelChart = ({ data }) => {
  const chartData = React.useMemo(() => {
    const stageMap = {};
    if (data && data.length > 0) {
      data.forEach((item) => {
        const key = item._id ? item._id.toLowerCase() : '';
        stageMap[key] = item.count;
      });
    }

    return Object.keys(STAGE_CONFIG).map((stageKey) => {
      const cfg = STAGE_CONFIG[stageKey];
      return {
        stageKey,
        label: cfg.label,
        color: cfg.color,
        count: stageMap[stageKey] !== undefined ? stageMap[stageKey] : 0
      };
    });
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
          <p style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
            {entry.stageKey} Stage
          </p>
          <p style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.9rem' }}>
            Prospects: <span style={{ color: entry.color }}>{entry.count}</span>
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
          margin={{ top: 12, right: 12, left: -22, bottom: 0 }}
          barSize={24}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={{ stroke: '#f1f5f9' }}
            style={{ fontSize: '0.72rem', fontWeight: 500 }}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '0.75rem', fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadFunnelChart;
