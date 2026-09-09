import React, { useState, useMemo } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import { RotateCcw, Copy, Check, Plus, Trash2, PieChart, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';

interface AssetItem {
  id: string;
  name: string;
  currentValue: number;
  targetPercent: number;
  color: string;
}

interface Props {
  currency: CurrencyCode;
}

const PRESET_COLORS = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

export const StockInvestCalculator: React.FC<Props> = ({ currency }) => {
  const [assets, setAssets] = useState<AssetItem[]>([
    { id: '1', name: 'US / Global Index (e.g. S&P 500 / Nifty)', currentValue: 60000, targetPercent: 50, color: '#0284c7' },
    { id: '2', name: 'Tech / Growth Stocks', currentValue: 30000, targetPercent: 25, color: '#8b5cf6' },
    { id: '3', name: 'Bonds & Fixed Income', currentValue: 15000, targetPercent: 15, color: '#10b981' },
    { id: '4', name: 'Cash / Liquid Reserve', currentValue: 15000, targetPercent: 10, color: '#f59e0b' },
  ]);

  const [copied, setCopied] = useState(false);

  // Totals & Rebalance calculation
  const { totalPortfolioValue, totalTargetPercent, rebalanceRows } = useMemo(() => {
    const totalVal = assets.reduce((sum, a) => sum + Math.max(0, a.currentValue), 0);
    const totalTarget = assets.reduce((sum, a) => sum + Math.max(0, a.targetPercent), 0);

    const rows = assets.map((asset) => {
      const currentVal = Math.max(0, asset.currentValue);
      const currentPct = totalVal > 0 ? (currentVal / totalVal) * 100 : 0;
      // Target value according to portfolio size
      const targetVal = totalTarget > 0 ? (totalVal * asset.targetPercent) / totalTarget : 0;
      const difference = targetVal - currentVal; // Positive = Buy, Negative = Sell

      return {
        ...asset,
        currentPct,
        targetVal,
        difference,
        action: difference > 1 ? 'BUY' : difference < -1 ? 'SELL' : 'ON TARGET',
      };
    });

    return {
      totalPortfolioValue: totalVal,
      totalTargetPercent: totalTarget,
      rebalanceRows: rows,
    };
  }, [assets]);

  const handleAddAsset = () => {
    const newId = String(Date.now());
    const nextColor = PRESET_COLORS[assets.length % PRESET_COLORS.length];
    setAssets([
      ...assets,
      {
        id: newId,
        name: `Asset ${assets.length + 1}`,
        currentValue: 10000,
        targetPercent: 10,
        color: nextColor,
      },
    ]);
  };

  const handleRemoveAsset = (id: string) => {
    if (assets.length <= 1) return;
    setAssets(assets.filter((a) => a.id !== id));
  };

  const handleUpdate = (id: string, field: 'name' | 'currentValue' | 'targetPercent', val: string | number) => {
    setAssets(
      assets.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: val };
        }
        return a;
      })
    );
  };

  const handleCopy = () => {
    const lines = rebalanceRows.map(
      (r) =>
        `- ${r.name}: Current ${formatCurrency(r.currentValue, currency)} (${r.currentPct.toFixed(1)}%) -> Target ${r.targetPercent}% | Action: ${
          r.action === 'BUY'
            ? `Buy +${formatCurrency(Math.abs(r.difference), currency)}`
            : r.action === 'SELL'
            ? `Sell -${formatCurrency(Math.abs(r.difference), currency)}`
            : 'Balanced'
        }`
    );
    const text = `CalcPro Portfolio Rebalance Summary:
Total Value: ${formatCurrency(totalPortfolioValue, currency)}
${lines.join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setAssets([
      { id: '1', name: 'Global Index (S&P / Nifty)', currentValue: 60000, targetPercent: 50, color: '#0284c7' },
      { id: '2', name: 'Growth Stocks', currentValue: 30000, targetPercent: 25, color: '#8b5cf6' },
      { id: '3', name: 'Bonds & Fixed Income', currentValue: 15000, targetPercent: 15, color: '#10b981' },
      { id: '4', name: 'Cash Reserve', currentValue: 15000, targetPercent: 10, color: '#f59e0b' },
    ]);
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Portfolio Asset Allocation & Rebalance Report',
      calculatorName: 'Portfolio_Allocation',
      category: 'Capital Markets & Wealth',
      currency,
      primaryMetric: {
        label: 'Total Net Portfolio Value',
        value: formatCurrency(totalPortfolioValue, currency),
        subtext: `Across ${assets.length} registered asset classes`,
      },
      secondaryMetrics: [
        {
          label: 'Total Target Allocation',
          value: `${totalTargetPercent}%`,
          subtext: totalTargetPercent === 100 ? 'Fully allocated (100%)' : 'Target mismatch',
        },
        {
          label: 'Required Trade Actions',
          value: `${rebalanceRows.filter(r => r.action !== 'ON TARGET').length} adjustments`,
          subtext: 'Rebalancing recommendations',
        },
      ],
      parameters: [
        { label: 'Total Portfolio Capital', value: formatCurrency(totalPortfolioValue, currency) },
        { label: 'Registered Holdings', value: `${assets.length} Asset Classes` },
        { label: 'Portfolio Status', value: totalTargetPercent === 100 ? 'Balanced Model' : 'Adjust Target Percentages' },
      ],
      breakdown: rebalanceRows.map((r) => ({
        label: r.name,
        value: `${formatCurrency(r.currentValue, currency)} (${r.currentPct.toFixed(1)}% -> Target ${r.targetPercent}%)`,
        percent: `${r.currentPct.toFixed(1)}%`,
      })),
      tableHeaders: ['Asset Class', 'Current Value', 'Current %', 'Target %', 'Recommended Action'],
      tableRows: rebalanceRows.map((r) => ({
        period: r.name,
        col1: formatCurrency(r.currentValue, currency),
        col2: `${r.currentPct.toFixed(1)}%`,
        col3: `${r.targetPercent}% (${formatCurrency(r.targetVal, currency)})`,
      })),
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Portfolio Allocation & Rebalancer</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Asset Allocation
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Calculate target weights and exact buy/sell amounts to rebalance</p>
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
        {/* Total portfolio banner */}
        <div className="bg-sky-50 rounded-xl p-5 border border-sky-200 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-800">Total Portfolio Value</span>
            <div className="text-3xl font-extrabold text-slate-900 font-mono mt-0.5">
              {formatCurrency(totalPortfolioValue, currency)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Target %</span>
              <span
                className={`text-sm font-bold font-mono ${
                  totalTargetPercent === 100 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {totalTargetPercent}% {totalTargetPercent !== 100 && '(Target should sum to 100%)'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAddAsset}
              className="btn-gloss btn-gloss-indigo text-xs px-3.5 py-2 rounded-lg inline-flex items-center gap-1.5 font-bold"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>
        </div>

        {/* Current vs Target Visual Bar */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-600 block uppercase">Current Allocation vs Target</span>
          {/* Current Bar */}
          <div className="h-6 rounded-lg overflow-hidden flex shadow-2xs">
            {rebalanceRows.map((item) => (
              <div
                key={item.id}
                style={{
                  width: `${item.currentPct}%`,
                  backgroundColor: item.color,
                }}
                className="h-full relative group transition-all duration-300"
                title={`${item.name}: ${item.currentPct.toFixed(1)}%`}
              />
            ))}
          </div>
        </div>

        {/* Asset Table with Interactive Inputs and Rebalance Guidance */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Asset / Stock</th>
                <th className="py-3 px-4 text-right">Current Value</th>
                <th className="py-3 px-4 text-right">Current %</th>
                <th className="py-3 px-4 text-right">Target %</th>
                <th className="py-3 px-4 text-right">Target Value</th>
                <th className="py-3 px-4 text-center">Rebalance Action</th>
                <th className="py-3 px-3 text-center w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rebalanceRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleUpdate(row.id, 'name', e.target.value)}
                        className="w-full font-medium text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:bg-white outline-none px-1 py-0.5 rounded transition"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={row.currentValue}
                      onChange={(e) => handleUpdate(row.id, 'currentValue', Number(e.target.value))}
                      className="w-28 text-right font-mono font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:bg-white focus:border-sky-500"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                    {row.currentPct.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={row.targetPercent}
                        onChange={(e) => handleUpdate(row.id, 'targetPercent', Number(e.target.value))}
                        className="w-16 text-right font-mono font-semibold text-sky-700 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 outline-none focus:bg-white focus:border-sky-500"
                      />
                      <span className="text-slate-500 text-xs font-bold">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {formatCurrency(row.targetVal, currency)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.action === 'BUY' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 font-mono">
                        BUY +{formatCurrency(Math.abs(row.difference), currency)}
                      </span>
                    ) : row.action === 'SELL' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 font-mono">
                        SELL -{formatCurrency(Math.abs(row.difference), currency)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        Balanced
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {assets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(row.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition"
                        title="Remove asset"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Prominent Glazed PDF Download Option */}
        <div className="pt-2">
          <button
            onClick={handleExportPdf}
            className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
            title="Download full Portfolio Rebalance assessment PDF to your phone"
          >
            <FileDown className="w-4 h-4" />
            <span>Download PDF to Phone (ফোনে PDF সেভ করুন)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
