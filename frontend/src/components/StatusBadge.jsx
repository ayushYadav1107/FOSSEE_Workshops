export default function StatusBadge({ status }) {
  const map = {
    0: { label: 'Pending',  cls: 'badge-warning' },
    1: { label: 'Accepted', cls: 'badge-success' },
    2: { label: 'Deleted',  cls: 'badge-danger'  },
  };
  const { label, cls } = map[status] ?? { label: 'Unknown', cls: 'badge-info' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
