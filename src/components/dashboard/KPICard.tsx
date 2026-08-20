import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  iconVariant?: 'blue' | 'purple' | 'orange' | 'emerald';
  trend?: {
    value: string;
    isPositive: boolean;
    period?: string;
  };
  badge?: {
    text: string;
    color: string;
  };
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subValue,
  icon,
  iconVariant = 'blue',
  trend,
  badge,
}) => {
  const iconBgMap = {
    blue: 'bg-blue-50 text-[#0B2B66]',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${iconBgMap[iconVariant]}`}>
          {icon}
        </div>

        {trend ? (
          <span
            className={`text-xs font-bold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.value}
          </span>
        ) : badge ? (
          <span className="text-xs text-orange-600 font-bold px-2 py-0.5 rounded-full bg-orange-50 border border-orange-100">
            {badge.text}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-medium">Live</span>
        )}
      </div>

      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight font-mono sm:font-sans">{value}</p>

      {subValue && (
        <p className="text-[11px] text-slate-400 mt-1 font-medium truncate">
          {subValue}
        </p>
      )}
    </div>
  );
};
