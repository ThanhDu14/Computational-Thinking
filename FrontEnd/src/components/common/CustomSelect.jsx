import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ 
    options, 
    value, 
    onChange, 
    placeholder = "Chọn...", 
    buttonClassName = "w-full bg-surface-container-low border-none rounded-2xl py-3 px-4 text-on-surface focus:ring-2 focus:ring-primary/20 outline-none font-body text-sm flex justify-between items-center",
    dropdownClassName = "absolute z-50 w-full mt-2 bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl",
    optionClassName = "text-on-surface hover:bg-surface-container-high",
    activeOptionClassName = "bg-primary/10 text-primary font-bold"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

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
                    <ul className="max-h-[220px] overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-outline-variant/50 scrollbar-track-transparent">
                        {options.map((opt) => (
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
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
