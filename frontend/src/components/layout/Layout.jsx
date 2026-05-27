import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Logic to determine the header title based on active path
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'System Overview';
    if (path.includes('/teams')) return 'Team Management';
    if (path.includes('/members')) return 'Team Members';
    if (path.includes('/tasks')) return 'Task Management';
    if (path.includes('/leads')) return 'Potential Customers';
    if (path.includes('/profile')) return 'My Profile';
    return 'Business Development Workspace';
  };

  return (
    <div className="app-layout">
      {/* Sidebar for Left Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Panel */}
      <div className="main-content">
        <Navbar title={getHeaderTitle()} toggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
