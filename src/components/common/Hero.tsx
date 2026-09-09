import React from 'react';
import { Search, Sparkles } from 'lucide-react';
import { CalculatorMeta } from '../../types';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  popularCalculators: CalculatorMeta[];
  onSelectCalculator: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  searchQuery,
  onSearchChange,
  popularCalculators,
  onSelectCalculator,
}) => {
  return (
    <section className="bg-[#F8F9FA] border-b border-slate-200 py-12 sm:py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-indigo-700 mb-5">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>ACCURATE • REAL-TIME • PROFESSIONAL TOOLS</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-[#1A1A1A] leading-none">
            Precision<br className="hidden sm:inline" /> Engineered.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-500 max-w-xl font-normal leading-relaxed">
            Advanced mathematical modeling for professional decision making. Instant calculations, transparent methodology, and real-time visual projections.
          </p>

          {/* Search container */}
          <div className="max-w-xl mt-7 relative">
            <div className="relative flex items-center shadow-xs rounded-xl overflow-hidden bg-white border border-slate-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search module (e.g. EMI, Mortgage, SIP, BMI, Calorie)..."
                className="w-full pl-11 pr-4 py-3 text-slate-900 text-xs sm:text-sm font-medium outline-none placeholder:text-slate-400 tracking-wide"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="mr-3 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 bg-slate-100 rounded"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Popular quick jump pills */}
          <div className="flex flex-wrap items-center gap-2 mt-5 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">
              DIRECT ACCESS:
            </span>
            {popularCalculators.slice(0, 6).map((calc) => (
              <button
                key={calc.id}
                onClick={() => onSelectCalculator(calc.id)}
                className="btn-gloss btn-gloss-white text-slate-700 hover:text-indigo-600 px-3 py-1.5 rounded-lg transition text-[11px] font-bold uppercase tracking-wider"
              >
                {calc.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
