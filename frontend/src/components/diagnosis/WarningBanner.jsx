// WarningBanner.jsx — Medical disclaimer warning
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function WarningBanner() {
  const { t } = useLanguage();

  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-amber-500/40 bg-amber-950/20 animate-fade-in">
      <div className="flex-shrink-0 mt-0.5">
        <AlertTriangle size={20} className="text-amber-400" />
      </div>
      <p className="text-sm leading-relaxed text-slate-300">
        <span className="font-semibold text-amber-400">{t.warningTitle}</span>{' '}
        {t.warningText}
      </p>
    </div>
  );
}