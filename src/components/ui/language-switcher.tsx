'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  id: 'Bahasa Indonesia',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch'
};

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        onClick={toggleDropdown}
        type="button"
        className="flex items-center gap-2 px-4 bg-white border border-slate-200 rounded-full hover:bg-[#FFFDF5] active:bg-[#FFFDF5] focus:outline-none focus:ring-2 focus:ring-[#006948] transition-all duration-200 shadow-sm min-h-[52px] min-w-[52px]"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Select Language, currently ${LANGUAGE_NAMES[currentLocale]}`}
      >
        <Globe className="w-5 h-5 text-slate-500 shrink-0" />
        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          {currentLocale}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-100 shadow-[0_8px_32px_rgba(15,23,42,0.08)] ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-2" role="none">
            {Object.entries(LANGUAGE_NAMES).map(([code, name]) => {
              const isActive = code === currentLocale;
              return (
                <button
                  key={code}
                  onClick={() => handleLanguageChange(code)}
                  className={`w-full text-left flex items-center justify-between px-4 py-3.5 text-sm font-semibold transition-colors duration-150 min-h-[48px] ${
                    isActive
                      ? 'bg-[#FFFDF5] text-[#006948]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  role="menuitem"
                  tabIndex={0}
                >
                  <span className="font-bold">{name}</span>
                  {isActive && <Check className="w-4 h-4 text-[#006948]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
