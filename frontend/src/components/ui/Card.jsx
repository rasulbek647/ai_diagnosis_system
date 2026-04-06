// Card.jsx — Glass-morphism card container
import clsx from 'clsx';

export default function Card({ children, className = '', title, subtitle, action, noPadding = false }) {
  return (
    <div className={clsx('glass-card overflow-hidden', className)}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-surface-border">
          <div>
            {title && <h3 className="font-display font-semibold text-slate-100 text-lg">{title}</h3>}
            {subtitle && <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0 ml-4">{action}</div>}
        </div>
      )}
      <div className={clsx(!noPadding && 'p-6')}>
        {children}
      </div>
    </div>
  );
}

// Stat card variant for the dashboard
export function StatCard({ label, value, icon: Icon, trend, color = 'blue' }) {
  const iconWrap = {
    blue:   'text-primary-400 bg-primary-400/10',
    green:  'text-emerald-400 bg-emerald-400/10',
    amber:  'text-amber-400 bg-amber-400/10',
    purple: 'text-purple-400 bg-purple-400/10',
  };
  const valueTone = {
    blue:   'text-primary-400',
    green:  'text-emerald-400',
    amber:  'text-amber-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-sm font-medium">{label}</span>
        {Icon && (
          <span className={clsx('p-2 rounded-lg', iconWrap[color])}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className={clsx('text-3xl font-display font-bold', valueTone[color])}>{value}</div>
      {trend && <div className="text-xs text-slate-500 mt-1">{trend}</div>}
    </div>
  );
}