import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { RiSearchLine, RiMenuLine } from 'react-icons/ri';

const Navbar = ({ title, toggleSidebar, onSearch, searchValue }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={toggleSidebar}
          className="btn-mobile-toggle"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'none' // Controlled in CSS for mobile view
          }}
        >
          <RiMenuLine />
        </button>
        <h1 className="navbar-title">{title}</h1>
      </div>

      <div className="navbar-actions">
        {onSearch && (
          <div className="search-container">
            <RiSearchLine className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchValue || ''}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}

        <div className="navbar-profile">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <div className="navbar-profile-avatar">{getInitials(user?.name)}</div>
          )}
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.name || 'User'}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
