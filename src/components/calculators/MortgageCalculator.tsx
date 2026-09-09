import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { DonutChart } from '../common/DonutChart';
import { RotateCcw, Copy, Check, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';
import { ShareButton } from '../common/ShareButton';

interface Props {
  currency: CurrencyCode;
  initialInputs?: Record<string, any>;
}

export const MortgageCalculator: React.FC<Props> = ({ currency, initialInputs }) => {
  const [homePrice, setHomePrice] = useState<number>(450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [interestRate, setInterestRate] = useState<number>(6.8);
  const [propertyTaxAnnual, setPropertyTaxAnnual] = useState<number>(4200); // per year
  const [homeInsuranceAnnual, setHomeInsuranceAnnual] = useState<number>(1400); // per year
  const [hoaFeeMonthly, setHoaFeeMonthly] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Restore inputs if loaded from shared calculation link
  useEffect(() => {
    if (initialInputs) {
      if (typeof initialInputs.homePrice === 'number') setHomePrice(initialInputs.homePrice);
      if (typeof initialInputs.downPaymentPercent === 'number') setDownPaymentPercent(initialInputs.downPaymentPercent);
      if (typeof initialInputs.loanTermYears === 'number') setLoanTermYears(initialInputs.loanTermYears);
      if (typeof initialInputs.interestRate === 'number') setInterestRate(initialInputs.interestRate);
      if (typeof initialInputs.propertyTaxAnnual === 'number') setPropertyTaxAnnual(initialInputs.propertyTaxAnnual);
      if (typeof initialInputs.homeInsuranceAnnual === 'number') setHomeInsuranceAnnual(initialInputs.homeInsuranceAnnual);
      if (typeof initialInputs.hoaFeeMonthly === 'number') setHoaFeeMonthly(initialInputs.hoaFeeMonthly);
    }
  }, [initialInputs]);

  const {
    downPaymentAmount,
    principalLoan,
    monthlyPrincipalInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPMI,
    monthlyHOA,
    totalMonthlyPayment,
    totalInterest,
    totalCostOfLoan,
  } = useMemo(() => {
    const downAmount = (homePrice * downPaymentPercent) / 100;
    const loanAmt = Math.max(0, homePrice - downAmount);
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;

    let monthlyPI = 0;
    if (loanAmt > 0 && monthlyRate > 0) {
      monthlyPI =
        (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    } else if (loanAmt > 0 && monthlyRate === 0) {
      monthlyPI = loanAmt / totalMonths;
    }

    const mTax = propertyTaxAnnual / 12;
    const mIns = homeInsuranceAnnual / 12;
    // PMI typically applies if down payment is < 20% (approx 0.5% - 1% of loan annually)
    const mPMI = downPaymentPercent < 20 ? (loanAmt * 0.008) / 12 : 0;
    const mHOA = hoaFeeMonthly;

    const totalMonthly = monthlyPI + mTax + mIns + mPMI + mHOA;
    const totalPayPI = monthlyPI * totalMonths;
    const totInt = Math.max(0, totalPayPI - loanAmt);

    return {
      downPaymentAmount: Math.round(downAmount),
      principalLoan: Math.round(loanAmt),
      monthlyPrincipalInterest: Math.round(monthlyPI),
      monthlyPropertyTax: Math.round(mTax),
      monthlyInsurance: Math.round(mIns),
      monthlyPMI: Math.round(mPMI),
      monthlyHOA: Math.round(mHOA),
      totalMonthlyPayment: Math.round(totalMonthly),
      totalInterest: Math.round(totInt),
      totalCostOfLoan: Math.round(downAmount + totalPayPI + (mTax + mIns + mPMI + mHOA) * totalMonths),
    };
  }, [homePrice, downPaymentPercent, loanTermYears, interestRate, propertyTaxAnnual, homeInsuranceAnnual, hoaFeeMonthly]);

  const handleCopy = () => {
    const text = `CalcPro Mortgage Estimate:
Home Price: ${formatCurrency(homePrice, currency)}
Down Payment: ${formatCurrency(downPaymentAmount, currency)} (${downPaymentPercent}%)
Loan Amount: ${formatCurrency(principalLoan, currency)}
Rate: ${interestRate}% (${loanTermYears} Yrs)
Total Monthly Payment: ${formatCurrency(totalMonthlyPayment, currency)}
- Principal & Interest: ${formatCurrency(monthlyPrincipalInterest, currency)}
- Property Tax: ${formatCurrency(monthlyPropertyTax, currency)}
- Homeowners Insurance: ${formatCurrency(monthlyInsurance, currency)}
- PMI: ${formatCurrency(monthlyPMI, currency)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setHomePrice(450000);
    setDownPaymentPercent(20);
    setLoanTermYears(30);
    setInterestRate(6.8);
    setPropertyTaxAnnual(4200);
    setHomeInsuranceAnnual(1400);
    setHoaFeeMonthly(0);
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Comprehensive Mortgage & Escrow Assessment',
      calculatorName: 'Mortgage_Assessment',
      category: 'Real Estate & Housing',
      currency,
      primaryMetric: {
        label: 'Total Monthly Outflow',
        value: `${formatCurrency(totalMonthlyPayment, currency)} / mo`,
        subtext: `Principal, Interest, Property Tax & Insurance`,
      },
      secondaryMetrics: [
        {
          label: 'Principal & Interest',
          value: formatCurrency(monthlyPrincipalInterest, currency),
          subtext: `Base loan repayment across ${loanTermYears} years`,
        },
        {
          label: 'Total Interest Payable',
          value: formatCurrency(totalInterest, currency),
          subtext: `At ${interestRate}% fixed annual rate`,
        },
      ],
      parameters: [
        { label: 'Property Purchase Price', value: formatCurrency(homePrice, currency) },
        { label: 'Down Payment Paid', value: `${formatCurrency(downPaymentAmount, currency)} (${downPaymentPercent}%)` },
        { label: 'Principal Loan Balance', value: formatCurrency(principalLoan, currency) },
        { label: 'Fixed Loan Term', value: `${loanTermYears} Years (${loanTermYears * 12} installments)` },
        { label: 'Annual Interest Rate', value: `${interestRate}% p.a.` },
        { label: 'Annual Property Tax', value: formatCurrency(propertyTaxAnnual, currency) },
        { label: 'Annual Home Insurance', value: formatCurrency(homeInsuranceAnnual, currency) },
        ...(monthlyPMI > 0 ? [{ label: 'Monthly PMI Fee', value: formatCurrency(monthlyPMI, currency) }] : []),
        ...(monthlyHOA > 0 ? [{ label: 'Monthly HOA Fee', value: formatCurrency(monthlyHOA, currency) }] : []),
      ],
      breakdown: [
        { label: 'Monthly Principal & Interest', value: formatCurrency(monthlyPrincipalInterest, currency), percent: `${totalMonthlyPayment > 0 ? ((monthlyPrincipalInterest / totalMonthlyPayment) * 100).toFixed(1) : 0}%` },
        { label: 'Monthly Property Tax Escrow', value: formatCurrency(monthlyPropertyTax, currency), percent: `${totalMonthlyPayment > 0 ? ((monthlyPropertyTax / totalMonthlyPayment) * 100).toFixed(1) : 0}%` },
        { label: 'Monthly Homeowners Insurance', value: formatCurrency(monthlyInsurance, currency), percent: `${totalMonthlyPayment > 0 ? ((monthlyInsurance / totalMonthlyPayment) * 100).toFixed(1) : 0}%` },
        ...(monthlyPMI > 0 ? [{ label: 'Private Mortgage Insurance (PMI)', value: formatCurrency(monthlyPMI, currency), percent: `${totalMonthlyPayment > 0 ? ((monthlyPMI / totalMonthlyPayment) * 100).toFixed(1) : 0}%` }] : []),
      ],
      tableHeaders: ['Cost Item', 'Monthly Outflow', 'Annual Impact', 'Full Term Cost'],
      tableRows: [
        {
          period: 'Principal & Interest',
          col1: formatCurrency(monthlyPrincipalInterest, currency),
          col2: formatCurrency(monthlyPrincipalInterest * 12, currency),
          col3: formatCurrency(monthlyPrincipalInterest * loanTermYears * 12, currency),
        },
        {
          period: 'Property Tax',
          col1: formatCurrency(monthlyPropertyTax, currency),
          col2: formatCurrency(propertyTaxAnnual, currency),
          col3: formatCurrency(propertyTaxAnnual * loanTermYears, currency),
        },
        {
          period: 'Home Insurance',
          col1: formatCurrency(monthlyInsurance, currency),
          col2: formatCurrency(homeInsuranceAnnual, currency),
          col3: formatCurrency(homeInsuranceAnnual * loanTermYears, currency),
        },
        ...(monthlyPMI > 0 ? [{
          period: 'PMI Insurance',
          col1: formatCurrency(monthlyPMI, currency),
          col2: formatCurrency(monthlyPMI * 12, currency),
          col3: 'Until 20% equity',
        }] : []),
      ],
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Mortgage Assessment</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Full Escrow
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Calculate monthly mortgage with taxes, insurance & PMI</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Web Share API: Share calculation result link */}
          <ShareButton
            title="CalcPro Mortgage Assessment"
            text={`CalcPro Mortgage: Total Monthly Outflow ${formatCurrency(totalMonthlyPayment, currency)} for Home Price of ${formatCurrency(homePrice, currency)} (${downPaymentPercent}% down, ${loanTermYears}yr at ${interestRate}%). View statement:`}
            calcId="mortgage"
            currency={currency}
            inputs={{
              homePrice,
              downPaymentPercent,
              loanTermYears,
              interestRate,
              propertyTaxAnnual,
              homeInsuranceAnnual,
              hoaFeeMonthly,
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
        {/* Controls */}
        <div className="lg:col-span-6 space-y-5">
          {/* Home Price */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Home Price</label>
              <span className="text-sm font-bold text-blue-600 font-mono">
                {formatCurrency(homePrice, currency)}
              </span>
            </div>
            <input
              type="number"
              min="10000"
              step="5000"
              value={homePrice}
              onChange={(e) => setHomePrice(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
            <input
              type="range"
              min="50000"
              max="2000000"
              step="10000"
              value={homePrice}
              onChange={(e) => setHomePrice(Number(e.target.value))}
              className="w-full mt-2 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Down Payment</label>
              <span className="text-sm font-bold text-slate-900 font-mono">
                {formatCurrency(downPaymentAmount, currency)} ({downPaymentPercent}%)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                <input
                  type="number"
                  min="0"
                  max="90"
                  step="1"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Math.min(90, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="flex gap-1.5">
                {[5, 10, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`btn-gloss flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      downPaymentPercent === pct
                        ? 'btn-gloss-indigo'
                        : 'btn-gloss-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            {downPaymentPercent < 20 && (
              <p className="text-[11px] text-amber-600 font-medium mt-1">
                Notice: Down payment under 20% typically includes Private Mortgage Insurance (PMI).
              </p>
            )}
          </div>

          {/* Term & Rate */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Loan Term</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 p-0.5 bg-slate-100 gap-1">
                {[15, 20, 30].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setLoanTermYears(term)}
                    className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                      loanTermYears === term ? 'btn-gloss-indigo' : 'btn-gloss-white'
                    }`}
                  >
                    {term} Yrs
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Interest Rate (%)</label>
              <input
                type="number"
                min="0.1"
                max="20"
                step="0.05"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>

          {/* Taxes & Insurance */}
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Taxes, Insurance & Fees</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Property Tax (Yearly)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={propertyTaxAnnual}
                  onChange={(e) => setPropertyTaxAnnual(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Home Insurance (Yearly)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={homeInsuranceAnnual}
                  onChange={(e) => setHomeInsuranceAnnual(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Monthly Payment</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 mt-1 font-mono">
                {formatCurrency(totalMonthlyPayment, currency)}
                <span className="text-sm text-slate-500 font-normal"> / mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Includes Principal, Interest, Taxes & Insurance</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <DonutChart
                segments={[
                  {
                    label: 'Principal & Interest',
                    value: monthlyPrincipalInterest,
                    color: '#2563eb', // blue-600
                    formattedValue: formatCurrency(monthlyPrincipalInterest, currency),
                  },
                  {
                    label: 'Property Tax',
                    value: monthlyPropertyTax,
                    color: '#f97316', // orange-500
                    formattedValue: formatCurrency(monthlyPropertyTax, currency),
                  },
                  {
                    label: 'Home Insurance',
                    value: monthlyInsurance,
                    color: '#10b981', // emerald-500
                    formattedValue: formatCurrency(monthlyInsurance, currency),
                  },
                  ...(monthlyPMI > 0
                    ? [
                        {
                          label: 'PMI',
                          value: monthlyPMI,
                          color: '#e11d48', // rose-600
                          formattedValue: formatCurrency(monthlyPMI, currency),
                        },
                      ]
                    : []),
                ]}
                size={160}
                strokeWidth={22}
                centerTitle="Monthly"
                centerSubtitle={formatCurrency(totalMonthlyPayment, currency)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Total Loan Balance</span>
                <span className="font-bold text-slate-800 text-sm font-mono mt-0.5 block">
                  {formatCurrency(principalLoan, currency)}
                </span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Total Interest Cost</span>
                <span className="font-bold text-amber-600 text-sm font-mono mt-0.5 block">
                  {formatCurrency(totalInterest, currency)}
                </span>
              </div>
            </div>

            {/* Prominent Glazed PDF Download Option */}
            <button
              onClick={handleExportPdf}
              className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
              title="Download full Mortgage assessment PDF to your phone"
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
