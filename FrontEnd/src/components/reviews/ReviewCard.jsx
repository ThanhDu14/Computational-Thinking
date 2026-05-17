import React, { useState } from 'react';
import { Star, Trash2, Edit3, X, ChevronLeft, ChevronRight, UserCircle, ImageIcon } from 'lucide-react';
import ConfirmModal from '../common/ConfirmModal';

/**
 * ReviewCard – Hiển thị 1 review với avatar, rating, bình luận và ảnh.
 * Props:
 *   review     – object review từ API { review_id, user_id, rating, comment, images[], created_at, user_name? }
 *   currentUserId – ID của user đang đăng nhập (dùng để ẩn/hiện nút Edit/Delete)
 *   onEdit     – callback(review) khi nhấn nút sửa
 *   onDelete   – callback(reviewId) khi nhấn nút xóa
 */
export default function ReviewCard({ review, currentUserId, currentUser, onEdit, onDelete }) {
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    const isOwner = currentUserId && review.user_id === currentUserId;
    const images = review.images || [];
    const rating = Number(review.rating) || 0;

    let displayName = review.user_name || review.reviewer_name;
    if (isOwner && currentUser) {
        displayName = currentUser.name || currentUser.display_name || currentUser.username || displayName;
    }
    if (!displayName) {
        displayName = `User #${String(review.user_id).slice(-4)}`;
    }

    const avatarLetter = displayName.charAt(0).toUpperCase();

    const formattedDate = review.created_at
        ? new Date(review.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

    const handleDelete = () => {
        if (!deleteConfirm) { setDeleteConfirm(true); return; }
        onDelete && onDelete(review.review_id);
        setDeleteConfirm(false);
    };

    return (
        <>
            {/* Card */}
            <div className="review-card group flex flex-col gap-4 p-6 rounded-2xl border border-outline-variant/20 bg-surface/60 backdrop-blur-sm hover:bg-surface/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">

                {/* Header: Avatar + Name + Rating + Actions */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                            <span className="font-bold text-primary text-base">{avatarLetter}</span>
                        </div>
                        {/* Name + Date */}
                        <div>
                            <p className="font-bold text-on-surface text-sm leading-tight">{displayName}</p>
                            {formattedDate && (
                                <p className="text-xs text-on-surface-variant/70 mt-0.5">{formattedDate}</p>
                            )}
                        </div>
                    </div>

                    {/* Rating badge */}
                    <div className="flex items-center gap-1 shrink-0">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-outline-variant/40'}`}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant ml-1">{rating.toFixed(1)}</span>
                    </div>
                </div>

                {/* Comment */}
                {review.comment && (
                    <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-4 font-medium">
                        "{review.comment}"
                    </p>
                )}

                {/* Images */}
                {images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {images.slice(0, 4).map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => setLightboxIdx(idx)}
                                className="relative rounded-xl overflow-hidden w-16 h-16 shrink-0 ring-1 ring-outline-variant/30 hover:ring-primary/50 transition-all"
                            >
                                <img src={url} alt={`review-img-${idx}`} className="w-full h-full object-cover" />
                                {idx === 3 && images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">+{images.length - 4}</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Owner Actions */}
                {isOwner && (
                    <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/10">
                        <button
                            onClick={() => { onEdit && onEdit(review); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-primary bg-primary/8 hover:bg-primary/15 transition-colors"
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Sửa
                        </button>
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors text-red-500 bg-red-500/8 hover:bg-red-500/15"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Xóa
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal 
                isOpen={deleteConfirm}
                onClose={() => setDeleteConfirm(false)}
                onConfirm={() => onDelete && onDelete(review.review_id)}
                title="Xóa đánh giá"
                message="Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác."
                confirmText="Xóa đánh giá"
                cancelText="Hủy"
                isDanger={true}
            />

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setLightboxIdx(null)}
                >
                    <button
                        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        onClick={() => setLightboxIdx(null)}
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    {/* Prev */}
                    {lightboxIdx > 0 && (
                        <button
                            className="absolute left-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i - 1); }}
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                    )}

                    <img
                        src={images[lightboxIdx]}
                        alt="review-full"
                        className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                        onClick={e => e.stopPropagation()}
                    />

                    {/* Next */}
                    {lightboxIdx < images.length - 1 && (
                        <button
                            className="absolute right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                            onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i + 1); }}
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    )}

                    <p className="absolute bottom-5 text-white/60 text-sm">{lightboxIdx + 1} / {images.length}</p>
                </div>
            )}
        </>
    );
}
