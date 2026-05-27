import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

// Helper to remove Vietnamese accents for searching
const removeAccents = (str) => {
    if (!str) return '';
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
};

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Chọn...",
    searchable = null, // If null, auto-enable when options.length > 5
    buttonClassName = "w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm flex justify-between items-center",
    dropdownClassName = "absolute z-50 w-full mt-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl",
    optionClassName = "text-on-surface hover:bg-surface-container-high",
    activeOptionClassName = "bg-primary/10 text-primary font-bold"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    const isSearchEnabled = searchable !== null ? searchable : options.length > 5;

    const selectedOption = options.find(opt => opt.value === value) || options[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset search term when dropdown closes
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    const filteredOptions = options.filter(opt => {
        const label = opt.label || '';
        const rawLabel = removeAccents(label.toLowerCase());
        const rawSearch = removeAccents(searchTerm.toLowerCase());
        return rawLabel.includes(rawSearch);
    });

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                className={buttonClassName}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`w-4 h-4 ml-2 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={dropdownClassName}>
                    {isSearchEnabled && (
                        <div className="px-3 pt-3 pb-2 border-b border-outline-variant/20 sticky top-0 bg-surface-container-low/95 backdrop-blur-md z-10 flex items-center gap-2">
                            <Search className="w-4 h-4 text-on-surface-variant shrink-0" />
                            <input
                                type="text"
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-surface-container-high/50 border border-outline-variant/25 focus:border-primary/40 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/10 font-body transition-all"
                                autoFocus
                            />
                        </div>
                    )}
                    <ul className="max-h-[220px] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-outline-variant/50 scrollbar-track-transparent">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => (
                                <li
                                    key={opt.value}
                                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between font-body ${value === opt.value ? activeOptionClassName : optionClassName}`}
                                    onClick={() => {
                                        // Bắt chước event object của select để không phải sửa code gốc nhiều
                                        onChange({ target: { value: opt.value } });
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="truncate pr-2">{opt.label}</span>
                                    {value === opt.value && <Check className="w-4 h-4 shrink-0" />}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-xs text-on-surface-variant italic text-center font-body">
                                Không tìm thấy kết quả nào
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
