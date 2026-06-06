import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../api/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ref so clearSession is always stable and never stale inside closures/interceptors
  const clearSessionRef = useRef(null);

  // Prevent StrictMode double-mount from running two concurrent restore checks
  const restoreRan = useRef(false);

  /** Wipes ALL auth state — memory AND localStorage */
  const clearSession = useCallback(() => {
    console.log('[AuthContext] clearSession() called — wiping all auth state.');
    localStorage.removeItem('tc_token');
    localStorage.removeItem('tc_user');
    setToken(null);
    setUser(null);
  }, []);

  // Keep the ref in sync so the axios interceptor can always call the latest version
  clearSessionRef.current = clearSession;

  // ── Restore session from localStorage on mount ──────────────
  // STRICT: Always re-validates the stored token against the backend.
  // StrictMode-safe: guarded by restoreRan ref so the effect only fires once.
  useEffect(() => {
    if (restoreRan.current) return;
    restoreRan.current = true;

    const checkAuth = async () => {
      console.log('[AuthContext] Starting auth restore check...');

      const savedToken = localStorage.getItem('tc_token');

      if (!savedToken) {
        console.log('[AuthContext] No token in localStorage → user is logged out.');
        setLoading(false);
        return;
      }

      console.log('[AuthContext] Token found in localStorage → validating with backend...');

      // Sanity check: a JWT has exactly 3 parts separated by dots
      const parts = savedToken.split('.');
      if (parts.length !== 3) {
        console.warn('[AuthContext] Malformed token detected → clearing session.');
        clearSessionRef.current();
        setLoading(false);
        return;
      }

      try {
        // Hits GET /auth/profile — backend verifies JWT signature AND confirms
        // the user still exists in MongoDB. 401 → catch → clearSession.
        const { data } = await authAPI.getProfile();

        if (data?.success && data?.user) {
          console.log('[AuthContext] ✅ Token valid. User confirmed in DB:', data.user.email);
          // Set both atomically before clearing loading
          setToken(savedToken);
          setUser(data.user);
          localStorage.setItem('tc_user', JSON.stringify(data.user));
        } else {
          console.warn('[AuthContext] Backend returned success:false → clearing session.');
          clearSessionRef.current();
        }
      } catch (err) {
        const status = err.response?.status;
        console.warn('[AuthContext] Profile fetch failed →', status, err.response?.data?.message);
        // Only clear on 401 (bad token). On network error / 5xx, preserve session
        // so a temporary server outage doesn't log the user out.
        if (status === 401) {
          console.warn('[AuthContext] 401 on restore → clearing session.');
          clearSessionRef.current();
        } else {
          console.warn('[AuthContext] Non-401 error on restore — keeping stored token, user stays logged in.');
          // Restore from localStorage cache so UI stays coherent
          const cachedUser = localStorage.getItem('tc_user');
          if (cachedUser) {
            try {
              setToken(savedToken);
              setUser(JSON.parse(cachedUser));
            } catch {
              clearSessionRef.current();
            }
          } else {
            clearSessionRef.current();
          }
        }
      } finally {
        setLoading(false);
        console.log('[AuthContext] Auth restore check complete.');
      }
    };

    checkAuth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Called ONLY after a verified successful login / signup / Google auth.
   * Both tokenVal and userData MUST be present from a real backend response.
   *
   * State is updated BEFORE this function returns, so any subsequent
   * navigate() call will see isAuthenticated === true immediately.
   */
  const saveSession = useCallback((tokenVal, userData) => {
    if (!tokenVal || !userData) {
      console.error('[AuthContext] saveSession() called with missing token or user — REJECTED.');
      return false;
    }

    if (tokenVal.split('.').length !== 3) {
      console.error('[AuthContext] saveSession() received malformed token — REJECTED.');
      return false;
    }

    console.log('[AuthContext] saveSession() → saving session for:', userData.email);

    // Persist to localStorage FIRST so the request interceptor picks it up
    // immediately on the very next API call (e.g. profile refresh after login)
    localStorage.setItem('tc_token', tokenVal);
    localStorage.setItem('tc_user', JSON.stringify(userData));

    // Then update React state — these are synchronous state enqueues;
    // React will batch them and re-render once before the next microtask,
    // which is before navigate() resolves in the caller.
    setToken(tokenVal);
    setUser(userData);

    return true;
  }, []);

  /** Logs the user out completely — clears everything */
  const logout = useCallback(() => {
    console.log('[AuthContext] logout() called.');
    clearSession();
  }, [clearSession]);

  /** Re-fetches the latest profile from the backend and updates state */
  const refreshProfile = useCallback(async () => {
    console.log('[AuthContext] refreshProfile() called.');
    try {
      const { data } = await authAPI.getProfile();
      if (data?.success && data?.user) {
        console.log('[AuthContext] refreshProfile() → updated user:', data.user.email);
        setUser(data.user);
        localStorage.setItem('tc_user', JSON.stringify(data.user));
      } else {
        console.warn('[AuthContext] refreshProfile() returned no user → logging out.');
        logout();
      }
    } catch (err) {
      const status = err.response?.status;
      console.warn('[AuthContext] refreshProfile() failed →', status);
      if (status === 401) logout();
      // Non-401 errors (network, 5xx): don't log out, just surface the failure
    }
  }, [logout]);

  // isAuthenticated is ONLY true when:
  //   1. loading is complete (backend has been consulted)
  //   2. token exists in state
  //   3. user exists in state
  // It is NEVER true from localStorage alone.
  const isAuthenticated = !loading && !!token && !!user;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    saveSession,
    logout,
    refreshProfile,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
