// RegisterForm.jsx — Registration form
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function RegisterForm() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())              e.fullName = 'Ism kiritilishi shart';
    if (!form.email)                        e.email    = 'Email kiritilishi shart';
    if (form.password.length < 6)           e.password = 'Parol kamida 6 ta belgi';
    if (form.password !== form.confirm)     e.confirm  = 'Parollar mos emas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      toast.success(t.registerSuccess);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.detail || t.error;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.fullName}</label>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            placeholder="Ism Familiya"
            className={`input-field pl-10 ${errors.fullName ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.email}</label>
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="example@email.com"
            className={`input-field pl-10 ${errors.email ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.password}</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showPwd ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            className={`input-field pl-10 pr-12 ${errors.password ? 'border-red-500' : ''}`}
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1.5">{t.confirmPassword}</label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="password"
            value={form.confirm}
            onChange={e => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            className={`input-field pl-10 ${errors.confirm ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
      </div>

      <Button type="submit" variant="primary" fullWidth loading={loading}>
        {t.register}
      </Button>

      <p className="text-center text-sm text-slate-500">
        {t.haveAccount}{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          {t.loginHere}
        </Link>
      </p>
    </form>
  );
}