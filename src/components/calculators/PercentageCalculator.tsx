import React, { useState } from 'react';
import { RotateCcw, Copy, Check, Percent, FileDown } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';
import { exportCalculationToPdf } from '../../utils/pdfExport';

export const PercentageCalculator: React.FC = () => {
  // Mode 1: What is X% of Y?
  const [val1Percent, setVal1Percent] = useState<number>(15);
  const [val1Total, setVal1Total] = useState<number>(200);

  // Mode 2: X is what % of Y?
  const [val2Part, setVal2Part] = useState<number>(40);
  const [val2Total, setVal2Total] = useState<number>(200);

  // Mode 3: % Increase/Decrease from X to Y
  const [val3From, setVal3From] = useState<number>(100);
  const [val3To, setVal3To] = useState<number>(125);

  const [copied, setCopied] = useState(false);

  // Results
  const res1 = (val1Percent * val1Total) / 100;
  const res2 = val2Total !== 0 ? (val2Part / val2Total) * 100 : 0;
  const diff3 = val3To - val3From;
  const res3Pct = val3From !== 0 ? (diff3 / val3From) * 100 : 0;

  const handleCopy = () => {
    const text = `CalcPro Percentage Answers:
1. ${val1Percent}% of ${val1Total} = ${res1}
2. ${val2Part} is ${res2.toFixed(2)}% of ${val2Total}
3. From ${val3From} to ${val3To} = ${res3Pct >= 0 ? '+' : ''}${res3Pct.toFixed(2)}% (${res3Pct >= 0 ? 'Increase' : 'Decrease'})`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setVal1Percent(15);
    setVal1Total(200);
    setVal2Part(40);
    setVal2Total(200);
    setVal3From(100);
    setVal3To(125);
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Percentage & Delta Analysis Report',
      calculatorName: 'Percentage_Ratio_Computation',
      category: 'Mathematical Analytics',
      primaryMetric: {
        label: 'Relative Delta Change (Mode 3)',
        value: `${res3Pct >= 0 ? '+' : ''}${res3Pct.toFixed(2)}%`,
        subtext: `From ${val3From} to ${val3To} (Net diff: ${diff3 >= 0 ? `+${diff3}` : diff3})`,
      },
      secondaryMetrics: [
        {
          label: 'Percentage of Total (Mode 1)',
          value: `${val1Percent}% of ${val1Total} = ${res1}`,
          subtext: `Fraction: ${(val1Percent / 100).toFixed(4)}`,
        },
        {
          label: 'Proportion Ratio (Mode 2)',
          value: `${val2Part} is ${res2.toFixed(2)}% of ${val2Total}`,
          subtext: `Ratio: ${(val2Part / val2Total).toFixed(4)}`,
        },
      ],
      parameters: [
        { label: 'Mode 1 Percentage (X%)', value: `${val1Percent}% of ${val1Total}` },
        { label: 'Mode 2 Part to Whole', value: `${val2Part} out of ${val2Total}` },
        { label: 'Mode 3 Base Value (From)', value: `${val3From}` },
        { label: 'Mode 3 Target Value (To)', value: `${val3To}` },
      ],
      breakdown: [
        { label: `Mode 1: ${val1Percent}% of ${val1Total}`, value: `${res1}` },
        { label: `Mode 2: ${val2Part} / ${val2Total}`, value: `${res2.toFixed(2)}%` },
        { label: `Mode 3: Delta (${val3To} - ${val3From})`, value: `${diff3 >= 0 ? `+${diff3}` : diff3} (${res3Pct.toFixed(2)}%)` },
      ],
      tableHeaders: ['Calculation Case', 'Input Variables', 'Mathematical Formula', 'Result Value'],
      tableRows: [
        { period: '1. Percentage of Total', col1: `${val1Percent}% of ${val1Total}`, col2: `(${val1Percent} × ${val1Total}) / 100`, col3: `${res1}` },
        { period: '2. Proportion Percentage', col1: `${val2Part} of ${val2Total}`, col2: `(${val2Part} / ${val2Total}) × 100`, col3: `${res2.toFixed(2)}%` },
        { period: '3. Percentage Change', col1: `${val3From} -> ${val3To}`, col2: `((${val3To} - ${val3From}) / ${val3From}) × 100`, col3: `${res3Pct >= 0 ? '+' : ''}${res3Pct.toFixed(2)}%` },
      ],
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Percentage & Ratio Computation</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Multi-Mode
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Quickly compute percentages, relative proportions & delta changes</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="p-6 md:p-8 space-y-6">
        {/* Case 1: What is X% of Y? */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 block mb-3">
            1. What is X% of Y?
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600">What is</span>
            <div className="relative w-28">
              <span className="absolute right-2.5 top-2.5 text-slate-400 text-xs font-bold">%</span>
              <input
                type="number"
                value={val1Percent}
                onChange={(e) => setVal1Percent(Number(e.target.value))}
                className="w-full px-3 py-2 pr-7 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <span className="text-sm font-medium text-slate-600">of</span>
            <input
              type="number"
              value={val1Total}
              onChange={(e) => setVal1Total(Number(e.target.value))}
              className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-sm font-bold text-slate-500">=</span>
            <div className="px-4 py-2 bg-cyan-600 text-white font-mono font-bold text-base rounded-lg shadow-2xs">
              {formatNumber(res1, 2)}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Formula: ({val1Percent} ÷ 100) × {val1Total} = {res1}</p>
        </div>

        {/* Case 2: X is what % of Y? */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 block mb-3">
            2. X is what percent of Y?
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={val2Part}
              onChange={(e) => setVal2Part(Number(e.target.value))}
              className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-slate-600">is what % of</span>
            <input
              type="number"
              value={val2Total}
              onChange={(e) => setVal2Total(Number(e.target.value))}
              className="w-32 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-sm font-bold text-slate-500">=</span>
            <div className="px-4 py-2 bg-cyan-600 text-white font-mono font-bold text-base rounded-lg shadow-2xs">
              {formatNumber(res2, 2)}%
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Formula: ({val2Part} ÷ {val2Total}) × 100 = {res2.toFixed(2)}%</p>
        </div>

        {/* Case 3: Percentage increase / decrease */}
        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 block mb-3">
            3. Percentage Increase / Decrease from X to Y
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-slate-600">From</span>
            <input
              type="number"
              value={val3From}
              onChange={(e) => setVal3From(Number(e.target.value))}
              className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-slate-600">to</span>
            <input
              type="number"
              value={val3To}
              onChange={(e) => setVal3To(Number(e.target.value))}
              className="w-28 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <span className="text-sm font-bold text-slate-500">=</span>
            <div
              className={`px-4 py-2 font-mono font-bold text-base rounded-lg text-white shadow-2xs ${
                res3Pct >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {res3Pct >= 0 ? `+${formatNumber(res3Pct, 2)}% (Increase)` : `${formatNumber(res3Pct, 2)}% (Decrease)`}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Formula: (({val3To} - {val3From}) ÷ {val3From}) × 100 = {res3Pct.toFixed(2)}% (Difference of {diff3 >= 0 ? `+${diff3}` : diff3})
          </p>
        </div>

        {/* Prominent Glazed PDF Download Option */}
        <button
          onClick={handleExportPdf}
          className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
          title="Download full Percentage & Delta Analysis PDF to your phone"
        >
          <FileDown className="w-4 h-4" />
          <span>Download PDF to Phone (ফোনে PDF সেভ করুন)</span>
        </button>
      </div>
    </div>
  );
};
