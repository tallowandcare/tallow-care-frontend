import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashNavbar({ cartCount, onCartClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = user?.fullName || user?.name || user?.email || 'User';
  const firstName = displayName.split(' ')[0];
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const profilePic = user?.profilePicture || null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMenuOpen(false);
    navigate('/');
  };

  const NAV_LINKS = [
    { label: 'Home',      to: '/dashboard' },
    { label: 'Orders',    to: '#' },
    { label: 'Products',  to: '/dashboard/products' },
    { label: 'My Cart',   to: '/dashboard/cart' },
    { label: 'Reviews',   to: '/dashboard/reviews' },
  ];

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      navigate('/dashboard/cart');
    }
  };

  return (
    <>
      <nav
        className="tc-nav"
        style={{
          boxShadow: scrolled ? '0 4px 32px rgba(42,35,24,.09)' : '0 8px 30px rgba(42,35,24,.05)',
          transition: 'box-shadow 0.3s',
        }}
      >
        {/* ── Logo ── */}
        <a href="/" className="tc-logo" aria-label="Tallow & Care Homepage">
          <img src="/logo.png" alt="Tallow & Care" className="tc-logo-img" />
        </a>

        {/* ── Desktop nav links ── */}
        <div className="tc-nav-links-desktop">
          {NAV_LINKS.map(l => (
            l.to.startsWith('#')
              ? <a key={l.label} href={l.to} className="tc-nav-link">{l.label}</a>
              : <Link
                  key={l.label}
                  to={l.to}
                  className={`tc-nav-link${location.pathname === l.to ? ' active' : ''}`}
                >
                  {l.label}
                </Link>
          ))}
        </div>

        {/* ── Search ── */}
        <div className="tc-search">
          <span className="tc-search-icon">
            <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input type="text" placeholder='Search "dog food", "vet"...' />
        </div>

        {/* ── Right: cart + avatar + hamburger ── */}
        <div className="tc-nav-right">
          {/* Cart */}
          <button className="tc-icon-btn" onClick={handleCartClick} aria-label="Cart">
            <svg viewBox="0 0 24 24" strokeWidth="1.8" fill="none" stroke="currentColor">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartCount > 0 && (
              <span className="tc-cart-badge" key={cartCount}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>

          {/* Avatar + dropdown */}
          <div className="tc-avatar-wrap" ref={dropdownRef}>
            <button
              className={`tc-avatar${profilePic ? ' tc-avatar--img' : ''}`}
              onClick={() => setDropdownOpen(o => !o)}
              aria-label="User menu"
              aria-expanded={dropdownOpen}
            >
              {profilePic
                ? <img src={profilePic} alt={displayName} className="tc-avatar-photo" referrerPolicy="no-referrer" />
                : initials}
            </button>
            {dropdownOpen && (
              <div className="tc-dropdown">
                <div className="tc-dropdown-header">
                  <div className={`tc-dropdown-avatar${profilePic ? ' tc-dropdown-avatar--img' : ''}`}>
                    {profilePic
                      ? <img src={profilePic} alt={displayName} className="tc-avatar-photo" referrerPolicy="no-referrer" />
                      : initials}
                  </div>
                  <div>
                    <p className="tc-dropdown-name">{displayName}</p>
                    <p className="tc-dropdown-sub">@{user?.username || 'user'}</p>
                  </div>
                </div>
                <hr className="tc-dropdown-divider" />
                <button className="tc-dropdown-item tc-dropdown-item--logout" onClick={handleLogout}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger */}
          <button
            className={`tc-hamburger${menuOpen ? ' tc-hamburger--open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span className="tc-bar" />
            <span className="tc-bar" />
            <span className="tc-bar" />
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      <div className={`tc-mobile-menu${menuOpen ? ' tc-mobile-menu--open' : ''}`}>
        <div className="tc-mobile-menu-inner">
          <div className="tc-mobile-greeting">Hi, {firstName} 👋</div>
          {NAV_LINKS.map(l => (
            l.to.startsWith('#')
              ? <a
                  key={l.label}
                  href={l.to}
                  className="tc-mobile-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </a>
              : <Link
                  key={l.label}
                  to={l.to}
                  className={`tc-mobile-link${location.pathname === l.to ? ' active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {l.label}
                </Link>
          ))}
          <div className="tc-mobile-divider" />
          <button className="tc-mobile-logout" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
