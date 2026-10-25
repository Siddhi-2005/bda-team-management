import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuLayoutDashboard,
  LuUsers,
  LuSquareCheck,
  LuSettings,
  LuLogOut,
  LuTrendingUp,
  LuChevronsUpDown,
  LuUserCheck
} from 'react-icons/lu';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'SP';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const workspaceLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LuLayoutDashboard size={18} /> },
    { to: '/leads', label: 'Potential Customers', icon: <LuUsers size={18} /> },
    { to: '/tasks', label: 'Tasks', icon: <LuSquareCheck size={18} /> }
  ];

  const teamLinks = [
    { to: '/teams', label: 'Teams', icon: <LuUsers size={18} />, roles: ['admin', 'manager'] },
    { to: '/members', label: 'Members', icon: <LuUserCheck size={18} />, roles: ['admin', 'manager'] }
  ];

  const accountLinks = [
    { to: '/profile', label: 'Profile & settings', icon: <LuSettings size={18} /> }
  ];

  const filterRole = (links) => links.filter((l) => !l.roles || l.roles.includes(user?.role));

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <LuTrendingUp />
        </div>
        <div className="brand-text-col">
          <span className="brand-title">BDA Workspace</span>
          <span className="brand-sub">Sales team platform</span>
        </div>
      </div>

      {/* Live Status Pill */}
      <div className="sidebar-status-pill">
        <div className="status-indicator">
          <span className="pulsing-dot" />
          <span>Pipeline live</span>
        </div>
        <LuChevronsUpDown size={14} style={{ color: '#94a3b8' }} />
      </div>

      {/* Section: Workspace */}
      <div className="nav-section-title">Workspace</div>
      <ul className="sidebar-nav-list">
        {filterRole(workspaceLinks).map((link) => (
          <li key={link.to} className="sidebar-nav-item">
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => {
                if (window.innerWidth <= 768 && toggleSidebar) toggleSidebar();
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Section: Team */}
      {filterRole(teamLinks).length > 0 && (
        <>
          <div className="nav-section-title">Team</div>
          <ul className="sidebar-nav-list">
            {filterRole(teamLinks).map((link) => (
              <li key={link.to} className="sidebar-nav-item">
                <NavLink
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  onClick={() => {
                    if (window.innerWidth <= 768 && toggleSidebar) toggleSidebar();
                  }}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Section: Account */}
      <div className="nav-section-title">Account</div>
      <ul className="sidebar-nav-list">
        {accountLinks.map((link) => (
          <li key={link.to} className="sidebar-nav-item">
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
              onClick={() => {
                if (window.innerWidth <= 768 && toggleSidebar) toggleSidebar();
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User Footer */}
      <div className="sidebar-user-footer">
        <div className="user-badge-row">
          <div className="avatar-circle">
            {getInitials(user?.name)}
          </div>
          <div className="user-badge-info">
            <span className="user-badge-name">{user?.name || 'Siddhi Pawar'}</span>
            <span className="user-badge-role">{user?.role || 'Admin'}</span>
          </div>
        </div>

        <button onClick={logout} className="btn-sidebar-logout" title="Log out">
          <LuLogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
