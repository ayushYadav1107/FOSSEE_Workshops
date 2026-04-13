import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import { History } from 'lucide-react';

export default function CoordinatorProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/profile/${id}/`).then(r => setData(r.data)).catch(() => toast.error('Profile not found')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!data) return null;

  const initials = `${data.first_name?.[0] || ''}${data.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem', maxWidth: 800 }}>
      <Link to="/dashboard" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}>← Back</Link>

      <div className="glass-card mb-2" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg">{initials}</div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>{data.first_name} {data.last_name}</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{data.email}</div>
            <span className="badge badge-info mt-1" style={{ marginTop: 8 }}>📋 Coordinator</span>
          </div>
        </div>
        <div className="divider" />
        <div className="grid-2" style={{ gap: '1.5rem' }}>
          {[['🏫 Institute', data.institute], ['🔬 Department', data.department], ['📞 Phone', data.phone_number], ['📍 Location', data.location], ['🗺️ State', data.state]].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
              <div style={{ color: value ? 'var(--text)' : 'var(--text-dim)', fontWeight: 500 }}>{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div className="section-title"><History size={15} strokeWidth={2} /> Workshop History</div>
        {(!data.workshops || data.workshops.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>No workshops yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr><th>Workshop</th><th>Date</th><th>Instructor</th><th>Status</th></tr>
              </thead>
              <tbody>
                {data.workshops.map(w => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 500 }}>{w.workshop_type}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{w.instructor || '—'}</td>
                    <td><StatusBadge status={w.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
