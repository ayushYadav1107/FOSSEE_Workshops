import { Link } from 'react-router-dom';

export default function ActivationPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-card animate-slide-up" style={{ textAlign: 'center', padding: '3rem 2.5rem', maxWidth: 440, width: '100%' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📧</div>
        <h2 style={{ fontWeight: 800, marginBottom: '0.75rem' }}>Check Your Email</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2rem' }}>
          We've sent a verification link to your email address. Please click the link to activate your account before logging in.
        </p>
        <div className="alert alert-info mb-2">
          💡 The activation link expires in 24 hours. Check your spam folder if you don't see the email.
        </div>
        <Link to="/login" className="btn btn-primary w-full mt-2">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}
