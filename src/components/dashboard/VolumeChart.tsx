import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import dayjs from 'dayjs';
import { InboundTransaction } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/formatters';

interface VolumeChartProps {
  transactions: InboundTransaction[];
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ transactions }) => {
  const volumeData = useMemo(() => {
    const months = new Map<string, { month: string; amountMmk: number; count: number }>();

    transactions.forEach((transaction) => {
      const date = dayjs(transaction.valueDate);
      if (!date.isValid()) return;

      const key = date.format('YYYY-MM');
      const current = months.get(key) || { month: date.format('MMM YY').toUpperCase(), amountMmk: 0, count: 0 };
      current.amountMmk += transaction.netAmountMmk || transaction.convertedAmountMmk || 0;
      current.count += 1;
      months.set(key, current);
    });

    return Array.from(months.entries())
      .sort(([first], [second]) => first.localeCompare(second))
      .slice(-6)
      .map(([, value]) => value);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-sans">
          <p className="font-bold text-slate-200 mb-1.5">{label} settlement activity</p>
          <div className="space-y-1">
            <p className="text-cyan-400">
              <span className="font-semibold">Settlement value: </span>
              {formatCurrency(data.amountMmk, 'MMK')}
            </p>
            <p className="text-slate-300">
              <span className="font-semibold">Transactions: </span>
              {formatNumber(data.count)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col shadow-xs min-h-[360px]">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Settlement Volume</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Monthly value from the transactions in the current view</p>
        </div>
      </div>

      <div className="h-64 w-full">
        {volumeData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={volumeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#E2E8F0' }} tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(value) => `${formatNumber(value / 1000000)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amountMmk" name="Settlement value" fill="#0B2B66" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">No transaction data in the selected period.</div>
        )}
      </div>
    </div>
  );
};
