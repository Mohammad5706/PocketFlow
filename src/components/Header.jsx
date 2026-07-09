import { NavLink } from 'react-router-dom';
import { Wallet, LogOut } from 'lucide-react';

export function Header({ onLogout }) {
  return (
    <header className="app-navbar animate-fade">
      <div className="navbar-container">
        {/* Brand Identity */}
        <div className="navbar-left">
          <div className="navbar-logo-wrapper">
            <Wallet size={20} className="navbar-logo-icon" />
          </div>
          <div className="navbar-branding">
            <span className="navbar-title">PocketFlow</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-nav-links">
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
          >
            Expenses
          </NavLink>
        </nav>
        
        {/* Actions / Logout */}
        <div className="navbar-right">
          <button onClick={onLogout} className="logout-btn" title="Logout">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

