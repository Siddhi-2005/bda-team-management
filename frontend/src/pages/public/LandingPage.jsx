import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LuTrendingUp,
  LuSparkles,
  LuCheck,
  LuArrowRight,
  LuKanban,
  LuTarget,
  LuMail,
  LuShield,
  LuUsers,
  LuUser
} from 'react-icons/lu';

const LandingPage = () => {
  const navigate = useNavigate();
  const { loginDemo } = useAuth();

  const handleOpenDemo = async (role = 'admin') => {
    await loginDemo(role);
    navigate('/dashboard');
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', color: '#0f172a' }}>
      {/* Top Navbar */}
      <nav style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}>
              <LuTrendingUp />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>BDA Workspace</span>
          </div>

          <div style={{ display: 'flex', gap: '24px', fontSize: '0.88rem', fontWeight: 500, color: '#475569' }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }}>Features</a>
            <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How it works</a>
            <a href="#roles" style={{ color: 'inherit', textDecoration: 'none' }}>Roles</a>
            <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/login"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0f172a',
              textDecoration: 'none',
              borderRadius: '8px'
            }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#ffffff',
              background: '#2563eb',
              borderRadius: '8px',
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <span style={{ background: '#2563eb', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>New</span>
              <span>AI follow-up emails in one click</span>
            </div>

            <h1 style={{
              fontSize: '3.2rem',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: '20px'
            }}>
              Run your whole sales team from one workspace.
            </h1>

            <p style={{
              fontSize: '1.12rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '32px',
              maxWidth: '520px'
            }}>
              Track every prospect from first call to closed deal, hand out tasks, and see which team is ahead of target, without chasing spreadsheets.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                }}
              >
                <span>Create free account</span>
                <LuArrowRight size={18} />
              </Link>

              <button
                onClick={() => handleOpenDemo('admin')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                Try the live demo
              </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuCheck style={{ color: '#10b981' }} />
                <span>Demo logins included</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <LuCheck style={{ color: '#10b981' }} />
                <span>Admin, manager and associate roles</span>
              </div>
            </div>
          </div>

          {/* Right Floating App Preview */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)',
            padding: '16px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <div style={{ marginLeft: '12px', background: '#f8fafc', padding: '2px 16px', borderRadius: '6px', fontSize: '0.7rem', color: '#94a3b8' }}>
                app.bdaworkspace.internal/dashboard
              </div>
            </div>

            {/* Mock stats widget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Revenue won</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>18.6L</div>
                <div style={{ fontSize: '0.65rem', color: '#10b981' }}>+22% this month</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Active customers</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>128</div>
                <div style={{ fontSize: '0.65rem', color: '#3b82f6' }}>+5 this week</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Active reps</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>24</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b' }}>2 sales teams</div>
              </div>
            </div>

            {/* Mini preview rows */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Aarav Verma (Sharma Textiles)</span>
                <span style={{ color: '#2563eb' }}>₹4,80,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                <span>Negotiation Stage</span>
                <span>Assigned to Ankit Patel</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px' }}>
                <span>Rohan Desai (Desai Realty)</span>
                <span style={{ color: '#059669' }}>₹9,00,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                <span style={{ color: '#059669', fontWeight: 600 }}>Won Deal</span>
                <span>Assigned to Meera Iyer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Stats Row */}
      <section style={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '36px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '24px'
        }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>7</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>pipeline stages, New to Won</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>4</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>task stages on a kanban board</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>3</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>roles with their own access</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>1 click</div>
            <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>to draft a follow-up email</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ maxWidth: '1240px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            Everything a business development team needs to close.
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.5 }}>
            Customers, tasks, teams and targets live together, so the numbers on the dashboard are the numbers your team is working.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '24px' }}>
          {/* Card 1: Pipeline */}
          <div className="white-card" style={{ padding: '32px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuTrendingUp size={20} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>A pipeline that shows where every deal stands</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>
              Move prospects from New to Won, record deal value and source, and set the next follow-up date.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[
                { name: 'New', count: 42, color: '#0284c7' },
                { name: 'Contacted', count: 31, color: '#d97706' },
                { name: 'Qualified', count: 22, color: '#7c3aed' },
                { name: 'Proposal', count: 14, color: '#ea580c' },
                { name: 'Negotiation', count: 8, color: '#0ea5e9' },
                { name: 'Won', count: 11, color: '#059669' }
              ].map((s) => (
                <div key={s.name} style={{ background: '#f8fafc', padding: '10px 4px', borderRadius: '8px', borderTop: `3px solid ${s.color}` }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{s.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: AI Email Drafter (Dark) */}
          <div style={{ background: '#0b132b', color: '#ffffff', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <LuSparkles size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>AI email drafter</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
                Turn your call notes into a polite, personal follow-up email.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '14px', fontSize: '0.78rem' }}>
              <div style={{ color: '#93c5fd', fontWeight: 600, marginBottom: '4px' }}>Subject: Next steps for Sharma Textiles</div>
              <p style={{ color: '#cbd5e1', lineHeight: 1.4 }}>
                "Hi Aarav, thanks for the time today. As discussed, I will send the revised proposal by Friday..."
              </p>
            </div>
          </div>
        </div>

        {/* 3 Smaller Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="white-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuKanban size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Task board</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              To do, in progress, review and done, with priority and due dates.
            </p>
          </div>

          <div className="white-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuTarget size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Team targets</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Set a sales target for each team and watch achievement live 24/7.
            </p>
          </div>

          <div className="white-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuMail size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Website enquiries become leads</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
              Anyone can submit the public contact form, and it lands in your pipeline.
            </p>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section id="how-it-works" style={{ background: '#f8fafc', padding: '80px 24px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '40px', textAlign: 'center' }}>
            From first enquiry to closed deal in three steps.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '18px' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Capture</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Add prospects by hand or let the public contact form drop them straight into the pipeline.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '18px' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Work the deal</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Assign an owner, schedule follow-ups, and draft outreach emails with AI while the details are fresh.
              </p>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '28px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0f172a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '18px' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>Close and measure</h3>
              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                Mark deals won and see revenue, top performers and team targets update on the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Overview */}
      <section id="roles" style={{ maxWidth: '1240px', margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            The right view for everyone on the team.
          </h2>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Each person sees what they need and nothing they should not.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div className="white-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuShield size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Admin</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Sets up teams and members, sees every customer and every number across the whole organization.
            </p>
          </div>

          <div className="white-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuUsers size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Team manager</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Assigns leads and tasks, and tracks the team against its target in real time.
            </p>
          </div>

          <div className="white-card">
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <LuUser size={20} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Business development associate</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Works their own customers and tasks, and drafts follow-up emails in seconds.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0b132b 0%, #152244 50%, #1d4ed8 100%)',
          borderRadius: '20px',
          padding: '48px 40px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              See your pipeline the way your team does.
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              Log in with a demo account and look around. No setup needed.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <button
              onClick={() => handleOpenDemo('admin')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.92rem',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.35)'
              }}
            >
              <span>Open the demo</span>
              <LuArrowRight size={16} />
            </button>

            <Link
              to="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none'
              }}
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '24px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.82rem',
        color: '#64748b'
      }}>
        <div>© 2026 BDA Workspace. A portfolio project by Siddhi.</div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Log in</Link>
          <Link to="/register" style={{ color: 'inherit', textDecoration: 'none' }}>Register</Link>
          <Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
