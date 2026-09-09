import React, { useState } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react';

export interface AmortizationRow {
  period: number; // Year or Month
  beginningBalance: number;
  payment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

interface AmortizationTableProps {
  rows: AmortizationRow[];
  currency: CurrencyCode;
  periodLabel?: 'Year' | 'Month';
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  rows,
  currency,
  periodLabel = 'Year',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [limit, setLimit] = useState(10);

  const displayedRows = isExpanded ? rows.slice(0, limit) : rows.slice(0, 5);

  return (
    <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="bg-slate-50 px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <h4 className="font-semibold text-slate-800 text-sm md:text-base">
            Amortization Schedule ({periodLabel}ly Breakdown)
          </h4>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-indigo-50 transition"
        >
          {isExpanded ? (
            <>
              Collapse Schedule <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              View Full Schedule ({rows.length} {periodLabel}s) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-100/75 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-4">{periodLabel}</th>
              <th className="py-3 px-4 text-right">Beginning Balance</th>
              <th className="py-3 px-4 text-right">Principal Paid</th>
              <th className="py-3 px-4 text-right">Interest Paid</th>
              <th className="py-3 px-4 text-right">Total Payment</th>
              <th className="py-3 px-4 text-right">Ending Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedRows.map((row) => (
              <tr key={row.period} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-900">
                  {periodLabel} {row.period}
                </td>
                <td className="py-3 px-4 text-right text-slate-600 font-mono">
                  {formatCurrency(row.beginningBalance, currency)}
                </td>
                <td className="py-3 px-4 text-right text-emerald-600 font-semibold font-mono">
                  {formatCurrency(row.principal, currency)}
                </td>
                <td className="py-3 px-4 text-right text-amber-600 font-mono">
                  {formatCurrency(row.interest, currency)}
                </td>
                <td className="py-3 px-4 text-right text-slate-700 font-semibold font-mono">
                  {formatCurrency(row.payment, currency)}
                </td>
                <td className="py-3 px-4 text-right text-slate-900 font-bold font-mono">
                  {formatCurrency(row.endingBalance, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isExpanded && rows.length > limit && (
        <div className="p-3 bg-slate-50 text-center border-t border-slate-200">
          <button
            onClick={() => setLimit((prev) => prev + 15)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Load 15 More {periodLabel}s (Showing {limit} of {rows.length})
          </button>
        </div>
      )}
    </div>
  );
};
