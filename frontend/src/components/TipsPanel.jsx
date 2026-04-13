import { useState } from 'react';

/**
 * Dismissible tips panel. Tips are remembered in localStorage so they
 * don't appear again once the user closes them.
 *
 * Props:
 *   storageKey  – unique localStorage key (e.g. 'tips_coordinator')
 *   title       – panel heading
 *   tips        – array of { icon, text } objects
 */
export default function TipsPanel({ storageKey, title = '💡 Quick Tips', tips = [] }) {
  const [visible, setVisible] = useState(() => {
    try { return !localStorage.getItem(storageKey); }
    catch { return true; }
  });

  const dismiss = () => {
    try { localStorage.setItem(storageKey, '1'); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible || tips.length === 0) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(6,182,212,0.08) 100%)',
      border: '1px solid rgba(79,70,229,0.25)',
      borderRadius: 14,
      padding: '1.25rem 1.5rem',
      marginBottom: '1.75rem',
      position: 'relative',
    }}>
      {/* Dismiss button */}
      <button
        onClick={dismiss}
        title="Dismiss tips"
        style={{
          position: 'absolute', top: '0.75rem', right: '0.75rem',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-dim)', fontSize: '1.1rem', lineHeight: 1,
          padding: '2px 6px', borderRadius: 6,
        }}
      >✕</button>

      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.9rem', color: 'var(--text)' }}>
        {title}
      </div>

      <div className="tips-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.65rem' }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{tip.icon}</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
