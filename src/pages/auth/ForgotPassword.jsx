import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) return setError('Please enter your email address.');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword(trimmedEmail);

      if (data.success) {
        // Store email in sessionStorage so VerifyOtp and ResetPassword can read it
        sessionStorage.setItem('fp_email', trimmedEmail);
        setSuccess('Reset code sent! Redirecting…');
        setTimeout(() => navigate('/verify-reset-otp'), 1200);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split-page">
      {/* LEFT — hero image panel */}
      <div className="auth-split-left">
        <div className="auth-split-overlay" />
      </div>

      {/* RIGHT — form panel */}
      <div className="auth-split-right">
        <div className={`auth-form-panel${mounted ? ' auth-form-panel--in' : ''}`}>

          {/* Step progress: 1 of 3 */}
          <div className="auth-step-dots">
            <div className="auth-dot auth-dot--active" />
            <div className="auth-dot" />
            <div className="auth-dot" />
          </div>

          <div className="auth-form-header">
            <h1 className="auth-split-title">Forgot Password</h1>
            <p className="auth-split-subtitle">
              Enter your registered email and we'll send you a 6-digit reset code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-split-form" noValidate>
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                className="auth-input"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                required
                autoFocus
                autoComplete="email"
                disabled={loading || !!success}
              />
            </div>

            {error && <div className="auth-error-msg">{error}</div>}

            {success && (
              <div className="auth-success-msg">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {success}
              </div>
            )}

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={loading || !!success}
            >
              {loading ? <LoadingSpinner /> : 'Send Reset Code'}
            </button>
          </form>

          <p className="auth-switch-link">
            Remember your password?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <span className="btn-spinner">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    </span>
  );
}
