// Navbar.jsx — Top navigation bar (mobile hamburger + lang switcher)
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import Sidebar from './Sidebar';

export default function Navbar({ title }) {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-surface-border bg-surface-card/60 backdrop-blur-sm sticky top-0 z-30">
        {/* Mobile hamburger */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Page title */}
        <h1 className="font-display font-bold text-slate-100 text-2xl tracking-tight hidden lg:block">{title}</h1>
        <div className="lg:hidden font-display font-semibold text-slate-100">{t.appName}</div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
        </div>
      </header>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute left-0 top-0 h-full w-[260px] animate-slide-up">
            <div className="relative h-full">
              <button
                className="absolute top-4 right-3 z-10 p-2 rounded-lg hover:bg-white/5 text-slate-400"
                onClick={() => setMobileOpen(false)}
              >
                <X size={20} />
              </button>
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}