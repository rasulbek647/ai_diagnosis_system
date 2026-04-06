// AdminPage.jsx — Admin panel with user management + system stats
import { useEffect, useState } from 'react';
import { ShieldCheck, Users, Activity, TrendingUp, Trash2, Crown, UserX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';

const isDemo = import.meta.env.VITE_DEMO === 'true';

const DEMO_ADMIN_USERS = [
  { id: 1, full_name: 'matyoquboff___', email: 'matyoquboffrasulbrek@gmail.com', role: 'admin', is_active: true, created_at: new Date().toISOString() },
  { id: 2, full_name: 'Ali Valiyev', email: 'ali@example.com', role: 'user', is_active: true, created_at: new Date().toISOString() },
  { id: 3, full_name: 'Malika Tosheva', email: 'malika@example.com', role: 'user', is_active: true, created_at: new Date().toISOString() },
];

const DEMO_ADMIN_STATS = { total_users: 3, active_today: 1, total_diagnoses: 12, avg_probability: 0.67 };

const DEMO_ADMIN_DIAGNOSES = [
  {
    id: 'demo-d1',
    user_name: 'matyoquboff___',
    user_email: 'matyoquboffrasulbrek@gmail.com',
    created_at: new Date().toISOString(),
    top_diagnosis: 'ARVI (Tez-tez shamollash)',
    symptoms: ['yo\'tal', 'isitma'],
    results: [{ probability: 0.72, name: 'ARVI (Tez-tez shamollash)' }],
  },
];

export default function AdminPage() {
  const { t } = useLanguage();
  const { isAdmin: adminCheck } = useAuth();
  const navigate = useNavigate();

  const [users,        setUsers]        = useState([]);
  const [allDiagnoses, setAllDiagnoses] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('users'); // 'users' | 'diagnoses'

  // Guard: redirect non-admins
  useEffect(() => {
    if (!adminCheck) navigate('/dashboard');
  }, [adminCheck, navigate]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (isDemo) {
          const localUsers = localStorage.getItem('demo_users');
          if (localUsers) {
            setUsers(JSON.parse(localUsers));
          } else {
            setUsers(DEMO_ADMIN_USERS);
            localStorage.setItem('demo_users', JSON.stringify(DEMO_ADMIN_USERS));
          }
          setStats(DEMO_ADMIN_STATS);
          setAllDiagnoses(DEMO_ADMIN_DIAGNOSES);
          return;
        }
        const [usersRes, statsRes, diagRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/stats'),
          api.get('/admin/diagnoses?limit=20'),
        ]);
        setUsers(usersRes.data || []);
        setStats(statsRes.data || {});
        setAllDiagnoses(diagRes.data?.items || []);
      } catch {
        setUsers(DEMO_ADMIN_USERS);
        setStats(DEMO_ADMIN_STATS);
        setAllDiagnoses(DEMO_ADMIN_DIAGNOSES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggleAdmin = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (isDemo) {
      setUsers((u) => {
        const nextUsers = u.map((usr) => (usr.id === userId ? { ...usr, role: nextRole } : usr));
        localStorage.setItem('demo_users', JSON.stringify(nextUsers));
        return nextUsers;
      });
      toast.success('Rol yangilandi');
      return;
    }
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: nextRole });
      toast.success('Rol yangilandi');
      setUsers((u) =>
        u.map((usr) => (usr.id === userId ? { ...usr, role: nextRole } : usr))
      );
    } catch {
      toast.error(t.error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t.confirmDelete)) return;
    if (isDemo) {
      setUsers((u) => {
        const nextUsers = u.filter((usr) => usr.id !== userId);
        localStorage.setItem('demo_users', JSON.stringify(nextUsers));
        return nextUsers;
      });
      toast.success("Foydalanuvchi o'chirildi");
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success("Foydalanuvchi o'chirildi");
      setUsers((u) => u.filter((usr) => usr.id !== userId));
    } catch {
      toast.error(t.error);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <ShieldCheck size={20} className="text-purple-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100">{t.adminTitle}</h2>
          <p className="text-slate-500 text-sm">{t.adminSubtitle}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t.totalUsers}      value={stats?.total_users ?? 0}     icon={Users}     color="blue"   />
        <StatCard label={t.activeToday}     value={stats?.active_today ?? 0}    icon={Activity}  color="green"  />
        <StatCard label={t.allDiagnoses}    value={stats?.total_diagnoses ?? 0} icon={TrendingUp} color="amber"  />
        <StatCard label="O'rtacha ehtimol"  value={`${Math.round((stats?.avg_probability || 0) * 100)}%`} icon={ShieldCheck} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-surface-border w-fit">
        {[
          { key: 'users',     label: t.userManagement, icon: Users },
          { key: 'diagnoses', label: t.allDiagnoses,   icon: Activity },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-surface-card text-slate-100 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* User management table */}
      {tab === 'users' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.fullName}</th>
                  <th>{t.email}</th>
                  <th>{t.role}</th>
                  <th>{t.status}</th>
                  <th>Qo'shilgan</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id}>
                    <td className="text-slate-600 font-mono text-xs">{idx + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.full_name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-200">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-xs text-slate-400">{u.email}</td>
                    <td>
                      <Badge variant={u.role === 'admin' ? 'purple' : 'default'}>
                        {u.role === 'admin' ? '👑 Admin' : 'Foydalanuvchi'}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.is_active ? 'success' : 'danger'}>
                        {u.is_active ? t.active : t.inactive}
                      </Badge>
                    </td>
                    <td className="font-mono text-xs text-slate-500">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAdmin(u.id, u.role)}
                          title={u.role === 'admin' ? t.revokeAdmin : t.makeAdmin}
                          className="p-1.5 rounded-lg hover:bg-purple-500/10 text-slate-500 hover:text-purple-400 transition-colors"
                        >
                          {u.role === 'admin' ? <UserX size={14} /> : <Crown size={14} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title={t.deleteUser}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All diagnoses table */}
      {tab === 'diagnoses' && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Foydalanuvchi</th>
                  <th>{t.date}</th>
                  <th>{t.topDiagnosis}</th>
                  <th>{t.symptoms}</th>
                  <th>{t.probability}</th>
                </tr>
              </thead>
              <tbody>
                {allDiagnoses.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-slate-500">{t.noData}</td></tr>
                ) : allDiagnoses.map((d, i) => (
                  <tr key={d.id}>
                    <td className="font-mono text-xs text-slate-600">{i + 1}</td>
                    <td className="text-sm text-slate-300">{d.user_name || d.user_email || '—'}</td>
                    <td className="font-mono text-xs text-slate-500">{formatDate(d.created_at)}</td>
                    <td className="text-sm font-semibold text-slate-200">{d.top_diagnosis || '—'}</td>
                    <td className="text-slate-500 text-xs">{d.symptoms?.slice(0, 3).join(', ')}</td>
                    <td>
                      <Badge variant={
                        (d.results?.[0]?.probability || 0) >= 0.65 ? 'danger' :
                        (d.results?.[0]?.probability || 0) >= 0.35 ? 'warning' : 'success'
                      }>
                        {Math.round((d.results?.[0]?.probability || 0) * 100)}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}