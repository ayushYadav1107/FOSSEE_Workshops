import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import toast from 'react-hot-toast';
import './RegisterPage.css';

/* ── Inline SVG icons (Lucide-style, stroke-based) ────────────────── */
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const IconUser     = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const IconMail     = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6" />;
const IconLock     = () => <Icon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" />;
const IconPhone    = () => <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.1 3.4 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6.72 6.72l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;
const IconBuilding = () => <Icon d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18H6zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4" />;
const IconCheck    = () => <Icon d="M20 6L9 17l-5-5" />;
const IconArrow    = () => <Icon d="M5 12h14M12 5l7 7-7 7" />;
const IconAccount  = () => <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 14a10 10 0 0 1-8-4c.02-2.65 5.34-4 8-4s7.98 1.35 8 4A10 10 0 0 1 12 22z" />;
const IconPerson   = () => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />;
const IconOffice   = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10" />;
const IconWarn     = () => <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />;

const STEPS = [
  { label: 'Account',   Icon: IconAccount,  desc: 'Set your credentials' },
  { label: 'Personal',  Icon: IconPerson,   desc: 'Tell us about you' },
  { label: 'Institute', Icon: IconOffice,   desc: 'Your organisation' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [choices, setChoices] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});
  const [form, setForm]       = useState({
    username: '', email: '', password: '', confirm_password: '',
    title: '', first_name: '', last_name: '',
    phone_number: '', how_did_you_hear_about_us: '',
    institute: '', department: '', location: '', state: '',
  });

  useEffect(() => {
    client.get('/choices/').then(r => {
      const d = r.data;
      setChoices(d);
      // Auto-select first valid option for every required ChoiceField
      // so we never send an empty string to Django's ChoiceField validators
      setForm(f => ({
        ...f,
        title:                    f.title                    || (d.titles?.[0]?.[0]  ?? ''),
        department:               f.department               || (d.departments?.[0]?.[0] ?? ''),
        state:                    f.state                    || (d.states?.find(([v]) => v)?.[0] ?? ''),
        how_did_you_hear_about_us: f.how_did_you_hear_about_us || (d.sources?.[0]?.[0] ?? ''),
      }));
    }).catch(() => {});
  }, []);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.username.trim())              errs.username = ['Username is required.'];
      else if (!/^[\w.]+$/.test(form.username)) errs.username = ['Letters, digits, period and underscore only.'];
      if (!form.email.trim())                 errs.email = ['Email is required.'];
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = ['Enter a valid email address.'];
      if (!form.password)                     errs.password = ['Password is required.'];
      else if (form.password.length < 8)      errs.password = ['Password must be at least 8 characters.'];
      if (!form.confirm_password)             errs.confirm_password = ['Please confirm your password.'];
      else if (form.password !== form.confirm_password) errs.confirm_password = ['Passwords do not match.'];
    }
    if (s === 1) {
      if (!form.first_name.trim()) errs.first_name = ['First name is required.'];
      if (!form.last_name.trim())  errs.last_name  = ['Last name is required.'];
      if (!form.phone_number.trim())                errs.phone_number = ['Phone number is required.'];
      else if (!/^\d{10}$/.test(form.phone_number)) errs.phone_number = ['Enter a valid 10-digit number.'];
      if (!form.how_did_you_hear_about_us) errs.how_did_you_hear_about_us = ['Please select an option.'];
    }
    if (s === 2) {
      if (!form.institute.trim())  errs.institute  = ['Institute name is required.'];
      if (!form.department)        errs.department = ['Please select a department.'];
      if (!form.state)             errs.state      = ['Please select a state.'];
    }
    return errs;
  };

  const goStep = (next) => {
    const errs = validateStep(step);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(2);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setErrors({});
    try {
      // Django requires location as a non-empty CharField — fall back to a single space
      const payload = { ...form, location: form.location.trim() || '-' };
      await client.post('/register/', payload);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const serverErrs = err.response?.data?.errors || {};
      setErrors(serverErrs);
      const allMsgs = Object.values(serverErrs).flat();
      if (allMsgs.length) toast.error(allMsgs[0]);
      else toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const FieldError = ({ k }) => errors[k]?.[0] ? (
    <span className="reg-field-error">
      <IconWarn />{errors[k][0]}
    </span>
  ) : null;

  const progress = (step / (STEPS.length - 1)) * 100;

  return (
    <div className="reg-page">
      <div className="reg-blob reg-blob-1" />
      <div className="reg-blob reg-blob-2" />

      <div className="reg-wrapper animate-slide-up">

        {/* ── Step Indicator ─────────────────────────────────── */}
        <div className="reg-steps">
          <div className="reg-steps-track">
            <div className="reg-steps-progress" style={{ width: `${progress}%` }} />
          </div>
          {STEPS.map(({ label, Icon: StepIcon }, i) => (
            <div key={label} className={`reg-step-item ${i <= step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <div className="reg-step-circle">
                {i < step ? <IconCheck /> : <StepIcon />}
              </div>
              <span className="reg-step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Card ───────────────────────────────────────────── */}
        <div className="glass-card reg-card">
          <div className="reg-card-header">
            <div className="reg-step-badge">Step {step + 1} of {STEPS.length}</div>
            <h2 className="reg-title">
              {step === 0 ? 'Create Account' : step === 1 ? 'Personal Details' : 'Institute Info'}
            </h2>
            <p className="reg-subtitle">{STEPS[step].desc}</p>
          </div>

          <form onSubmit={handleSubmit} noValidate autoComplete="off">

            {/* ── Step 0: Account ────────────────────────────── */}
            {step === 0 && (
              <div className="reg-fields animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Username <span className="reg-required">*</span></label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon"><IconUser /></span>
                    <input
                      className={`form-control reg-input-has-icon ${errors.username ? 'reg-input-error' : ''}`}
                      placeholder="e.g. mayank123"
                      value={form.username}
                      onChange={set('username')}
                      autoComplete="nope"
                    />
                  </div>
                  <span className="form-hint">Letters, digits, period and underscore only</span>
                  <FieldError k="username" />
                </div>

                <div className="form-group">
                  <label className="form-label">Email <span className="reg-required">*</span></label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon"><IconMail /></span>
                    <input
                      className={`form-control reg-input-has-icon ${errors.email ? 'reg-input-error' : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                      autoComplete="nope"
                    />
                  </div>
                  <FieldError k="email" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Password <span className="reg-required">*</span></label>
                    <div className="reg-input-wrap">
                      <span className="reg-input-icon"><IconLock /></span>
                      <input
                        className={`form-control reg-input-has-icon ${errors.password ? 'reg-input-error' : ''}`}
                        type="password"
                        placeholder="Min 8 chars"
                        value={form.password}
                        onChange={set('password')}
                        autoComplete="new-password"
                      />
                    </div>
                    <FieldError k="password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password <span className="reg-required">*</span></label>
                    <div className="reg-input-wrap">
                      <span className="reg-input-icon"><IconLock /></span>
                      <input
                        className={`form-control reg-input-has-icon ${errors.confirm_password ? 'reg-input-error' : ''}`}
                        type="password"
                        placeholder="Repeat password"
                        value={form.confirm_password}
                        onChange={set('confirm_password')}
                        autoComplete="new-password"
                      />
                    </div>
                    <FieldError k="confirm_password" />
                  </div>
                </div>

                {form.password && (
                  <div className="reg-strength">
                    <div className="reg-strength-bars">
                      {[1, 2, 3, 4].map(n => (
                        <div key={n} className={`reg-strength-bar ${getStrength(form.password) >= n ? `s${getStrength(form.password)}` : ''}`} />
                      ))}
                    </div>
                    <span className="reg-strength-label">{['', 'Weak', 'Fair', 'Good', 'Strong'][getStrength(form.password)]}</span>
                  </div>
                )}

                <button type="button" className="btn btn-primary w-full mt-2 reg-next-btn" onClick={() => goStep(1)}>
                  Continue <IconArrow />
                </button>
              </div>
            )}

            {/* ── Step 1: Personal ───────────────────────────── */}
            {step === 1 && (
              <div className="reg-fields animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Title <span className="reg-required">*</span></label>
                  <select className="form-control" value={form.title} onChange={set('title')}>
                    {(choices.titles || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name <span className="reg-required">*</span></label>
                    <input
                      className={`form-control ${errors.first_name ? 'reg-input-error' : ''}`}
                      placeholder="Mayank"
                      value={form.first_name}
                      onChange={set('first_name')}
                      autoComplete="nope"
                    />
                    <FieldError k="first_name" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name <span className="reg-required">*</span></label>
                    <input
                      className={`form-control ${errors.last_name ? 'reg-input-error' : ''}`}
                      placeholder="Kumar"
                      value={form.last_name}
                      onChange={set('last_name')}
                      autoComplete="nope"
                    />
                    <FieldError k="last_name" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number <span className="reg-required">*</span></label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon"><IconPhone /></span>
                    <input
                      className={`form-control reg-input-has-icon ${errors.phone_number ? 'reg-input-error' : ''}`}
                      placeholder="10-digit mobile number"
                      value={form.phone_number}
                      onChange={set('phone_number')}
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="nope"
                    />
                  </div>
                  <FieldError k="phone_number" />
                </div>

                <div className="form-group">
                  <label className="form-label">How did you hear about us? <span className="reg-required">*</span></label>
                  <select
                    className={`form-control ${errors.how_did_you_hear_about_us ? 'reg-input-error' : ''}`}
                    value={form.how_did_you_hear_about_us}
                    onChange={set('how_did_you_hear_about_us')}
                  >
                    {(choices.sources || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <FieldError k="how_did_you_hear_about_us" />
                </div>

                <div className="reg-nav-btns">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>← Back</button>
                  <button type="button" className="btn btn-primary w-full reg-next-btn" onClick={() => goStep(2)}>
                    Continue <IconArrow />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Institute ──────────────────────────── */}
            {step === 2 && (
              <div className="reg-fields animate-fade-in">
                <div className="form-group">
                  <label className="form-label">Institute / Organisation <span className="reg-required">*</span></label>
                  <div className="reg-input-wrap">
                    <span className="reg-input-icon"><IconBuilding /></span>
                    <input
                      className={`form-control reg-input-has-icon ${errors.institute ? 'reg-input-error' : ''}`}
                      placeholder="Full name of your institute"
                      value={form.institute}
                      onChange={set('institute')}
                      autoComplete="nope"
                    />
                  </div>
                  <FieldError k="institute" />
                </div>

                <div className="form-group">
                  <label className="form-label">Department <span className="reg-required">*</span></label>
                  <select
                    className={`form-control ${errors.department ? 'reg-input-error' : ''}`}
                    value={form.department}
                    onChange={set('department')}
                  >
                    <option value="">Select department…</option>
                    {(choices.departments || []).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <FieldError k="department" />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">City / Location</label>
                    <input
                      className="form-control"
                      placeholder="e.g. Bhopal"
                      value={form.location}
                      onChange={set('location')}
                      autoComplete="nope"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State <span className="reg-required">*</span></label>
                    <select
                      className={`form-control ${errors.state ? 'reg-input-error' : ''}`}
                      value={form.state}
                      onChange={set('state')}
                    >
                      <option value="">Select state…</option>
                      {(choices.states || []).filter(([v]) => v).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    <FieldError k="state" />
                  </div>
                </div>

                {/* Account summary */}
                <div className="reg-summary">
                  <p className="reg-summary-title">Registering as</p>
                  <div className="reg-summary-grid">
                    <span>Username</span><strong>{form.username}</strong>
                    <span>Email</span><strong>{form.email}</strong>
                    <span>Name</span><strong>{form.first_name} {form.last_name}</strong>
                  </div>
                </div>

                <div className="reg-nav-btns">
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="btn btn-primary w-full reg-next-btn" disabled={loading}>
                    {loading
                      ? <><span className="reg-spinner" /> Registering…</>
                      : <><IconCheck /> Register</>}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="divider" />
          <p className="reg-signin-text">
            Already have an account?{' '}
            <Link to="/login" className="reg-signin-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
