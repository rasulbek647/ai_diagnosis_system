// DiagnosisPage.jsx — Main diagnosis flow page
import { useState } from 'react';
import { Stethoscope, Zap, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import SymptomSelector from '../components/diagnosis/SymptomSelector';
import DiagnosisResult from '../components/diagnosis/DiagnosisResult';
import WarningBanner from '../components/diagnosis/WarningBanner';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { appendLocalHistory } from '../utils/localHistory';

const isDemo = import.meta.env.VITE_DEMO === 'true';

// ── States of the diagnosis flow ──
const STATE = { INPUT: 'input', LOADING: 'loading', RESULT: 'result' };

export default function DiagnosisPage() {
  const { t } = useLanguage();

  const [symptoms,  setSymptoms]  = useState([]);
  const [results,   setResults]   = useState(null);
  const [flowState, setFlowState] = useState(STATE.INPUT);
  const [saving,    setSaving]    = useState(false);

  // ── Run AI diagnosis ──
  const handleAnalyze = async () => {
    if (symptoms.length === 0) {
      toast.error('Kamida 1 ta alornat kiriting');
      return;
    }
    setFlowState(STATE.LOADING);
    if (isDemo) {
      const demoResults = getDemoResults(symptoms);
      setResults(demoResults);
      setFlowState(STATE.RESULT);
      return;
    }
    try {
      const { data } = await api.post('/diagnosis/analyze', { symptoms });
      setResults(data.results);
      setFlowState(STATE.RESULT);
    } catch {
      const demoResults = getDemoResults(symptoms);
      setResults(demoResults);
      setFlowState(STATE.RESULT);
    }
  };

  // ── Save result to history ──
  const handleSave = async () => {
    if (!results) return;
    setSaving(true);
    const payload = {
      symptoms,
      results,
      top_diagnosis: results[0]?.name,
    };
    try {
      if (isDemo) {
        appendLocalHistory(payload);
        toast.success('Natija saqlandi!');
        return;
      }
      await api.post('/history', payload);
      toast.success('Natija saqlandi!');
    } catch {
      appendLocalHistory(payload);
      toast.success('Natija saqlandi! (brauzeringizda mahalliy saqlandi)');
    } finally {
      setSaving(false);
    }
  };

  // ── Reset to input ──
  const handleNew = () => {
    setSymptoms([]);
    setResults(null);
    setFlowState(STATE.INPUT);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-600/20 border border-primary-500/30 flex items-center justify-center">
          <Stethoscope size={20} className="text-primary-400" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-100">{t.diagnosisTitle}</h2>
          <p className="text-slate-500 text-sm">{t.diagnosisSubtitle}</p>
        </div>
      </div>

      {/* Warning banner — always visible */}
      <WarningBanner />

      {/* Input phase */}
      {flowState !== STATE.RESULT && (
        <Card title={t.selectSymptoms} subtitle="Quyidagi ro'yxatdan tanlang yoki o'zingiz kiriting">
          <SymptomSelector selected={symptoms} onChange={setSymptoms} />

          <div className="flex gap-3 mt-6 pt-6 border-t border-surface-border">
            <Button
              variant="primary"
              size="lg"
              loading={flowState === STATE.LOADING}
              disabled={symptoms.length === 0}
              onClick={handleAnalyze}
            >
              <Zap size={16} />
              {flowState === STATE.LOADING ? t.analyzing : t.analyzeBtn}
            </Button>

            {symptoms.length > 0 && (
              <Button variant="ghost" size="lg" onClick={() => setSymptoms([])}>
                <Trash2 size={15} />
                {t.clearAll}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Loading animation */}
      {flowState === STATE.LOADING && (
        <div className="glass-card p-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 border border-primary-500/30 mb-4">
            <Stethoscope size={28} className="text-primary-400 animate-pulse" />
          </div>
          <p className="text-slate-400 font-medium">{t.analyzing}</p>
          <p className="text-slate-600 text-sm mt-1">AI {symptoms.length} ta alomatni tahlil qilmoqda...</p>
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results phase */}
      {flowState === STATE.RESULT && results && (
        <>
          {/* Show symptoms summary */}
          <div className="glass-card px-5 py-4">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
              {t.selectedSymptoms}
            </p>
            <div className="flex flex-wrap gap-2">
              {symptoms.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-lg bg-surface text-slate-400 text-xs border border-surface-border">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <DiagnosisResult
            results={results}
            onSave={handleSave}
            onNew={handleNew}
            saving={saving}
          />
        </>
      )}
    </div>
  );
}

// ── Demo AI results (used when backend is offline) ──
function getDemoResults(symptoms) {
  const lower = symptoms.map(s => s.toLowerCase());

  // Simple rule-based scoring for demo
  const diseases = [
    {
      id: 1,
      name: 'ARVI (Tez-tez shamollash)',
      probability: 0,
      description: 'Yuqori nafas yo\'llarining virusli kasalligi. Ko\'pincha sovuq havoda uchraydi.',
      recommendations: [
        'Ko\'proq suv iching (kuniga 2-3 litr)',
        'Dam oling va issiq bo\'ling',
        'C vitamini qabul qiling',
        'Burun tozalash uchun tuzli suv tomchisi ishlating',
        'Alomatlar 7 kundan ko\'p davom etsa shifokorga boring',
      ],
      keywords: ['yo\'tal', 'burun', 'tomоq', 'isitma', 'cough', 'fever', 'sore throat', 'runny nose'],
    },
    {
      id: 2,
      name: 'Gripp (Influenza)',
      probability: 0,
      description: 'Influenza virusi tomonidan yuzaga kelgan o\'tkir yuqumli kasallik.',
      recommendations: [
        'Shifokorga murojaat qiling',
        'To\'shak rejimini saqlang',
        'Yetarli suyuqlik iching',
        'Dori-darmon faqat shifokor tavsiyasi bilan',
        'Boshqalar bilan aloqani cheklang',
      ],
      keywords: ['isitma', 'bosh og\'riq', 'mushak', 'charchoq', 'fever', 'headache', 'fatigue', 'muscle'],
    },
    {
      id: 3,
      name: 'Migren',
      probability: 0,
      description: 'Kuchli bosh og\'riq bilan kechadigan nevrologik kasallik.',
      recommendations: [
        'Tinch, qorong\'i xonada dam oling',
        'Boshga sovuq kompres qo\'ying',
        'Og\'riq qoldiruvchi dorilar (shifokor bilan maslahatlashing)',
        'Triggerlarni aniqlang va ularga yo\'l qo\'ymang',
        'Muntazam uyqu jadvalini saqlang',
      ],
      keywords: ['bosh og\'riq', 'ko\'z og\'riq', 'bosh aylanishi', 'headache', 'dizziness', 'eye'],
    },
    {
      id: 4,
      name: 'Gastrit',
      probability: 0,
      description: 'Oshqozon shilliq qavatining yallig\'lanishi.',
      recommendations: [
        'Ovqatlanish tartibini yaxshilang',
        'Achchiq va yog\'li ovqatlardan saqlaning',
        'Kichik porsiyalarda tez-tez yeng',
        'Stress darajasini kamaytiring',
        'Gastroenterologga murojaat qiling',
      ],
      keywords: ['qorin og\'riq', 'ko\'ngil', 'qayt', 'ishtaha', 'abdominal', 'nausea', 'vomiting', 'stomach'],
    },
    {
      id: 5,
      name: 'Qon bosimining ko\'tarilishi',
      probability: 0,
      description: 'Arterial qon bosimining doimiy yoki epizodik oshishi.',
      recommendations: [
        'Tuzni kamaytiring',
        'Muntazam jismoniy faoliyat',
        'Vazningizni nazorat qiling',
        'Qon bosimini kundalik o\'lchang',
        'Darhol shifokorga murojaat qiling',
      ],
      keywords: ['bosh og\'riq', 'ko\'z', 'bosh aylanishi', 'headache', 'dizziness', 'chest'],
    },
  ];

  // Score each disease based on keyword overlap
  const scored = diseases.map(d => {
    const matches = d.keywords.filter(kw =>
      lower.some(s => s.includes(kw) || kw.includes(s))
    ).length;
    const base = matches / Math.max(d.keywords.length, 1);
    // Add some randomness for realism
    const prob = Math.min(0.95, base * 0.9 + Math.random() * 0.15);
    return { ...d, probability: Number(prob.toFixed(2)) };
  });

  // Sort by probability descending, return top 4
  return scored
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 4)
    .map(({ keywords, ...rest }) => rest);
}