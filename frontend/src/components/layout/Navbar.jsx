import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LuSearch, LuPlus, LuBell, LuMenu } from 'react-icons/lu';

const Navbar = ({ toggleSidebar, onSearch, searchValue, onNewClick }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return { section: 'Workspace', page: 'Dashboard' };
    if (path.includes('/leads')) return { section: 'Workspace', page: 'Potential Customers' };
    if (path.includes('/tasks')) return { section: 'Workspace', page: 'Tasks' };
    if (path.includes('/teams')) return { section: 'Team', page: 'Teams' };
    if (path.includes('/members')) return { section: 'Team', page: 'Members' };
    if (path.includes('/profile')) return { section: 'Workspace', page: 'Profile' };
    return { section: 'Workspace', page: 'Overview' };
  };

  const getInitials = (name) => {
    if (!name) return 'SP';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getFirstName = (name) => {
    if (!name) return 'Siddhi';
    return name.split(' ')[0];
  };

  const { section, page } = getBreadcrumb();

  const handleNewAction = () => {
    if (onNewClick) {
      onNewClick();
    } else {
      // Default to navigating to add customer
      navigate('/leads');
    }
  };

  return (
    <header className="app-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={toggleSidebar}
          className="btn-icon-soft"
          style={{ display: 'none' }}
          id="mobile-nav-toggle"
        >
          <LuMenu size={18} />
        </button>

        <div className="breadcrumb-path">
          <span className="breadcrumb-muted">{section}</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{page}</span>
        </div>
      </div>

      <div className="topbar-right-actions">
        <div className="search-input-wrapper">
          <LuSearch className="search-icon-inside" size={16} />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search customers, tasks, people..."
            value={searchValue || ''}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <span className="search-shortcut-badge">Ctrl K</span>
        </div>

        <button className="btn-primary-blue" onClick={handleNewAction} title="Create New">
          <LuPlus size={16} />
          <span>New</span>
        </button>

        <button className="btn-icon-soft" title="Notifications">
          <LuBell size={17} />
        </button>

        <div className="topbar-profile-pill" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <div className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
            {getInitials(user?.name)}
          </div>
          <span>{getFirstName(user?.name)}</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
