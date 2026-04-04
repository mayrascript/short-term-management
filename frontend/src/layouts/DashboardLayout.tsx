import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Share2, DollarSign, CheckSquare, Building } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <Building size={24} />
          <span>MySTR</span>
        </div>
        
        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
             <Home size={20} />
             <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/social" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
             <Share2 size={20} />
             <span>Social</span>
          </NavLink>
          
          <NavLink to="/finance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
             <DollarSign size={20} />
             <span>Finance</span>
          </NavLink>
          
          <NavLink to="/tasks" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
             <CheckSquare size={20} />
             <span>Tasks</span>
          </NavLink>
        </nav>
      </aside>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
