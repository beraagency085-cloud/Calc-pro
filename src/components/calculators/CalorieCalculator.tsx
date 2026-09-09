import React, { useState, useMemo } from 'react';
import { RotateCcw, Copy, Check, Flame, Activity, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';

export const CalorieCalculator: React.FC = () => {
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(26);
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [activityMultiplier, setActivityMultiplier] = useState<number>(1.375); // Light exercise
  const [copied, setCopied] = useState(false);

  const { bmr, tdee, goals, macros } = useMemo(() => {
    let baseBmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
      baseBmr += 5;
    } else {
      baseBmr -= 161;
    }

    const calculatedTdee = baseBmr * activityMultiplier;

    const maintain = Math.round(calculatedTdee);
    const mildLoss = Math.max(1200, Math.round(calculatedTdee - 250));
    const loss = Math.max(1200, Math.round(calculatedTdee - 500));
    const extremeLoss = Math.max(1200, Math.round(calculatedTdee - 1000));
    const mildGain = Math.round(calculatedTdee + 250);
    const gain = Math.round(calculatedTdee + 500);

    const proteinGrams = Math.round((maintain * 0.3) / 4);
    const carbsGrams = Math.round((maintain * 0.4) / 4);
    const fatGrams = Math.round((maintain * 0.3) / 9);

    return {
      bmr: Math.round(baseBmr),
      tdee: maintain,
      goals: {
        maintain,
        mildLoss,
        loss,
        extremeLoss,
        mildGain,
        gain,
      },
      macros: {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams,
      },
    };
  }, [gender, age, heightCm, weightKg, activityMultiplier]);

  const handleCopy = () => {
    const text = `CalcPro Calorie & Energy Needs:
BMR (Basal Metabolic Rate): ${bmr} kcal/day
Maintenance (TDEE): ${tdee} kcal/day
Weight Loss (-0.5kg/week): ${goals.loss} kcal/day
Mild Weight Loss: ${goals.mildLoss} kcal/day
Weight Gain (+0.5kg/week): ${goals.gain} kcal/day
Suggested Daily Macros (Maintain): ${macros.protein}g Protein, ${macros.carbs}g Carbs, ${macros.fat}g Fats`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setGender('male');
    setAge(26);
    setHeightCm(175);
    setWeightKg(70);
    setActivityMultiplier(1.375);
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Nutritional Energy & Caloric Expenditure Analysis',
      calculatorName: 'Calorie_Expenditure_Assessment',
      category: 'Health & Metabolic Science',
      primaryMetric: {
        label: 'Total Daily Energy Expenditure (TDEE)',
        value: `${tdee} kcal/day`,
        subtext: `Basal Metabolic Rate (BMR): ${bmr} kcal/day`,
      },
      secondaryMetrics: [
        {
          label: 'Weight Loss Target (-0.5 kg/wk)',
          value: `${goals.loss} kcal/day`,
          subtext: 'Safe, sustainable caloric deficit',
        },
        {
          label: 'Lean Muscle Gain (+0.5 kg/wk)',
          value: `${goals.gain} kcal/day`,
          subtext: 'Optimal hypercaloric surplus',
        },
      ],
      parameters: [
        { label: 'Gender', value: gender.toUpperCase() },
        { label: 'Age', value: `${age} Years` },
        { label: 'Height', value: `${heightCm} cm` },
        { label: 'Weight', value: `${weightKg} kg` },
        { label: 'Basal Metabolic Rate (BMR)', value: `${bmr} kcal` },
      ],
      breakdown: [
        { label: 'Dietary Protein (30% kcal)', value: `${macros.protein} grams/day`, percent: '30%' },
        { label: 'Dietary Carbohydrates (40% kcal)', value: `${macros.carbs} grams/day`, percent: '40%' },
        { label: 'Healthy Dietary Fats (30% kcal)', value: `${macros.fat} grams/day`, percent: '30%' },
      ],
      tableHeaders: ['Fitness Goal', 'Daily Calorie Target', 'Weekly Projected Change'],
      tableRows: [
        { period: 'Maintain Weight', col1: `${tdee} kcal/day`, col2: '±0 kg' },
        { period: 'Mild Loss (-0.25 kg/wk)', col1: `${goals.mildLoss} kcal/day`, col2: '-0.25 kg/week' },
        { period: 'Standard Loss (-0.5 kg/wk)', col1: `${goals.loss} kcal/day`, col2: '-0.50 kg/week' },
        { period: 'Mild Gain (+0.25 kg/wk)', col1: `${goals.mildGain} kcal/day`, col2: '+0.25 kg/week' },
        { period: 'Hypertrophy Gain (+0.5 kg/wk)', col1: `${goals.gain} kcal/day`, col2: '+0.50 kg/week' },
      ],
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">Metabolic Expenditure (TDEE)</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              Mifflin-St Jeor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">BMR, Total Daily Energy Expenditure & Goal Plans</p>
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
        <div className="lg:col-span-6 space-y-5">
          {/* Gender */}
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Gender</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-300 p-0.5 bg-slate-100 gap-1">
              <button
                type="button"
                onClick={() => setGender('male')}
                className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  gender === 'male' ? 'btn-gloss-indigo' : 'btn-gloss-white'
                }`}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => setGender('female')}
                className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                  gender === 'female' ? 'btn-gloss-indigo' : 'btn-gloss-white'
                }`}
              >
                Female
              </button>
            </div>
          </div>

          {/* Age, Height, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                min="10"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="250"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">Activity Level</label>
            <select
              value={activityMultiplier}
              onChange={(e) => setActivityMultiplier(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
            >
              <option value={1.2}>Sedentary (Little or no exercise, desk job)</option>
              <option value={1.375}>Lightly Active (Light exercise 1-3 days/week)</option>
              <option value={1.55}>Moderately Active (Moderate workout 3-5 days/week)</option>
              <option value={1.725}>Very Active (Hard exercise 6-7 days/week)</option>
              <option value={1.9}>Extra Active (Physical job or twice daily intense training)</option>
            </select>
          </div>

          {/* BMR Info Pill */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span className="font-medium">Basal Metabolic Rate (BMR):</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{bmr} calories/day</span>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-orange-50/40 rounded-xl p-6 border border-orange-100">
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Daily Calorie Needs</span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-orange-600 mt-1 font-mono">
                {tdee} <span className="text-base text-slate-500 font-normal">kcal / day</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">To maintain current weight at your activity level</p>
            </div>

            {/* Goals Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5 text-xs">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
                Target Calories By Goal
              </span>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Mild Weight Loss (-0.25 kg/wk)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{goals.mildLoss} kcal</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600 font-medium">Standard Weight Loss (-0.5 kg/wk)</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">{goals.loss} kcal</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Mild Weight Gain (+0.25 kg/wk)</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{goals.mildGain} kcal</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-600 font-medium">Muscle & Weight Gain (+0.5 kg/wk)</span>
                <span className="font-bold text-blue-600 font-mono text-sm">{goals.gain} kcal</span>
              </div>
            </div>

            {/* Macros Recommendation */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <span className="font-semibold text-slate-800 block text-xs mb-2">
                Recommended Daily Macronutrients (Maintenance)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <span className="text-slate-500 block">Protein</span>
                  <span className="font-bold text-indigo-700 text-sm font-mono mt-0.5 block">{macros.protein}g</span>
                  <span className="text-[10px] text-slate-400">30% cal</span>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <span className="text-slate-500 block">Carbs</span>
                  <span className="font-bold text-amber-700 text-sm font-mono mt-0.5 block">{macros.carbs}g</span>
                  <span className="text-[10px] text-slate-400">40% cal</span>
                </div>
                <div className="p-2 bg-rose-50 rounded-lg">
                  <span className="text-slate-500 block">Fats</span>
                  <span className="font-bold text-rose-700 text-sm font-mono mt-0.5 block">{macros.fat}g</span>
                  <span className="text-[10px] text-slate-400">30% cal</span>
                </div>
              </div>
            </div>

            {/* Prominent Glazed PDF Download Option */}
            <button
              onClick={handleExportPdf}
              className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
              title="Download full Nutritional Energy & Caloric Expenditure Analysis PDF to your phone"
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
