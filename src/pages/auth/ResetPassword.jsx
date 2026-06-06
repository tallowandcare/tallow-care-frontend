import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';

// ── Password strength helper ──────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '#e3ddd5' };
  let score = 0;
  if (password.length >= 8)           score++;
  if (password.length >= 12)          score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  if (score <= 1) return { score, label: 'Weak',   color: '#e53935' };
  if (score <= 2) return { score, label: 'Fair',   color: '#fb8c00' };
  if (score <= 3) return { score, label: 'Good',   color: '#7cb342' };
  return             { score, label: 'Strong', color: '#2e7d32' };
}

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState('');
  const [success, setSuccess]                 = useState('');
  const [mounted, setMounted]                 = useState(false);
  const [email, setEmail]                     = useState('');
  const [otp, setOtp]                         = useState('');

  // ── Guard: redirect if session is missing ─────────────────────
  useEffect(() => {
    setMounted(true);
    const storedEmail = sessionStorage.getItem('fp_email');
    const storedOtp   = sessionStorage.getItem('fp_otp');
    if (!storedEmail || !storedOtp) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    setEmail(storedEmail);
    setOtp(storedOtp);
  }, [navigate]);

  const strength = getPasswordStrength(password);
  const mismatch = !!confirmPassword && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password)               return setError('Please enter a new password.');
    if (password.length < 8)     return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(email, otp, password);

      if (data.success) {
        // Clean up session data — flow is complete
        sessionStorage.removeItem('fp_email');
        sessionStorage.removeItem('fp_otp');
        setSuccess('Password reset successfully! Redirecting to sign in…');
        setTimeout(() => navigate('/login', { replace: true }), 2000);
      } else {
        setError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      const msg    = err.response?.data?.message || '';
      const status = err.response?.status;

      if (status === 400 && msg.toLowerCase().includes('expired')) {
        setError('Your reset session has expired. Please start over.');
        setTimeout(() => navigate('/forgot-password', { replace: true }), 2500);
      } else if (status === 400 && msg.toLowerCase().includes('invalid')) {
        setError('Invalid reset session. Please start over.');
        setTimeout(() => navigate('/forgot-password', { replace: true }), 2500);
      } else {
        setError(msg || 'Failed to reset password. Please try again.');
      }
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

          {/* Step progress: 3 of 3 */}
          <div className="auth-step-dots">
            <div className="auth-dot auth-dot--done" />
            <div className="auth-dot auth-dot--done" />
            <div className="auth-dot auth-dot--active" />
          </div>

          <div className="auth-form-header">
            <h1 className="auth-split-title">New Password</h1>
            <p className="auth-split-subtitle">
              Create a strong password for{' '}
              <strong style={{ color: '#4a7c3f' }}>{email}</strong>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-split-form" noValidate>

            {/* ── New password ── */}
            <div className="auth-field">
              <label className="auth-label">New Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoFocus
                  autoComplete="new-password"
                  disabled={loading || !!success}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="pw-strength">
                  <div className="pw-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="pw-bar"
                        style={{ background: strength.score >= i ? strength.color : '#e3ddd5' }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: '600', color: strength.color, minWidth: '46px' }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* ── Confirm password ── */}
            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="new-password"
                  disabled={loading || !!success}
                  style={{ borderColor: mismatch ? '#e53935' : undefined }}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  <EyeIcon open={showConfirm} />
                </button>
              </div>
              {mismatch && (
                <span style={{ fontSize: '0.75rem', color: '#e53935', marginTop: '2px' }}>
                  Passwords do not match
                </span>
              )}
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
              {loading ? <LoadingSpinner /> : 'Reset Password'}
            </button>
          </form>

          {!success && (
            <p className="auth-switch-link">
              <Link to="/verify-reset-otp">← Back to OTP</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
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
