import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function StatusPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/workshops/status/').then(r => setData(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  const accepted = data?.workshops?.filter(w => w.status === 1) || [];
  const proposed = data?.workshops?.filter(w => w.status === 0 && w.tnc_accepted) || [];

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem' }}>
      <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Workshops</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track your proposed and accepted workshops</p>
        </div>
        <Link to="/propose" className="btn btn-primary">+ Propose Workshop</Link>
      </div>

      {accepted.length === 0 && proposed.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
          <h2 style={{ marginBottom: '0.5rem' }}>No workshops yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Propose your first workshop to get started!</p>
          <Link to="/propose" className="btn btn-primary btn-lg">Propose a Workshop</Link>
        </div>
      ) : (
        <>
          <div className="glass-card mb-2" style={{ padding: '1.5rem' }}>
            <div className="section-title">✅ Accepted Workshops</div>
            {accepted.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.875rem' }}>No accepted workshops yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr><th>Workshop</th><th>Instructor</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {accepted.map(w => (
                      <tr key={w.id}>
                        <td><Link to={`/workshops/${w.id}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>{w.workshop_type}</Link></td>
                        <td style={{ color: 'var(--text-muted)' }}>{w.instructor_name || '—'}</td>
                        <td>{new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td><StatusBadge status={w.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="section-title">⏳ My Proposals</div>
            {proposed.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0', fontSize: '0.875rem' }}>No pending proposals.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="modern-table">
                  <thead>
                    <tr><th>Workshop</th><th>Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {proposed.map(w => (
                      <tr key={w.id}>
                        <td><Link to={`/workshops/${w.id}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>{w.workshop_type}</Link></td>
                        <td>{new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td><StatusBadge status={w.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
