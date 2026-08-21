import React, { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { InboundTransaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CountrySettlementPieChartProps {
  transactions: InboundTransaction[];
}

const COLORS = ['#0B2B66', '#E11D2A', '#F27D26', '#0F766E', '#7C3AED', '#64748B'];

export const CountrySettlementPieChart: React.FC<CountrySettlementPieChartProps> = ({ transactions }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chartData = useMemo(() => {
    const totals = new Map<string, number>();
    transactions.forEach((transaction) => {
      const amount = transaction.netAmountMmk || transaction.convertedAmountMmk || 0;
      totals.set(transaction.senderCountry || 'Unknown', (totals.get(transaction.senderCountry || 'Unknown') || 0) + amount);
    });

    const sorted = Array.from(totals.entries()).sort(([, first], [, second]) => second - first);
    const topCountries = sorted.slice(0, 10);

    return topCountries.map(([country, amountMmk], index) => ({
      country,
      amountMmk,
      color: COLORS[index % COLORS.length],
    }));
  }, [transactions]);
  const totalSettlementValue = chartData.reduce((sum, item) => sum + item.amountMmk, 0);
  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload as { country: string; amountMmk: number };
    const percentage = totalSettlementValue
      ? Math.round((item.amountMmk / totalSettlementValue) * 100)
      : 0;

    return (
      <div className="w-44 rounded-md bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
        <p className="truncate font-semibold">{item.country}</p>
        <p className="mt-0.5 text-slate-300">{formatCurrency(item.amountMmk, 'MMK')}</p>
        <p className="mt-0.5 text-blue-200">{percentage}% of settlement value</p>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50/70 p-3">
      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Settlement Value by Country</p>
      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">Top sender countries by credited value in the selected view</p>
      {chartData.length ? (
        <>
          <div className="relative mt-2 h-[185px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="amountMmk"
                  nameKey="country"
                  cx="50%"
                  cy="58%"
                  innerRadius={44}
                  outerRadius={64}
                  paddingAngle={2}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((item, index) => (
                    <Cell
                      key={item.country}
                      fill={item.color}
                      stroke="#FFFFFF"
                      strokeWidth={activeIndex === index ? 3 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<PieTooltip />}
                  cursor={false}
                  position={{ x: 8, y: 6 }}
                  wrapperStyle={{ zIndex: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute left-1/2 top-[58%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{chartData.length}</span>
              <span className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Countries</span>
            </div>
          </div>
          <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700 pt-2">
            {chartData.map((item) => (
              <div key={item.country} className="flex items-center justify-between gap-2 text-[11px]">
                <span className="flex min-w-0 items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.country}</span>
                </span>
                <span className="shrink-0 font-semibold text-slate-700 dark:text-slate-300">
                  {totalSettlementValue ? Math.round((item.amountMmk / totalSettlementValue) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex h-[220px] items-center justify-center text-xs text-slate-500 dark:text-slate-400">
          No settlement data in the selected period.
        </div>
      )}
    </div>
  );
};
