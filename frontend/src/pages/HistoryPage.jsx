// HistoryPage.jsx — Diagnosis history list with detail view
import { useEffect, useState } from 'react';
import { History, Eye, Trash2, X, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Badge, { severityVariant } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';
import { getLocalHistoryPage, deleteLocalHistory } from '../utils/localHistory';

const isDemo = import.meta.env.VITE_DEMO === 'true';

// Detail modal
function DetailModal({ item, onClose, t }) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border sticky top-0 bg-surface-card z-10">
          <h3 className="font-display font-semibold text-slate-100">Tashxis tafsilotlari</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Date */}
          <div className="text-sm text-slate-500">
            📅 {formatDate(item.created_at)}
          </div>

          {/* Symptoms */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.symptoms}</p>
            <div className="flex flex-wrap gap-2">
              {item.symptoms?.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-lg bg-surface text-slate-400 text-xs border border-surface-border">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Results */}
          {item.results?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t.results}</p>
              <div className="space-y-2">
                {item.results.map((r, i) => {
                  const pct = Math.round((r.probability || 0) * 100);
                  const sev = pct >= 65 ? 'high' : pct >= 35 ? 'medium' : 'low';
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                      <div className="font-mono text-xs text-slate-500 w-5 text-center">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-200 text-sm font-medium truncate">{r.name}</span>
                          <span className="text-sm font-bold font-mono ml-2 flex-shrink-0" style={{
                            color: sev === 'high' ? '#f87171' : sev === 'medium' ? '#fbbf24' : '#34d399'
                          }}>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${sev === 'high' ? 'bg-red-500' : sev === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { t } = useLanguage();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [page,     setPage]     = useState(1);
  const [total,    setTotal]    = useState(0);
  const PER_PAGE = 10;

  const load = async () => {
    setLoading(true);
    const offset = (page - 1) * PER_PAGE;
    try {
      if (isDemo) {
        const { items, total } = getLocalHistoryPage(PER_PAGE, offset);
        setItems(items);
        setTotal(total);
        return;
      }
      const { data } = await api.get(`/history?limit=${PER_PAGE}&offset=${offset}`);
      setItems(data.items || []);
      setTotal(data.total ?? data.items?.length ?? 0);
    } catch {
      const { items, total } = getLocalHistoryPage(PER_PAGE, offset);
      setItems(items);
      setTotal(total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm(t.confirmDelete)) return;
    const sid = String(id);
    if (isDemo || sid.startsWith('local_')) {
      deleteLocalHistory(id);
      toast.success('O\'chirildi');
      load();
      return;
    }
    try {
      await api.delete(`/history/${id}`);
      toast.success('O\'chirildi');
      load();
    } catch {
      toast.error(t.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
          <History size={20} className="text-emerald-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100">{t.historyTitle}</h2>
          <p className="text-slate-500 text-sm">{t.historySubtitle}</p>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <div className="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
            {t.loading}
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <History size={40} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">{t.noHistory}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t.date}</th>
                  <th>{t.topDiagnosis}</th>
                  <th>{t.symptoms}</th>
                  <th>{t.probability}</th>
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const topProb = Math.round((item.results?.[0]?.probability || 0) * 100);
                  const sev = topProb >= 65 ? 'high' : topProb >= 35 ? 'medium' : 'low';
                  return (
                    <tr key={item.id}>
                      <td className="text-slate-600 font-mono text-xs">
                        {(page - 1) * PER_PAGE + idx + 1}
                      </td>
                      <td className="font-mono text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </td>
                      <td>
                        <span className="font-semibold text-slate-200 text-sm">{item.top_diagnosis || '—'}</span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {item.symptoms?.slice(0, 3).map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-surface text-slate-500 text-xs border border-surface-border">
                              {s}
                            </span>
                          ))}
                          {item.symptoms?.length > 3 && (
                            <span className="text-slate-600 text-xs">+{item.symptoms.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge variant={severityVariant(sev)}>{topProb}%</Badge>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(item)}
                            className="p-1.5 hover:bg-primary-500/10 rounded-lg text-slate-500 hover:text-primary-400 transition-colors"
                            title={t.viewDetails}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                            title={t.deleteRecord}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > PER_PAGE && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-surface-border">
            <span className="text-sm text-slate-500">
              Jami: {total} ta yozuv
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Oldingi
              </Button>
              <span className="px-3 py-1.5 text-sm text-slate-400">{page}</span>
              <Button size="sm" variant="secondary" disabled={page * PER_PAGE >= total} onClick={() => setPage(p => p + 1)}>
                Keyingi →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} t={t} />
      )}
    </div>
  );
}