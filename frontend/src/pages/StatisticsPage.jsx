import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { BarChart2, SlidersHorizontal, List } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function StatisticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from_date: '', to_date: '', state: '', workshop_type: '' });
  const [page, setPage] = useState(1);
  const [activeChart, setActiveChart] = useState('bar');

  const fetch = (f = filters, p = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ ...f, page: p });
    Object.keys(f).forEach(k => !f[k] && params.delete(k));
    client.get(`/statistics/public/?${params}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    setPage(1);
    fetch(filters, 1);
  };

  const set = k => e => setFilters(f => ({ ...f, [k]: e.target.value }));

  const barData = data?.chart?.states?.map((s, i) => ({ name: s, count: data.chart.state_counts[i] })) || [];
  const pieData = data?.chart?.types?.map((t, i) => ({ name: t, value: data.chart.type_counts[i] })) || [];

  return (
    <div className="page-container animate-fade-in" style={{ paddingTop: '5rem' }}>
      <h1 className="page-title mb-1">Workshop Statistics</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Public overview of workshops across India
      </p>

      <div className="stats-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Filters */}
        <div className="glass-card stats-filter-sticky" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
          <div className="section-title"><SlidersHorizontal size={15} strokeWidth={2} /> Filters</div>
          <form onSubmit={handleFilter}>
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" className="form-control" value={filters.from_date} onChange={set('from_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" className="form-control" value={filters.to_date} onChange={set('to_date')} />
            </div>
            <div className="form-group">
              <label className="form-label">Workshop Type</label>
              <select className="form-control" value={filters.workshop_type} onChange={set('workshop_type')}>
                <option value="">All types</option>
                {(data?.filter_options?.workshop_types || []).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <select className="form-control" value={filters.state} onChange={set('state')}>
                <option value="">All states</option>
                {(data?.filter_options?.states || []).map(s => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFilters({ from_date: '', to_date: '', state: '', workshop_type: '' }); fetch({}, 1); }}>
                Clear
              </button>
              <button type="submit" className="btn btn-primary btn-sm w-full">View</button>
            </div>
          </form>
        </div>

        {/* Main content */}
        <div>
          {/* Charts */}
          {(barData.length > 0 || pieData.length > 0) && (
            <div className="glass-card mb-2" style={{ padding: '1.5rem' }}>
              <div className="flex-between mb-2">
                <div className="section-title" style={{ margin: 0 }}><BarChart2 size={15} strokeWidth={2} /> Charts</div>
                <div className="flex gap-1">
                  <button className={`btn btn-sm ${activeChart === 'bar' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveChart('bar')}>State</button>
                  <button className={`btn btn-sm ${activeChart === 'pie' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveChart('pie')}>Type</button>
                </div>
              </div>
              {activeChart === 'bar' && barData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {activeChart === 'pie' && pieData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Table */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div className="flex-between mb-2">
              <div className="section-title" style={{ margin: 0 }}><List size={15} strokeWidth={2} /> Workshops</div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Page {data?.current_page} of {data?.num_pages}
              </span>
            </div>
            {loading ? <Loader /> : (
              <>
                <div style={{ overflowX: 'auto' }}>
                  <table className="modern-table">
                    <thead>
                      <tr><th>#</th><th>Coordinator</th><th>Institute</th><th>Instructor</th><th>Workshop</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                      {(data?.workshops || []).map((w, i) => (
                        <tr key={w.id}
                          onClick={() => window.location.href = `/workshops/${w.id}`}
                          style={{ cursor: 'pointer' }}
                          title="Click to view full workshop details"
                        >
                          <td style={{ color: 'var(--text-dim)' }}>{i + 1}</td>
                          <td style={{ fontWeight: 500, color: 'var(--accent)' }}>{w.coordinator_name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{w.institute}</td>
                          <td style={{ color: 'var(--text-muted)' }}>{w.instructor_name || '—'}</td>
                          <td>{w.workshop_type}</td>
                          <td style={{ color: 'var(--text-muted)' }}>
                            {new Date(w.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!data?.workshops?.length) && (
                    <div className="empty-state"><div className="empty-state-icon">📭</div><h3>No workshops found</h3><p>Try adjusting your filters</p></div>
                  )}
                </div>
                {data?.num_pages > 1 && (
                  <div className="flex-center gap-1 mt-2" style={{ justifyContent: 'center' }}>
                    <button className="btn btn-ghost btn-sm" disabled={!data.has_previous} onClick={() => { setPage(p => p - 1); fetch(filters, page - 1); }}>← Prev</button>
                    <button className="btn btn-ghost btn-sm" disabled={!data.has_next} onClick={() => { setPage(p => p + 1); fetch(filters, page + 1); }}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
