import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  RiDashboardLine,
  RiTeamLine,
  RiUserLine,
  RiTaskLine,
  RiLineChartLine,
  RiSettings3Line,
  RiLogoutBoxRLine
} from 'react-icons/ri';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <RiDashboardLine /> },
    { to: '/teams', label: 'Teams', icon: <RiTeamLine />, roles: ['admin', 'manager'] },
    { to: '/members', label: 'Members', icon: <RiUserLine />, roles: ['admin', 'manager'] },
    { to: '/tasks', label: 'Tasks', icon: <RiTaskLine /> },
    { to: '/leads', label: 'Potential Customers', icon: <RiLineChartLine /> },
    { to: '/profile', label: 'Profile', icon: <RiSettings3Line /> }
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.roles || link.roles.includes(user?.role)
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        <div className="sidebar-logo">
          <RiLineChartLine style={{ color: 'var(--accent-secondary)' }} />
          <span>Business Development Platform</span>
        </div>

        <nav>
          <ul className="sidebar-menu">
            {filteredLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={() => {
                    if (window.innerWidth <= 768) toggleSidebar();
                  }}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {user?.avatar ? (
            <img src={user.avatar} className="sidebar-avatar" alt={user.name} />
          ) : (
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
          )}
          <div className="sidebar-user-info">
            <h4>{user?.name || 'Associate'}</h4>
            <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.65rem', marginTop: '4px' }}>
              {user?.role}
            </span>
          </div>
        </div>

        <button onClick={logout} className="btn-logout">
          <RiLogoutBoxRLine />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
