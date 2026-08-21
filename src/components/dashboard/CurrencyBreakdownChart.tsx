import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { InboundTransaction } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface CurrencyBreakdownChartProps {
  transactions: InboundTransaction[];
}

const COLORS = ['#0B2B66', '#E11D2A', '#F27D26', '#0F766E', '#7C3AED', '#64748B'];

export const CurrencyBreakdownChart: React.FC<CurrencyBreakdownChartProps> = ({ transactions }) => {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const chartData = React.useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach((transaction) => {
      totals.set(
        transaction.currency,
        (totals.get(transaction.currency) || 0) + (transaction.netAmountMmk || transaction.convertedAmountMmk || 0)
      );
    });
    const totalAmount = Array.from(totals.values()).reduce((sum, amount) => sum + amount, 0);

    const sortedTotals = Array.from(totals.entries())
      .sort(([, first], [, second]) => second - first)
    const displayedTotals = sortedTotals.slice(0, 5);
    const otherAmount = sortedTotals.slice(5).reduce((sum, [, amount]) => sum + amount, 0);
    if (otherAmount) displayedTotals.push(['Other', otherAmount]);

    return displayedTotals.map(([currency, amountMmk], index) => ({
        currency,
        amountMmk,
        value: totalAmount ? Math.round((amountMmk / totalAmount) * 100) : 0,
        color: COLORS[index % COLORS.length],
      }));
  }, [transactions]);
  const dominantCurrency = chartData[0];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs font-sans">
          <p className="font-bold text-slate-200">{data.currency} Inbound Share</p>
          <p className="text-cyan-400 mt-1">
            Share: <span className="font-semibold">{data.value}%</span>
          </p>
          <p className="text-slate-300">
            Settlement value: <span className="font-semibold">{formatNumber(data.amountMmk)} MMK</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col justify-between shadow-xs h-full">
      <div>
        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Currency Breakdown</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Settlement-value distribution in the current view</p>
      </div>

      <div className="flex flex-col items-center justify-center py-3 relative">
        {chartData.length ? <div className="relative w-full max-w-[280px] h-[220px]">
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
            <span className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{dominantCurrency?.value}%</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">{dominantCurrency?.currency} dominant</span>
          </div>
        </div> : <div className="h-[220px] flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">No transaction data in the selected period.</div>}
      </div>

      <div className="w-full space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50">
        {chartData.map((item) => (
          <div key={item.currency} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="font-medium text-slate-700 dark:text-slate-300">{item.currency}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white font-mono">{formatNumber(item.amountMmk)} MMK</span>
          </div>
        ))}
      </div>
    </div>
  );
};
