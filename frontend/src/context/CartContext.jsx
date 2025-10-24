import React, { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item._id === action.payload._id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item._id === action.payload._id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item._id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'SET_CART':
      return {
        ...state,
        items: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: []
  });

  // Generate user-specific cart key
  const getCartKey = () => {
    return user ? `cart_${user._id}` : 'cart_guest';
  };

  // Load cart from localStorage when user changes
  React.useEffect(() => {
    const loadCart = () => {
      if (isAuthenticated && user) {
        // User is logged in - load their cart
        const userCart = JSON.parse(localStorage.getItem(getCartKey())) || [];
        console.log('🔄 Loading user cart for:', user._id, 'Items:', userCart.length);
        dispatch({ type: 'SET_CART', payload: userCart });
      } else {
        // User is not logged in - load guest cart
        const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
        console.log('🔄 Loading guest cart. Items:', guestCart.length);
        dispatch({ type: 'SET_CART', payload: guestCart });
      }
    };

    loadCart();
  }, [user, isAuthenticated]);

  // Save cart to localStorage when items change
  React.useEffect(() => {
    if (state.items.length > 0) {
      const cartKey = getCartKey();
      console.log('💾 Saving cart to:', cartKey, 'Items:', state.items.length);
      localStorage.setItem(cartKey, JSON.stringify(state.items));
    }
  }, [state.items, user, isAuthenticated]);

  // Handle user login - transfer guest cart to user cart
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const guestCart = JSON.parse(localStorage.getItem('cart_guest')) || [];
      const userCart = JSON.parse(localStorage.getItem(getCartKey())) || [];
      
      if (guestCart.length > 0 && userCart.length === 0) {
        // Merge guest cart with user cart
        console.log('🔄 Transferring guest cart to user cart');
        const mergedCart = [...guestCart];
        dispatch({ type: 'SET_CART', payload: mergedCart });
        localStorage.removeItem('cart_guest');
      }
    }
  }, [isAuthenticated, user]);

  // Handle user logout - clear cart
  React.useEffect(() => {
    if (!isAuthenticated) {
      console.log('🚪 User logged out, clearing cart');
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const addToCart = (product, quantity = 1) => {
    console.log('➕ Adding to cart:', product.name, 'Qty:', quantity);
    dispatch({
      type: 'ADD_TO_CART',
      payload: { ...product, quantity }
    });
  };

  const removeFromCart = (productId) => {
    console.log('➖ Removing from cart:', productId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      console.log('✏️ Updating quantity:', productId, 'to', quantity);
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    }
  };

  const clearCart = () => {
    console.log('🗑️ Clearing entire cart');
    dispatch({ type: 'CLEAR_CART' });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};