import React from 'react';
import { Outlet } from 'react-router';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    // Default to open on desktop, closed on mobile
    return window.innerWidth >= 1024;
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] overflow-hidden">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        {/* Main Content Area */}
        <div 
          className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          {/* Navbar */}
          <Navbar onMenuClick={toggleSidebar} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8 scroll-smooth">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;