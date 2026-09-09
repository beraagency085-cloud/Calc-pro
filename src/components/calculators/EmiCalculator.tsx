import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { DonutChart } from '../common/DonutChart';
import { AmortizationTable, AmortizationRow } from '../common/AmortizationTable';
import { RotateCcw, Copy, Check, Info, FileDown, Bookmark, BookmarkCheck } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';
import { useHistory } from '../../context/HistoryContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShareButton } from '../common/ShareButton';

interface Props {
  currency: CurrencyCode;
  initialInputs?: Record<string, any>;
}

export const EmiCalculator: React.FC<Props> = ({ currency, initialInputs }) => {
  const [loanAmount, setLoanAmount] = useState<number>(2500000);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenureValue, setTenureValue] = useState<number>(15);
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [copied, setCopied] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);

  const { addHistoryItem } = useHistory();
  const { t } = useLanguage();

  // Restore inputs if passed from History
  useEffect(() => {
    if (initialInputs) {
      if (typeof initialInputs.loanAmount === 'number') setLoanAmount(initialInputs.loanAmount);
      if (typeof initialInputs.interestRate === 'number') setInterestRate(initialInputs.interestRate);
      if (typeof initialInputs.tenureValue === 'number') setTenureValue(initialInputs.tenureValue);
      if (initialInputs.tenureType) setTenureType(initialInputs.tenureType);
    }
  }, [initialInputs]);

  // Calculate EMI
  const { emi, totalInterest, totalPayment, schedule } = useMemo(() => {
    const P = Math.max(0, loanAmount);
    const annualRate = Math.max(0.1, interestRate);
    const r = annualRate / (12 * 100);
    const n = tenureType === 'years' ? tenureValue * 12 : tenureValue;

    if (P <= 0 || n <= 0) {
      return { emi: 0, totalInterest: 0, totalPayment: 0, schedule: [] };
    }

    // Formula: E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emiCalc = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPay = emiCalc * n;
    const totalInt = totalPay - P;

    // Generate yearly amortization
    const yearlyRows: AmortizationRow[] = [];
    let currentBalance = P;
    const totalYears = Math.ceil(n / 12);

    for (let yr = 1; yr <= totalYears; yr++) {
      const startBalance = currentBalance;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;
      let yearlyPayment = 0;

      for (let m = 1; m <= 12; m++) {
        const monthIndex = (yr - 1) * 12 + m;
        if (monthIndex > n || currentBalance <= 0) break;

        const interestForMonth = currentBalance * r;
        const principalForMonth = Math.min(currentBalance, emiCalc - interestForMonth);
        const actualPayment = principalForMonth + interestForMonth;

        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        yearlyPayment += actualPayment;
        currentBalance = Math.max(0, currentBalance - principalForMonth);
      }

      yearlyRows.push({
        period: yr,
        beginningBalance: startBalance,
        payment: Math.round(yearlyPayment),
        principal: Math.round(yearlyPrincipal),
        interest: Math.round(yearlyInterest),
        endingBalance: Math.round(currentBalance),
      });

      if (currentBalance <= 0) break;
    }

    return {
      emi: Math.round(emiCalc),
      totalInterest: Math.round(totalInt),
      totalPayment: Math.round(totalPay),
      schedule: yearlyRows,
    };
  }, [loanAmount, interestRate, tenureValue, tenureType]);

  const principalPercent = totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 0;
  const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  const handleSaveToHistory = () => {
    addHistoryItem({
      calculatorId: 'emi',
      calculatorTitle: 'EMI Calculator',
      summary: `EMI: ${formatCurrency(emi, currency)} / mo (${tenureValue} ${tenureType})`,
      details: {
        'Loan Amount': formatCurrency(loanAmount, currency),
        'Interest Rate': `${interestRate}% p.a.`,
        'Tenure': `${tenureValue} ${tenureType}`,
        'Total Interest': formatCurrency(totalInterest, currency),
        'Total Outflow': formatCurrency(totalPayment, currency),
      },
      inputs: {
        loanAmount,
        interestRate,
        tenureValue,
        tenureType,
      },
    });
    setSavedToHistory(true);
    setTimeout(() => setSavedToHistory(false), 2000);
  };

  const handleCopy = () => {
    const text = `CalcPro EMI Summary:
Loan Amount: ${formatCurrency(loanAmount, currency)}
Interest Rate: ${interestRate}%
Tenure: ${tenureValue} ${tenureType}
Monthly EMI: ${formatCurrency(emi, currency)}
Total Interest: ${formatCurrency(totalInterest, currency)}
Total Payment: ${formatCurrency(totalPayment, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    handleSaveToHistory();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLoanAmount(2500000);
    setInterestRate(9.5);
    setTenureValue(15);
    setTenureType('years');
  };

  const handleExportPdf = () => {
    handleSaveToHistory();
    exportCalculationToPdf({
      title: 'Equated Monthly Installment (EMI) Statement',
      calculatorName: 'EMI_Assessment',
      category: 'Financial Planning',
      currency,
      primaryMetric: {
        label: 'Monthly Loan EMI',
        value: formatCurrency(emi, currency),
        subtext: `Payable per month for ${tenureValue} ${tenureType}`,
      },
      secondaryMetrics: [
        {
          label: 'Total Interest',
          value: formatCurrency(totalInterest, currency),
          subtext: `${interestPercent.toFixed(1)}% of total payment`,
        },
        {
          label: 'Total Payment',
          value: formatCurrency(totalPayment, currency),
          subtext: 'Principal + Interest',
        },
      ],
      parameters: [
        { label: 'Loan Principal', value: formatCurrency(loanAmount, currency) },
        { label: 'Annual Interest Rate', value: `${interestRate}% p.a.` },
        { label: 'Loan Tenure', value: `${tenureValue} ${tenureType}` },
        { label: 'Total Installments', value: `${tenureType === 'years' ? tenureValue * 12 : tenureValue} months` },
      ],
      breakdown: [
        { label: 'Principal Loan Amount', value: formatCurrency(loanAmount, currency), percent: `${principalPercent.toFixed(1)}%` },
        { label: 'Total Interest Payable', value: formatCurrency(totalInterest, currency), percent: `${interestPercent.toFixed(1)}%` },
        { label: 'Total Net Outflow (P + I)', value: formatCurrency(totalPayment, currency), percent: '100%' },
      ],
      tableHeaders: ['Year', 'Principal Paid', 'Interest Paid', 'Total Installment', 'Remaining Balance'],
      tableRows: schedule.map((row) => ({
        period: `Year ${row.period}`,
        col1: formatCurrency(row.principalPaid, currency),
        col2: formatCurrency(row.interestPaid, currency),
        col3: formatCurrency(row.totalPayment, currency),
        col4: formatCurrency(row.remainingBalance, currency),
      })),
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">EMI Assessment</h2>
            <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-600 px-2 py-0.5 rounded">
              Live Rate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-normal">Equated Monthly Installment with transparent amortization</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Web Share API: Share calculation result link */}
          <ShareButton
            title="CalcPro EMI Calculation"
            text={`CalcPro EMI Assessment: Monthly EMI ${formatCurrency(emi, currency)} for Loan ${formatCurrency(loanAmount, currency)} at ${interestRate}% for ${tenureValue} ${tenureType}. View full calculation breakdown:`}
            calcId="emi"
            currency={currency}
            inputs={{
              loanAmount,
              interestRate,
              tenureValue,
              tenureType,
            }}
            variant="glazed-header"
          />

          {/* Shiny Glazed Save History Button */}
          <button
            onClick={handleSaveToHistory}
            className="btn-gloss btn-gloss-indigo text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            title="Save this calculation to browser history"
          >
            {savedToHistory ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-300" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{savedToHistory ? t('saved') : t('save_to_history')}</span>
          </button>

          {/* Shiny Glazed PDF Export Button */}
          <button
            onClick={handleExportPdf}
            className="btn-gloss btn-gloss-emerald text-[11px] px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-sm"
            title="Download PDF report to your phone or computer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>{t('export_pdf')}</span>
          </button>

          {/* Shiny Glazed Copy Button */}
          <button
            onClick={handleCopy}
            className="btn-gloss btn-gloss-dark text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
            title="Copy calculation summary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('copied') : t('copy_summary')}
          </button>

          {/* Shiny Glazed Reset Button */}
          <button
            onClick={handleReset}
            className="btn-gloss btn-gloss-dark text-[11px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-slate-300"
            title="Reset defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('reset')}</span>
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 grid lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-6">
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Loan Amount</label>
              <span className="text-sm font-bold text-indigo-600 font-mono">
                {formatCurrency(loanAmount, currency)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1000"
                max="50000000"
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <input
              type="range"
              min="50000"
              max="20000000"
              step="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-600 cursor-pointer"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[500000, 1000000, 2500000, 5000000, 10000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLoanAmount(amt)}
                  className={`btn-gloss text-xs px-2.5 py-1 rounded-md font-medium transition ${
                    loanAmount === amt
                      ? 'btn-gloss-indigo'
                      : 'btn-gloss-white'
                  }`}
                >
                  {formatCurrency(amt, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Interest Rate (p.a.)</label>
              <span className="text-sm font-bold text-indigo-600 font-mono">{interestRate}%</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="30"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[7.5, 8.5, 9.5, 10.5, 12].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setInterestRate(rate)}
                  className={`btn-gloss text-xs px-2.5 py-1 rounded-md font-medium transition ${
                    interestRate === rate
                      ? 'btn-gloss-indigo'
                      : 'btn-gloss-white'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Loan Tenure</label>
              <span className="text-sm font-bold text-indigo-600 font-mono">
                {tenureValue} {tenureType}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max={tenureType === 'years' ? 30 : 360}
                value={tenureValue}
                onChange={(e) => setTenureValue(Math.max(1, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <div className="flex rounded-lg overflow-hidden border border-slate-300 p-0.5 bg-slate-100 shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (tenureType === 'months') setTenureValue(Math.max(1, Math.round(tenureValue / 12)));
                    setTenureType('years');
                  }}
                  className={`btn-gloss px-3 py-1 text-xs font-bold rounded-md transition ${
                    tenureType === 'years' ? 'btn-gloss-indigo' : 'btn-gloss-white'
                  }`}
                >
                  YR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tenureType === 'years') setTenureValue(tenureValue * 12);
                    setTenureType('months');
                  }}
                  className={`btn-gloss px-3 py-1 text-xs font-bold rounded-md transition ${
                    tenureType === 'months' ? 'btn-gloss-indigo' : 'btn-gloss-white'
                  }`}
                >
                  MO
                </button>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max={tenureType === 'years' ? 30 : 360}
              value={tenureValue}
              onChange={(e) => setTenureValue(Number(e.target.value))}
              className="w-full mt-2 accent-indigo-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(tenureType === 'years' ? [5, 10, 15, 20, 25, 30] : [12, 24, 36, 60, 120]).map((ten) => (
                <button
                  key={ten}
                  type="button"
                  onClick={() => setTenureValue(ten)}
                  className={`btn-gloss text-xs px-2.5 py-1 rounded-md font-medium transition ${
                    tenureValue === ten
                      ? 'btn-gloss-indigo'
                      : 'btn-gloss-white'
                  }`}
                >
                  {ten} {tenureType === 'years' ? 'Yr' : 'Mo'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Loan EMI</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 mt-1 font-mono">
                {formatCurrency(emi, currency)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Per month payable until loan maturity</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500 block">Total Interest Payable</span>
                <span className="text-lg sm:text-xl font-bold text-amber-600 font-mono block mt-1">
                  {formatCurrency(totalInterest, currency)}
                </span>
                <span className="text-[11px] text-amber-700/80">({interestPercent.toFixed(1)}% of total)</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500 block">Total Payment (P + I)</span>
                <span className="text-lg sm:text-xl font-bold text-slate-800 font-mono block mt-1">
                  {formatCurrency(totalPayment, currency)}
                </span>
                <span className="text-[11px] text-slate-500">Across {tenureValue} {tenureType}</span>
              </div>
            </div>

            {/* Breakup Chart */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-1.5 mb-3 text-slate-800 font-semibold text-sm">
                <Info className="w-4 h-4 text-indigo-500" />
                <span>Break-up of Total Payment</span>
              </div>
              <DonutChart
                segments={[
                  {
                    label: 'Principal',
                    value: loanAmount,
                    color: '#6366f1', // indigo-500
                    formattedValue: formatCurrency(loanAmount, currency),
                  },
                  {
                    label: 'Total Interest',
                    value: totalInterest,
                    color: '#f59e0b', // amber-500
                    formattedValue: formatCurrency(totalInterest, currency),
                  },
                ]}
                size={160}
                strokeWidth={22}
                centerTitle="Principal"
                centerSubtitle={`${principalPercent.toFixed(0)}%`}
              />
            </div>

            {/* Prominent Glazed Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <ShareButton
                title="CalcPro EMI Calculation"
                text={`CalcPro EMI Assessment: Monthly EMI ${formatCurrency(emi, currency)} for Loan ${formatCurrency(loanAmount, currency)} at ${interestRate}% for ${tenureValue} ${tenureType}. View full calculation breakdown:`}
                calcId="emi"
                currency={currency}
                inputs={{
                  loanAmount,
                  interestRate,
                  tenureValue,
                  tenureType,
                }}
                variant="primary"
                className="py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
              />
              <button
                onClick={handleExportPdf}
                className="flex-1 btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
                title="Download full PDF statement to your phone"
              >
                <FileDown className="w-4 h-4" />
                <span>{t('export_pdf')}</span>
              </button>
              <button
                onClick={handleSaveToHistory}
                className="btn-gloss btn-gloss-white py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm border border-slate-200 text-slate-800 hover:text-indigo-600"
                title="Save calculation to history"
              >
                {savedToHistory ? <BookmarkCheck className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4 text-indigo-600" />}
                <span>{savedToHistory ? t('saved') : t('save_to_history')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Table */}
      <div className="px-6 md:px-8 pb-8">
        <AmortizationTable rows={schedule} currency={currency} periodLabel="Year" />
      </div>
    </div>
  );
};
