import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [shadow, setShadow]         = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError]     = useState(false);
  const navRef                      = useRef(null);

  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => { setImgError(false); }, [user?.profilePicture]);

  // Navbar shadow on scroll
  useEffect(() => {
    const onScroll = () => setShadow(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu/dropdown when clicking OUTSIDE the navbar
  useEffect(() => {
    const onOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('touchstart', onOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const profileImage = !imgError
    ? (user?.profilePicture || user?.picture || user?.photoURL || user?.avatar || '')
    : '';

  const userInitial = user?.fullName?.[0]?.toUpperCase()
    || user?.username?.[0]?.toUpperCase() || 'U';

  return (
    <nav
      ref={navRef}
      className="navbar"
      style={{ boxShadow: shadow ? '0 4px 32px rgba(42,35,24,.08)' : 'none' }}
    >
      {/* Logo */}
      <a href="/#home" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/logo.png" alt="Logo" className="logo-img" style={{ height: '40px', width: 'auto' }} />
      </a>

      {/* Nav links */}
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li><a href="/#home"        onClick={() => setMenuOpen(false)}>Home</a></li>
        <li><a href="/#why-tallow"  onClick={() => setMenuOpen(false)}>Why Tallow</a></li>
        <li><a href="/#products"    onClick={() => setMenuOpen(false)}>Products</a></li>
        <li><a href="/#mission"     onClick={() => setMenuOpen(false)}>Mission</a></li>
        <li><a href="/#contact"     onClick={() => setMenuOpen(false)}>Contact</a></li>

        <div className="auth-mobile">
          {isAuthenticated ? (
            <>
              <span className="nav-user-name">
                Hi, {user?.fullName?.split(' ')[0] || user?.username}
              </span>
              <button className="btn-login nav-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="nav-login-link nav-btn-plain"
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
              >
                Login
              </button>
              <button
                className="btn-login"
                onClick={() => { navigate('/signup'); setMenuOpen(false); }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </ul>

      {/* Right side */}
      <div className="nav-right">
        <svg viewBox="0 0 24 24" strokeWidth="1.8" className="nav-icon-desktop">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>

        <svg viewBox="0 0 24 24" strokeWidth="1.8">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        {/* Desktop auth */}
        <div className="auth-desktop">
          {isAuthenticated ? (
            <div
              className="nav-user-dropdown"
              onClick={() => setDropdownOpen(o => !o)}
            >
              <div className="nav-avatar">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={user?.fullName || 'User'}
                    onError={() => setImgError(true)}
                    referrerPolicy="no-referrer"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  />
                ) : (
                  <span>{userInitial}</span>
                )}
              </div>

              {dropdownOpen && (
                <div className="nav-dropdown-menu">
                  <div className="dropdown-user-info">
                    {profileImage && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        <img
                          src={profileImage}
                          alt={user?.fullName || 'User'}
                          onError={() => setImgError(true)}
                          referrerPolicy="no-referrer"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,0,0,0.08)' }}
                        />
                      </div>
                    )}
                    <p className="dropdown-name">{user?.fullName}</p>
                    <p className="dropdown-username">@{user?.username || 'user'}</p>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={handleLogout}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="nav-login-link nav-btn-plain" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-login" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </div>
    </nav>
  );
}
