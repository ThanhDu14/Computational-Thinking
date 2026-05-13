import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as wishlistService from '../services/wishlistService';
import { getLocationById } from '../services/locationService';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Helper to normalize location data from API
  const normalizeLocation = useCallback((data) => {
    if (!data) return null;
    
    // Normalize images
    const allImages = (data.images || []).map(img => 
      typeof img === 'string' ? img : (img.image || img.url || '')
    ).filter(Boolean);
    
    const image = allImages.length > 0 ? allImages[0] : '';
    
    return {
      ...data,
      id: data.id || data.location_id,
      name: data.name || data.location_name || 'Địa điểm',
      image: image,
      location: data.city || data.region || data.address || '',
      description: data.description || '',
      rating: data.rating || data.overall_rating || 0,
      price: data.price || null,
      // Keep original arrays if needed
      categories: data.categories || [],
      images: allImages
    };
  }, []);

  // Load wishlist from API when authenticated
  const fetchWishlistData = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      return;
    }

    setLoading(true);
    try {
      const wishlistItems = await wishlistService.getMyWishlist();
      
      // Fetch details for each location in the wishlist
      const detailedWishlist = await Promise.all(
        wishlistItems.map(async (item) => {
          try {
            const data = await getLocationById(item.location_id);
            return normalizeLocation(data);
          } catch (err) {
            console.error(`Error fetching details for location ${item.location_id}:`, err);
            return null;
          }
        })
      );

      setWishlist(detailedWishlist.filter(item => item !== null));
    } catch (error) {
      console.error("Error loading wishlist from API:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, normalizeLocation]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData, user]);

  const toggleWishlist = async (place) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để lưu vào Wishlist / Please login to use Wishlist");
      return;
    }
    
    const placeId = place.id || place.location_id;
    const exists = wishlist.some(item => (item.id || item.location_id) === placeId);
    
    try {
      if (exists) {
        await wishlistService.removeFromWishlist(placeId);
        setWishlist(prev => prev.filter(item => (item.id || item.location_id) !== placeId));
      } else {
        await wishlistService.addToWishlist(placeId);
        // Add the place object to local state immediately
        setWishlist(prev => [...prev, normalizeLocation(place)]);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert("Có lỗi xảy ra khi cập nhật Wishlist. Vui lòng thử lại.");
    }
  };

  const isInWishlist = (placeOrId) => {
    const targetId = typeof placeOrId === 'object' ? (placeOrId.id || placeOrId.location_id) : placeOrId;
    return wishlist.some(item => (item.id || item.location_id) === targetId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, toggleWishlist, isInWishlist, loading,
      isWishlistOpen, setIsWishlistOpen, refreshWishlist: fetchWishlistData
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

