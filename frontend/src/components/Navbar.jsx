import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? (user.is_instructor ? '/dashboard' : '/status') : '/login'} className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span>FOSSEE <span className="brand-accent">Workshops</span></span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle menu">
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/statistics" className="nav-link" onClick={() => setMenuOpen(false)}>
            📊 Statistics
          </Link>

          {user && (
            <>
              {user.is_instructor && (
                <Link to="/dashboard" className="nav-link" onClick={() => setMenuOpen(false)}>
                  🎯 Dashboard
                </Link>
              )}
              {!user.is_instructor && (
                <Link to="/status" className="nav-link" onClick={() => setMenuOpen(false)}>
                  📋 My Workshops
                </Link>
              )}
              {!user.is_instructor && (
                <Link to="/propose" className="nav-link" onClick={() => setMenuOpen(false)}>
                  📝 Propose
                </Link>
              )}
              <Link to="/types" className="nav-link" onClick={() => setMenuOpen(false)}>
                🗂️ Workshop Types
              </Link>

              <div className="nav-dropdown">
                <button
                  className="nav-link avatar-btn"
                  onClick={() => setDropdownOpen(d => !d)}
                >
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                    {initials}
                  </div>
                  <span>{user.first_name || user.username}</span>
                  <span className="chevron">▾</span>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu" onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}>
                    <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                    <button className="dropdown-item danger" onClick={handleLogout}>🚪 Logout</button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
