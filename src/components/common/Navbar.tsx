import React from 'react';
import { CurrencyCode } from '../../types';
import { CURRENCIES } from '../../utils/formatters';
import { Calculator, Search, History, ShieldCheck, Mail, Globe } from 'lucide-react';
import { StaticPageType } from '../pages/StaticPagesModal';
import { useLanguage } from '../../context/LanguageContext';

interface NavbarProps {
  currentCurrency: CurrencyCode;
  onCurrencyChange: (c: CurrencyCode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCalculator: (id: string) => void;
  onOpenHistory: () => void;
  historyCount: number;
  onOpenStaticPage: (page: StaticPageType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  searchQuery,
  onSearchChange,
  onSelectCalculator,
  onOpenHistory,
  historyCount,
  onOpenStaticPage,
}) => {
  const { currentLanguage, setIsSelectorOpen, t } = useLanguage();
  return (
    <nav className="h-16 border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-50 flex items-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-3">
          {/* Logo */}
          <div
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold italic text-base shadow-xs group-hover:scale-105 transition-transform">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                CALCPRO<span className="text-indigo-600">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">
                PRECISION SYSTEMS
              </span>
            </div>
          </div>

          {/* Quick Search */}
          <div className="hidden sm:flex items-center flex-1 max-w-xs relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-indigo-600 rounded-lg outline-none transition text-slate-800 placeholder:text-slate-400 font-medium uppercase tracking-wider text-[11px]"
            />
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-5 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <a
                href="#live-calculator"
                className="hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('live-calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Calculator
              </a>
              <a
                href="#calculators"
                className="hover:text-indigo-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('calculators')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Directory
              </a>
              <button
                type="button"
                onClick={() => onOpenStaticPage('about')}
                className="hover:text-indigo-600 transition-colors uppercase cursor-pointer"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => onOpenStaticPage('contact')}
                className="hover:text-indigo-600 transition-colors uppercase cursor-pointer"
              >
                Contact
              </button>
            </div>

            <div className="hidden lg:block h-4 w-px bg-slate-200"></div>

            {/* Asian Language Selector Button */}
            <button
              type="button"
              onClick={() => setIsSelectorOpen(true)}
              className="btn-gloss btn-gloss-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 transition shadow-2xs"
              title="এশিয়ার ভাষা অনুবাদক (Asian Languages Selector)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{currentLanguage.flag}</span>
              <span className="hidden xs:inline text-[11px] font-bold">{currentLanguage.nativeName}</span>
            </button>

            {/* Glossy History Button */}
            <button
              type="button"
              onClick={onOpenHistory}
              className="btn-gloss btn-gloss-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-600 transition shadow-2xs"
              title="View your saved calculations history"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">হিস্ট্রি</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-mono px-1.5 py-0.2 rounded-full font-bold">
                {historyCount}
              </span>
            </button>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5">
              <select
                id="currency"
                value={currentCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 font-bold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs transition cursor-pointer uppercase tracking-wider"
                title="Select currency for financial tools"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="BDT">৳ BDT</option>
                <option value="AED">د.إ AED</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
