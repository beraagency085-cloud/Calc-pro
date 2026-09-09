/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyCode, CalculatorCategory } from './types';
import { CALCULATORS_LIST } from './data/calculatorsData';
import { Navbar } from './components/common/Navbar';
import { Hero } from './components/common/Hero';
import { CalculatorCard } from './components/common/CalculatorCard';
import { Footer } from './components/common/Footer';
import { CalculatorGuideAndFaq } from './components/common/CalculatorGuideAndFaq';
import { HistoryProvider, useHistory } from './context/HistoryContext';
import { HistoryDrawer } from './components/common/HistoryDrawer';
import { StaticPagesModal, StaticPageType } from './components/pages/StaticPagesModal';
import { updatePageMeta } from './utils/seo';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LanguageSelectorModal } from './components/common/LanguageSelectorModal';

// Calculator Implementations
import { EmiCalculator } from './components/calculators/EmiCalculator';
import { MortgageCalculator } from './components/calculators/MortgageCalculator';
import { SipCalculator } from './components/calculators/SipCalculator';
import { RdCalculator } from './components/calculators/RdCalculator';
import { ExtraPaymentCalculator } from './components/calculators/ExtraPaymentCalculator';
import { BmiCalculator } from './components/calculators/BmiCalculator';
import { AgeCalculator } from './components/calculators/AgeCalculator';
import { CalorieCalculator } from './components/calculators/CalorieCalculator';
import { PercentageCalculator } from './components/calculators/PercentageCalculator';
import { StockInvestCalculator } from './components/calculators/StockInvestCalculator';

import { ShieldCheck, Zap, Laptop, History, Sparkles } from 'lucide-react';

