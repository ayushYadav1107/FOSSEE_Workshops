import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { User, GraduationCap, MessageSquare, PenLine, ArrowLeft, Calendar } from 'lucide-react';

const DetailRow = ({ icon, label, value }) =>
  value ? (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.65rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: '1rem', width: 20, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{label}</div>
        <div style={{ color: 'var(--text)', fontWeight: 500, fontSize: '0.95rem' }}>{value}</div>
      </div>
    </div>
  ) : null;

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
    client.get(`/workshops/${id}/`)
      .then(r => setWorkshop(r.data))
      .catch(() => navigate(user?.is_instructor ? '/dashboard' : '/status'))
      .finally(() => setLoading(false));
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

  const initials = (name) =>
    name?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?';

  const statusColor = workshop.status === 1 ? 'var(--success)' : workshop.status === 2 ? 'var(--danger)' : 'var(--warning)';

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem', maxWidth: 860 }}>
      <Link
        to={user?.is_instructor ? '/dashboard' : '/status'}
        style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}
      >
        <ArrowLeft size={15} strokeWidth={2} /> Back
      </Link>

      <div className="glass-card mb-2" style={{ padding: '2rem', borderLeft: `4px solid ${statusColor}` }}>
        <div className="flex-between mb-1" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.4rem' }}>
              {workshop.workshop_type}
            </h1>
            <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
              <StatusBadge status={workshop.status} />
              {workshop.workshop_duration && (
                <span className="badge badge-info">🗓️ {workshop.workshop_duration} day{workshop.workshop_duration !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
          <Link to={`/types/${workshop.workshop_type_id}`} style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 600 }}>
            View Workshop Type →
          </Link>
        </div>
        {workshop.workshop_description && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7, marginTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
            {workshop.workshop_description.substring(0, 300)}{workshop.workshop_description.length > 300 ? '…' : ''}
          </p>
        )}
      </div>

      <div className="detail-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="section-title" style={{ marginBottom: '0.5rem' }}><User size={15} strokeWidth={2} /> Coordinator</div>
          <DetailRow icon="🙍" label="Name" value={
            <Link to={`/profile/${workshop.coordinator_id}`} style={{ color: 'var(--accent)' }}>
              {workshop.coordinator_name}
            </Link>
          } />
          <DetailRow icon="🏫" label="Institute"       value={workshop.institute} />
          <DetailRow icon="📍" label="City / Location"  value={workshop.location} />
          <DetailRow icon="🗺️" label="State"           value={workshop.state} />
          <DetailRow icon="📞" label="Phone"           value={workshop.coordinator_phone} />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="section-title" style={{ marginBottom: '0.5rem' }}><GraduationCap size={15} strokeWidth={2} /> Instructor</div>
          {workshop.instructor_name ? (
            <>
              <DetailRow icon="🙍" label="Name"  value={workshop.instructor_name} />
              <DetailRow icon="📞" label="Phone" value={workshop.instructor_phone} />
              <DetailRow icon="📅" label="Workshop Date" value={
                new Date(workshop.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              } />
            </>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: '0.875rem', paddingTop: '0.5rem' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>⏳</span>
              Awaiting instructor assignment
            </div>
          )}
          {!workshop.instructor_name && (
            <DetailRow icon="📅" label="Proposed Date" value={
              new Date(workshop.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
            } />
          )}
        </div>
      </div>

      <div className="glass-card mb-2" style={{ padding: '1.75rem' }}>
        <div className="section-title"><MessageSquare size={15} strokeWidth={2} /> Comments ({workshop.comments?.length || 0})</div>
        {(!workshop.comments || workshop.comments.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>No comments yet. Be the first to add one!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {workshop.comments.map(c => (
              <div key={c.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div className="avatar">{initials(c.author)}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex-center gap-1 mb-1">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.author}</span>
                    {!c.public && <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Private</span>}
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginLeft: 'auto' }}>
                      {new Date(c.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <div className="section-title"><PenLine size={15} strokeWidth={2} /> Add Comment</div>
        <form onSubmit={handleComment}>
          <div className="form-group">
            <textarea className="form-control" rows={3} placeholder="Write your comment…"
              value={comment} onChange={e => setComment(e.target.value)} required />
          </div>
          {user?.is_instructor && (
            <label className="checkbox-group mb-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Make this comment public (visible to coordinator)</span>
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
