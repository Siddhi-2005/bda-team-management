import React, { useState } from 'react';
import axios from 'axios';
import { RiSendPlaneFill, RiCheckDoubleLine, RiUserLine, RiMailLine, RiPhoneLine, RiFileTextLine } from 'react-icons/ri';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return setErr('Please provide at least your name and email.');
    }

    try {
      setLoading(true);
      setErr('');
      // Send the data through our new Public Doorway!
      await axios.post('https://bda-team-management.onrender.com/api/public/contact', formData);
      setSubmitted(true); // Changes the screen to a "Thank You" message
    } catch (err) {
      setErr('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If they submitted, show a success screen
  if (submitted) {
    return (
      <div className="auth-page" style={{ textAlign: 'center' }}>
        <div className="auth-card">
          <RiCheckDoubleLine style={{ fontSize: '4rem', color: 'var(--success)' }} />
          <h2 style={{ margin: '20px 0' }}>Request Received!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Our business team will contact you shortly.</p>
        </div>
      </div>
    );
  }

  // Otherwise, show the form
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.8rem', fontWeight: 700 }}>Contact Sales</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Leave us a message and our team will reach out to you.</p>
        </div>
        
        {err && <div className="alert alert-danger">{err}</div>}
        
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <RiUserLine style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="John Doe"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <RiMailLine style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="email"
                placeholder="email@example.com"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <RiPhoneLine style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="+91 XXXXXXXXXX"
                className="form-control"
                style={{ paddingLeft: '45px' }}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>How can we help?</label>
            <div style={{ position: 'relative' }}>
              <RiFileTextLine style={{ position: 'absolute', left: '16px', top: '20px', color: 'var(--text-secondary)' }} />
              <textarea
                placeholder="Tell us about your business needs..."
                className="form-control"
                style={{ paddingLeft: '45px', minHeight: '100px', resize: 'vertical' }}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '20px', height: '48px' }} disabled={loading}>
            {loading ? 'Sending...' : <><RiSendPlaneFill /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
