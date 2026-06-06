import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Attach JWT token to every request automatically ──────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tc_token');
    if (token) {
      if (token.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`[authAPI] Attaching token to ${config.method?.toUpperCase()} ${config.url}`);
      } else {
        console.warn('[authAPI] Malformed token found in localStorage → removing it.');
        localStorage.removeItem('tc_token');
        localStorage.removeItem('tc_user');
      }
    } else {
      console.log(`[authAPI] No token → unauthenticated request to ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Handle 401 globally ───────────────────────────────────────
// IMPORTANT: The 401 interceptor ONLY clears localStorage here.
// It does NOT call clearSession() from AuthContext because we don't have
// a reference to React state here and doing so on every 401 would
// incorrectly log the user out mid-session (e.g. if a single endpoint
// returns 401 for a reason unrelated to the session token).
//
// The AuthContext restore check is the authoritative gate — if the
// session token is truly dead, the next page load will clear state.
// For immediate logout on 401, components can call logout() directly.
API.interceptors.response.use(
  (res) => {
    console.log(`[authAPI] ✅ ${res.config.method?.toUpperCase()} ${res.config.url} → ${res.status}`);
    return res;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.response?.data?.message;

    console.warn(`[authAPI] ❌ ${error.config?.method?.toUpperCase()} ${url} → ${status}: ${message}`);

    // On 401 for the profile endpoint (session restore), clear localStorage
    // so the next restore check starts clean. Do NOT touch React state here.
    if (status === 401 && url?.includes('/auth/profile')) {
      console.warn('[authAPI] 401 on /auth/profile → clearing stored credentials.');
      localStorage.removeItem('tc_token');
      localStorage.removeItem('tc_user');
    }

    return Promise.reject(error);
  }
);

// ── Auth endpoints ────────────────────────────────────────────
export const authAPI = {
  checkUsername: (username) =>
    API.post('/auth/check-username', { username }),

  sendEmailOTP: (email, fullName) =>
    API.post('/auth/send-email-otp', { email, fullName }),

  verifyEmailOTP: (email, otp) =>
    API.post('/auth/verify-email-otp', { email, otp }),

  signup: (data) =>
    API.post('/auth/signup', data),

  login: (identifier, password, captchaToken = '') => {
  return API.post('/auth/login', {
    identifier,
    password,
    captchaToken,
  });
  },

  googleAuth: (credential) => {
    console.log('[authAPI] googleAuth() → sending Google credential to backend...');
    return API.post('/auth/google', { credential });
  },

  getProfile: () => {
    console.log('[authAPI] getProfile() → fetching current user profile...');
    return API.get('/auth/profile');
  },

  // ── Forgot-password / OTP reset flow ─────────────────────────
  forgotPassword: (email) =>
    API.post('/auth/forgot-password', { email }),

  verifyResetOtp: (email, otp) =>
    API.post('/auth/verify-reset-otp', { email, otp }),

  resetPassword: (email, otp, newPassword) =>
    API.post('/auth/reset-password', { email, otp, newPassword }),
};

export default API;
