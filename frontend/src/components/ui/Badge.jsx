// Badge.jsx — Status/severity badges
import clsx from 'clsx';

const variants = {
  success: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30',
  warning: 'bg-amber-400/10 text-amber-400 border-amber-400/30',
  danger:  'bg-red-400/10 text-red-400 border-red-400/30',
  info:    'bg-primary-400/10 text-primary-400 border-primary-400/30',
  purple:  'bg-purple-400/10 text-purple-400 border-purple-400/30',
  default: 'bg-slate-700 text-slate-300 border-slate-600',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border',
      variants[variant], className
    )}>
      {children}
    </span>
  );
}

export function severityVariant(severity) {
  if (severity === 'high')   return 'danger';
  if (severity === 'medium') return 'warning';
  return 'success';
}