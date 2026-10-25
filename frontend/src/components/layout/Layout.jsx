import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-container">
      {/* Sidebar for Left Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Panel */}
      <div className="app-main">
        <Navbar toggleSidebar={toggleSidebar} />
        
        {/* Main Content Area */}
        <main className="page-content-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
