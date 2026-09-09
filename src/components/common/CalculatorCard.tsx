import React from 'react';
import {
  Banknote,
  Home,
  TrendingUp,
  PiggyBank,
  Coins,
  HeartPulse,
  CalendarClock,
  Flame,
  Percent,
  PieChart,
  ArrowRight,
} from 'lucide-react';
import { CalculatorMeta } from '../../types';

interface CardProps {
  calculator: CalculatorMeta;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const CalculatorCard: React.FC<CardProps> = ({
  calculator,
  isSelected,
  onSelect,
}) => {
  const renderIcon = () => {
    const props = { className: 'h-6 w-6' };
    switch (calculator.iconName) {
      case 'Banknote':
        return <Banknote {...props} />;
      case 'Home':
        return <Home {...props} />;
      case 'TrendingUp':
        return <TrendingUp {...props} />;
      case 'PiggyBank':
        return <PiggyBank {...props} />;
      case 'Coins':
        return <Coins {...props} />;
      case 'HeartPulse':
        return <HeartPulse {...props} />;
      case 'CalendarClock':
        return <CalendarClock {...props} />;
      case 'Flame':
        return <Flame {...props} />;
      case 'Percent':
        return <Percent {...props} />;
      case 'PieChart':
      default:
        return <PieChart {...props} />;
    }
  };

  // Color classes for icon box
  const getIconColorClasses = () => {
    switch (calculator.accentColor) {
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white';
      case 'blue':
        return 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white';
      case 'emerald':
        return 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white';
      case 'teal':
        return 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white';
      case 'purple':
        return 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white';
      case 'rose':
        return 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white';
      case 'amber':
        return 'bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white';
      case 'orange':
        return 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white';
      case 'cyan':
        return 'bg-cyan-100 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white';
      case 'sky':
      default:
        return 'bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white';
    }
  };

  return (
    <div
      onClick={() => onSelect(calculator.id)}
      className={`group relative bg-white rounded-3xl border p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-md bg-indigo-50/15'
          : 'border-slate-200 hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5'
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2.5 right-6 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-xs">
          ACTIVE MODULE
        </div>
      )}

      <div>
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${getIconColorClasses()}`}
        >
          {renderIcon()}
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors tracking-tight">
            {calculator.title}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">{calculator.shortDesc}</p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 transition-colors">
        <span>{calculator.category} MODULE</span>
        <span className="inline-flex items-center gap-1">
          COMPUTE <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
};
