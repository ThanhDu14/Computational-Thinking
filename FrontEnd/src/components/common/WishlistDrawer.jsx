import React from 'react';
import { useWishlist } from '../../context/WishlistContext';
import { X, Heart, MapPin, Trash2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const WishlistDrawer = () => {
    const { wishlist, isWishlistOpen, setIsWishlistOpen, toggleWishlist } = useWishlist();
    const navigate = useNavigate();

    if (!isWishlistOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity pointer-events-auto"
                onClick={() => setIsWishlistOpen(false)}
            />

            {/* Sliding Drawer */}
            <div className="fixed top-0 right-0 h-screen w-full sm:w-[400px] md:w-[450px] bg-surface-container-lowest shadow-2xl z-[101] flex flex-col transform transition-transform duration-300 ease-in-out font-body animate-in slide-in-from-right-full pointer-events-auto">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-outline-variant/20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                        </div>
                        <h2 className="text-xl font-display font-bold text-on-surface">Danh sách Yêu thích</h2>
                        <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{wishlist.length}</span>
                    </div>
                    <button 
                        onClick={() => setIsWishlistOpen(false)}
                        className="p-2 hover:bg-outline-variant/20 rounded-full transition-colors text-on-surface-variant"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    {wishlist.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                            <div className="w-20 h-20 bg-outline-variant/10 rounded-full flex items-center justify-center mb-4">
                                <Heart className="w-10 h-10 text-outline" />
                            </div>
                            <p className="font-bold text-on-surface mb-2">Chưa có gì ở đây cả!</p>
                            <p className="text-sm text-on-surface-variant max-w-[250px]">
                                Hãy dạo một vòng và thả tim vài địa điểm thú vị nhé.
                            </p>
                            <button 
                                onClick={() => { setIsWishlistOpen(false); navigate('/destinations'); }}
                                className="mt-6 px-6 py-2.5 bg-primary/10 text-primary font-bold rounded-full hover:bg-primary/20 transition-colors"
                            >
                                Đi khám phá
                            </button>
                        </div>
                    ) : (
                        wishlist.map((place, idx) => (
                            <div key={`wl-${idx}`} className="flex gap-4 p-3 bg-surface-container/30 hover:bg-surface-container rounded-2xl border border-outline-variant/20 transition-colors group">
                                {/* Image */}
                                <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden cursor-pointer" onClick={() => { setIsWishlistOpen(false); navigate('/place/' + encodeURIComponent(place.location_name)); }}>
                                    <img 
                                        src={place.images?.[0] || place.image || "https://placehold.co/150"} 
                                        alt={place.location_name} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                {/* Details */}
                                <div className="flex flex-col flex-1 py-1 overflow-hidden">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 
                                            onClick={() => { setIsWishlistOpen(false); navigate('/place/' + encodeURIComponent(place.location_name)); }}
                                            className="font-bold text-on-surface line-clamp-1 hover:text-primary cursor-pointer transition-colors"
                                        >
                                            {place.location_name || place.name}
                                        </h3>
                                        <button 
                                            onClick={() => toggleWishlist(place)}
                                            className="p-1.5 text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 -mr-1"
                                            title="Xóa khỏi Wishlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mb-auto line-clamp-1">
                                        <MapPin className="w-3 h-3 text-primary" /> {place.region || place.location || 'Unknown'}
                                    </p>
                                    
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm font-bold text-primary">Free</span>
                                        <button 
                                            onClick={() => { setIsWishlistOpen(false); navigate('/place/' + encodeURIComponent(place.location_name)); }}
                                            className="text-xs font-bold flex items-center gap-1 group-hover:underline text-on-surface"
                                        >
                                            Chi tiết <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer fixed */}
                {wishlist.length > 0 && (
                    <div className="p-6 border-t border-outline-variant/20 shrink-0 bg-surface-container-lowest/80 backdrop-blur-md">
                        <Link 
                            to="/wishlist" 
                            onClick={() => setIsWishlistOpen(false)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all hover:-translate-y-1"
                        >
                            Xem trang toàn màn hình <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default WishlistDrawer;
