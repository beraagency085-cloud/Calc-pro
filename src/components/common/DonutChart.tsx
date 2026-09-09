import React from 'react';

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  formattedValue?: string;
}

interface DonutChartProps {
  segments: ChartSegment[];
  size?: number;
  strokeWidth?: number;
  centerTitle?: string;
  centerSubtitle?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  segments,
  size = 200,
  strokeWidth = 26,
  centerTitle,
  centerSubtitle,
}) => {
  const total = segments.reduce((sum, seg) => sum + Math.max(0, seg.value), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle if total is 0 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {total > 0 &&
            segments.map((segment, index) => {
              const fraction = Math.max(0, segment.value) / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += fraction;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {centerTitle && (
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {centerTitle}
            </span>
          )}
          {centerSubtitle && (
            <span className="text-base font-bold text-slate-900 leading-tight">
              {centerSubtitle}
            </span>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="space-y-3 min-w-[160px]">
        {segments.map((seg, idx) => {
          const pct = total > 0 ? ((Math.max(0, seg.value) / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={idx} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-600 font-medium">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-slate-900 ml-2">{pct}%</span>
                {seg.formattedValue && (
                  <span className="block text-xs text-slate-400 font-normal">
                    {seg.formattedValue}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
