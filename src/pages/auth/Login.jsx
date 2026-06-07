import { useState, useEffect, useRef } from 'react'; // added useRef
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { authAPI } from '../../api/authAPI';
import { useAuth } from '../../context/AuthContext';
import { Turnstile } from '@marsidev/react-turnstile';

export default function Login() {
  const navigate = useNavigate();
  const { saveSession, isAuthenticated, loading: authLoading } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  // FIX (Bug 2): ref to the Turnstile widget so we can call .reset() on it.
  // @marsidev/react-turnstile forwards this ref and exposes reset(), remove(), etc.
  const turnstileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect ONLY if ALREADY authenticated when page loads.
  // authLoading must be false first — prevents flash redirect during restore.
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('[Login] User already authenticated → redirecting to dashboard.');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password;

    if (!trimmedIdentifier) return setError('Please enter your username or email.');
    if (!trimmedPassword) return setError('Please enter your password.');

    console.log('[Login] handleLogin() → attempting login for:', trimmedIdentifier);
    setLoading(true);

    try {
      console.log("captchaToken =", captchaToken);
      const { data } = await authAPI.login(trimmedIdentifier, trimmedPassword, captchaToken);

      console.log('[Login] Backend response:', data);

      if (data.success && data.token && data.user) {
        console.log('[Login] ✅ Login success → saving session for:', data.user.email);
        // saveSession() writes to localStorage AND updates React state synchronously.
        // navigate() is called after so the ProtectedRoute sees isAuthenticated=true.
        const saved = saveSession(data.token, data.user);
        if (saved) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        console.warn('[Login] Backend returned success:false or missing token/user.');
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      if (err.response?.data?.captchaRequired) {
        setShowCaptcha(true);
      }

      // ── FIX (Bug 2) ──────────────────────────────────────────────────────
      // The backend calls Cloudflare's siteverify endpoint on every attempt,
      // which CONSUMES the token (single-use by design). If we don't reset the
      // widget here, the next submit sends the same dead token → Cloudflare
      // returns success: false → backend returns 400 "Invalid captcha" even
      // when the user types the correct password.
      //
      // turnstileRef.current?.reset() is safe to call unconditionally:
      //   • If the widget is not rendered yet (showCaptcha === false), the ref
      //     is null and optional chaining makes this a no-op.
      //   • If the widget is rendered, it resets to its initial unsolved state,
      //     forcing the user to complete a fresh challenge before the next submit.
      //
      // setCaptchaToken('') ensures the form never sends a stale/expired string.
      turnstileRef.current?.reset();
      setCaptchaToken('');

      const status = err.response?.status;
      const message = err.response?.data?.message;

      console.warn('[Login] Login error →', status, message);

      if (status === 401) {
        setError(message || "You don't have an account with Tallow and Care.\n Please sign up first.");
      } else if (status === 400) {
        setError(message || 'Please fill in all required fields.');
      } else if (err.code === 'ECONNABORTED' || !err.response) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    ux_mode: 'redirect',
    redirect_uri: 'https://tallowandcare.in',
    onSuccess: async (tokenResponse) => {
      console.log('[Login] Google OAuth success → sending access token to backend...');
      setLoading(true);
      setError('');
      try {
        const { data } = await authAPI.googleAuth(tokenResponse.access_token);
        console.log('[Login] Google auth backend response:', data);

        if (data.success && data.token && data.user) {
          console.log('[Login] ✅ Google login success → saving session for:', data.user.email);
          const saved = saveSession(data.token, data.user);
          if (saved) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.warn('[Login] Google auth returned success:false or missing token/user.');
          setError(data.message || 'Google login failed. Please try again.');
        }
      } catch (err) {
        const message = err.response?.data?.message;
        console.warn('[Login] Google auth error →', err.response?.status, message);
        setError(message || 'Google login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.warn('[Login] Google OAuth cancelled or failed:', err);
      setError('Google login was cancelled or failed. Please try again.');
    },
  });

  // While the auth restore check is running, show nothing (or a spinner)
  // so we don't flash the login form to an already-authenticated user.
  if (authLoading) {
    return (
      <div className="auth-split-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="auth-split-page">
      {/* LEFT — hero image panel */}
      <div className="auth-split-left">
        <div className="auth-split-overlay" />
      </div>

      {/* RIGHT — form panel */}
      <div className="auth-split-right">
        <div className={`auth-form-panel${mounted ? ' auth-form-panel--in' : ''}`}>
          <div className="auth-form-header">
            <h1 className="auth-split-title">Sign in</h1>
            <p className="auth-split-subtitle">Welcome back! Please sign in to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="auth-split-form" noValidate>
            {/* Email/Username */}
            <div className="auth-field">
              <label className="auth-label">Email or Username</label>
              <input
                className="auth-input"
                type="text"
                placeholder="your@email.com or username"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                required
                autoFocus
                autoComplete="username"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  autoComplete="current-password"
                  disabled={loading}
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
            </div>

            {/* Forgot Password link */}
            <div style={{ textAlign: 'right', marginTop: '-6px' }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#4a7c3f',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.target.style.color = '#3a6232'; e.target.style.textDecoration = 'underline'; }}
                onMouseLeave={(e) => { e.target.style.color = '#4a7c3f'; e.target.style.textDecoration = 'none'; }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Turnstile CAPTCHA widget */}
            {showCaptcha && (
              <div style={{ marginBottom: '15px' }}>
                <Turnstile
                  ref={turnstileRef}
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                  onSuccess={(token) => {
                    setCaptchaToken(token);
                  }}
                  onExpire={() => {
                    // Token expired client-side before the user submitted —
                    // clear it so we don't send a dead string to the backend.
                    setCaptchaToken('');
                  }}
                />
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="auth-error-msg">
                {error.includes("don't have an account") ? (
                  <>
                    You don&apos;t have an account with Tallow and Care.
                    <br />
                    Please sign up first.
                  </>
                ) : (
                  error
                )}
              </div>
            )}

            <button type="submit" className="auth-primary-btn" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Continue'}
            </button>
          </form>

          <p className="auth-switch-link">
            Don&apos;t have an account?{' '}
            <Link to="/signup">Sign up</Link>
          </p>

          <div className="auth-split-divider">
            <span>or continue</span>
          </div>

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
