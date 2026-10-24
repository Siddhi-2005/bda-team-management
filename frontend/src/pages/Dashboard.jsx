import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/ui/StatCard';
import PerformanceChart from '../components/charts/PerformanceChart';
import LeadFunnelChart from '../components/charts/LeadFunnelChart';
import TeamStatsChart from '../components/charts/TeamStatsChart';
import {
  RiGroupLine,
  RiGitMergeLine,
  RiTaskLine,
  RiMoneyDollarCircleLine,
  RiLoader5Line,
  RiShieldFlashLine,
  RiTimeLine
} from 'react-icons/ri';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity')
        ]);

        if (statsRes.data.success && activityRes.data.success) {
          setStats(statsRes.data.stats);
          setActivity(activityRes.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError('Failed to fetch dashboard metrics. Please reload.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flex: 1, height: '60vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '15px' }}>
        <RiLoader5Line className="spin" style={{ fontSize: '3rem', color: 'var(--accent-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading business development intelligence analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card alert alert-danger" style={{ margin: '20px' }}>
        {error}
      </div>
    );
  }

  const {
    totalUsers,
    totalTeams,
    totalTasks,
    totalRevenue,
    leadsByStatus,
    monthlyLeads,
    topPerformers,
    teamPerformance
  } = stats;

  const hasNoWorkData = totalTasks === 0 && (!leadsByStatus || leadsByStatus.length === 0) && totalRevenue === 0;

  return (
    <div>
      {hasNoWorkData && (
        <div className="glass-card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Your workspace is empty</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Add a potential customer to build future income charts, or add a task to track your calls, demos, and follow-ups.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/leads" className="btn btn-primary">Add Customer</Link>
            <Link to="/tasks" className="btn btn-secondary">Add Task</Link>
          </div>
        </div>
      )}

      {/* StatCards Row */}
      <div className="dashboard-grid">
        <StatCard
          title="Total Representatives"
          value={totalUsers}
          icon={<RiGroupLine />}
          color="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
        />
        <StatCard
          title="Active Sales Teams"
          value={totalTeams}
          icon={<RiGitMergeLine />}
          color="linear-gradient(135deg, #10b981 0%, #047857 100%)"
        />
        <StatCard
          title="Assigned Tasks"
          value={totalTasks}
          icon={<RiTaskLine />}
          color="linear-gradient(135deg, #f59e0b 0%, #b45309 100%)"
        />
        <StatCard
          title="Total Revenue Won"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          icon={<RiMoneyDollarCircleLine />}
          color="linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
        />
      </div>

      {/* Main Charts Area */}
      <div className="charts-grid">
        <div className="glass-card">
          <h3 className="chart-title">Customer Acquisition Trends (Last 6 Months)</h3>
          <PerformanceChart data={monthlyLeads} />
        </div>
        <div className="glass-card">
          <h3 className="chart-title">Customer Stage Distribution</h3>
          <LeadFunnelChart data={leadsByStatus} />
        </div>
      </div>

      {/* Second Row: Team Performance and Top Sales Associates */}
      <div className="secondary-grid" style={{ marginBottom: '24px' }}>
        <div className="glass-card">
          <h3 className="chart-title">Team Sales Target Achievement</h3>
          <TeamStatsChart data={teamPerformance} />
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 className="chart-title">Top Business Development Associates</h3>
          <div className="table-responsive" style={{ flex: 1 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Representative</th>
                  <th>Won Deals</th>
                  <th>Revenue (₹)</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((performer, idx) => (
                  <tr key={performer._id || idx}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="kanban-avatar" style={{ background: 'var(--accent-primary)' }}>
                        {performer.name[0]}
                      </div>
                      <span>{performer.name}</span>
                    </td>
                    <td>{performer.wonDeals}</td>
                    <td style={{ fontWeight: 'bold', color: 'var(--success)' }}>
                      ₹{performer.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activity Logs Feed */}
      <div className="glass-card">
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiTimeLine style={{ color: 'var(--accent-secondary)' }} />
          Recent Activity Logs
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Leads Activity */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Recent Potential Customers
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activity?.recentLeads.map((l) => (
                <div 
                  key={l._id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{l.name}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Assigned to {l.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ₹{l.value.toLocaleString('en-IN')}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '2px', textTransform: 'capitalize' }}>
                      {l.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Activity */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
              Recently Task Assignments
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activity?.recentTasks.map((t) => (
                <div 
                  key={t._id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.title}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Assigned to {t.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${
                      t.priority === 'critical' ? 'badge-danger' : 
                      t.priority === 'high' ? 'badge-warning' : 'badge-primary'
                    }`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                      {t.priority}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'capitalize' }}>
                      {t.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
