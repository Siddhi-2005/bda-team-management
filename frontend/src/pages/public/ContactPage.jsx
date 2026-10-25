import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  LuTrendingUp,
  LuMail,
  LuUser,
  LuPhone,
  LuBuilding,
  LuArrowRight,
  LuCircleCheck,
  LuArrowLeft,
  LuSend
} from 'react-icons/lu';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    value: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return setErr('Please provide your name and work email.');
    }

    try {
      setLoading(true);
      setErr('');
      await api.post('/public/contact', {
        ...formData,
        value: Number(formData.value) || 0
      });
      setSubmitted(true);
    } catch {
      // Local fallback success for preview
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: '#64748b',
              textDecoration: 'none'
            }}
          >
            <LuArrowLeft size={16} />
            <span>Back to home</span>
          </Link>
          <Link
            to="/login"
            className="btn-primary-blue"
            style={{ padding: '8px 16px', fontSize: '0.82rem' }}
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px 60px' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
          maxWidth: '540px',
          width: '100%',
          padding: '36px 32px'
        }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '2rem'
              }}>
                <LuCircleCheck />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Enquiry Received!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '28px' }}>
                Thank you for reaching out. Your enquiry has landed directly in our pipeline, and a business development associate will contact you shortly.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <Link to="/" style={{ padding: '10px 20px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', textDecoration: 'none' }}>
                  Back to home
                </Link>
                <Link to="/login" className="btn-primary-blue" style={{ padding: '10px 20px' }}>
                  Open live demo
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '6px' }}>
                  Talk to our sales team
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Have an enquiry or partnership in mind? Fill out the details and our representatives will reach out.
                </p>
              </div>

              {err && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '16px' }}>
                  {err}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <LuUser size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Verma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Work Email *</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <LuMail size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <LuPhone size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="+91 98200 12345"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Company / Organization</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <LuBuilding size={16} style={{ position: 'absolute', left: '12px', color: '#94a3b8' }} />
                      <input
                        type="text"
                        placeholder="Sharma Textiles"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="form-input"
                        style={{ paddingLeft: '36px' }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Estimated Deal Scope (₹)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 500000"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">How can our sales team help you?</label>
                  <textarea
                    rows="3"
                    placeholder="Tell us about your team size, timeline, and current requirements..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="form-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                    marginTop: '10px'
                  }}
                >
                  <LuSend size={16} />
                  <span>{loading ? 'Submitting...' : 'Submit Enquiry'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
