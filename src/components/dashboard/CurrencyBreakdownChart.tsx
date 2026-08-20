import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/formatters';

export const CurrencyBreakdownChart: React.FC = () => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const chartData = [
    { currency: 'USD', value: 65, amountUsd: 1593020, color: '#0B2B66' },
    { currency: 'EUR', value: 20, amountUsd: 490160, color: '#E11D2A' },
    { currency: 'SGD', value: 15, amountUsd: 367620, color: '#F27D26' },
  ];

  const renderPointerLabel = (props: any) => {
    const { cx, cy, midAngle, outerRadius, payload } = props;
    const RADIAN = Math.PI / 180;
    const cos = Math.cos(-midAngle * RADIAN);
    const sin = Math.sin(-midAngle * RADIAN);
    const startX = cx + (outerRadius + 4) * cos;
    const startY = cy + (outerRadius + 4) * sin;
    const midX = cx + (outerRadius + 14) * cos;
    const midY = cy + (outerRadius + 14) * sin;
    const endX = midX + (cos >= 0 ? 24 : -24);
    const endY = midY;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <path d={`M${startX},${startY}L${midX},${midY}L${endX},${endY}`} fill="none" stroke={payload.color} strokeWidth={1.5} />
        <text x={endX + (cos >= 0 ? 4 : -4)} y={endY + 4} textAnchor={textAnchor} fill="#334155" fontSize={11} fontWeight={700}>
          {payload.currency}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs font-sans">
          <p className="font-bold text-slate-200">{data.currency} Inbound Share</p>
          <p className="text-cyan-400 mt-1">
            Percentage: <span className="font-semibold">{data.value}%</span>
          </p>
          <p className="text-slate-300">
            Est. Volume: <span className="font-semibold">${formatNumber(data.amountUsd)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs h-full">
      <div>
        <h3 className="font-bold text-slate-800 text-base">Currency Breakdown</h3>
        <p className="text-xs text-slate-400 mt-0.5">Distribution of inbound funds</p>
      </div>

      <div className="flex flex-col items-center justify-center py-3 relative">
        <div className="relative w-full max-w-[280px] h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                nameKey="currency"
                labelLine={false}
                label={renderPointerLabel}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#ffffff"
                    strokeWidth={activeIndex === index ? 3 : 2}
                    style={{ cursor: 'pointer', transition: 'all 180ms ease' }}
                  />
                ))}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 50 }}
                animationDuration={180}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-slate-900 leading-tight">65%</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">USD dominant</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-2.5 pt-2 border-t border-slate-100">
        {chartData.map((item) => (
          <div key={item.currency} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="font-medium text-slate-700">{item.currency}</span>
            </div>
            <span className="font-bold text-slate-900 font-mono">${formatNumber(item.amountUsd)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
