export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: '1rem'
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading…</p>
      </div>
    );
  }
  return (
    <div className="loader-center">
      <div className="spinner" />
    </div>
  );
}
