// LoginPage.jsx — Full-screen login page
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LoginForm from '../components/auth/LoginForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex">
      {/* Left — decorative panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-950 via-surface to-surface-card items-center justify-center p-12">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-2xl shadow-primary-600/40 mb-8">
            <Activity size={36} className="text-white" />
          </div>

          <h1 className="font-display text-4xl font-bold text-slate-100 mb-4">
            {t.appName}
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            {t.appTagline}
          </p>

          {/* Feature pills */}
          {['🤖 AI tahlil', '📊 Ehtimollik', '💊 Tavsiyalar', '🌐 Ko\'p tilli'].map(f => (
            <div key={f} className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-400 text-sm m-1">
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-100">{t.appName}</span>
          </div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Form card */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="glass-card p-8">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold text-slate-100">{t.loginTitle}</h2>
                <p className="text-slate-500 mt-1 text-sm">AI tashxis tizimiga xush kelibsiz</p>
              </div>
              <LoginForm />
            </div>

            {/* Demo credentials hint */}
            <div className="mt-4 p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 text-xs text-slate-500 text-center">
              Demo: <span className="text-primary-400 font-mono">admin@medai.uz</span> / <span className="text-primary-400 font-mono">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}