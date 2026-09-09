import React, { useState, useMemo, useEffect } from 'react';
import { RotateCcw, Copy, Check, HeartPulse, FileDown } from 'lucide-react';
import { exportCalculationToPdf } from '../../utils/pdfExport';
import { ShareButton } from '../common/ShareButton';

interface Props {
  initialInputs?: Record<string, any>;
}

export const BmiCalculator: React.FC<Props> = ({ initialInputs }) => {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  // Metric: cm, kg
  const [heightCm, setHeightCm] = useState<number>(172);
  const [weightKg, setWeightKg] = useState<number>(68);

  // Imperial: feet, inches, lbs
  const [heightFeet, setHeightFeet] = useState<number>(5);
  const [heightInches, setHeightInches] = useState<number>(8);
  const [weightLbs, setWeightLbs] = useState<number>(150);

  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<number>(28);
  const [copied, setCopied] = useState(false);

  // Restore inputs if loaded from shared calculation link
  useEffect(() => {
    if (initialInputs) {
      if (initialInputs.unit === 'metric' || initialInputs.unit === 'imperial') setUnit(initialInputs.unit);
      if (typeof initialInputs.heightCm === 'number') setHeightCm(initialInputs.heightCm);
      if (typeof initialInputs.weightKg === 'number') setWeightKg(initialInputs.weightKg);
      if (typeof initialInputs.heightFeet === 'number') setHeightFeet(initialInputs.heightFeet);
      if (typeof initialInputs.heightInches === 'number') setHeightInches(initialInputs.heightInches);
      if (typeof initialInputs.weightLbs === 'number') setWeightLbs(initialInputs.weightLbs);
      if (initialInputs.gender === 'male' || initialInputs.gender === 'female') setGender(initialInputs.gender);
      if (typeof initialInputs.age === 'number') setAge(initialInputs.age);
    }
  }, [initialInputs]);

  const { bmi, category, colorClass, barPercent, idealWeightMin, idealWeightMax } = useMemo(() => {
    let calculatedBmi = 0;
    let minKg = 0;
    let maxKg = 0;

    if (unit === 'metric') {
      const hM = heightCm / 100;
      if (hM > 0) {
        calculatedBmi = weightKg / (hM * hM);
        minKg = 18.5 * (hM * hM);
        maxKg = 24.9 * (hM * hM);
      }
    } else {
      const totalInches = heightFeet * 12 + heightInches;
      if (totalInches > 0) {
        calculatedBmi = (703 * weightLbs) / (totalInches * totalInches);
        const minLbs = (18.5 * (totalInches * totalInches)) / 703;
        const maxLbs = (24.9 * (totalInches * totalInches)) / 703;
        minKg = minLbs;
        maxKg = maxLbs;
      }
    }

    const roundedBmi = parseFloat(calculatedBmi.toFixed(1));

    let cat = 'Normal Weight';
    let color = 'text-emerald-600 bg-emerald-50 border-emerald-300';
    let percent = 50;

    if (roundedBmi < 18.5) {
      cat = 'Underweight';
      color = 'text-sky-600 bg-sky-50 border-sky-300';
      percent = Math.min(25, Math.max(5, (roundedBmi / 18.5) * 25));
    } else if (roundedBmi <= 24.9) {
      cat = 'Healthy / Normal';
      color = 'text-emerald-600 bg-emerald-50 border-emerald-300';
      percent = 25 + ((roundedBmi - 18.5) / (24.9 - 18.5)) * 25;
    } else if (roundedBmi <= 29.9) {
      cat = 'Overweight';
      color = 'text-amber-600 bg-amber-50 border-amber-300';
      percent = 50 + ((roundedBmi - 25) / (29.9 - 25)) * 25;
    } else {
      cat = 'Obese';
      color = 'text-rose-600 bg-rose-50 border-rose-300';
      percent = Math.min(100, 75 + ((roundedBmi - 30) / 10) * 25);
    }

    return {
      bmi: roundedBmi,
      category: cat,
      colorClass: color,
      barPercent: Math.min(100, Math.max(0, percent)),
      idealWeightMin: minKg.toFixed(1),
      idealWeightMax: maxKg.toFixed(1),
    };
  }, [unit, heightCm, weightKg, heightFeet, heightInches, weightLbs]);

  const handleCopy = () => {
    const text = `CalcPro BMI Report:
BMI Score: ${bmi} (${category})
Age: ${age} | Gender: ${gender}
Healthy Weight Range: ${idealWeightMin} - ${idealWeightMax} ${unit === 'metric' ? 'kg' : 'lbs'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setUnit('metric');
    setHeightCm(172);
    setWeightKg(68);
    setAge(28);
    setGender('male');
  };

  const handleExportPdf = () => {
    exportCalculationToPdf({
      title: 'Body Mass Index (BMI) & Health Assessment',
      calculatorName: 'BMI_Health_Index',
      category: 'Health & Fitness',
      primaryMetric: {
        label: 'Body Mass Index (BMI)',
        value: `${bmi} kg/m²`,
        subtext: `Classification: ${category}`,
      },
      secondaryMetrics: [
        {
          label: 'Health Classification',
          value: category,
          subtext: 'World Health Organization (WHO) scale',
        },
        {
          label: 'Ideal Weight Range',
          value: `${idealWeightMin} - ${idealWeightMax} ${unit === 'metric' ? 'kg' : 'lbs'}`,
          subtext: 'For normal BMI (18.5 - 24.9)',
        },
      ],
      parameters: [
        { label: 'Height', value: unit === 'metric' ? `${heightCm} cm` : `${heightFeet} ft ${heightInches} in` },
        { label: 'Weight', value: unit === 'metric' ? `${weightKg} kg` : `${weightLbs} lbs` },
        { label: 'Age', value: `${age} years` },
        { label: 'Gender', value: gender === 'male' ? 'Male' : 'Female' },
        { label: 'Measurement System', value: unit === 'metric' ? 'Metric System' : 'Imperial System' },
      ],
      breakdown: [
        { label: 'Underweight Bracket (< 18.5)', value: `< ${(unit === 'metric' ? 18.5 * (heightCm/100)**2 : (18.5*(heightFeet*12+heightInches)**2)/703).toFixed(1)} ${unit === 'metric' ? 'kg' : 'lbs'}` },
        { label: 'Normal / Healthy (18.5 - 24.9)', value: `${idealWeightMin} - ${idealWeightMax} ${unit === 'metric' ? 'kg' : 'lbs'}` },
        { label: 'Overweight Bracket (25.0 - 29.9)', value: `${idealWeightMax} - ${(unit === 'metric' ? 29.9 * (heightCm/100)**2 : (29.9*(heightFeet*12+heightInches)**2)/703).toFixed(1)} ${unit === 'metric' ? 'kg' : 'lbs'}` },
        { label: 'Obese Bracket (>= 30.0)', value: `> ${(unit === 'metric' ? 30.0 * (heightCm/100)**2 : (30.0*(heightFeet*12+heightInches)**2)/703).toFixed(1)} ${unit === 'metric' ? 'kg' : 'lbs'}` },
      ],
      tableHeaders: ['BMI Category', 'BMI Range', 'Associated Health Risk', 'Recommended Action'],
      tableRows: [
        { period: 'Underweight', col1: '< 18.5', col2: 'Malnutrition risk', col3: 'Caloric surplus & strength training' },
        { period: 'Normal Weight', col1: '18.5 - 24.9', col2: 'Lowest health risk', col3: 'Maintain balanced diet and activity' },
        { period: 'Overweight', col1: '25.0 - 29.9', col2: 'Elevated cardiac risk', col3: 'Modest caloric deficit & daily cardio' },
        { period: 'Obese', col1: '>= 30.0', col2: 'High risk of chronic disease', col3: 'Consult physician for structured guidance' },
      ],
    });
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-[#1A1A1A] text-white px-6 sm:px-8 py-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight">BMI & Health Index</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-600 px-2 py-0.5 rounded">
              WHO Standard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Body Mass Index and healthy weight bracket assessment</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Web Share API: Share calculation result link */}
          <ShareButton
            title="CalcPro BMI Health Index"
            text={`CalcPro Health: My BMI is ${bmi.toFixed(1)} (${category}), ideal weight bracket ${idealWeightMin.toFixed(1)} - ${idealWeightMax.toFixed(1)} ${unit === 'metric' ? 'kg' : 'lbs'}. Check assessment:`}
            calcId="bmi"
            inputs={{
              unit,
              heightCm,
              weightKg,
              heightFeet,
              heightInches,
              weightLbs,
              gender,
              age,
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
        <div className="lg:col-span-6 space-y-5">
          {/* Unit Toggle & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Unit System</label>
              <div className="flex rounded-lg overflow-hidden border border-slate-300 p-0.5 bg-slate-100 gap-1">
                <button
                  type="button"
                  onClick={() => setUnit('metric')}
                  className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                    unit === 'metric' ? 'btn-gloss-rose' : 'btn-gloss-white'
                  }`}
                >
                  Metric (cm / kg)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('imperial')}
                  className={`btn-gloss flex-1 py-1.5 text-xs font-bold rounded-md transition ${
                    unit === 'imperial' ? 'btn-gloss-rose' : 'btn-gloss-white'
                  }`}
                >
                  Imperial (ft / lbs)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Biological Gender</label>
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
          </div>

          {/* Metric Inputs */}
          {unit === 'metric' ? (
            <>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Height (cm)</label>
                  <span className="text-sm font-bold text-rose-600 font-mono">{heightCm} cm</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
                />
                <input
                  type="range"
                  min="100"
                  max="220"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full mt-2 accent-rose-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Weight (kg)</label>
                  <span className="text-sm font-bold text-rose-600 font-mono">{weightKg} kg</span>
                </div>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
                />
                <input
                  type="range"
                  min="35"
                  max="150"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full mt-2 accent-rose-600 cursor-pointer"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Height</label>
                  <span className="text-sm font-bold text-rose-600 font-mono">
                    {heightFeet} ft {heightInches} in
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Feet</span>
                    <input
                      type="number"
                      min="3"
                      max="8"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Inches</span>
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Weight (lbs)</label>
                  <span className="text-sm font-bold text-rose-600 font-mono">{weightLbs} lbs</span>
                </div>
                <input
                  type="number"
                  min="50"
                  max="600"
                  value={weightLbs}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1">Age</label>
            <input
              type="number"
              min="5"
              max="120"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none"
            />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-rose-50/40 rounded-xl p-6 border border-rose-100">
          <div className="space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Body Mass Index</span>
              <div className="text-5xl font-extrabold text-slate-900 mt-2 font-mono">{bmi}</div>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
                  {category}
                </span>
              </div>
            </div>

            {/* Spectrum Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-600 block mb-2">BMI Spectrum (WHO)</span>
              <div className="relative h-4 rounded-full overflow-hidden flex">
                <div className="h-full bg-sky-400 w-1/4" title="Underweight (<18.5)"></div>
                <div className="h-full bg-emerald-500 w-1/4" title="Normal (18.5 - 24.9)"></div>
                <div className="h-full bg-amber-400 w-1/4" title="Overweight (25 - 29.9)"></div>
                <div className="h-full bg-rose-500 w-1/4" title="Obese (>= 30)"></div>
              </div>

              {/* Indicator Arrow */}
              <div className="relative h-4 mt-1">
                <div
                  className="absolute top-0 transform -translate-x-1/2 transition-all duration-300"
                  style={{ left: `${barPercent}%` }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-slate-900"></div>
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500 font-medium px-1 mt-1">
                <span>&lt; 18.5</span>
                <span>18.5 - 24.9</span>
                <span>25 - 29.9</span>
                <span>30+</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Ideal Normal Weight Range:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">
                  {idealWeightMin} - {idealWeightMax} {unit === 'metric' ? 'kg' : 'lbs'}
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                {category === 'Healthy / Normal'
                  ? 'Great job! Your weight is in the optimal range. Maintain a balanced diet and regular physical activity.'
                  : category === 'Underweight'
                  ? 'Your BMI is lower than recommended. Focus on nutrient-rich foods and strength training to build healthy mass.'
                  : 'Consider consulting a healthcare provider for personalized nutrition and cardio routines to achieve a healthy weight.'}
              </p>
            </div>

            {/* Prominent Glazed PDF Download Option */}
            <button
              onClick={handleExportPdf}
              className="w-full btn-gloss btn-gloss-emerald py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg tracking-wider"
              title="Download full BMI assessment PDF to your phone"
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
