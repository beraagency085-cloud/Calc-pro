import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, ChevronRight } from 'lucide-react';

interface SectionTranslatorBarProps {
  className?: string;
  compact?: boolean;
}

export const SectionTranslatorBar: React.FC<SectionTranslatorBarProps> = ({
  className = '',
  compact = false,
}) => {
  const { currentLanguage, setLanguage, setIsSelectorOpen } = useLanguage();

  // Curated quick-switch languages representing major Asian regions
  const quickLanguages = [
    { code: 'bn', label: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'ur', label: 'اردو', flag: '🇵🇰' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'id', label: 'Bahasa', flag: '🇮🇩' },
    { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  ];

  return (
    <div
      className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
          <Globe className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>অনুবাদ ও এশিয়ার আঞ্চলিক ভাষা (Asian Language Translator)</span>
            </span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
              {currentLanguage.flag} {currentLanguage.nativeName}
            </span>
          </div>
          {!compact && (
            <p className="text-[11px] text-slate-300">
              সহজে বুঝতে যেকোনো এশিয়ান ভাষা নির্বাচন করুন (Auto translates this guide & FAQ)
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
        {/* Quick select Asian language pills */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-thin">
          {quickLanguages.map((l) => {
            const isActive = currentLanguage.code === l.code;
            return (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
                title={`Switch language to ${l.label}`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            );
          })}
        </div>

        {/* Button to open full 26+ Asian languages directory */}
        <button
          type="button"
          onClick={() => setIsSelectorOpen(true)}
          className="btn-gloss btn-gloss-indigo text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 font-bold shrink-0 shadow-xs whitespace-nowrap"
        >
          <span>সব ভাষা (26+ All)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