function AppContent() {
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [activeCalcId, setActiveCalcId] = useState<string>('emi');
  const [activeCategory, setActiveCategory] = useState<CalculatorCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStaticPage, setActiveStaticPage] = useState<StaticPageType | null>(null);
  const [restoredInputs, setRestoredInputs] = useState<Record<string, any> | undefined>(undefined);

  const { history, setIsHistoryOpen } = useHistory();
  const { t } = useLanguage();

  // Update Dynamic SEO Title & Meta tags
  useEffect(() => {
    updatePageMeta(activeCalcId, activeStaticPage);
  }, [activeCalcId, activeStaticPage]);

  // Filter calculators by category and search
  const filteredCalculators = useMemo(() => {
    return CALCULATORS_LIST.filter((calc) => {
      const matchesCategory =
        activeCategory === 'all' || calc.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        calc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        calc.shortDesc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const activeCalculatorMeta = useMemo(() => {
    return CALCULATORS_LIST.find((c) => c.id === activeCalcId) || CALCULATORS_LIST[0];
  }, [activeCalcId]);

  const handleSelectCalculator = (id: string, inputs?: Record<string, any>) => {
    setActiveCalcId(id);
    setRestoredInputs(inputs);
    const element = document.getElementById('live-calculator');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render the selected calculator
  const renderActiveCalculator = () => {
    switch (activeCalcId) {
      case 'emi':
        return <EmiCalculator currency={currency} initialInputs={restoredInputs} />;
      case 'mortgage':
        return <MortgageCalculator currency={currency} />;
      case 'sip':
        return <SipCalculator currency={currency} />;
      case 'rd':
        return <RdCalculator currency={currency} />;
      case 'extra':
        return <ExtraPaymentCalculator currency={currency} />;
      case 'bmi':
        return <BmiCalculator />;
      case 'age':
        return <AgeCalculator />;
      case 'calorie':
        return <CalorieCalculator />;
      case 'percentage':
        return <PercentageCalculator />;
      case 'stock':
        return <StockInvestCalculator currency={currency} />;
      default:
        return <EmiCalculator currency={currency} initialInputs={restoredInputs} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1A1A1A] antialiased selection:bg-indigo-600 selection:text-white font-sans">
      {/* Top sticky navbar */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={setCurrency}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCalculator={(id) => handleSelectCalculator(id)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        onOpenStaticPage={(page) => setActiveStaticPage(page)}
      />

      {/* Hero section */}
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        popularCalculators={CALCULATORS_LIST}
        onSelectCalculator={(id) => handleSelectCalculator(id)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
        {/* Dedicated Active Tool View / Workspace with Editorial Directory */}
        <section id="live-calculator" className="scroll-mt-24">
          <div className="lg:grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Editorial Directory Sidebar */}
            <aside className="hidden lg:flex lg:col-span-3 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex-col sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  DIRECTORY
                </h2>
                <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  10 MODULES
                </span>
              </div>

              <div className="space-y-1">
                {CALCULATORS_LIST.map((calc) => {
                  const isActive = activeCalcId === calc.id;
                  return (
                    <div
                      key={calc.id}
                      onClick={() => handleSelectCalculator(calc.id)}
                      className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 shadow-2xs font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate pr-2">{calc.title}</span>
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse shrink-0"></span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                          {calc.category === 'financial' ? 'FIN' : calc.category === 'health' ? 'HLT' : 'MTH'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* History Quick Launcher in Sidebar */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="w-full btn-gloss btn-gloss-white p-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs text-slate-700 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-indigo-600" />
                    <span>হিস্ট্রি খাতা (History)</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono">
                    {history.length}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveStaticPage('about')}
                    className="hover:text-indigo-600 transition"
                  >
                    About Us
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setActiveStaticPage('contact')}
                    className="hover:text-indigo-600 transition"
                  >
                    Contact
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setActiveStaticPage('privacy')}
                    className="hover:text-indigo-600 transition"
                  >
                    Privacy
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Column: Active Module & Editorial Widgets */}
            <div className="lg:col-span-9 space-y-8">
              {/* Header and Mobile Directory Scroller */}
              <div>
                {/* Mobile horizontal pill scroller */}
                <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-thin">
                  {CALCULATORS_LIST.map((calc) => (
                    <button
                      key={calc.id}
                      onClick={() => handleSelectCalculator(calc.id)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg whitespace-nowrap transition-all shrink-0 ${
                        activeCalcId === calc.id
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {calc.title}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      COMPUTATION ENGINE • {activeCalculatorMeta.category.toUpperCase()}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter text-[#1A1A1A]">
                      {activeCalculatorMeta.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(true)}
                      className="btn-gloss btn-gloss-white text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 font-bold shadow-2xs text-slate-700"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-600" />
                      <span>হিস্ট্রি ({history.length})</span>
                    </button>
                    <span className="self-start sm:self-auto text-[10px] font-bold bg-[#1A1A1A] text-white px-3 py-1.5 rounded tracking-widest uppercase shadow-xs">
                      ACTIVE MODULE
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Calculator Component Container */}
              <div className="transition-opacity duration-300">
                {renderActiveCalculator()}
              </div>

              {/* Educational Guide, Formulas & Schema.org FAQ Section */}
              <div className="pt-2">
                <CalculatorGuideAndFaq calculatorId={activeCalcId} />
              </div>

              {/* Editorial Companion Insight Cards */}
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {/* SIP & Wealth Editorial Card */}
                <div
                  onClick={() => {
                    handleSelectCalculator('sip');
                    document.getElementById('live-calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-indigo-600 rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-sm cursor-pointer hover:bg-indigo-700 transition group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                        PROJECTION ENGINE
                      </span>
                      <span className="text-xs opacity-75 group-hover:translate-x-0.5 transition-transform font-bold uppercase tracking-wider">
                        Explore &rarr;
                      </span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight mb-2">
                      SIP Growth<br />Projector
                    </h4>
                    <p className="text-indigo-100 text-xs sm:text-sm font-normal leading-relaxed">
                      Forecast wealth accumulation and compound return trajectories across 5, 10, and 20-year horizons.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20 flex items-baseline justify-between">
                    <div>
                      <div className="text-xl font-bold font-mono tracking-tight">Compound Math</div>
                      <div className="text-[10px] opacity-75 uppercase tracking-wider">Algorithmic Precision</div>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-white text-indigo-700 px-3 py-1 rounded-lg">
                      OPEN SIP
                    </span>
                  </div>
                </div>

                {/* Health / Precision Index Card */}
                <div
                  onClick={() => {
                    handleSelectCalculator('bmi');
                    document.getElementById('live-calculator')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#1A1A1A] rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-sm cursor-pointer hover:bg-slate-900 transition group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded text-slate-300">
                        METRIC ASSESSMENT
                      </span>
                      <span className="text-xs opacity-75 group-hover:translate-x-0.5 transition-transform font-bold uppercase tracking-wider">
                        Explore &rarr;
                      </span>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl sm:text-2xl font-bold tracking-tight">Health Index</h4>
                      <span className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-emerald-400">
                        24.1
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed">
                      Body Mass Index (WHO standards) & Basal Metabolic Rate tracking module for lifestyle health.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                      <span>OPTIMAL RANGE</span>
                      <span className="text-emerald-400 font-bold">HEALTHY / NORMAL</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Calculators Catalogue / Grid */}
        <section id="calculators" className="scroll-mt-24 pt-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                CATALOGUE DIRECTORY
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter text-[#1A1A1A]">
                All Computation Modules
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Explore our full suite of precision finance, health, and math calculators
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl shrink-0 overflow-x-auto">
              {(
                [
                  { id: 'all', label: 'All (10)' },
                  { id: 'financial', label: 'Financial (5)' },
                  { id: 'health', label: 'Health (2)' },
                  { id: 'math', label: 'Math & Utility (3)' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                    activeCategory === cat.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filteredCalculators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCalculators.map((calc) => (
                <CalculatorCard
                  key={calc.id}
                  calculator={calc}
                  isSelected={activeCalcId === calc.id}
                  onSelect={(id) => handleSelectCalculator(id)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
              <p className="text-slate-500 text-sm mb-3">No calculator matched &ldquo;{searchQuery}&rdquo;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="text-xs font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-lg"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
        </section>

        {/* Feature Highlights / Professional Guarantees */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              STANDARDS & TRANSPARENCY
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tighter text-[#1A1A1A] mt-1">
              Precision Engineered Standards
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Built with high precision formulas and privacy-first local client execution
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">Instant Real-Time Results</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Computations execute immediately as you slide or type, with zero loading delays or page reloads.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">100% Private & Client-Side</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Your financial numbers and health data stay strictly in your browser. No personal data leaves the machine.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3 mx-auto sm:mx-0">
                <Laptop className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1 tracking-tight">Global Currency Support</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Seamlessly toggle between INR (₹), USD ($), EUR (€), GBP (£), BDT (৳), and AED (د.إ) anytime.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onSelectCalculator={(id) => handleSelectCalculator(id)}
        onOpenStaticPage={(page) => setActiveStaticPage(page)}
      />

      {/* Slide-over Calculation History Drawer */}
      <HistoryDrawer onSelectCalculator={handleSelectCalculator} />

      {/* Static Compliance Pages Modal (About, Contact, Privacy, Terms) */}
      <StaticPagesModal
        pageType={activeStaticPage}
        onClose={() => setActiveStaticPage(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <HistoryProvider>
        <AppContent />
        <LanguageSelectorModal />
      </HistoryProvider>
    </LanguageProvider>
  );
}
