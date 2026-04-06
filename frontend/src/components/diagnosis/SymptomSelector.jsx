// SymptomSelector.jsx — Text input + selectable symptom pills by category
import { useState, useMemo } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import clsx from 'clsx';

// ── Full symptom library, keyed by category ──
const SYMPTOMS_DB = {
  general: [
    'isitma',        'charchoq',       'zaiflik',        'ishtahasizlik',
    'terlash',       'titroq',         'vazn yo\'qotish', 'qizish',
    'fever',         'fatigue',        'weakness',       'chills',
  ],
  head: [
    'bosh og\'riq',  'bosh aylanishi',  'ko\'z og\'riq',   'quloq og\'riq',
    'burun bitishi', 'burundan qon',    'tish og\'riq',    'bo\'yin og\'riq',
    'headache',      'dizziness',       'earache',         'nosebleed',
  ],
  respiratory: [
    'yo\'tal',       'nafas qisishi',   'ko\'krak og\'rig\'i', 'xirildash',
    'tomоq og\'riq', 'burun oqishi',    'qichqiriq',
    'cough',         'shortness of breath', 'chest pain',  'wheezing',
    'sore throat',   'runny nose',      'sneezing',
  ],
  digestive: [
    'qorin og\'riq',  'ko\'ngil aynish', 'qayt qilish',   'diareya',
    'qabziyat',       'meteorizm',       'o\'t qusish',   'ishtaha yo\'qligi',
    'abdominal pain', 'nausea',          'vomiting',      'diarrhea',
    'constipation',   'bloating',        'heartburn',
  ],
  musculoskeletal: [
    'bo\'g\'im og\'riq', 'mushak og\'rig\'i', 'orqa og\'riq',  'bo\'yin og\'riq',
    'oyoq og\'riq',      'qo\'l og\'riq',     'shish',         'qotib qolish',
    'joint pain',        'muscle pain',       'back pain',     'swelling',
    'stiffness',
  ],
  skin: [
    'toshmalar',     'qichishish',     'ko\'karishlar',  'yara',
    'teri quruqligi','ko\'pchish',     'teri sariqlik',
    'rash',          'itching',        'bruising',       'wound',
    'dry skin',      'swelling',       'jaundice',
  ],
  neurological: [
    'uyqu buzilishi', 'xotira yo\'qolishi', 'epilepsia',    'uyushish',
    'titroq',         'muvozanat yo\'qolishi',
    'insomnia',       'memory loss',        'numbness',     'tremor',
    'balance problems', 'confusion',
  ],
};

export default function SymptomSelector({ selected, onChange }) {
  const { t, lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');

  // Add symptom from text input
  const handleTextAdd = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const sym = searchQuery.trim().toLowerCase();
      if (!selected.includes(sym)) {
        onChange([...selected, sym]);
      }
      setSearchQuery('');
    }
  };

  // Toggle symptom pill
  const toggleSymptom = (sym) => {
    if (selected.includes(sym)) {
      onChange(selected.filter(s => s !== sym));
    } else {
      onChange([...selected, sym]);
    }
  };

  // Remove from selected
  const removeSymptom = (sym) => onChange(selected.filter(s => s !== sym));

  // Filter symptoms by search query
  const visibleSymptoms = useMemo(() => {
    const base = SYMPTOMS_DB[activeCategory] || [];
    if (!searchQuery) return base;
    return Object.values(SYMPTOMS_DB)
      .flat()
      .filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeCategory, searchQuery]);

  const categories = Object.keys(SYMPTOMS_DB);

  return (
    <div className="space-y-5">
      {/* Text search / add */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleTextAdd}
          placeholder={t.symptomsPlaceholder}
          className="input-field pl-10 pr-12"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <p className="text-xs text-slate-500 -mt-3 ml-1">
        {lang === 'uz' ? 'Enter tugmasini bosib qo\'shish mumkin' : 'Press Enter to add custom symptom'}
      </p>

      {/* Category tabs — hide when searching */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border',
                activeCategory === cat
                  ? 'bg-primary-600/20 border-primary-500/50 text-primary-300'
                  : 'bg-surface border-surface-border text-slate-500 hover:text-slate-300 hover:border-slate-600'
              )}
            >
              {t.symptomCategories?.[cat] || cat}
            </button>
          ))}
        </div>
      )}

      {/* Symptom pills grid */}
      <div className="flex flex-wrap gap-2 min-h-[80px]">
        {visibleSymptoms.map(sym => (
          <button
            key={sym}
            onClick={() => toggleSymptom(sym)}
            className={clsx('symptom-pill', selected.includes(sym) && 'selected')}
          >
            {selected.includes(sym) && <span className="mr-1 text-primary-400">✓</span>}
            {sym}
          </button>
        ))}
        {visibleSymptoms.length === 0 && (
          <div className="flex items-center gap-2 text-slate-500 text-sm py-6">
            <Plus size={16} />
            <span>Enter tugmasini bosib qo'shish mumkin</span>
          </div>
        )}
      </div>

      {/* Selected symptoms chips */}
      {selected.length > 0 && (
        <div className="border-t border-surface-border pt-4">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
            {t.selectedSymptoms} ({selected.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map(sym => (
              <span
                key={sym}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600/20
                           border border-primary-500/40 text-primary-300 text-sm font-medium"
              >
                {sym}
                <button
                  onClick={() => removeSymptom(sym)}
                  className="hover:text-red-400 transition-colors ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}