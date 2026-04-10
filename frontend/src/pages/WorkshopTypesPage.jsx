import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function WorkshopTypesPage() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  const fetch = (p = 1) => {
    setLoading(true);
    client.get(`/workshops/types/?page=${p}`)
      .then(r => { setTypes(r.data.types); setMeta(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(page); }, [page]);

  if (loading) return <Loader />;

  const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem' }}>
      <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Workshop Types</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Explore available workshop categories</p>
        </div>
        {user?.is_instructor && (
          <Link to="/types/add" className="btn btn-primary">+ Add Workshop Type</Link>
        )}
      </div>

      {types.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h2>No workshop types yet</h2>
          <p style={{ color: 'var(--text-muted)' }}>An instructor needs to add workshop types first.</p>
        </div>
      ) : (
        <div className="grid-3">
          {types.map((t, i) => (
            <Link key={t.id} to={`/types/${t.id}`} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{
                padding: '1.75rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                borderTop: `3px solid ${colors[i % colors.length]}`,
                height: '100%',
                display: 'flex', flexDirection: 'column',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: '1rem',
                  background: `${colors[i % colors.length]}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem',
                }}>
                  💡
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{t.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                  {t.description?.substring(0, 100)}{t.description?.length > 100 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-info">🗓️ {t.duration} day{t.duration !== 1 ? 's' : ''}</span>
                  <span style={{ color: colors[i % colors.length], fontSize: '0.8rem', fontWeight: 600 }}>View →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.num_pages > 1 && (
        <div className="flex-center gap-1 mt-3" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost btn-sm" disabled={!meta.has_previous} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Page {page} of {meta.num_pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={!meta.has_next} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
