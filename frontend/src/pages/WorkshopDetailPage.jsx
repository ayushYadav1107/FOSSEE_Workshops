import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function WorkshopDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [posting, setPosting] = useState(false);

  const fetchData = () => {
    client.get(`/workshops/${id}/`).then(r => setWorkshop(r.data)).catch(() => navigate('/status')).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      await client.post(`/workshops/${id}/`, { comment, public: isPublic });
      toast.success('Comment posted!');
      setComment('');
      fetchData();
    } catch { toast.error('Failed to post comment'); }
    finally { setPosting(false); }
  };

  if (loading) return <Loader />;
  if (!workshop) return null;

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?';

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem', maxWidth: 800 }}>
      <Link to={user?.is_instructor ? '/dashboard' : '/status'} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}>
        ← Back
      </Link>

      {/* Workshop Info Card */}
      <div className="glass-card mb-2" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
        <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.4rem' }}>{workshop.workshop_type}</h2>
          <StatusBadge status={workshop.status} />
        </div>
        <div className="grid-2" style={{ gap: '1rem' }}>
          {[
            ['👤 Coordinator', <Link key="coord" to={`/profile/${workshop.coordinator_id}`} style={{ color: 'var(--accent)' }}>{workshop.coordinator_name}</Link>],
            ['🏫 Institute', workshop.institute],
            ['📅 Date', new Date(workshop.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
              <div style={{ color: 'var(--text)', fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      <div className="glass-card mb-2" style={{ padding: '1.75rem' }}>
        <div className="section-title">💬 Comments ({workshop.comments?.length || 0})</div>
        {(!workshop.comments || workshop.comments.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>No comments yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {workshop.comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div className="avatar">{initials(c.author)}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex-center gap-1 mb-1">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.author}</span>
                    {!c.public && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Private</span>}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginLeft: 'auto' }}>
                      {new Date(c.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post comment */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div className="section-title">✏️ Add Comment</div>
        <form onSubmit={handleComment}>
          <div className="form-group">
            <textarea className="form-control" rows={3} placeholder="Write your comment…"
              value={comment} onChange={e => setComment(e.target.value)} required />
          </div>
          {user?.is_instructor && (
            <label className="checkbox-group mb-2">
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Make this comment public</span>
            </label>
          )}
          <button type="submit" className="btn btn-primary" disabled={posting}>
            {posting ? '⏳ Posting…' : '💬 Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
}
