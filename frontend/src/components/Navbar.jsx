import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, ClipboardList, PlusCircle, BookOpen,
  BarChart2, User, LogOut, ChevronDown, Zap, Menu, X
} from 'lucide-react';
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

  const close = () => { setMenuOpen(false); setDropdownOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={user ? '/home' : '/login'} className="navbar-brand">
          <span className="brand-icon"><Zap size={18} strokeWidth={2.5} /></span>
          <span>FOSSEE <span className="brand-accent">Workshops</span></span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Toggle menu">
          {menuOpen
            ? <X size={22} strokeWidth={2} />
            : <Menu size={22} strokeWidth={2} />
          }
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/statistics" className="nav-link" onClick={close}>
            <BarChart2 size={15} strokeWidth={2} />
            Statistics
          </Link>

          <Link to="/types" className="nav-link" onClick={close}>
            <BookOpen size={15} strokeWidth={2} />
            Workshop Types
          </Link>

          {user && (
            <>
              {user.is_instructor && (
                <Link to="/dashboard" className="nav-link" onClick={close}>
                  <LayoutDashboard size={15} strokeWidth={2} />
                  Dashboard
                </Link>
              )}
              {!user.is_instructor && (
                <Link to="/status" className="nav-link" onClick={close}>
                  <ClipboardList size={15} strokeWidth={2} />
                  My Workshops
                </Link>
              )}
              {!user.is_instructor && (
                <Link to="/propose" className="nav-link" onClick={close}>
                  <PlusCircle size={15} strokeWidth={2} />
                  Propose
                </Link>
              )}

              <div className="nav-dropdown">
                <button className="nav-link avatar-btn" onClick={() => setDropdownOpen(d => !d)}>
                  <div className="avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{initials}</div>
                  <span>{user.first_name || user.username}</span>
                  <ChevronDown size={13} strokeWidth={2.5} className={`chevron-icon ${dropdownOpen ? 'open' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu" onClick={close}>
                    <Link to="/profile" className="dropdown-item">
                      <User size={14} strokeWidth={2} /> Profile
                    </Link>
                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={14} strokeWidth={2} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {!user && (
            <>
              <Link to="/login" className="nav-link" onClick={close}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
