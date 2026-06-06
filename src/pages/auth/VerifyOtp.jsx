import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../api/authAPI';

const OTP_LENGTH      = 6;
const RESEND_COOLDOWN = 60; // seconds before the user can resend

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [otp, setOtp]               = useState(Array(OTP_LENGTH).fill(''));
  const [email, setEmail]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [mounted, setMounted]       = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const inputRefs = useRef([]);

  // ── Guard: redirect back if email is missing ──────────────────
  useEffect(() => {
    setMounted(true);
    const stored = sessionStorage.getItem('fp_email');
    if (!stored) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    setEmail(stored);
    // Focus the first box after mount
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [navigate]);

  // ── Countdown timer ───────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  // ── OTP box change handler ────────────────────────────────────
  const handleChange = (index, value) => {
    // Accept only a single digit
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError('');
    // Auto-advance to next box
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Keyboard navigation ───────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Paste handler: fill all boxes at once ─────────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setOtp(next);
    setError('');
    // Focus the box after the last pasted digit
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      return setError('Please enter the complete 6-digit code.');
    }

    setLoading(true);
    try {
      const { data } = await authAPI.verifyResetOtp(email, otpString);

      if (data.success) {
        // Save the verified OTP so ResetPassword can re-validate server-side
        sessionStorage.setItem('fp_otp', otpString);
        setSuccess('Verified! Redirecting…');
        setTimeout(() => navigate('/reset-password'), 1200);
      } else {
        setError(data.message || 'Invalid code. Please try again.');
        clearOtp();
      }
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(msg || 'Verification failed. Please try again.');
      clearOtp();
    } finally {
      setLoading(false);
    }
  };

  const clearOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  // ── Resend OTP ────────────────────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    setError('');
    setResendSent(false);

    try {
      const { data } = await authAPI.forgotPassword(email);
      if (data.success) {
        clearOtp();
        setResendTimer(RESEND_COOLDOWN);
        setResendSent(true);
        setTimeout(() => setResendSent(false), 3000);
      } else {
        setError(data.message || 'Failed to resend code. Please try again.');
      }
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = otp.join('').length === OTP_LENGTH;

  const timerDisplay = `${String(Math.floor(resendTimer / 60)).padStart(2, '0')}:${String(resendTimer % 60).padStart(2, '0')}`;

  return (
    <div className="auth-split-page">
      {/* LEFT — hero image panel */}
      <div className="auth-split-left">
        <div className="auth-split-overlay" />
      </div>

      {/* RIGHT — form panel */}
      <div className="auth-split-right">
        <div className={`auth-form-panel${mounted ? ' auth-form-panel--in' : ''}`}>

          {/* Step progress: 2 of 3 */}
          <div className="auth-step-dots">
            <div className="auth-dot auth-dot--done" />
            <div className="auth-dot auth-dot--active" />
            <div className="auth-dot" />
          </div>

          <div className="auth-form-header">
            <h1 className="auth-split-title">Enter Reset Code</h1>
            <p className="auth-split-subtitle">
              We sent a 6-digit code to{' '}
              <strong style={{ color: '#4a7c3f' }}>{email}</strong>.
              {' '}It expires in 10 minutes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-split-form" noValidate>

            {/* ── OTP input boxes ── */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '6px' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading || !!success}
                  aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                  style={{
                    width: '46px',
                    height: '56px',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: '0',
                    border: `1.5px solid ${digit ? '#4a7c3f' : '#e3ddd5'}`,
                    borderRadius: '12px',
                    background: digit ? 'rgba(74, 124, 63, 0.06)' : '#fff',
                    color: '#1e3520',
                    outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    boxSizing: 'border-box',
                    cursor: 'text',
                    caretColor: 'transparent',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4a7c3f';
                    e.target.style.boxShadow = '0 0 0 3.5px rgba(74,124,63,0.13)';
                    e.target.select();
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = digit ? '#4a7c3f' : '#e3ddd5';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            {/* ── Resend timer / link ── */}
            <div style={{ textAlign: 'center', fontSize: '0.83rem', color: '#9a8e82' }}>
              {resendSent && (
                <span style={{ color: '#2d6a4f', fontWeight: '600' }}>
                  ✓ New code sent!
                </span>
              )}
              {!resendSent && resendTimer > 0 && (
                <span>
                  Resend code in{' '}
                  <strong style={{ color: '#4a7c3f' }}>{timerDisplay}</strong>
                </span>
              )}
              {!resendSent && resendTimer <= 0 && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4a7c3f',
                    fontWeight: '700',
                    fontSize: '0.83rem',
                    cursor: resendLoading ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                    fontFamily: 'inherit',
                    opacity: resendLoading ? 0.6 : 1,
                  }}
                >
                  {resendLoading ? 'Sending…' : 'Resend Code'}
                </button>
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
              disabled={loading || !isComplete || !!success}
            >
              {loading ? <LoadingSpinner /> : 'Verify Code'}
            </button>
          </form>

          <p className="auth-switch-link">
            <Link to="/forgot-password">← Change email</Link>
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
