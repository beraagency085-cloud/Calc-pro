import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { DonutChart } from '../common/DonutChart';
import { RotateCcw, Copy, Check, TrendingUp, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';
import { ShareButton } from '../common/ShareButton';

interface Props {
  currency: CurrencyCode;
  initialInputs?: Record<string, any>;
}

export const SipCalculator: React.FC<Props> = ({ currency, initialInputs }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(10000);
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12); // %
  const [timePeriodYears, setTimePeriodYears] = useState<number>(10);
  const [stepUpPercent, setStepUpPercent] = useState<number>(0); // Annual step up %
  const [copied, setCopied] = useState(false);

  // Restore inputs if loaded from share link or history
  useEffect(() => {
    if (initialInputs) {
      if (typeof initialInputs.monthlyInvestment === 'number') setMonthlyInvestment(initialInputs.monthlyInvestment);
      if (typeof initialInputs.expectedReturnRate === 'number') setExpectedReturnRate(initialInputs.expectedReturnRate);
      if (typeof initialInputs.timePeriodYears === 'number') setTimePeriodYears(initialInputs.timePeriodYears);
      if (typeof initialInputs.stepUpPercent === 'number') setStepUpPercent(initialInputs.stepUpPercent);
    }
  }, [initialInputs]);

  const { investedAmount, estReturns, totalValue, yearlyGrowth } = useMemo(() => {
    const P = Math.max(0, monthlyInvestment);
    const r = expectedReturnRate / 100 / 12; // Monthly rate
    const totalMonths = timePeriodYears * 12;

    let currentMonthly = P;
    let totalInvested = 0;
    let accumulatedValue = 0;
    const growthTimeline: { year: number; invested: number; value: number }[] = [];

    for (let month = 1; month <= totalMonths; month++) {
      // If step up is active, increase monthly SIP at the start of each new year
      if (stepUpPercent > 0 && month > 1 && (month - 1) % 12 === 0) {
        currentMonthly = currentMonthly * (1 + stepUpPercent / 100);
      }

      totalInvested += currentMonthly;
      accumulatedValue = (accumulatedValue + currentMonthly) * (1 + r);

      if (month % 12 === 0) {
        growthTimeline.push({
          year: month / 12,
          invested: Math.round(totalInvested),
          value: Math.round(accumulatedValue),
        });
      }
    }

    const finalVal = Math.round(accumulatedValue);
    const finalInv = Math.round(totalInvested);
    const returns = Math.max(0, finalVal - finalInv);

    return {
      investedAmount: finalInv,
      estReturns: returns,
      totalValue: finalVal,
      yearlyGrowth: growthTimeline,
    };
  }, [monthlyInvestment, expectedReturnRate, timePeriodYears, stepUpPercent]);

  const handleCopy = () => {
    const text = `CalcPro SIP Projection:
Monthly Investment: ${formatCurrency(monthlyInvestment, currency)}
Expected Annual Return: ${expectedReturnRate}%
Duration: ${timePeriodYears} Years
Total Invested: ${formatCurrency(investedAmount, currency)}
Estimated Returns: ${formatCurrency(estReturns, currency)}
Total Maturity Wealth: ${formatCurrency(totalValue, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setMonthlyInvestment(10000);
    setExpectedReturnRate(12);
    setTimePeriodYears(10);
    setStepUpPercent(0);
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Systematic Investment Plan (SIP) Projection',
      calculatorName: 'SIP_Projector',
      category: 'Wealth Accumulation',
      currency,
      primaryMetric: {
        label: 'Total Expected Maturity Value',
        value: formatCurrency(totalValue, currency),
        subtext: `Compounded over ${timePeriodYears} years`,
      },
      secondaryMetrics: [
        {
          label: 'Total Invested',
          value: formatCurrency(investedAmount, currency),
          subtext: `${totalValue > 0 ? ((investedAmount / totalValue) * 100).toFixed(1) : 0}% of corpus`,
        },
        {
          label: 'Wealth Gain (Returns)',
          value: formatCurrency(estReturns, currency),
          subtext: `${totalValue > 0 ? ((estReturns / totalValue) * 100).toFixed(1) : 0}% net growth`,
        },
      ],
      parameters: [
        { label: 'Monthly SIP Amount', value: formatCurrency(monthlyInvestment, currency) },
        { label: 'Expected Annual Return', value: `${expectedReturnRate}% p.a.` },
        { label: 'Investment Horizon', value: `${timePeriodYears} Years (${timePeriodYears * 12} months)` },
        { label: 'Annual Step-Up Rate', value: stepUpPercent > 0 ? `+${stepUpPercent}% per year` : 'None (Fixed SIP)' },
      ],
      breakdown: [
        { label: 'Total Invested Capital', value: formatCurrency(investedAmount, currency), percent: `${totalValue > 0 ? ((investedAmount / totalValue) * 100).toFixed(1) : 0}%` },
        { label: 'Estimated Wealth Returns', value: formatCurrency(estReturns, currency), percent: `${totalValue > 0 ? ((estReturns / totalValue) * 100).toFixed(1) : 0}%` },
        { label: 'Expected Maturity Corpus', value: formatCurrency(totalValue, currency), percent: '100%' },
      ],
      tableHeaders: ['Year', 'Total Invested', 'Corpus Value', 'Wealth Growth'],
      tableRows: yearlyGrowth.map((g) => ({
        period: `Year ${g.year}`,
        col1: formatCurrency(g.invested, currency),
        col2: formatCurrency(g.value, currency),
        col3: formatCurrency(Math.max(0, g.value - g.invested), currency),
      })),
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">SIP Growth Projector</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Compounding
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Systematic Investment Plan wealth creator with step-up modeling</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Web Share API: Share calculation result link */}
          <ShareButton
            title="CalcPro SIP Wealth Projection"
            text={`CalcPro SIP Plan: Monthly ${formatCurrency(monthlyInvestment, currency)} at ${expectedReturnRate}% for ${timePeriodYears} years yields total expected corpus of ${formatCurrency(totalValue, currency)}! Check projection:`}
            calcId="sip"
            currency={currency}
            inputs={{
              monthlyInvestment,
              expectedReturnRate,
              timePeriodYears,
              stepUpPercent,
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
        {/* Inputs */}
        <div className="lg:col-span-6 space-y-6">
          {/* Monthly Investment */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Monthly Investment</label>
              <span className="text-sm font-bold text-emerald-600 font-mono">
                {formatCurrency(monthlyInvestment, currency)}
              </span>
            </div>
            <input
              type="number"
              min="500"
              step="500"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Math.max(100, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
            <input
              type="range"
              min="1000"
              max="200000"
              step="1000"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full mt-2 accent-emerald-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[2000, 5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMonthlyInvestment(amt)}
                  className={`btn-gloss text-xs px-2.5 py-1 rounded-md font-medium transition ${
                    monthlyInvestment === amt
                      ? 'btn-gloss-emerald'
                      : 'btn-gloss-white'
                  }`}
                >
                  {formatCurrency(amt, currency)}
                </button>
              ))}
            </div>
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Expected Annual Return Rate</label>
              <span className="text-sm font-bold text-emerald-600 font-mono">{expectedReturnRate}%</span>
            </div>
            <input
              type="number"
              min="1"
              max="35"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full mt-2 accent-emerald-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[8, 10, 12, 15, 18].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setExpectedReturnRate(rate)}
                  className={`btn-gloss text-xs px-2.5 py-1 rounded-md font-medium transition ${
                    expectedReturnRate === rate
                      ? 'btn-gloss-emerald'
                      : 'btn-gloss-white'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Time Period */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Time Period (Years)</label>
              <span className="text-sm font-bold text-emerald-600 font-mono">{timePeriodYears} Years</span>
            </div>
            <input
              type="number"
              min="1"
              max="40"
              value={timePeriodYears}
              onChange={(e) => setTimePeriodYears(Math.max(1, Math.min(40, Number(e.target.value))))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
            <input
              type="range"
              min="1"
              max="35"
              value={timePeriodYears}
              onChange={(e) => setTimePeriodYears(Number(e.target.value))}
              className="w-full mt-2 accent-emerald-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[3, 5, 10, 15, 20, 25].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setTimePeriodYears(yr)}
                  className={`btn-gloss text-xs px-2.5 py-1 rounded-md font-medium transition ${
                    timePeriodYears === yr
                      ? 'btn-gloss-emerald'
                      : 'btn-gloss-white'
                  }`}
                >
                  {yr} Yrs
                </button>
              ))}
            </div>
          </div>

          {/* Optional Step Up */}
          <div className="pt-2 border-t border-slate-200">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-600">Annual Step-Up SIP (Optional)</label>
              <span className="text-xs font-bold text-slate-700">{stepUpPercent}% yearly</span>
            </div>
            <div className="flex gap-2">
              {[0, 5, 10, 15].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStepUpPercent(s)}
                  className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                    stepUpPercent === s
                      ? 'btn-gloss-emerald'
                      : 'btn-gloss-white'
                  }`}
                >
                  {s === 0 ? 'None' : `+${s}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Expected Total Maturity</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Growth
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1 font-mono">
                {formatCurrency(totalValue, currency)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Based on monthly compounding over {timePeriodYears} years</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500 block">Total Invested</span>
                <span className="text-lg font-bold text-slate-800 font-mono block mt-1">
                  {formatCurrency(investedAmount, currency)}
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-xs font-medium text-slate-500 block">Estimated Returns</span>
                <span className="text-lg font-bold text-emerald-600 font-mono block mt-1">
                  {formatCurrency(estReturns, currency)}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <DonutChart
                segments={[
                  {
                    label: 'Invested Capital',
                    value: investedAmount,
                    color: '#64748b', // slate-500
                    formattedValue: formatCurrency(investedAmount, currency),
                  },
                  {
                    label: 'Wealth Gain',
                    value: estReturns,
                    color: '#10b981', // emerald-500
                    formattedValue: formatCurrency(estReturns, currency),
                  },
                ]}
                size={160}
                strokeWidth={22}
                centerTitle="Gain"
                centerSubtitle={`${totalValue > 0 ? ((estReturns / totalValue) * 100).toFixed(0) : 0}%`}
              />
            </div>

            {/* Prominent Glazed Share & PDF Download Options */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <ShareButton
                title="CalcPro SIP Wealth Projection"
                text={`CalcPro SIP Plan: Monthly ${formatCurrency(monthlyInvestment, currency)} at ${expectedReturnRate}% for ${timePeriodYears} years yields total expected corpus of ${formatCurrency(totalValue, currency)}! Check projection:`}
                calcId="sip"
                currency={currency}
                inputs={{
                  monthlyInvestment,
                  expectedReturnRate,
                  timePeriodYears,
                  stepUpPercent,
                }}
                variant="primary"
                className="py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs"
              />
              <button
                onClick={handleExportPdf}
                className="flex-1 btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
                title="Download full SIP projection PDF to your phone"
              >
                <FileDown className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
