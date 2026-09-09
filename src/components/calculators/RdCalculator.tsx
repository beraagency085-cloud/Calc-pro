import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { DonutChart } from '../common/DonutChart';
import { RotateCcw, Copy, Check, PiggyBank, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';
import { ShareButton } from '../common/ShareButton';

interface Props {
  currency: CurrencyCode;
  initialInputs?: Record<string, any>;
}

export const RdCalculator: React.FC<Props> = ({ currency, initialInputs }) => {
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(5000);
  const [interestRate, setInterestRate] = useState<number>(7.1);
  const [tenureYears, setTenureYears] = useState<number>(5);
  const [compoundingFreq, setCompoundingFreq] = useState<'quarterly' | 'monthly'>('quarterly');
  const [copied, setCopied] = useState(false);

  // Restore inputs if loaded from shared calculation link
  useEffect(() => {
    if (initialInputs) {
      if (typeof initialInputs.monthlyDeposit === 'number') setMonthlyDeposit(initialInputs.monthlyDeposit);
      if (typeof initialInputs.interestRate === 'number') setInterestRate(initialInputs.interestRate);
      if (typeof initialInputs.tenureYears === 'number') setTenureYears(initialInputs.tenureYears);
      if (initialInputs.compoundingFreq === 'quarterly' || initialInputs.compoundingFreq === 'monthly') {
        setCompoundingFreq(initialInputs.compoundingFreq);
      }
    }
  }, [initialInputs]);

  const { totalInvested, interestEarned, maturityAmount } = useMemo(() => {
    const P = Math.max(0, monthlyDeposit);
    const r = interestRate / 100;
    const n = tenureYears * 12; // total number of monthly deposits
    const m = compoundingFreq === 'quarterly' ? 4 : 12; // compounding frequency per year

    let maturity = 0;
    for (let i = 1; i <= n; i++) {
      const monthsRemaining = n - i + 1;
      const yearsRemaining = monthsRemaining / 12;
      maturity += P * Math.pow(1 + r / m, m * yearsRemaining);
    }

    const invested = P * n;
    const interest = Math.max(0, maturity - invested);

    return {
      totalInvested: Math.round(invested),
      interestEarned: Math.round(interest),
      maturityAmount: Math.round(maturity),
    };
  }, [monthlyDeposit, interestRate, tenureYears, compoundingFreq]);

  const handleCopy = () => {
    const text = `CalcPro RD Calculation:
Monthly Deposit: ${formatCurrency(monthlyDeposit, currency)}
Interest Rate: ${interestRate}% (${compoundingFreq} compounding)
Tenure: ${tenureYears} Years
Total Investment: ${formatCurrency(totalInvested, currency)}
Interest Earned: ${formatCurrency(interestEarned, currency)}
Maturity Amount: ${formatCurrency(maturityAmount, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMonthlyDeposit(5000);
    setInterestRate(7.1);
    setTenureYears(5);
    setCompoundingFreq('quarterly');
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Recurring Deposit (RD) Maturity Assessment',
      calculatorName: 'Recurring_Deposit_Assessment',
      category: 'Financial & Wealth Growth',
      currency,
      primaryMetric: {
        label: 'Maturity Corpus',
        value: formatCurrency(maturityAmount, currency),
        subtext: `Guaranteed payout after ${tenureYears} years (${tenureYears * 12} deposits)`,
      },
      secondaryMetrics: [
        {
          label: 'Total Capital Deposited',
          value: formatCurrency(totalInvested, currency),
          subtext: `${formatCurrency(monthlyDeposit, currency)} per month`,
        },
        {
          label: 'Total Interest Accrued',
          value: formatCurrency(interestEarned, currency),
          subtext: `Compounded ${compoundingFreq} at ${interestRate}% p.a.`,
        },
      ],
      parameters: [
        { label: 'Monthly Recurring Deposit', value: formatCurrency(monthlyDeposit, currency) },
        { label: 'Deposit Tenure', value: `${tenureYears} Years (${tenureYears * 12} months)` },
        { label: 'Annual Interest Rate', value: `${interestRate}% p.a.` },
        { label: 'Compounding Frequency', value: compoundingFreq === 'quarterly' ? 'Quarterly (Bank Standard)' : 'Monthly' },
      ],
      breakdown: [
        { label: 'Total Invested Principal', value: formatCurrency(totalInvested, currency), percent: `${maturityAmount > 0 ? ((totalInvested / maturityAmount) * 100).toFixed(1) : 0}%` },
        { label: 'Accumulated Compound Interest', value: formatCurrency(interestEarned, currency), percent: `${maturityAmount > 0 ? ((interestEarned / maturityAmount) * 100).toFixed(1) : 0}%` },
      ],
      tableHeaders: ['Year', 'Yearly Deposit', 'Cumulative Invested', 'Maturity Value'],
      tableRows: Array.from({ length: Math.min(10, tenureYears) }, (_, idx) => {
        const yr = idx + 1;
        const depSoFar = monthlyDeposit * yr * 12;
        const r = interestRate / 100;
        const m = compoundingFreq === 'quarterly' ? 4 : 12;
        let v = 0;
        for (let i = 1; i <= yr * 12; i++) {
          const rem = yr * 12 - i + 1;
          v += monthlyDeposit * Math.pow(1 + r / m, m * (rem / 12));
        }
        return {
          period: `Year ${yr}`,
          col1: formatCurrency(monthlyDeposit * 12, currency),
          col2: formatCurrency(depSoFar, currency),
          col3: formatCurrency(Math.round(v), currency),
        };
      }),
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Recurring Deposit Assessment</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Guaranteed Return
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Fixed recurring deposit with bank compounding algorithms</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Web Share API: Share calculation result link */}
          <ShareButton
            title="CalcPro Recurring Deposit Assessment"
            text={`CalcPro RD: Monthly deposit ${formatCurrency(monthlyDeposit, currency)} at ${interestRate}% for ${tenureYears} years matures to ${formatCurrency(maturityAmount, currency)} (Earned Interest: ${formatCurrency(interestEarned, currency)}). Check details:`}
            calcId="rd"
            currency={currency}
            inputs={{
              monthlyDeposit,
              interestRate,
              tenureYears,
              compoundingFreq,
            }}
            variant="glazed-header"
          />

          {/* Shiny Glazed PDF Export Button */}
          <button
            onClick={handleExportPdf}
            className="btn-gloss btn-gloss-emerald text-[11px] px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            title="Download PDF report to your phone or computer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>

          {/* Shiny Glazed Copy Button */}
          <button
            onClick={handleCopy}
            className="btn-gloss btn-gloss-dark text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            title="Copy calculation summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>

          {/* Shiny Glazed Reset Button */}
          <button
            onClick={handleReset}
            className="btn-gloss btn-gloss-dark text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-slate-300"
            title="Reset defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          {/* Monthly Deposit */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Monthly Deposit</label>
              <span className="text-sm font-bold text-teal-600 font-mono">
                {formatCurrency(monthlyDeposit, currency)}
              </span>
            </div>
            <input
              type="number"
              min="500"
              step="500"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Math.max(100, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
            />
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
              className="w-full mt-2 accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Interest Rate (% p.a.)</label>
              <span className="text-sm font-bold text-teal-600 font-mono">{interestRate}%</span>
            </div>
            <input
              type="number"
              min="1"
              max="20"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
            />
            <input
              type="range"
              min="3"
              max="15"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full mt-2 accent-teal-600 cursor-pointer"
            />
          </div>

          {/* Tenure & Compounding */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Tenure (Years)</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 p-0.5 bg-slate-100 gap-1">
                {[1, 3, 5, 10].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setTenureYears(yr)}
                    className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                      tenureYears === yr ? 'btn-gloss-teal' : 'btn-gloss-white'
                    }`}
                  >
                    {yr}Y
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Compounding</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 p-0.5 bg-slate-100 gap-1">
                <button
                  type="button"
                  onClick={() => setCompoundingFreq('quarterly')}
                  className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                    compoundingFreq === 'quarterly' ? 'btn-gloss-teal' : 'btn-gloss-white'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  type="button"
                  onClick={() => setCompoundingFreq('monthly')}
                  className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                    compoundingFreq === 'monthly' ? 'btn-gloss-teal' : 'btn-gloss-white'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Maturity Amount</span>
                <PiggyBank className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-teal-600 mt-1 font-mono">
                {formatCurrency(maturityAmount, currency)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total payout at the end of {tenureYears} years</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500 block">Total Invested</span>
                <span className="text-lg font-bold text-slate-800 font-mono block mt-1">
                  {formatCurrency(totalInvested, currency)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500 block">Interest Earned</span>
                <span className="text-lg font-bold text-teal-600 font-mono block mt-1">
                  {formatCurrency(interestEarned, currency)}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <DonutChart
                segments={[
                  {
                    label: 'Invested',
                    value: totalInvested,
                    color: '#64748b',
                    formattedValue: formatCurrency(totalInvested, currency),
                  },
                  {
                    label: 'Interest',
                    value: interestEarned,
                    color: '#0d9488', // teal-600
                    formattedValue: formatCurrency(interestEarned, currency),
                  },
                ]}
                size={160}
                strokeWidth={22}
                centerTitle="Maturity"
                centerSubtitle={formatCurrency(maturityAmount, currency)}
              />
            </div>

            {/* Prominent Glazed PDF Download Option */}
            <button
              onClick={handleExportPdf}
              className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
              title="Download full Recurring Deposit statement PDF to your phone"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF to Phone (ফোনে PDF সেভ করুন)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
