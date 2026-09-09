import React, { useState, useMemo, useEffect } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { RotateCcw, Copy, Check, Sparkles } from 'lucide-react';
import { ShareButton } from '../common/ShareButton';

interface Props {
  currency: CurrencyCode;
  initialInputs?: Record<string, any>;
}

export const ExtraPaymentCalculator: React.FC<Props> = ({ currency, initialInputs }) => {
  const [loanBalance, setLoanBalance] = useState<number>(3000000);
  const [interestRate, setInterestRate] = useState<number>(9.0);
  const [remainingYears, setRemainingYears] = useState<number>(20);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(5000);
  const [copied, setCopied] = useState(false);

  // Restore inputs if loaded from shared calculation link
  useEffect(() => {
    if (initialInputs) {
      if (typeof initialInputs.loanBalance === 'number') setLoanBalance(initialInputs.loanBalance);
      if (typeof initialInputs.interestRate === 'number') setInterestRate(initialInputs.interestRate);
      if (typeof initialInputs.remainingYears === 'number') setRemainingYears(initialInputs.remainingYears);
      if (typeof initialInputs.extraMonthlyPayment === 'number') setExtraMonthlyPayment(initialInputs.extraMonthlyPayment);
    }
  }, [initialInputs]);

  const {
    standardMonthlyEMI,
    standardTotalInterest,
    newTotalInterest,
    interestSaved,
    originalMonths,
    newMonths,
    monthsSaved,
    yearsSaved,
  } = useMemo(() => {
    const P = Math.max(0, loanBalance);
    const r = interestRate / 100 / 12;
    const origN = remainingYears * 12;

    if (P <= 0 || r <= 0 || origN <= 0) {
      return {
        standardMonthlyEMI: 0,
        standardTotalInterest: 0,
        newTotalInterest: 0,
        interestSaved: 0,
        originalMonths: 0,
        newMonths: 0,
        monthsSaved: 0,
        yearsSaved: '0',
      };
    }

    const emi = (P * r * Math.pow(1 + r, origN)) / (Math.pow(1 + r, origN) - 1);
    const origTotalInterest = emi * origN - P;

    // Simulate payoff with extra monthly payment
    let balance = P;
    let actualMonths = 0;
    let totalPaidWithExtra = 0;
    const maxMonthsLimit = origN;
    const totalMonthlyPay = emi + extraMonthlyPayment;

    while (balance > 0 && actualMonths < maxMonthsLimit * 2) {
      actualMonths++;
      const interestThisMonth = balance * r;
      const principalThisMonth = Math.min(balance, totalMonthlyPay - interestThisMonth);

      balance -= principalThisMonth;
      totalPaidWithExtra += principalThisMonth + interestThisMonth;

      if (balance <= 0.01) break;
    }

    const newTotInterest = Math.max(0, totalPaidWithExtra - P);
    const savedInt = Math.max(0, origTotalInterest - newTotInterest);
    const mSaved = Math.max(0, origN - actualMonths);
    const ySaved = (mSaved / 12).toFixed(1);

    return {
      standardMonthlyEMI: Math.round(emi),
      standardTotalInterest: Math.round(origTotalInterest),
      newTotalInterest: Math.round(newTotInterest),
      interestSaved: Math.round(savedInt),
      originalMonths: origN,
      newMonths: actualMonths,
      monthsSaved: mSaved,
      yearsSaved: ySaved,
    };
  }, [loanBalance, interestRate, remainingYears, extraMonthlyPayment]);

  const handleCopy = () => {
    const text = `CalcPro Extra Payment Savings:
Remaining Balance: ${formatCurrency(loanBalance, currency)}
Interest Rate: ${interestRate}%
Extra Payment: ${formatCurrency(extraMonthlyPayment, currency)} / month
Interest Saved: ${formatCurrency(interestSaved, currency)}
Time Saved: ${monthsSaved} months (${yearsSaved} years)
New Payoff Time: ${newMonths} months (vs ${originalMonths} months)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setLoanBalance(3000000);
    setInterestRate(9.0);
    setRemainingYears(20);
    setExtraMonthlyPayment(5000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Debt Prepayment Modeling</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Interest Saver
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Evaluate amortization acceleration and interest savings from supplementary monthly payments</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Web Share API: Share calculation result link */}
          <ShareButton
            title="CalcPro Extra Payment Debt Prepayment"
            text={`CalcPro Debt Acceleration: Extra payment of ${formatCurrency(extraMonthlyPayment, currency)} saves ${formatCurrency(interestSaved, currency)} in interest and cuts payoff time by ${monthsSaved} months (${yearsSaved} years)! View breakdown:`}
            calcId="extra"
            currency={currency}
            inputs={{
              loanBalance,
              interestRate,
              remainingYears,
              extraMonthlyPayment,
            }}
            variant="glazed-header"
          />

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Remaining Loan Balance</label>
              <span className="text-sm font-bold text-purple-600 font-mono">
                {formatCurrency(loanBalance, currency)}
              </span>
            </div>
            <input
              type="number"
              min="10000"
              step="10000"
              value={loanBalance}
              onChange={(e) => setLoanBalance(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Interest Rate (%)</label>
              <input
                type="number"
                min="1"
                max="25"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Remaining Tenure (Years)</label>
              <input
                type="number"
                min="1"
                max="35"
                value={remainingYears}
                onChange={(e) => setRemainingYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-semibold text-slate-700">Extra Monthly Payment</label>
              <span className="text-sm font-bold text-purple-600 font-mono">
                +{formatCurrency(extraMonthlyPayment, currency)} / mo
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="500"
              value={extraMonthlyPayment}
              onChange={(e) => setExtraMonthlyPayment(Math.max(0, Number(e.target.value)))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
            />
            <input
              type="range"
              min="0"
              max="50000"
              step="500"
              value={extraMonthlyPayment}
              onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
              className="w-full mt-2 accent-purple-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[1000, 2500, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setExtraMonthlyPayment(amt)}
                  className={`text-xs px-2.5 py-1 rounded-md border font-medium transition ${
                    extraMonthlyPayment === amt
                      ? 'bg-purple-50 text-purple-700 border-purple-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  +{formatCurrency(amt, currency)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison Result */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-purple-50/50 rounded-xl p-6 border border-purple-100">
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-xs">
              <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Your Total Interest Savings</span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-600 mt-1 font-mono">
                {formatCurrency(interestSaved, currency)}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                You will become 100% debt-free <strong className="text-purple-700 font-semibold">{yearsSaved} years earlier</strong>!
              </p>
            </div>

            {/* Side-by-side comparison table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="grid grid-cols-2 text-xs font-bold text-slate-600 bg-slate-100 p-3 border-b border-slate-200">
                <span>Standard Loan</span>
                <span className="text-purple-700">With Extra Payment</span>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-slate-500 text-xs">Monthly Payment</span>
                  <span className="text-xs font-semibold text-slate-800">New Payment</span>
                </div>
                <div className="grid grid-cols-2 font-mono">
                  <span className="text-slate-700">{formatCurrency(standardMonthlyEMI, currency)}</span>
                  <span className="text-purple-700 font-bold">
                    {formatCurrency(standardMonthlyEMI + extraMonthlyPayment, currency)}
                  </span>
                </div>

                <div className="grid grid-cols-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-xs">Total Interest</span>
                  <span className="text-xs font-semibold text-slate-800">New Total Interest</span>
                </div>
                <div className="grid grid-cols-2 font-mono">
                  <span className="text-amber-600">{formatCurrency(standardTotalInterest, currency)}</span>
                  <span className="text-emerald-600 font-bold">{formatCurrency(newTotalInterest, currency)}</span>
                </div>

                <div className="grid grid-cols-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 text-xs">Loan Payoff Term</span>
                  <span className="text-xs font-semibold text-slate-800">New Payoff Term</span>
                </div>
                <div className="grid grid-cols-2 font-mono">
                  <span className="text-slate-700">{originalMonths} Months</span>
                  <span className="text-purple-700 font-bold">{newMonths} Months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
