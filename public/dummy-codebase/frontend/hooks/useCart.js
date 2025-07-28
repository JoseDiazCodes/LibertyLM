import { useState, useEffect, useContext, createContext } from 'react';
import { useAuth } from './useAuth';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync cart with server when user logs in
  useEffect(() => {
    if (user) {
      syncCartWithServer();
    }
  }, [user]);

  const syncCartWithServer = async () => {
    if (!user || cartItems.length === 0) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ items: cartItems })
      });

      if (response.ok) {
        const { cart } = await response.json();
        setCartItems(cart.items || []);
      }
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true);
    
    try {
      const existingItemIndex = cartItems.findIndex(
        item => item.product._id === product._id
      );

      let newCartItems;
      
      if (existingItemIndex > -1) {
        // Update existing item
        newCartItems = cartItems.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newCartItems = [...cartItems, {
          product,
          quantity,
          addedAt: new Date().toISOString()
        }];
      }

      setCartItems(newCartItems);

      // Sync with server if user is logged in
      if (user) {
        await updateServerCart(newCartItems);
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    
    try {
      const newCartItems = cartItems.filter(
        item => item.product._id !== productId
      );
      
      setCartItems(newCartItems);

      if (user) {
        await updateServerCart(newCartItems);
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      return removeFromCart(productId);
    }

    setIsLoading(true);
    
    try {
      const newCartItems = cartItems.map(item => 
        item.product._id === productId 
          ? { ...item, quantity }
          : item
      );
      
      setCartItems(newCartItems);

      if (user) {
        await updateServerCart(newCartItems);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    
    try {
      setCartItems([]);

      if (user) {
        await updateServerCart([]);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateServerCart = async (items) => {
    if (!user) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error('Failed to update cart on server');
      }
    } catch (error) {
      console.error('Error updating server cart:', error);
      // Don't throw here, allow local cart to work even if server update fails
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.currentPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product._id === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.product._id === productId);
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    getCartItem,
    syncCartWithServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};