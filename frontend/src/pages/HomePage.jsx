import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, PlusCircle, ClipboardList, BarChart2, User,
  ArrowRight, CheckCircle, Clock, CalendarCheck, FileStack
} from 'lucide-react';

const FlowStep = ({ number, label, sub, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
    <div style={{
      width: 44, height: 44, borderRadius: '50%',
      background: `${color}22`, border: `2px solid ${color}55`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: '0.85rem', color,
    }}>{number}</div>
    <div style={{ fontWeight: 700, fontSize: '0.82rem', textAlign: 'center', color: 'var(--text)' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.4 }}>{sub}</div>}
  </div>
);

const FlowArrow = () => (
  <div style={{ display: 'flex', alignItems: 'center', paddingTop: 14, color: 'var(--text-dim)', flexShrink: 0 }}>
    <ArrowRight size={18} strokeWidth={1.5} />
  </div>
);

const ActionCard = ({ icon, color, title, desc, to, cta }) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div
      className="glass-card"
      style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: `3px solid ${color}`, transition: 'all 0.2s ease', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem' }}>{title}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.55 }}>{desc}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color, fontSize: '0.8rem', fontWeight: 600 }}>
        {cta} <ArrowRight size={13} strokeWidth={2.5} />
      </div>
    </div>
  </Link>
);

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.first_name || user?.username || 'there';
  const role = user?.is_instructor ? 'Instructor' : 'Coordinator';

  return (
    <div style={{ paddingTop: '64px' }}>

      <div style={{
        minHeight: '52vh',
        background: `
          linear-gradient(to bottom, rgba(10,10,20,0.4) 0%, rgba(10,10,20,0.72) 55%, rgba(15,15,26,1) 100%),
          url('/campus_hero.png') center 30% / cover no-repeat
        `,
        display: 'flex',
        alignItems: 'center',
        padding: '4rem 2rem 5rem',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto', width: '100%', textAlign: 'center' }}>
          <span style={{
            display: 'inline-block', padding: '5px 16px', borderRadius: 100,
            background: 'rgba(79,70,229,0.2)', border: '1px solid rgba(99,102,241,0.4)',
            fontSize: '0.78rem', fontWeight: 700, color: '#a5b4fc',
            letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem',
          }}>
            {role} Portal · FOSSEE, IIT Bombay
          </span>

          <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '0.9rem' }}>
            Welcome back,{' '}
            <span style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {firstName}
            </span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 2.5rem' }}>
            {user?.is_instructor
              ? 'Review date proposals from coordinators, manage your schedule, and keep workshops on track.'
              : 'Propose a workshop date for your institute and get it confirmed by a FOSSEE instructor.'
            }
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user?.is_instructor ? '/dashboard' : '/propose'} className="btn btn-primary btn-lg">
              {user?.is_instructor ? <CalendarCheck size={17} /> : <PlusCircle size={17} />}
              {user?.is_instructor ? 'Review Requests' : 'Propose a Workshop'}
            </Link>
            <Link to={user?.is_instructor ? '/statistics' : '/status'} className="btn btn-ghost btn-lg">
              {user?.is_instructor ? <BarChart2 size={17} /> : <ClipboardList size={17} />}
              {user?.is_instructor ? 'View Statistics' : 'My Proposals'}
            </Link>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>

        {user?.is_instructor ? (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem' }}>Your Dashboard</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Coordinators propose a workshop date → you review and accept → workshop gets booked
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              <ActionCard
                icon={<FileStack size={22} strokeWidth={1.75} />}
                color="#f59e0b"
                title="Review Requests"
                desc="Coordinator date proposals waiting for your review and acceptance."
                to="/dashboard"
                cta="Go to Dashboard"
              />
              <ActionCard
                icon={<CheckCircle size={22} strokeWidth={1.75} />}
                color="#10b981"
                title="Confirmed Workshops"
                desc="Workshops you have already accepted and confirmed with coordinators."
                to="/dashboard"
                cta="View Schedule"
              />
              <ActionCard
                icon={<BookOpen size={22} strokeWidth={1.75} />}
                color="#4f46e5"
                title="Workshop Catalogue"
                desc="Browse all workshop types available on the platform."
                to="/types"
                cta="Browse Types"
              />
              <ActionCard
                icon={<BarChart2 size={22} strokeWidth={1.75} />}
                color="#06b6d4"
                title="Statistics"
                desc="Workshop activity overview across states and institutes."
                to="/statistics"
                cta="View Stats"
              />
            </div>

            <div className="glass-card" style={{
              padding: '1.5rem 2rem',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.05) 100%)',
              border: '1px solid rgba(245,158,11,0.2)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
                How your workflow works
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                <FlowStep number="1" label="Coordinator Proposes" sub="Picks a workshop type + date" color="#06b6d4" />
                <FlowArrow />
                <FlowStep number="2" label="You Review" sub="Accept or let it expire" color="#f59e0b" />
                <FlowArrow />
                <FlowStep number="3" label="Workshop Booked" sub="Coordinator is notified" color="#10b981" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '0.3rem' }}>Quick Actions</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Choose a workshop type, propose a date, and wait for instructor confirmation
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
              <ActionCard
                icon={<BookOpen size={22} strokeWidth={1.75} />}
                color="#4f46e5"
                title="Browse Workshop Types"
                desc="Explore Python, Scilab, OpenFOAM and more workshops offered by FOSSEE."
                to="/types"
                cta="Browse"
              />
              <ActionCard
                icon={<PlusCircle size={22} strokeWidth={1.75} />}
                color="#06b6d4"
                title="Propose a Workshop"
                desc="Select a workshop type and submit a date for your institute."
                to="/propose"
                cta="Propose Now"
              />
              <ActionCard
                icon={<ClipboardList size={22} strokeWidth={1.75} />}
                color="#10b981"
                title="My Proposals"
                desc="Track the status of your submitted workshop proposals."
                to="/status"
                cta="Track Status"
              />
              <ActionCard
                icon={<User size={22} strokeWidth={1.75} />}
                color="#8b5cf6"
                title="Your Profile"
                desc="Keep your institute, location and contact info up to date."
                to="/profile"
                cta="Edit Profile"
              />
            </div>

            <div className="glass-card" style={{
              padding: '1.5rem 2rem',
              background: 'linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(6,182,212,0.05) 100%)',
              border: '1px solid rgba(79,70,229,0.2)',
              marginBottom: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>
                How it works
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                <FlowStep number="1" label="Browse Types" sub="Find the right workshop from the FOSSEE catalogue" color="#4f46e5" />
                <FlowArrow />
                <FlowStep number="2" label="Propose a Date" sub="Submit your institute's preferred date" color="#06b6d4" />
                <FlowArrow />
                <FlowStep number="3" label="Instructor Reviews" sub="A FOSSEE instructor accepts the proposal" color="#f59e0b" />
                <FlowArrow />
                <FlowStep number="4" label="Workshop Booked!" sub="You receive confirmation details" color="#10b981" />
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-dim)', fontSize: '0.8rem' }}>
          <Clock size={13} strokeWidth={2} />
          FOSSEE Workshop Booking Portal · IIT Bombay
        </div>
      </div>
    </div>
  );
}
