import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashNavbar from '../components/dashboard/DashNavbar';
import DashHero from '../components/dashboard/DashHero';
import Bestsellers from '../components/dashboard/Bestsellers';
import RecommendationWizard from '../components/dashboard/RecommendationWizard';
import AISection from '../components/dashboard/AISection';
import MissionSection from '../components/dashboard/MissionSection';
import DashFooter from '../components/dashboard/DashFooter';
import { useCart } from '../context/CartContext';
import '../styles/dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { totalCount, addToCart } = useCart();

  /**
   * FIX (Bonus – product normalisation before addToCart):
   *  Bestsellers uses a slightly different shape (img vs images, string price vs
   *  numeric originalPrice).  We normalise here so CartContext always receives a
   *  consistent object regardless of the source component.
   */
  const handleAddToCart = (product) => {
    if (!product) return; // Guard: Bestsellers previously called onAddToCart() with no argument

    // Ensure images is always an array
    const images = Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : product.img
          ? [product.img]
          : [];

    // Parse originalPrice in case it's still a formatted string
    const originalPrice =
      typeof product.originalPrice === 'number'
        ? product.originalPrice
        : parseFloat(String(product.originalPrice ?? product.price ?? '0').replace(/[^0-9.]/g, '')) || 0;

    const normalised = {
      ...product,
      images,
      originalPrice,
      discount: typeof product.discount === 'number' ? product.discount : 0,
    };

    addToCart(normalised, 1);
  };

  return (
    <div className="dash-root">
      <DashNavbar
        cartCount={totalCount}
        onCartClick={() => navigate('/dashboard/cart')}
      />

      {/* Hero lives OUTSIDE dash-layout so it's never clipped by padding */}
      <DashHero />

      <div className="dash-layout">
        <Bestsellers onAddToCart={handleAddToCart} />
        <RecommendationWizard onAddToCart={handleAddToCart} />
        <MissionSection />
      </div>

      {/* Footer lives OUTSIDE dash-layout — full width, no side gaps */}
      <DashFooter />

      {/* Floating AI Chat Widget */}
      <AISection />
    </div>
  );
}
