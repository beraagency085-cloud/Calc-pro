import React, { useState, useMemo } from 'react';
import { RotateCcw, Copy, Check, Calendar, Cake, Clock, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';

export const AgeCalculator: React.FC = () => {
  // Default: 25 years ago today
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() - 25);
  const formattedDefault = defaultDate.toISOString().split('T')[0];

  const [dob, setDob] = useState<string>(formattedDefault);
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [copied, setCopied] = useState(false);

  const {
    years,
    months,
    days,
    nextBirthdayDays,
    nextBirthdayDayOfWeek,
    totalMonths,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    dayBorn,
  } = useMemo(() => {
    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (isNaN(birth.getTime()) || isNaN(target.getTime()) || birth > target) {
      return {
        years: 0,
        months: 0,
        days: 0,
        nextBirthdayDays: 0,
        nextBirthdayDayOfWeek: '',
        totalMonths: 0,
        totalWeeks: 0,
        totalDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        dayBorn: '',
      };
    }

    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayBornStr = weekdays[birth.getDay()];

    let y = target.getFullYear() - birth.getFullYear();
    let m = target.getMonth() - birth.getMonth();
    let d = target.getDate() - birth.getDate();

    if (d < 0) {
      m -= 1;
      const prevMonthLastDay = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
      d += prevMonthLastDay;
    }

    if (m < 0) {
      y -= 1;
      m += 12;
    }

    // Next birthday
    let nextBdayYear = target.getFullYear();
    let nextBday = new Date(nextBdayYear, birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday = new Date(nextBdayYear + 1, birth.getMonth(), birth.getDate());
    }

    const diffNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    const nextBdayWeekDay = weekdays[nextBday.getDay()];

    // Total statistics
    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totWeeks = Math.floor(totDays / 7);
    const totMonths = y * 12 + m;
    const totHours = totDays * 24;
    const totMins = totHours * 60;

    return {
      years: y,
      months: m,
      days: d,
      nextBirthdayDays: diffNextBday,
      nextBirthdayDayOfWeek: nextBdayWeekDay,
      totalMonths: totMonths,
      totalWeeks: totWeeks,
      totalDays: totDays,
      totalHours: totHours,
      totalMinutes: totMins,
      dayBorn: dayBornStr,
    };
  }, [dob, targetDate]);

  const handleCopy = () => {
    const text = `CalcPro Age Calculation:
Exact Age: ${years} Years, ${months} Months, ${days} Days
Born On: ${dayBorn}
Next Birthday: in ${nextBirthdayDays} days (${nextBirthdayDayOfWeek})
Total Days Lived: ${totalDays.toLocaleString()} days`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setDob(formattedDefault);
    setTargetDate(new Date().toISOString().split('T')[0]);
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Chronological Age & Life Milestones Certificate',
      calculatorName: 'Age_Milestones_Assessment',
      category: 'Chronological Precision',
      primaryMetric: {
        label: 'Exact Chronological Age',
        value: `${years} Years, ${months} Months, ${days} Days`,
        subtext: `Born on ${dayBorn} (${dob})`,
      },
      secondaryMetrics: [
        {
          label: 'Total Days Lived',
          value: `${totalDays.toLocaleString()} Days`,
          subtext: `${totalWeeks.toLocaleString()} completed weeks`,
        },
        {
          label: 'Upcoming Birthday',
          value: `In ${nextBirthdayDays} Days`,
          subtext: `Falling on ${nextBirthdayDayOfWeek}`,
        },
      ],
      parameters: [
        { label: 'Date of Birth', value: dob },
        { label: 'Assessment / As-of Date', value: targetDate },
        { label: 'Day of Birth', value: dayBorn },
        { label: 'Next Birthday Milestone', value: `${nextBirthdayDays} days (${nextBirthdayDayOfWeek})` },
      ],
      breakdown: [
        { label: 'Total Calendar Months', value: `${totalMonths.toLocaleString()} months` },
        { label: 'Total Calendar Weeks', value: `${totalWeeks.toLocaleString()} weeks` },
        { label: 'Total Calendar Days', value: `${totalDays.toLocaleString()} days` },
        { label: 'Total Hours Elapsed', value: `${totalHours.toLocaleString()} hours` },
        { label: 'Total Minutes Elapsed', value: `${totalMinutes.toLocaleString()} minutes` },
      ],
      tableHeaders: ['Time Unit', 'Exact Value', 'Equivalence'],
      tableRows: [
        { period: 'Years', col1: `${years} full years`, col2: `${years * 12} months` },
        { period: 'Months', col1: `${totalMonths.toLocaleString()} months`, col2: `${totalWeeks.toLocaleString()} weeks` },
        { period: 'Days', col1: `${totalDays.toLocaleString()} days`, col2: `${totalHours.toLocaleString()} hours` },
        { period: 'Hours', col1: `${totalHours.toLocaleString()} hours`, col2: `${totalMinutes.toLocaleString()} minutes` },
      ],
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Chronological Chronometer</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Precision
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Exact chronological duration in years, months, days & life milestones</p>
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

      <div className="p-6 md:p-8 grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-5">
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Date of Birth</label>
            <div className="relative">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
              />
            </div>
            {dayBorn && (
              <span className="text-xs text-amber-700 font-medium mt-1 inline-block">
                You were born on a <strong>{dayBorn}</strong>
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Age at the Date of</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
            />
          </div>

          {/* Next Birthday card */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <Cake className="w-4 h-4 text-amber-600" />
              <span>Next Birthday</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {nextBirthdayDays === 0 ? 'Today is your Birthday! 🎉' : `${nextBirthdayDays} days away`}
            </div>
            {nextBirthdayDays > 0 && (
              <p className="text-xs text-amber-700 mt-0.5">
                It will fall on a <strong>{nextBirthdayDayOfWeek}</strong>
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-50/80 rounded-xl p-6 border border-slate-200/80">
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Current Exact Age</span>
              <div className="flex flex-wrap items-baseline gap-3 mt-2">
                <div className="text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">{years}</span>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Years</span>
                </div>
                <div className="text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">{months}</span>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Months</span>
                </div>
                <div className="text-center bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                  <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">{days}</span>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Days</span>
                </div>
              </div>
            </div>

            {/* Total Life Statistics */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-sm mb-3">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Life Summary in Different Units</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Total Months</span>
                  <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                    {totalMonths.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Total Weeks</span>
                  <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                    {totalWeeks.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Total Days</span>
                  <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                    {totalDays.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 block">Total Hours</span>
                  <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                    {totalHours.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg col-span-2 sm:col-span-2">
                  <span className="text-slate-500 block">Total Minutes</span>
                  <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block">
                    {totalMinutes.toLocaleString()} min
                  </span>
                </div>
              </div>
            </div>

            {/* Prominent Glazed PDF Download Option */}
            <button
              onClick={handleExportPdf}
              className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
              title="Download full Chronological Age & Life Milestones Certificate PDF to your phone"
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
