import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Splash from './components/Splash';
import ScrollProgress from './components/ScrollProgress';
import Toast from './components/Toast';
import ClickRipple from './components/ClickRipple';

import Home from './pages/Home';
import WhyTallow from './pages/WhyTallow';
import Products from './pages/Products';
import Mission from './pages/Mission';
import Sustainability from './pages/Sustainability';
import Contact from './pages/Contact';

import Signup from './pages/auth/Signup';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import DashboardProducts from './pages/dashboard/DashboardProducts';
import DashboardReviews from './pages/DashboardReviews';
import MyCart from './pages/MyCart';

import useToast from './hooks/useToast';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// ── Main site layout (all existing pages) ──────────
function MainSite({ showToast }) {
  return (
    <>
      <Splash />
      <ScrollProgress />
      <ClickRipple />
      <Navbar />
      <main>
        <Home />
        <WhyTallow />
        <Products showToast={showToast} />
        <Mission />
        <Sustainability />
        <Contact showToast={showToast} />
      </main>
      <Footer />
    </>
  );
}

// ── Auth layout (clean, no nav/footer) ─────────────
function AuthLayout({ children }) {
  return <>{children}</>;
}

// ── Protected route: requires authentication ────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { message, visible, showToast } = useToast();

  return (
    <>
      <Toast message={message} visible={visible} />
      {/* CartProvider wraps all routes so cart state is available dashboard-wide */}
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainSite showToast={showToast} />} />
          <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
          <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
          <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
          <Route path="/verify-reset-otp" element={<AuthLayout><VerifyOtp /></AuthLayout>} />
          <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/products"
            element={
              <ProtectedRoute>
                <DashboardProducts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reviews"
            element={
              <ProtectedRoute>
                <DashboardReviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/cart"
            element={
              <ProtectedRoute>
                <MyCart />
              </ProtectedRoute>
            }
          />
          {/* Catch-all → home */}
          <Route path="*" element={<MainSite showToast={showToast} />} />
        </Routes>
      </CartProvider>
    </>
  );
}
