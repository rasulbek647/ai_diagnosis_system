// DiagnosisResult.jsx — AI result display with probability bars + recommendations
import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Stethoscope, Save } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Badge, { severityVariant } from '../ui/Badge';
import Button from '../ui/Button';
import clsx from 'clsx';

// Map probability to severity
function getSeverity(prob) {
  if (prob >= 0.65) return 'high';
  if (prob >= 0.35) return 'medium';
  return 'low';
}

// Map severity to color for the probability bar
const BAR_COLORS = {
  high:   'bg-red-500',
  medium: 'bg-amber-500',
  low:    'bg-emerald-500',
};

function DiseaseCard({ disease, index, t }) {
  const [expanded, setExpanded] = useState(index === 0); // first one open by default
  const severity = getSeverity(disease.probability);
  const pct = Math.round(disease.probability * 100);

  return (
    <div
      className={clsx(
        'rounded-xl border transition-all duration-200',
        severity === 'high'   && 'border-red-500/30 bg-red-500/5',
        severity === 'medium' && 'border-amber-500/30 bg-amber-500/5',
        severity === 'low'    && 'border-emerald-500/30 bg-emerald-500/5',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* Rank */}
        <div className={clsx(
          'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0',
          index === 0 ? 'bg-primary-600/30 text-primary-300' : 'bg-slate-700 text-slate-400'
        )}>
          {index + 1}
        </div>

        {/* Name + bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-slate-100 truncate">{disease.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
              <Badge variant={severityVariant(severity)}>
                {t[severity]}
              </Badge>
              <span className={clsx(
                'font-mono font-bold text-lg',
                severity === 'high'   && 'text-red-400',
                severity === 'medium' && 'text-amber-400',
                severity === 'low'    && 'text-emerald-400',
              )}>
                {pct}%
              </span>
            </div>
          </div>

          {/* Animated probability bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={clsx('prob-bar', BAR_COLORS[severity])}
              style={{
                width: `${pct}%`,
                transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${index * 150}ms`,
              }}
            />
          </div>
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 text-slate-500 ml-2">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded: description + recommendations */}
      {expanded && (
        <div className="px-5 pb-4 border-t border-white/5 pt-4 space-y-4 animate-fade-in">
          {/* Description */}
          {disease.description && (
            <div className="flex gap-2 text-slate-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-slate-500" />
              <p>{disease.description}</p>
            </div>
          )}

          {/* Recommendations */}
          {disease.recommendations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t.recommendations}
              </p>
              <ul className="space-y-1.5">
                {disease.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-300">
                    <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-emerald-500" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Consult doctor */}
          {severity === 'high' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <Stethoscope size={15} />
              <span className="font-medium">{t.consultDoctor}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiagnosisResult({ results, onSave, onNew, saving }) {
  const { t } = useLanguage();
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Results header */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-slate-100 text-lg">{t.results}</h3>
        <span className="text-xs text-slate-500 bg-surface px-3 py-1 rounded-full border border-surface-border">
          AI analysis
        </span>
      </div>

      {/* Disease cards */}
      <div className="space-y-3">
        {results.map((disease, i) => (
          <DiseaseCard key={disease.id || i} disease={disease} index={i} t={t} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button variant="primary" onClick={onSave} loading={saving}>
          <Save size={15} />
          {t.saveResult}
        </Button>
        <Button variant="secondary" onClick={onNew}>
          {t.newDiagnosis}
        </Button>
      </div>
    </div>
  );
}