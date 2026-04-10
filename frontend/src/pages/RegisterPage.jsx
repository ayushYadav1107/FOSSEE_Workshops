import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Personal', 'Institute'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirm_password: '',
    title: '', first_name: '', last_name: '',
    phone_number: '', institute: '', department: '',
    location: '', state: '', how_did_you_hear_about_us: '',
  });

  useEffect(() => {
    client.get('/choices/').then(r => setChoices(r.data)).catch(() => {});
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await client.post('/register/', form);
      toast.success('Registered! Please verify your email.');
      navigate('/activate');
    } catch (err) {
      const errs = err.response?.data?.errors || {};
      setErrors(errs);
      const allMsgs = Object.values(errs).flat();
      if (allMsgs.length) toast.error(allMsgs[0]);
      else toast.error('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (key) => errors[key]?.[0] && (
    <span className="form-error">{errors[key][0]}</span>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 1.5rem 2rem' }}>
      <div style={{ width: '100%', maxWidth: 540 }} className="animate-slide-up">
        {/* Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: i <= step ? 'linear-gradient(135deg, var(--primary), var(--accent))' : 'var(--card)',
                border: `1px solid ${i <= step ? 'transparent' : 'var(--card-border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.78rem', fontWeight: 700,
                color: i <= step ? 'white' : 'var(--text-dim)',
                transition: 'all 0.3s ease',
              }}>{i + 1}</div>
              <span style={{ fontSize: '0.8rem', color: i === step ? 'var(--text)' : 'var(--text-dim)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
              {i < STEPS.length - 1 && <span style={{ color: 'var(--card-border)', fontSize: '0.8rem', margin: '0 4px' }}>──</span>}
            </div>
          ))}
        </div>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
            Join the FOSSEE workshop network
          </p>

          <form onSubmit={handleSubmit}>
            {/* Step 0: Account */}
            {step === 0 && (
              <div className="animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Username *</label>
                  <input className="form-control" placeholder="e.g. john.doe" value={form.username} onChange={set('username')} required />
                  <span className="form-hint">Letters, digits, period and underscore only</span>
                  {fieldError('username')}
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                  {fieldError('email')}
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input className="form-control" type="password" placeholder="Min 8 chars" value={form.password} onChange={set('password')} required />
                    {fieldError('password')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={set('confirm_password')} required />
                    {fieldError('confirm_password')}
                  </div>
                </div>
                <button type="button" className="btn btn-primary w-full mt-2" onClick={() => setStep(1)}>
                  Continue →
                </button>
              </div>
            )}

            {/* Step 1: Personal */}
            {step === 1 && (
              <div className="animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <select className="form-control" value={form.title} onChange={set('title')}>
                    {(choices.titles || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input className="form-control" placeholder="John" value={form.first_name} onChange={set('first_name')} required />
                    {fieldError('first_name')}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input className="form-control" placeholder="Doe" value={form.last_name} onChange={set('last_name')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-control" placeholder="10-digit number" value={form.phone_number} onChange={set('phone_number')} required maxLength={10} />
                  {fieldError('phone_number')}
                </div>
                <div className="form-group">
                  <label className="form-label">How did you hear about us?</label>
                  <select className="form-control" value={form.how_did_you_hear_about_us} onChange={set('how_did_you_hear_about_us')}>
                    <option value="">Select…</option>
                    {(choices.sources || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="flex gap-1 mt-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  <button type="button" className="btn btn-primary w-full" onClick={() => setStep(2)}>Continue →</button>
                </div>
              </div>
            )}

            {/* Step 2: Institute */}
            {step === 2 && (
              <div className="animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Institute / Organisation *</label>
                  <input className="form-control" placeholder="Full name of your institute" value={form.institute} onChange={set('institute')} required />
                  {fieldError('institute')}
                </div>
                <div className="form-group">
                  <label className="form-label">Department *</label>
                  <select className="form-control" value={form.department} onChange={set('department')} required>
                    <option value="">Select department…</option>
                    {(choices.departments || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City / Location</label>
                    <input className="form-control" placeholder="Mumbai" value={form.location} onChange={set('location')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <select className="form-control" value={form.state} onChange={set('state')} required>
                      <option value="">Select state…</option>
                      {(choices.states || []).filter(([v]) => v).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? '⏳ Registering…' : '✓ Register'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="divider" />
          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
