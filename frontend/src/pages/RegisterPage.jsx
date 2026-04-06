// RegisterPage.jsx — Registration page
import { Activity } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import RegisterForm from '../components/auth/RegisterForm';
import LanguageSwitcher from '../components/ui/LanguageSwitcher';

export default function RegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Activity size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-slate-100">{t.appName}</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Ambient glow */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="glass-card p-8 relative">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-600/30 mb-4">
                <Activity size={24} className="text-white" />
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-100">{t.registerTitle}</h2>
              <p className="text-slate-500 text-sm mt-1">Yangi hisob yarating</p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}