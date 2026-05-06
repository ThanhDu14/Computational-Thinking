import React, { useState, useRef } from 'react';
import { Star, X, ImagePlus, Loader2, AlertCircle } from 'lucide-react';
import { uploadReviewImages, createReview, updateReview } from '../../services/reviewService';

const MAX_FILES = 5;
const MAX_MB = 10;

/**
 * ReviewForm – Form tạo / sửa review.
 * Props:
 *   locationId – string, ID địa điểm (bắt buộc khi tạo mới)
 *   getToken   – async function() => string, lấy JWT token (được gọi lúc submit)
 *   initialData – object|null, review cần sửa (null = tạo mới)
 *   onSuccess  – callback() sau khi submit thành công
 *   onCancel   – callback() khi huỷ
 */
export default function ReviewForm({ locationId, getToken, initialData = null, onSuccess, onCancel }) {
    const isEdit = !!initialData;

    const [rating, setRating] = useState(initialData?.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState(initialData?.comment || '');
    const [files, setFiles] = useState([]); // File objects mới thêm
    const [existingImages, setExistingImages] = useState(initialData?.images || []); // URL ảnh cũ (edit mode)
    const [previews, setPreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);

        // Validate số lượng
        if (files.length + selected.length + existingImages.length > MAX_FILES) {
            setError(`Tối đa ${MAX_FILES} ảnh.`);
            return;
        }

        // Validate kích thước
        const oversized = selected.filter(f => f.size > MAX_MB * 1024 * 1024);
        if (oversized.length > 0) {
            setError(`Mỗi ảnh phải nhỏ hơn ${MAX_MB}MB.`);
            return;
        }

        setError('');
        setFiles(prev => [...prev, ...selected]);

        // Tạo preview URLs
        selected.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setPreviews(prev => [...prev, { url: ev.target.result, name: file.name }]);
            };
            reader.readAsDataURL(file);
        });

        // Reset input để có thể chọn lại cùng file
        e.target.value = '';
    };

    const removeNewFile = (idx) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
        setPreviews(prev => prev.filter((_, i) => i !== idx));
    };

    const removeExistingImage = (idx) => {
        setExistingImages(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { setError('Vui lòng chọn số sao đánh giá.'); return; }
        if (!comment.trim()) { setError('Vui lòng nhập nhận xét.'); return; }

        setLoading(true);
        setError('');

        try {
            const token = typeof getToken === 'function' ? await getToken() : null;
            if (!token) {
                setError('Bạn cần đăng nhập để gửi đánh giá.');
                setLoading(false);
                return;
            }

            let imageUrls = [...existingImages];

            // Bước 1: Upload ảnh mới (nếu có)
            if (files.length > 0) {
                const uploaded = await uploadReviewImages(token, files);
                imageUrls = [...imageUrls, ...uploaded];
            }

            // Bước 2: Tạo hoặc cập nhật review
            if (isEdit) {
                await updateReview(token, initialData.review_id, {
                    rating,
                    comment: comment.trim(),
                    images: imageUrls
                });
            } else {
                await createReview(token, {
                    location_id: locationId,
                    rating,
                    comment: comment.trim(),
                    images: imageUrls
                });
            }

            onSuccess && onSuccess();
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };


    const totalImages = existingImages.length + files.length;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Star Rating */}
            <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Đánh giá của bạn *</label>
                <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(s => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => setRating(s)}
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 transition-transform hover:scale-125 active:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 transition-colors ${
                                    s <= (hoverRating || rating)
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-outline-variant/40 hover:text-amber-300'
                                }`}
                            />
                        </button>
                    ))}
                    {rating > 0 && (
                        <span className="text-sm font-bold text-on-surface-variant ml-2">
                            {['', 'Tệ', 'Không hay', 'Bình thường', 'Tốt', 'Xuất sắc'][rating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Comment */}
            <div>
                <label className="block text-sm font-bold text-on-surface mb-2">Nhận xét *</label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về địa điểm này..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface-container-low text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none text-sm font-medium"
                />
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-bold text-on-surface mb-2">
                    Hình ảnh <span className="font-normal text-on-surface-variant/70">({totalImages}/{MAX_FILES} ảnh)</span>
                </label>

                {/* Preview grid */}
                <div className="flex flex-wrap gap-3 mb-3">
                    {/* Ảnh cũ (edit mode) */}
                    {existingImages.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-primary/20 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeExistingImage(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    ))}

                    {/* Ảnh mới đang preview */}
                    {previews.map((p, idx) => (
                        <div key={`preview-${idx}`} className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-outline-variant/30 group">
                            <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => removeNewFile(idx)}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    ))}

                    {/* Add button */}
                    {totalImages < MAX_FILES && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant/50 flex flex-col items-center justify-center gap-1 text-on-surface-variant hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                        >
                            <ImagePlus className="w-6 h-6" />
                            <span className="text-[10px] font-bold">Thêm ảnh</span>
                        </button>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
                <p className="text-xs text-on-surface-variant/60">Tối đa 5 ảnh, mỗi ảnh dưới 10MB.</p>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-primary/20"
                >
                    {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                    ) : (
                        isEdit ? '💾 Lưu thay đổi' : '⭐ Gửi đánh giá'
                    )}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="py-3 px-5 rounded-xl border border-outline-variant/30 text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors disabled:opacity-60"
                    >
                        Huỷ
                    </button>
                )}
            </div>
        </form>
    );
}
