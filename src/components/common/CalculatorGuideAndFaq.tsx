import React, { useState } from 'react';
import { CALCULATOR_GUIDES, CalculatorGuide } from '../../data/calculatorGuideData';
import { useLanguage } from '../../context/LanguageContext';
import { SectionTranslatorBar } from './SectionTranslatorBar';
import {
  HelpCircle,
  BookOpen,
  ChevronDown,
  ShieldCheck,
  Lightbulb,
} from 'lucide-react';

interface Props {
  calculatorId: string;
}

export const CalculatorGuideAndFaq: React.FC<Props> = ({ calculatorId }) => {
  const guide: CalculatorGuide | undefined = CALCULATOR_GUIDES[calculatorId] || CALCULATOR_GUIDES.emi;
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // First open by default
  const { t, currentLanguage } = useLanguage();

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  // Build the FAQ Schema (application/ld+json) for Google Rich Snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: currentLanguage.code,
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="space-y-6 mt-10 pt-8 border-t border-slate-200">
      {/* Schema.org JSON-LD for Google Rich Snippet */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Asian Language Translator Bar for this Section */}
      <SectionTranslatorBar />

      {/* Guide Section: How It Works, Rules of Use, and Mathematical Formulas */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-xs space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t('guide_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {t('guide_title')}
              </h3>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bank & WHO Formula Standard</span>
          </span>
        </div>

        {/* 1. How It Works */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              ১. {t('how_it_works')}
            </h4>
          </div>
          <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50/60 p-5 rounded-2xl border border-slate-100 font-normal">
            {guide.howItWorks}
          </div>
        </div>

        {/* 2. Step-by-Step Usage Rules */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              ২. {t('usage_rules')}
            </h4>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {guide.usageSteps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-start gap-3 hover:border-slate-300 transition"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Mathematical Formula */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              ৩. {t('formulas')}
            </h4>
          </div>
          <div className="bg-[#1A1A1A] text-white p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-medium">
                {guide.formula.title}
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-white/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                Formula verified
              </span>
            </div>
            {/* Display Formula Box */}
            <div className="bg-black/50 p-4 rounded-xl border border-slate-800 text-center">
              <div className="text-base sm:text-lg font-mono font-bold tracking-wider text-emerald-400">
                {guide.formula.expression}
              </div>
            </div>
            {/* Variables Breakdown */}
            <div className="grid sm:grid-cols-2 gap-2 text-xs pt-1">
              {guide.formula.variables.map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-300 bg-slate-900/60 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="font-mono font-bold text-amber-400 text-xs bg-amber-400/10 px-1.5 py-0.5 rounded">
                    {v.symbol}
                  </span>
                  <span className="text-slate-300 text-[11px]">{v.meaning}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              {guide.formula.explanation}
            </p>
          </div>
        </div>

        {/* 4. Pro Tips & Practical Guidance */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              ৪. {t('pro_tips')}
            </h4>
          </div>
          <div className="space-y-2">
            {guide.proTips.map((tip, i) => (
              <div
                key={i}
                className="bg-purple-50/60 border border-purple-100 p-4 rounded-xl flex items-start gap-3"
              >
                <Lightbulb className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-xs text-purple-950 font-medium leading-relaxed">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section with Rich Snippets / FAQ Schema */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-9 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t('faq_schema_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {t('faq_title')}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Google Rich Snippet
            </span>
          </div>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {guide.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-indigo-200 bg-indigo-50/20 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      Q{index + 1}
                    </span>
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-indigo-100/60">
                    <p className="pt-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
