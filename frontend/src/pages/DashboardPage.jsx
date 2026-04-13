import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import TipsPanel from '../components/TipsPanel';
import { Clock, CheckCircle, CalendarDays, User, MessageSquare, BarChart2 } from 'lucide-react';

const INSTRUCTOR_TIPS = [
  { icon: <Clock size={15} strokeWidth={2} />, text: 'Pending coordinator date requests are waiting for your review.' },
  { icon: <CheckCircle size={15} strokeWidth={2} />, text: 'Click "Accept" on a request to confirm it. This cannot be undone.' },
  { icon: <CalendarDays size={15} strokeWidth={2} />, text: 'You can reschedule any upcoming confirmed workshop from the table.' },
  { icon: <User size={15} strokeWidth={2} />, text: "Click a coordinator's name to see their profile and full workshop history." },
  { icon: <MessageSquare size={15} strokeWidth={2} />, text: 'Open any workshop to add private or public comments for the coordinator.' },
  { icon: <BarChart2 size={15} strokeWidth={2} />, text: 'Check the Statistics page for a nationwide overview of workshops.' },
];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changingDate, setChangingDate] = useState(null);
  const [newDate, setNewDate] = useState('');

  const fetch = () => {
    client.get('/workshops/status/').then(r => setData(r.data)).catch(() => toast.error('Failed to load workshops')).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleAccept = async (id, workshopType) => {
    if (!window.confirm(`Once accepted you cannot reject. Accept "${workshopType}"?`)) return;
    try {
      await client.post(`/workshops/accept/${id}/`);
      toast.success('Workshop accepted!');
      fetch();
    } catch { toast.error('Failed to accept workshop'); }
  };

  const handleDateChange = async (id) => {
    if (!newDate) return;
    try {
      await client.post(`/workshops/change-date/${id}/`, { new_date: newDate });
      toast.success('Date updated!');
      setChangingDate(null);
      setNewDate('');
      fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to update date'); }
  };

  if (loading) return <Loader />;

  const accepted = data?.workshops?.filter(w => w.status === 1) || [];
  const pending  = data?.workshops?.filter(w => w.status === 0 && w.tnc_accepted) || [];

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem' }}>
      <div className="flex-between mb-2" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Review Workshop Requests</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Coordinators propose dates → you accept to confirm the booking</p>
        </div>
        <div className="flex gap-1">
          <span className="badge badge-success">✓ {accepted.length} Accepted</span>
          <span className="badge badge-warning">⏳ {pending.length} Pending</span>
        </div>
      </div>

      <TipsPanel
        storageKey="tips_instructor"
        title="💡 Getting Started — Instructor Guide"
        tips={INSTRUCTOR_TIPS}
      />
      {/* Pending Proposals */}
      <div className="glass-card mb-2" style={{ padding: '1.5rem' }}>
        <div className="section-title"><Clock size={15} strokeWidth={2} /> Pending Coordinator Requests</div>
        {pending.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">📭</div>
            <h3>No pending proposals</h3>
            <p>All proposals have been reviewed</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Coordinator</th>
                  <th>Institute</th>
                  <th>Workshop</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map(w => (
                  <tr key={w.id}>
                    <td>
                      <Link to={`/profile/${w.coordinator_id}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>
                        {w.coordinator_name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{w.institute}</td>
                    <td>{w.workshop_type}</td>
                    <td>{new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td><StatusBadge status={w.status} /></td>
                    <td>
                      <button className="btn btn-success btn-sm" onClick={() => handleAccept(w.id, w.workshop_type)}>
                        ✓ Accept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div className="section-title"><CheckCircle size={15} strokeWidth={2} /> Confirmed Bookings — Booked Workshops</div>
        {accepted.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-state-icon">📅</div>
            <h3>No confirmed bookings yet</h3>
            <p>Accept a pending request above to confirm a workshop</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Coordinator</th>
                  <th>Institute</th>
                  <th>Workshop</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {accepted.map(w => (
                  <tr key={w.id}>
                    <td>
                      <Link to={`/profile/${w.coordinator_id}`} style={{ color: 'var(--accent)', fontWeight: 500 }}>
                        {w.coordinator_name}
                      </Link>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{w.institute}</td>
                    <td>{w.workshop_type}</td>
                    <td>
                      <div className="flex-center gap-1">
                        {new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {new Date(w.date) > new Date() && (
                          changingDate === w.id ? (
                            <div className="flex-center gap-1">
                              <input type="date" className="form-control" style={{ width: 150, padding: '4px 8px', fontSize: '0.8rem' }}
                                value={newDate} onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                              <button className="btn btn-accent btn-sm" onClick={() => handleDateChange(w.id)}>Save</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setChangingDate(null)}>✕</button>
                            </div>
                          ) : (
                            <button className="btn btn-ghost btn-sm" title="Change date" onClick={() => { setChangingDate(w.id); setNewDate(''); }}>📅</button>
                          )
                        )}
                      </div>
                    </td>
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
