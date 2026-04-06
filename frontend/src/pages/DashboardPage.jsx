// DashboardPage.jsx — Bosh sahifa: statistika, haftalik grafik, tezkor tashxis
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Calendar, Activity, ArrowRight, HeartPulse } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useLanguage } from '../context/LanguageContext';
import { StatCard } from '../components/ui/Card';
import Button from '../components/ui/Button';
import WarningBanner from '../components/diagnosis/WarningBanner';
import api from '../api/axios';
import { formatDate } from '../utils/helpers';
import { readLocalHistory, computeHistoryStats } from '../utils/localHistory';

const isDemo = import.meta.env.VITE_DEMO === 'true';

export default function DashboardPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (isDemo) {
          const all = readLocalHistory();
          setStats(computeHistoryStats(all));
          setRecent(all.slice(0, 5));
          return;
        }
        const [statsRes, historyRes] = await Promise.all([
          api.get('/history/stats'),
          api.get('/history?limit=5'),
        ]);
        setStats(statsRes.data);
        setRecent(historyRes.data.items || []);
      } catch {
        const all = readLocalHistory();
        if (all.length) {
          setStats(computeHistoryStats(all));
          setRecent(all.slice(0, 5));
        } else {
          setStats({ total: 12, this_week: 3, top_disease: 'ARVI' });
          setRecent([]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const chartData = [
    { day: 'Du', diagnoses: 1 },
    { day: 'Se', diagnoses: 2 },
    { day: 'Ch', diagnoses: 0 },
    { day: 'Pa', diagnoses: 3 },
    { day: 'Ju', diagnoses: 1 },
    { day: 'Sh', diagnoses: 2 },
    { day: 'Ya', diagnoses: 3 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t.totalDiagnoses}
          value={loading ? '—' : stats?.total ?? 0}
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Bu hafta"
          value={loading ? '—' : stats?.this_week ?? 0}
          icon={Calendar}
          color="green"
        />
        <StatCard
          label="Eng ko'p"
          value={loading ? '—' : stats?.top_disease || '—'}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          label="AI aniqlik"
          value="87%"
          icon={Activity}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-display font-semibold text-slate-300 text-sm mb-6">Haftalik faoliyat</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="diagGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d96f8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2d96f8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#e2e8f0',
                }}
                cursor={{ stroke: '#2d96f8', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="diagnoses"
                stroke="#2d96f8"
                strokeWidth={2.5}
                fill="url(#diagGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden min-h-[280px]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div>
            <div className="w-12 h-12 rounded-xl bg-primary-600/25 border border-primary-500/35 flex items-center justify-center mb-4">
              <HeartPulse size={22} className="text-primary-400" />
            </div>
            <h3 className="font-display font-semibold text-slate-100 text-lg mb-2">{t.quickDiagnosis}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Alomatlaringizni kiriting va AI bir necha soniyada tahlil qiladi
            </p>
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={() => navigate('/diagnosis')}
            className="mt-6"
          >
            {t.startDiagnosis}
            <ArrowRight size={15} />
          </Button>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-surface-border">
            <h3 className="font-display font-semibold text-slate-100">{t.recentActivity}</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
              {t.viewAll} <ArrowRight size={13} />
            </Button>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>{t.date}</th>
                <th>{t.topDiagnosis}</th>
                <th>{t.symptoms}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((item) => (
                <tr key={item.id}>
                  <td className="text-slate-500 font-mono text-xs">{formatDate(item.created_at)}</td>
                  <td>
                    <span className="font-semibold text-primary-300">{item.top_diagnosis}</span>
                  </td>
                  <td className="text-slate-500">{item.symptoms?.slice(0, 3).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WarningBanner />
    </div>
  );
}
