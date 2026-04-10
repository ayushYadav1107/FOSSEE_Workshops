export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '1.5rem',
      textAlign: 'center',
      borderTop: '1px solid var(--card-border)',
      background: 'rgba(15,15,26,0.8)',
      backdropFilter: 'blur(10px)',
    }}>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        Developed by{' '}
        <span style={{
          background: 'linear-gradient(135deg, var(--primary-light), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 600,
        }}>
          FOSSEE Group, IIT Bombay
        </span>
      </p>
    </footer>
  );
}
