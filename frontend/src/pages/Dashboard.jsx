import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/ui/StatCard';
import PerformanceChart from '../components/charts/PerformanceChart';
import LeadFunnelChart from '../components/charts/LeadFunnelChart';
import TeamStatsChart from '../components/charts/TeamStatsChart';
import {
  LuUsers,
  LuGitMerge,
  LuSquareCheck,
  LuIndianRupee,
  LuPlus,
  LuArrowUpRight
} from 'react-icons/lu';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.allSettled([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity')
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success) {
          setStats(statsRes.value.data.stats);
        }
        if (activityRes.status === 'fulfilled' && activityRes.value?.data?.success) {
          setActivity(activityRes.value.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('en-GB', options);
  };

  const totalUsers = stats?.totalUsers ?? (user?.role === 'bda' ? 1 : 0);
  const totalTeams = stats?.totalTeams ?? (user?.team ? 1 : 0);
  const totalTasks = stats?.totalTasks ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;

  const topPerformers = stats?.topPerformers && stats.topPerformers.length > 0
    ? stats.topPerformers
    : [];

  const recentCustomers = activity?.recentLeads && activity.recentLeads.length > 0
    ? activity.recentLeads
    : [];

  const recentTasks = activity?.recentTasks && activity.recentTasks.length > 0
    ? activity.recentTasks
    : [];

  const firstName = user?.name ? user.name.split(' ')[0] : '';

  return (
    <div>
      {/* Greeting Banner */}
      <div className="greeting-hero-banner">
        <div>
          <div className="greeting-date-text">{getFormattedDate()}</div>
          <h1 className="greeting-heading">{getGreeting()}, {firstName}</h1>
          <p className="greeting-subtext">Here is where your pipeline and team stand right now.</p>
        </div>
        <div className="greeting-actions-row">
          <Link to="/tasks" className="btn-hero-outlined">
            <LuPlus size={16} />
            <span>Add task</span>
          </Link>
          <Link to="/leads" className="btn-hero-solid">
            <LuPlus size={16} />
            <span>Add customer</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Sales representatives"
          value={totalUsers}
          subtext={user?.role === "admin" ? "Across all teams" : user?.role === "manager" ? "In your team" : "Just you"}
          icon={<LuUsers />}
          color="blue"
        />
        <StatCard
          title="Active sales teams"
          value={totalTeams}
          subtext="Currently selling"
          icon={<LuGitMerge />}
          color="green"
        />
        <StatCard
          title="Open tasks"
          value={totalTasks}
          subtext="Assigned to your people"
          icon={<LuSquareCheck />}
          color="yellow"
        />
        <StatCard
          title="Revenue won"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          subtext="From closed deals"
          icon={<LuIndianRupee />}
          color="purple"
        />
      </div>

      {/* Row 1: Customer acquisition & Pipeline by stage */}
      <div className="two-col-grid">
        <div className="white-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title-main">Customer acquisition</h3>
              <p className="card-subtitle-main">New customers per month, last 6 months</p>
            </div>
            <Link to="/leads" className="link-btn-text">
              <span>View all</span>
              <LuArrowUpRight size={14} />
            </Link>
          </div>
          <PerformanceChart data={stats?.monthlyLeads} />
        </div>

        <div className="white-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title-main">Pipeline by stage</h3>
              <p className="card-subtitle-main">Customers at each step of the sale</p>
            </div>
          </div>
          <LeadFunnelChart data={stats?.leadsByStatus} />
        </div>
      </div>

      {/* Row 2: Team targets & Top performers */}
      <div className="two-col-grid">
        <div className="white-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title-main">Team targets</h3>
              <p className="card-subtitle-main">Sales achieved against target</p>
            </div>
          </div>
          <TeamStatsChart data={stats?.teamPerformance} />
        </div>

        <div className="white-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title-main">Top performers</h3>
              <p className="card-subtitle-main">Ranked by revenue won</p>
            </div>
          </div>
          <table className="clean-data-table">
            <thead>
              <tr>
                <th>Representative</th>
                <th style={{ textAlign: 'center' }}>Deals won</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '0.84rem' }}>
                    No closed deals won yet. When deals are marked as 'Won', top performers will appear here.
                  </td>
                </tr>
              ) : (
                topPerformers.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3' }}>
                          {item.name ? item.name[0] : 'U'}
                        </div>
                        <span className="cell-bold-main">{item.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{item.wonDeals}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-main)' }}>
                      ₹{item.revenue?.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Recent customers & Recent tasks */}
      <div className="two-col-grid">
        <div className="white-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title-main">Recent customers</h3>
              <p className="card-subtitle-main">Latest prospects added to the pipeline</p>
            </div>
            <Link to="/leads" className="link-btn-text">
              <span>Open</span>
              <LuArrowUpRight size={14} />
            </Link>
          </div>
          <table className="clean-data-table">
            <tbody>
              {recentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '0.84rem' }}>
                    No prospects in your pipeline yet. Click '+ New' above to create your first customer.
                  </td>
                </tr>
              ) : (
                recentCustomers.map((cust, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8' }}>
                          {cust.name ? cust.name[0] : 'C'}
                        </div>
                        <div>
                          <div className="cell-bold-main">{cust.name}</div>
                          <div className="cell-sub-muted">Assigned to {cust.assignedTo?.name || 'Unassigned'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="cell-bold-main">₹{cust.value?.toLocaleString('en-IN')}</div>
                      <div style={{ marginTop: '2px' }}>
                        <span className={`status-pill status-${cust.status}`}>
                          {cust.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="white-card">
          <div className="card-header-between">
            <div>
              <h3 className="card-title-main">Recent tasks</h3>
              <p className="card-subtitle-main">What your team was asked to do</p>
            </div>
            <Link to="/tasks" className="link-btn-text">
              <span>Open</span>
              <LuArrowUpRight size={14} />
            </Link>
          </div>
          <table className="clean-data-table">
            <tbody>
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center', padding: '28px', color: '#94a3b8', fontSize: '0.84rem' }}>
                    No tasks assigned right now. Click 'Add task' above to schedule work.
                  </td>
                </tr>
              ) : (
                recentTasks.map((task, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8' }}>
                          {task.assignedTo?.name ? task.assignedTo.name[0] : 'A'}
                        </div>
                        <div>
                          <div className="cell-bold-main">{task.title}</div>
                          <div className="cell-sub-muted">Assigned to {task.assignedTo?.name || 'Associate'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`status-pill priority-${task.priority?.toLowerCase() || 'medium'}`} style={{ marginRight: '6px' }}>
                        {task.priority || 'Medium'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
