import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';

// ── Step constants ──────────────────────────────────
const STEP = {
  INFO: 1,
  VERIFY: 2,
  OTP: 3,
};

// ── Debounce hook ───────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── OTP Input component ─────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.split('');

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace') {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = '';
        onChange(next.join(''));
      } else if (idx > 0) {
        refs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (idx, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join('').padEnd(6, '').slice(0, 6).trimEnd());
    if (char && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-boxes-new">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (refs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKey(idx, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="otp-box-new"
          aria-label={`OTP digit ${idx + 1}`}
        />
      ))}
    </div>
  );
}

// ── Main Signup Component ───────────────────────────
export default function Signup() {
  const navigate = useNavigate();
  const { saveSession, isAuthenticated, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, authLoading, navigate]);

  const [step, setStep] = useState(STEP.INFO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);

  const [verifyMethod, setVerifyMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameStatus(null);
      return;
    }
    const check = async () => {
      setUsernameStatus('checking');
      try {
        const { data } = await authAPI.checkUsername(debouncedUsername);
        setUsernameStatus(data.available ? 'available' : 'taken');
      } catch {
        setUsernameStatus(null);
      }
    };
    check();
  }, [debouncedUsername]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleInfoNext = (e) => {
    e.preventDefault();
    clearMessages();
    if (!fullName.trim()) return setError('Please enter your full name.');
    if (username.trim().length < 3) return setError('Username must be at least 3 characters.');
    if (usernameStatus === 'taken') return setError('That username is already taken.');
    if (usernameStatus === 'checking') return setError('Please wait while we check your username.');
    if (!/^[a-z0-9_]+$/i.test(username)) return setError('Username can only contain letters, numbers, and underscores.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    setStep(STEP.VERIFY);
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    clearMessages();
    if (!email.trim()) return setError('Please enter your email address.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email address.');
    setLoading(true);
    try {
      const { data } = await authAPI.sendEmailOTP(email.trim(), fullName.trim());
      if (data.success) {
        setOtpSent(true);
        setStep(STEP.OTP);
        setSuccess(data.message);
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    clearMessages();
    if (otp.replace(/\s/g, '').length < 6) return setError('Please enter the complete 6-digit code.');
    setLoading(true);
    try {
      const { data } = await authAPI.verifyEmailOTP(email.trim(), otp.trim());
      if (data.success) {
        setOtpVerified(true);
        setSuccess('Email verified! Creating your account...');
        await handleCreateAccount();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    console.log('[Signup] handleCreateAccount() → creating account...');
    try {
      const { data } = await authAPI.signup({
        fullName: fullName.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        password,
      });
      if (data.success && data.token && data.user) {
        console.log('[Signup] ✅ Account created → saving session for:', data.user.email);
        saveSession(data.token, data.user);
        setSuccess('Account created! Welcome to Tallow Care 🌿');
        setTimeout(() => navigate('/dashboard'), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Account creation failed. Please try again.');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      clearMessages();
      try {
        const { data } = await authAPI.googleAuth(tokenResponse.access_token);
        if (data.success && data.token && data.user) {
          console.log('[Signup] ✅ Google sign-up success → saving session for:', data.user.email);
          saveSession(data.token, data.user);
          navigate('/dashboard');
        } else {
          console.warn('[Signup] Google auth returned success:false or missing token/user.');
          setError(data.message || 'Google sign-up failed. Please try again.');
        }
      } catch (err) {
        const message = err.response?.data?.message;
        setError(message || 'Google sign-up failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google sign-up was cancelled or failed.'),
  });

  const usernameIcon = () => {
    if (usernameStatus === 'checking') return <span className="username-checking">⟳</span>;
    if (usernameStatus === 'available') return <span className="username-ok">✓ Available</span>;
    if (usernameStatus === 'taken') return <span className="username-taken">✗ Taken</span>;
    return null;
  };

  const stepTitles = {
    [STEP.INFO]: { title: 'Create account', sub: 'Join the natural skincare revolution.' },
    [STEP.VERIFY]: { title: 'Verify identity', sub: 'Step 2 of 3 — How should we reach you?' },
    [STEP.OTP]: { title: 'Enter code', sub: `Step 3 of 3 — Check your inbox at ${email}` },
  };

  return (
    <div className="auth-split-page">
      {/* LEFT — hero panel */}
      <div className="auth-split-left">
        <div className="auth-split-overlay" />
      </div>

      {/* RIGHT — form panel */}
      <div className="auth-split-right">
        <div className={`auth-form-panel${mounted ? ' auth-form-panel--in' : ''}`}>
          {/* Header */}
          <div className="auth-form-header">
            <h1 className="auth-split-title">{stepTitles[step].title}</h1>
            <p className="auth-split-subtitle">{stepTitles[step].sub}</p>
          </div>

          {/* Step dots */}
          <div className="auth-step-dots">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`auth-dot ${step === s ? 'auth-dot--active' : ''} ${step > s ? 'auth-dot--done' : ''}`}
              />
            ))}
          </div>

          {/* Google (step 1 only) */}
          {step === STEP.INFO && (
            <>
              <button
                type="button"
                className="auth-google-btn"
                onClick={() => googleLogin()}
                disabled={loading}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z" />
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                </svg>
                Continue with Google
              </button>
              <div className="auth-split-divider"><span>or</span></div>
            </>
          )}

          {/* ── STEP 1: Info ── */}
          {step === STEP.INFO && (
            <form onSubmit={handleInfoNext} className="auth-split-form">
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="Rohan Gupta"
                  value={fullName}
                  onChange={(e) => { setFullName(e.target.value); clearMessages(); }}
                  required
                  autoFocus
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Username</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    style={{ paddingRight: '110px' }}
                    type="text"
                    placeholder="Rohan_Gupta_2003"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value.toLowerCase()); clearMessages(); }}
                    required
                    autoComplete="username"
                  />
                  <span className="auth-input-badge">{usernameIcon()}</span>
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearMessages(); }}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-eye-btn"
                    onClick={() => setShowPass(!showPass)}
                    tabIndex={-1}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {password && <PasswordStrength password={password} />}
              </div>

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <button
                type="submit"
                className="auth-primary-btn"
                disabled={loading || usernameStatus === 'checking'}
              >
                Continue
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}

          {/* ── STEP 2: Verification ── */}
          {step === STEP.VERIFY && (
            <form onSubmit={handleSendOTP} className="auth-split-form">
              <div className="verify-method-grid">
                <label className={`verify-card ${verifyMethod === 'email' ? 'verify-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="verifyMethod"
                    value="email"
                    checked={verifyMethod === 'email'}
                    onChange={() => setVerifyMethod('email')}
                  />
                  <span className="verify-card-icon">✉️</span>
                  <div>
                    <div className="verify-card-title">Email OTP</div>
                    <div className="verify-card-desc">Verify via email code</div>
                  </div>
                </label>

                <label className={`verify-card ${verifyMethod === 'phone' ? 'verify-card--selected' : ''}`}>
                  <input
                    type="radio"
                    name="verifyMethod"
                    value="phone"
                    checked={verifyMethod === 'phone'}
                    onChange={() => setVerifyMethod('phone')}
                  />
                  <span className="verify-card-icon">📱</span>
                  <div>
                    <div className="verify-card-title">Phone</div>
                    <div className="verify-card-desc">Coming soon</div>
                  </div>
                </label>
              </div>

              {verifyMethod === 'email' && (
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="Rohan2001@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
                    required
                    autoFocus
                  />
                </div>
              )}

              {verifyMethod === 'phone' && (
                <div className="coming-soon-card">
                  <span>📱</span>
                  <p>Phone verification is coming soon. Please use email for now.</p>
                </div>
              )}

              {error && <ErrorMsg>{error}</ErrorMsg>}

              <div className="auth-row-actions">
                <button
                  type="button"
                  className="auth-back-btn"
                  onClick={() => { setStep(STEP.INFO); clearMessages(); }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="auth-primary-btn auth-primary-btn--flex"
                  disabled={loading || verifyMethod === 'phone'}
                >
                  {loading ? <LoadingSpinner /> : 'Send OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 3: OTP ── */}
          {step === STEP.OTP && (
            <form onSubmit={handleVerifyOTP} className="auth-split-form">
              <p className="otp-hint-text">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <OTPInput value={otp} onChange={setOtp} disabled={loading || otpVerified} />

              {error && <ErrorMsg>{error}</ErrorMsg>}
              {success && (
                <div className="auth-success-msg">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              )}

              <button
                type="submit"
                className="auth-primary-btn"
                disabled={loading || otp.length < 6 || otpVerified}
              >
                {loading ? <LoadingSpinner /> : 'Verify & Create Account'}
              </button>

              <div className="otp-resend-row">
                {resendCooldown > 0 ? (
                  <span className="resend-timer">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    className="resend-btn-new"
                    onClick={() => { setOtp(''); clearMessages(); handleSendOTP(); }}
                    disabled={loading}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </form>
          )}

          <p className="auth-switch-link">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ErrorMsg({ children }) {
  return (
    <div className="auth-error-msg">
      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {children}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const strength = checks.filter(Boolean).length;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#f0a07a', '#f5d76e', '#8aaa7a', '#4a7c59'];

  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="pw-bar"
            style={{ background: i < strength ? colors[strength - 1] : '#e8ddd0' }}
          />
        ))}
      </div>
      {strength > 0 && (
        <span style={{ color: colors[strength - 1], fontSize: '0.74rem', fontWeight: 600 }}>
          {labels[strength - 1]}
        </span>
      )}
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
