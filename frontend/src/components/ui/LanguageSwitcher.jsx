// LanguageSwitcher.jsx — Language switcher dropdown
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const LANGS = [
  { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'Русский',   flag: '🇷🇺' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-surface-card border border-slate-600/80
                   hover:border-primary-500/45 transition-all duration-150 text-slate-300 hover:text-slate-100"
      >
        <span className="text-sm font-medium lowercase">{lang}</span>
        <span className="text-sm font-semibold tracking-wide">{lang.toUpperCase()}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 glass-card shadow-xl shadow-black/30 z-50 animate-fade-in">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => { changeLanguage(l.code); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors
                ${lang === l.code
                  ? 'text-primary-300 bg-primary-600/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}
            >
              <span>{l.flag}</span>
              <span className="font-medium">{l.label}</span>
              {lang === l.code && <span className="ml-auto text-primary-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}