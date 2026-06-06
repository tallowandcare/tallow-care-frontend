export default function DashFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="dash-footer">
      <div className="dash-footer-inner">

        {/* Brand column */}
        <div className="dash-footer-brand">
          <div className="dash-footer-logo-text">
            Tallow <span className="dash-footer-logo-amp">&amp;</span> Care.
          </div>
          <p className="dash-footer-tagline">
            Healing your pet's skin naturally. Premium tallow-based pet care
            products crafted with love, science, and sustainable practices.
          </p>
          <div className="dash-footer-social">
            {/* Instagram */}
            <a href="#" className="dash-social-btn" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            {/* WhatsApp */}
            <a href="#" className="dash-social-btn" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="dash-social-btn" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop */}
        <div className="dash-footer-col">
          <h4 className="dash-footer-col-title">Shop</h4>
          <ul className="dash-footer-list">
            <li><a href="#">Dog Soap</a></li>
            <li><a href="#">Cat Soap</a></li>
            <li><a href="#">Healing Balms</a></li>
            <li><a href="#">Bundles</a></li>
          </ul>
        </div>

        {/* About Us */}
        <div className="dash-footer-col">
          <h4 className="dash-footer-col-title">About Us</h4>
          <ul className="dash-footer-list">
            <li><a href="#">Our Story</a></li>
            <li><a href="#">Mission</a></li>
            <li><a href="#">Sustainability</a></li>
            <li><a href="#">Careers</a></li>
          </ul>
        </div>

        {/* Help */}
        <div className="dash-footer-col">
          <h4 className="dash-footer-col-title">Help</h4>
          <ul className="dash-footer-list">
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Shipping</a></li>
            <li><a href="#">Returns</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>

      </div>

      <div className="dash-footer-bottom">
        <span>© {year} Tallow &amp; Care. All rights reserved.</span>
        <span className="dash-footer-bottom-right">
          <a href="#">Privacy Policy</a>
          <span className="dash-footer-dot">·</span>
          <a href="#">Terms of Service</a>
        </span>
      </div>
    </footer>
  );
}
