import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import Loader from '../components/Loader';
import { Info, FileText, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WorkshopTypeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/workshops/types/${id}/`)
      .then(r => setType(r.data))
      .catch(() => navigate('/types'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (!type) return null;

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem', maxWidth: 760 }}>
      <Link
        to="/types"
        style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}
      >
        ← Back to Workshop Types
      </Link>

      {/* Header card */}
      <div className="glass-card mb-2" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.6rem', marginBottom: '0.5rem' }}>{type.name}</h1>
            <span className="badge badge-info" style={{ fontSize: '0.8rem' }}>
              🗓️ {type.duration} day{type.duration !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Only coordinators can propose */}
          {user && !user.is_instructor && (
            <Link to="/propose" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Propose This Workshop
            </Link>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="glass-card mb-2" style={{ padding: '2rem' }}>
        <div className="section-title"><Info size={15} strokeWidth={2} /> About This Workshop</div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
          {type.description}
        </p>
      </div>

      {/* Terms & Conditions */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div className="section-title"><FileText size={15} strokeWidth={2} /> Terms &amp; Conditions</div>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10,
          padding: '1.25rem 1.5rem',
          marginTop: '1rem',
        }}>
          {type.terms_and_conditions
            ? type.terms_and_conditions.split('\n').map((line, i) => (
                <p key={i} style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                  {line}
                </p>
              ))
            : <p style={{ color: 'var(--text-dim)' }}>No terms available.</p>
          }
        </div>
      </div>
    </div>
  );
}
