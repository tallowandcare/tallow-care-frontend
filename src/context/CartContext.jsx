import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

function getCartKey(email) {
  return `cart_${email}`;
}

/**
 * FIX: Helper – normalise id so products coming from either the local
 *  data (id) or MongoDB / backend (_id) are treated as the same item.
 */
function getProductId(product) {
  return product?.id ?? product?._id;
}

/**
 * FIX: Safe price calculation.
 *  Original: item.originalPrice * (1 - item.discount / 100)  → NaN when fields missing
 *  Fixed   : falls back to item.price and treats missing discount as 0
 */
function calcPrice(item) {
  const base = Number(item.originalPrice ?? item.price ?? 0);
  const disc = Number(item.discount ?? 0);
  return Math.round(base * (1 - disc / 100));
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  // Load cart from localStorage whenever the logged-in user changes
  useEffect(() => {
    if (!user?.email) {
      // FIX (Issue #4 – Cart reset): Do NOT wipe items when the user logs out.
      // The cart remains in memory (and in localStorage under their email key)
      // so it survives a logout/login cycle.  A fresh load happens only when
      // a verified email is available.
      return;
    }

    const key = getCartKey(user.email);
    try {
      // FIX (Issue #8 – localStorage safety): JSON.parse is already wrapped in
      // try/catch; we also validate the result is an array before trusting it.
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      // Corrupted data → start fresh, don't crash
      setItems([]);
    }
  }, [user?.email]);

  // Persist to localStorage on every change (only while a user is logged in)
  useEffect(() => {
    if (!user?.email) return;
    const key = getCartKey(user.email);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Quota exceeded or private-browsing block – silently ignore
    }
  }, [items, user?.email]);

  /**
   * FIX (Issue #1 + #2 – addToCart with id/_id normalisation).
   * 1. Normalise the product id to a single `id` field.
   * 2. If the item already exists → increment quantity (prevents duplicates).
   * 3. Otherwise → append with quantity = qty.
   */
  const addToCart = useCallback((product, qty = 1) => {
    if (!product) return; // Guard against undefined/null products

    const productId = getProductId(product); // FIX: normalise id / _id
    if (!productId) return;                  // Reject products with no id at all

    setItems(prev => {
      // FIX: compare using normalised ids on both sides
      const existing = prev.find(i => getProductId(i) === productId);

      if (existing) {
        // Item already in cart → increase quantity, no duplicate
        return prev.map(i =>
          getProductId(i) === productId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }

      // New item → store with a guaranteed numeric `id` so future lookups
      // always have one consistent field to compare.
      return [
        ...prev,
        {
          ...product,
          id: productId,   // FIX: normalise _id → id
          quantity: qty,
        },
      ];
    });
  }, []);

  /**
   * FIX (Issue #3 – removeFromCart with id/_id).
   * Original: i.id !== productId (misses items stored under _id)
   * Fixed   : compare using normalised ids on both sides
   */
  const removeFromCart = useCallback((productId) => {
    setItems(prev => prev.filter(i => getProductId(i) !== productId));
  }, []);

  /**
   * FIX (Issue #2 – updateQuantity with id/_id normalisation).
   */
  const updateQuantity = useCallback((productId, qty) => {
    if (qty <= 0) {
      // Quantity reaches zero → remove the item
      setItems(prev => prev.filter(i => getProductId(i) !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          getProductId(i) === productId ? { ...i, quantity: qty } : i
        )
      );
    }
  }, []);

  /**
   * FIX: getItemQuantity uses normalised id comparison.
   */
  const getItemQuantity = useCallback((productId) => {
    return items.find(i => getProductId(i) === productId)?.quantity ?? 0;
  }, [items]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalCount = items.reduce((sum, i) => sum + (i.quantity || 0), 0);

  /**
   * FIX (Issue #5 – NaN price calculation).
   * Uses the safe calcPrice helper that handles missing/undefined fields.
   */
  const grandTotal = items.reduce((sum, i) => {
    return sum + calcPrice(i) * (i.quantity || 0);
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      getItemQuantity,
      clearCart,
      totalCount,
      grandTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export default CartContext;
