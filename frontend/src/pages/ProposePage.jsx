import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';

export default function ProposePage() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [tnc, setTnc] = useState('');
  const [showTnc, setShowTnc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ workshop_type: '', date: '', tnc_accepted: false });

  const minDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  })();
  const maxDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    client.get('/workshops/types/').then(r => setTypes(r.data.types)).catch(() => {});
  }, []);

  const handleTypeChange = async (e) => {
    const id = e.target.value;
    setForm(f => ({ ...f, workshop_type: id }));
    if (id) {
      try {
        const r = await client.get(`/workshops/types/${id}/tnc/`);
        setTnc(r.data.tnc);
      } catch { setTnc(''); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.tnc_accepted) { toast.error('Please accept T&C to proceed'); return; }
    setLoading(true); setErrors({});
    try {
      await client.post('/workshops/propose/', form);
      toast.success('Workshop proposed successfully!');
      navigate('/status');
    } catch (err) {
      const errs = err.response?.data?.errors || {};
      setErrors(errs);
      toast.error(err.response?.data?.error || Object.values(errs).flat()[0] || 'Failed to propose');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 560 }} className="animate-slide-up">
        <h1 className="page-title mb-1">Propose a Workshop</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Select a workshop type and your preferred date
        </p>

        <div className="alert alert-info mb-2">
          💡 Check <a href="/types" style={{ color: 'var(--accent)' }}>Workshop Types</a> before proposing to understand the content.
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Workshop Type *</label>
              <select className="form-control" value={form.workshop_type} onChange={handleTypeChange} required>
                <option value="">Select a workshop…</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.duration} day{t.duration !== 1 ? 's' : ''})</option>)}
              </select>
              {errors.workshop_type && <span className="form-error">{errors.workshop_type[0]}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Date *</label>
              <input type="date" className="form-control" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                min={minDate} max={maxDate} required />
              <span className="form-hint">Weekends allowed. Minimum 3 days from today.</span>
              {errors.date && <span className="form-error">{errors.date[0]}</span>}
            </div>

            {/* T&C */}
            {tnc && (
              <div style={{ marginBottom: '1.25rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTnc(p => !p)}>
                  📄 {showTnc ? 'Hide' : 'View'} Terms & Conditions
                </button>
                {showTnc && (
                  <div style={{
                    marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.03)',
                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--card-border)',
                    maxHeight: 200, overflowY: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)',
                    lineHeight: 1.6,
                  }}>
                    {tnc}
                  </div>
                )}
              </div>
            )}

            <label className="checkbox-group" style={{ marginBottom: '1.5rem' }}>
              <input type="checkbox" checked={form.tnc_accepted} onChange={e => setForm(f => ({ ...f, tnc_accepted: e.target.checked }))} />
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                I accept the <span style={{ color: 'var(--accent)' }}>terms and conditions</span>
              </span>
            </label>

            <div className="flex gap-1">
              <button type="button" className="btn btn-ghost" onClick={() => navigate('/status')}>Cancel</button>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                {loading ? '⏳ Submitting…' : '📝 Submit Proposal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
