import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Clock, PlusCircle, ArrowRight } from 'lucide-react';

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
    <div style={{ paddingTop: '64px' }}>

      {/* Hero banner with workshop photo */}
      <div className="hero-banner-mobile" style={{
        height: 220,
        background: `linear-gradient(to right, rgba(10,10,20,0.88) 0%, rgba(10,10,20,0.55) 55%, rgba(10,10,20,0.2) 100%),
                     url('/types_banner.png') center/cover no-repeat`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 3rem',
        marginBottom: '2rem',
      }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', color: '#fff', marginBottom: '0.4rem' }}>Workshop Types</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>Explore hands-on academic workshops from IIT Bombay</p>
        </div>
        {user?.is_instructor && (
          <Link to="/types/add" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
            <PlusCircle size={15} strokeWidth={2} /> Add Workshop Type
          </Link>
        )}
      </div>

      <div className="page-container animate-fade-in">

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
                  color: colors[i % colors.length],
                }}>
                  <GraduationCap size={22} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.5rem', color: 'var(--text)' }}>{t.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, flex: 1, marginBottom: '1rem' }}>
                  {t.description?.substring(0, 100)}{t.description?.length > 100 ? '…' : ''}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-info" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} strokeWidth={2} /> {t.duration} day{t.duration !== 1 ? 's' : ''}
                  </span>
                  <span style={{ color: colors[i % colors.length], fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    View <ArrowRight size={13} strokeWidth={2.5} />
                  </span>
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
    </div>
  );
}
