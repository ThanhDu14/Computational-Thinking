import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const getPlaceId = (place) => {
    return place.location_name || place.id;
  };

  // Load from localStorage on mount or when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `wishlist_${user.uid || user.email}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setWishlist(JSON.parse(saved));
        } else {
          setWishlist([]); // Reset if no saved data
        }
      } catch (error) {
        console.error("Error reading wishlist from localStorage", error);
        setWishlist([]);
      }
    } else {
      setWishlist([]); // Clear wishlist from memory if logged out
    }
  }, [isAuthenticated, user]);

  // Sync to localStorage whenever wishlist changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `wishlist_${user.uid || user.email}`;
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated, user]);

  const toggleWishlist = (place) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để lưu vào Wishlist / Please login to use Wishlist");
      return;
    }
    
    const placeId = getPlaceId(place);
    
    setWishlist(prev => {
      const exists = prev.some(item => getPlaceId(item) === placeId);
      if (exists) {
        return prev.filter(item => getPlaceId(item) !== placeId);
      } else {
        return [...prev, place];
      }
    });
  };

  const isInWishlist = (placeOrId) => {
    // allow passing full object or just string ID
    const targetId = typeof placeOrId === 'object' ? getPlaceId(placeOrId) : placeOrId;
    return wishlist.some(item => getPlaceId(item) === targetId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, toggleWishlist, isInWishlist, getPlaceId,
      isWishlistOpen, setIsWishlistOpen 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
