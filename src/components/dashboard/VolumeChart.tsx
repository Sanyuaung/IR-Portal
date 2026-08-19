import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const VolumeChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'USD' | 'MMK'>('USD');

  const volumeData = [
    { month: 'JAN', previousUsd: 1200000, currentUsd: 1650000, count: 140 },
    { month: 'FEB', previousUsd: 980000, currentUsd: 1850000, count: 165 },
    { month: 'MAR', previousUsd: 1250000, currentUsd: 1520000, count: 190 },
    { month: 'APR', previousUsd: 1480000, currentUsd: 2150000, count: 240 },
    { month: 'MAY', previousUsd: 1400000, currentUsd: 1720000, count: 210 },
    { month: 'JUN', previousUsd: 1750000, currentUsd: 2450800, count: 280 },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs font-sans">
          <p className="font-bold text-slate-200 mb-1.5">{label} Remittance</p>
          <div className="space-y-1">
            <p className="text-cyan-400">
              <span className="font-semibold">Current Month: </span>
              {viewMode === 'USD'
                ? `$${formatNumber(payload[0].value)}`
                : `${formatNumber(payload[0].value * 3550)} MMK`}
            </p>
            {payload[1] && (
              <p className="text-slate-300">
                <span className="font-semibold">Previous Year: </span>
                {viewMode === 'USD'
                  ? `$${formatNumber(payload[1].value)}`
                  : `${formatNumber(payload[1].value * 3550)} MMK`}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col shadow-xs h-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Remittance Volume ({viewMode})</h3>
          <p className="text-xs text-slate-400 mt-0.5">Monthly comparative inbound transaction throughput</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-[#0B2B66] rounded-xs"></div>
              <span className="text-slate-600">Current</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-slate-200 rounded-xs"></div>
              <span className="text-slate-600">Previous</span>
            </div>
          </div>

          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs">
            <button
              onClick={() => setViewMode('USD')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${
                viewMode === 'USD' ? 'bg-white text-[#0B2B66] shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setViewMode('MMK')}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-all ${
                viewMode === 'MMK' ? 'bg-white text-[#0B2B66] shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              MMK
            </button>
          </div>
        </div>
      </div>

      <div className="h-64 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={volumeData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 600 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="previousUsd"
              fill="#E2E8F0"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="currentUsd"
              fill="#0B2B66"
              radius={[3, 3, 0, 0]}
              maxBarSize={28}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
