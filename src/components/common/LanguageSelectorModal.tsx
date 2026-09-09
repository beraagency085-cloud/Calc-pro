import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Search, Check, X, Sparkles } from 'lucide-react';

export const LanguageSelectorModal: React.FC = () => {
  const { currentLanguage, setLanguage, languages, isSelectorOpen, setIsSelectorOpen } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = ['all', 'South Asia', 'East Asia', 'Southeast Asia', 'West Asia', 'Central Asia'];

  const filteredLanguages = useMemo(() => {
    return languages.filter((lang) => {
      const matchRegion = selectedRegion === 'all' || lang.region === selectedRegion;
      const matchSearch =
        search.trim() === '' ||
        lang.name.toLowerCase().includes(search.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
        lang.code.toLowerCase().includes(search.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [languages, search, selectedRegion]);

  if (!isSelectorOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  এশিয়ার ভাষা অনুবাদক (Asian Language Selector)
                </h3>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  26+ Languages
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                সব দেশের মানুষের সুবিধার্থে আপনার পছন্দের আঞ্চলিক ভাষা নির্বাচন করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSelectorOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white flex items-center justify-center transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Region Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ভাষা সার্চ করুন (Search by name or script, e.g. Hindi, বাংলা, العربية, 日本語)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-lg font-semibold tracking-wide whitespace-nowrap transition ${
                  selectedRegion === reg
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {reg === 'all' ? 'All Asian Regions' : reg}
              </button>
            ))}
          </div>
        </div>

        {/* Language Grid */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredLanguages.map((lang) => {
            const isSelected = currentLanguage.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsSelectorOpen(false);
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition group ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl shrink-0 select-none" role="img" aria-label={lang.name}>
                    {lang.flag}
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {lang.nativeName}
                      </span>
                      {lang.rtl && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                          RTL
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="truncate">{lang.name}</span>
                      <span>•</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{lang.code}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600">
                      Select
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>
              ভাষা নির্বাচন করলে পুরো পেজের গাইড, নির্দেশিকা, সূত্র এবং FAQ আপনার ভাষায় অনূদিত হবে।
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsSelectorOpen(false)}
            className="btn-gloss btn-gloss-dark px-4 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs shrink-0"
          >
            সম্পন্ন (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
