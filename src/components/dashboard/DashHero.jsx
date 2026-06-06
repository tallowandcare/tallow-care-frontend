import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MediaSlider from './MediaSlider';

export default function DashHero() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || user?.name?.split(' ')[0] || 'Friend';

  return (
    <section className="dash-hero">
      {/* ── Background media slider ── */}
      <MediaSlider />

      {/* ── Foreground hero content ── */}
      <div className="dash-hero-content">
        <div className="dash-hero-sub">👋 Welcome Back</div>
        <div className="dash-hero-title">
          {firstName}, your pets<br />are happy today 🐾
        </div>
        <div className="dash-hero-text">
          Everything your pets need, all in one beautiful place.
        </div>
        <div className="dash-hero-buttons">
          {/*
            Link component is used instead of button+navigate()
            — it is React Router's native navigation, 100% reliable,
            no useNavigate import needed, no hook-not-found errors.
            Styled to look identical to the original buttons.
          */}
          <Link
            to="/dashboard/products"
            className="dash-btn-yellow"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            🛍 Shop Now
          </Link>
          <Link
            to="/dashboard/cart"
            className="dash-btn-glass"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            📦 Track Orders
          </Link>
        </div>
      </div>
    </section>
  );
}
