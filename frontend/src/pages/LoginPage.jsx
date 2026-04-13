import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './LoginPage.css';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (user) {
    navigate(user.is_instructor ? '/dashboard' : '/status', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      toast.success(`Welcome back, ${data.first_name || data.username}!`);
      navigate(data.is_instructor ? '/dashboard' : '/status');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-hero animate-fade-left">
        <div className="hero-content">
          <h1 className="hero-title">Connect. Learn.<br />Grow Together.</h1>
          <p className="hero-desc">
            A platform for instructors and coordinators to seamlessly organise 
            and manage academic workshops across India.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">500+</span>
              <span className="stat-label">Workshops</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">28</span>
              <span className="stat-label">States</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">10k+</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="login-form-panel animate-fade-in">
        <div className="login-card glass-card">
          <div className="login-card-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account</p>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form-body">
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
                autoFocus
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
              <a href="/workshop/password_reset/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
              id="login-btn"
            >
              {loading ? '⏳ Signing in…' : '→ Sign In'}
            </button>
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
