import React from 'react';

const StatCard = ({ title, value, icon, subtext, color = 'blue' }) => {
  return (
    <div className="stat-metric-card">
      <div className="stat-top-header">
        <span className="stat-metric-title">{title}</span>
        <div className={`stat-icon-wrapper ${color}`}>
          {icon}
        </div>
      </div>
      <div className="stat-metric-value">{value}</div>
      {subtext && <div className="stat-metric-sub">{subtext}</div>}
    </div>
  );
};

export default StatCard;
