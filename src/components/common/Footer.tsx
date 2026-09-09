import React from 'react';
import { CALCULATORS_LIST } from '../../data/calculatorsData';
import { StaticPageType } from '../pages/StaticPagesModal';
import { ShieldCheck, Lock, HelpCircle, Mail, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ASIAN_LANGUAGES } from '../../types/language';

interface FooterProps {
  onSelectCalculator: (id: string) => void;
  onOpenStaticPage?: (page: StaticPageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCalculator, onOpenStaticPage }) => {
  const { currentLanguage, setLanguage, setIsSelectorOpen, t } = useLanguage();

  return (
    <footer className="bg-white text-slate-500 mt-20 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold italic text-base shadow-xs">
                C
              </div>
              <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                CALCPRO<span className="text-indigo-600">.</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
              পেশাদার ও প্রাতিষ্ঠানিক নির্ভুলতায় আর্থিক এবং স্বাস্থ্য হিসাবের আধুনিক প্ল্যাটফর্ম। কোনো তথ্য সার্ভারে সংরক্ষণ করা হয় না — ১০০% লোকাল ব্রাউজার প্রাইভেসি। সংস্করণ ৪.২.০
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-wider">
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Google YMYL Compliant
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                <Lock className="w-3 h-3 text-indigo-600" />
                100% Client-Side Privacy
              </span>
            </div>

            {/* Asian Languages Quick Selector in Footer */}
            <div className="pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800">
                  এশিয়ার আঞ্চলিক ভাষা (Asian Languages Support):
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 items-center">
                {ASIAN_LANGUAGES.slice(0, 10).map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLanguage(l.code)}
                    className={`px-2 py-1 rounded text-[11px] font-bold transition flex items-center gap-1 ${
                      currentLanguage.code === l.code
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.nativeName}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition border border-indigo-200"
                >
                  +{ASIAN_LANGUAGES.length - 10} আরো ভাষা (All)
                </button>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">FINANCE & LOANS</h4>
            <ul className="space-y-2 text-xs font-medium">
              {CALCULATORS_LIST.filter((c) => c.category === 'financial').map((calc) => (
                <li key={calc.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectCalculator(calc.id);
                      document.getElementById('live-calculator')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-indigo-600 transition text-left"
                  >
                    {calc.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">LEGAL & TRUST (E-E-A-T)</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenStaticPage?.('about')}
                  className="hover:text-indigo-600 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{t('about_us')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenStaticPage?.('contact')}
                  className="hover:text-indigo-600 transition flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('contact_us')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenStaticPage?.('privacy')}
                  className="hover:text-indigo-600 transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('privacy_policy')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenStaticPage?.('terms')}
                  className="hover:text-indigo-600 transition flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('terms_disclaimer')}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div>&copy; 2026 CALCPRO GLOBAL SYSTEMS — ALL RIGHTS RESERVED</div>
          <div className="flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => onOpenStaticPage?.('terms')}
              className="hover:text-slate-600 cursor-pointer transition uppercase"
            >
              Terms of Computation
            </button>
            <button
              type="button"
              onClick={() => onOpenStaticPage?.('privacy')}
              className="hover:text-slate-600 cursor-pointer transition uppercase"
            >
              Privacy Protocol
            </button>
            <button
              type="button"
              onClick={() => onOpenStaticPage?.('contact')}
              className="hover:text-slate-600 cursor-pointer transition uppercase"
            >
              Support Center
            </button>
            <span className="inline-flex items-center gap-1.5 text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Client Engine: Secure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
