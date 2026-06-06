import { useCallback, useState } from 'react';
import DashNavbar from '../../components/dashboard/DashNavbar';
import DashFooter from '../../components/dashboard/DashFooter';
import MarketplaceProducts from '../../components/products/MarketplaceProducts';
import ProductQuickView from '../../components/products/ProductQuickView';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import LoginRequiredPopup from '../../components/LoginRequiredPopup';
import '../../styles/dashboard.css';
import '../../styles/products.css';
import '../../styles/marketplace.css';

export default function DashboardProducts() {
  // FIX: Use CartContext for the actual cart operations and badge count.
  const { addToCart, totalCount } = useCart();

  // Auth state — used for the parent-level guard
  const { user } = useAuth();

  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    setTimeout(() => setToast({ visible: false, msg: '' }), 2500);
  }, []);

  // Auth-guarded add-to-cart handler
  const handleAddToCart = useCallback((product) => {
    if (!product) return;

    // 🔒 Auth guard — block guests (belt-and-suspenders; cards guard too)
    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    addToCart(product, 1);
    showToast(`🛒 "${product.name}" added to cart!`);
  }, [addToCart, showToast, user]);

  return (
    <div className="dash-root prod-page-root">
      {/* FIX: cartCount now reflects the real CartContext total */}
      <DashNavbar cartCount={totalCount} onCartClick={() => {}} />

      {/* Auth-required popup */}
      <LoginRequiredPopup
        visible={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
      />

      {/* Toast notification */}
      <div className={`prod-toast${toast.visible ? ' prod-toast--visible' : ''}`}>
        {toast.msg}
      </div>

      {/* Marketplace — products immediately visible */}
      <MarketplaceProducts
        onAddToCart={handleAddToCart}
        onQuickView={setQuickViewProduct}
      />

      <DashFooter />

      {/* Quick view modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(product, qty) => {
            if (!product) return;

            // 🔒 Auth guard in quick view too
            if (!user) {
              setQuickViewProduct(null);
              setShowLoginPopup(true);
              return;
            }

            addToCart(product, qty || 1);
            showToast(`🛒 "${product?.name}" added to cart!`);
            setQuickViewProduct(null);
          }}
        />
      )}
    </div>
  );
}
