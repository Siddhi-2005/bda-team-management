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

const LeadFunnelChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: '8px' }}>No pipeline stages yet</h4>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '320px' }}>
            Create leads and move them through stages like New, Contacted, Proposal, and Won.
          </p>
        </div>
      </div>
    );
  }

  const COLORS = {
    new: '#00b0ff',
    contacted: '#ffb300',
    qualified: '#6c63ff',
    proposal: '#fd7e14',
    negotiation: '#17a2b8',
    won: '#00e676',
    lost: '#e94560'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataInfo = payload[0].payload;
      return (
        <div 
          className="glass-card" 
          style={{ 
            padding: '12px', 
            background: '#111122', 
            border: `1px solid ${COLORS[dataInfo._id] || 'var(--accent-primary)'}`
          }}
        >
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>
            Pipeline Stage
          </p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', textTransform: 'capitalize' }}>
            {dataInfo._id}: <span style={{ color: COLORS[dataInfo._id] }}>{payload[0].value}</span>
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
            Total Value: ₹{dataInfo.value.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="_id" 
            stroke="var(--text-secondary)"
            style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
          />
          <YAxis 
            stroke="var(--text-secondary)" 
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry._id] || '#6c63ff'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeadFunnelChart;
