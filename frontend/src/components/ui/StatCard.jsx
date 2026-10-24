import React from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

const StatCard = ({ title, value, icon, trend, trendValue, color }) => {
  return (
    <div 
      className="glass-card stat-card" 
      style={{ '--accent-gradient': color || 'var(--accent-gradient)' }}
    >
      <div className="stat-header">
        <span className="stat-title">{title}</span>
        <div className="stat-icon-wrapper" style={{ color: color ? 'inherit' : 'var(--accent-primary)' }}>
          {icon}
        </div>
      </div>
      <div className="stat-value">{value}</div>
      {trendValue !== undefined && (
        <div className={`stat-trend ${trend === 'up' ? 'up' : 'down'}`}>
          {trend === 'up' ? <RiArrowUpLine /> : <RiArrowDownLine />}
          <span>{trendValue}%</span>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '4px' }}>
            vs last month
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
