import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import { PenLine, LayoutList } from 'lucide-react';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [choices, setChoices] = useState({});
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    Promise.all([client.get('/profile/'), client.get('/choices/')])
      .then(([profR, choiceR]) => {
        setData(profR.data);
        setChoices(choiceR.data);
        setForm({
          first_name: profR.data.first_name, last_name: profR.data.last_name,
          ...profR.data.profile,
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post('/profile/update/', form);
      toast.success('Profile updated!');
      await refreshUser();
      setEditing(false);
      const r = await client.get('/profile/');
      setData(r.data);
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <Loader />;

  const initials = `${data?.first_name?.[0] || ''}${data?.last_name?.[0] || ''}`.toUpperCase() || data?.username?.[0]?.toUpperCase();

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem', maxWidth: 700 }}>
      {/* Profile header */}
      <div className="glass-card mb-2" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg">{initials}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.25rem' }}>
              {data?.first_name} {data?.last_name}
            </h2>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{data?.email}</div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={`badge ${user?.is_instructor ? 'badge-primary' : 'badge-info'}`}>
                {user?.is_instructor ? '🎓 Instructor' : '📋 Coordinator'}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(e => !e)}>
            {editing ? '✕ Cancel' : '✏️ Edit'}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="section-title"><PenLine size={15} strokeWidth={2} /> Edit Profile</div>
          <form onSubmit={handleSave}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input className="form-control" value={form.first_name || ''} onChange={set('first_name')} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={form.last_name || ''} onChange={set('last_name')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-control" value={form.phone_number || ''} onChange={set('phone_number')} maxLength={10} />
            </div>
            <div className="form-group">
              <label className="form-label">Institute</label>
              <input className="form-control" value={form.institute || ''} onChange={set('institute')} />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-control" value={form.department || ''} onChange={set('department')}>
                {(choices.departments || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-control" value={form.location || ''} onChange={set('location')} />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <select className="form-control" value={form.state || ''} onChange={set('state')}>
                  {(choices.states || []).filter(([v]) => v).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-1 mt-2">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving…' : '✓ Save Changes'}</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div className="section-title"><LayoutList size={15} strokeWidth={2} /> Profile Details</div>
          <div className="grid-2" style={{ gap: '1.5rem' }}>
            {[
              ['Institute', data?.profile?.institute],
              ['Department', data?.profile?.department],
              ['Phone', data?.profile?.phone_number],
              ['Location', data?.profile?.location],
              ['State', data?.profile?.state],
              ['Position', data?.profile?.position],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ color: value ? 'var(--text)' : 'var(--text-dim)', fontWeight: 500 }}>{value || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
