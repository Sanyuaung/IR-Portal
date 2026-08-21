import React, { useMemo } from 'react';
import {
  DollarSign,
  Calendar,
  Download,
  ArrowDownLeft,
  Building,
  Users,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from '../components/common/ui-icons';
import { KPICard } from '../components/dashboard/KPICard';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { CurrencyBreakdownChart } from '../components/dashboard/CurrencyBreakdownChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { exportTransactionsToCsv } from '../utils/export';
import { notifications } from '@mantine/notifications';

import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const {
    getFilteredTransactions,
    setIsSimulateModalOpen,
    setCustomDateRange,
    setDatePreset,
    datePreset,
    customStartDate,
    customEndDate,
  } = useTransactionStore();
  const filteredTransactions = getFilteredTransactions();
  const analysis = useMemo(() => {
    const settled = filteredTransactions.filter((transaction) => transaction.status === 'success');
    const processing = filteredTransactions.filter(
      (transaction) => transaction.status === 'init' || transaction.status === 'MFR'
    );
    const failed = filteredTransactions.filter((transaction) => transaction.status === 'failed');
    const totalSettledMmk = settled.reduce(
      (sum, transaction) => sum + (transaction.netAmountMmk || transaction.convertedAmountMmk || 0),
      0
    );
    const countBy = (key: (transaction: typeof filteredTransactions[number]) => string) => {
      const counts = new Map<string, number>();
      filteredTransactions.forEach((transaction) => {
        const value = key(transaction);
        if (value) counts.set(value, (counts.get(value) || 0) + 1);
      });
      return Array.from(counts.entries()).sort(([, first], [, second]) => second - first)[0];
    };
    const leadingBank = countBy((transaction) => transaction.sendingBank);
    const dominantCurrency = countBy((transaction) => transaction.currency);
    const largestSettlement = settled.reduce<typeof settled[number] | null>(
      (largest, transaction) =>
        !largest || (transaction.netAmountMmk || transaction.convertedAmountMmk || 0) >
          (largest.netAmountMmk || largest.convertedAmountMmk || 0)
          ? transaction
          : largest,
      null
    );

    return {
      settled,
      processing,
      failed,
      totalSettledMmk,
      averageSettlementMmk: settled.length ? Math.round(totalSettledMmk / settled.length) : 0,
      settlementRate: filteredTransactions.length ? Math.round((settled.length / filteredTransactions.length) * 100) : 0,
      leadingBank,
      dominantCurrency,
      largestSettlement,
    };
  }, [filteredTransactions]);

  const handleExportReport = () => {
    exportTransactionsToCsv(filteredTransactions, 'KBZ_Remittance_Summary_Report');
    notifications.show({
      title: 'Report Downloaded',
      message: 'Exported transaction ledger to CSV successfully.',
      color: 'red',
    });
  };

  const toSafeIsoString = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Date) {
      return !isNaN(val.getTime()) ? val.toISOString() : null;
    }
    if (typeof val === 'string' || typeof val === 'number') {
      const d = new Date(val);
      return !isNaN(d.getTime()) ? d.toISOString() : null;
    }
    if (typeof val === 'object' && typeof val.toISOString === 'function') {
      return val.toISOString();
    }
    return null;
  };

  const handleDateRangeChange = (value: any) => {
    if (Array.isArray(value) && (value[0] || value[1])) {
      setDatePreset('custom');
      setCustomDateRange(
        toSafeIsoString(value[0]),
        toSafeIsoString(value[1])
      );
    } else {
      setDatePreset('all');
      setCustomDateRange(null, null);
    }
  };

  const dateValue: [Date | null, Date | null] = datePreset === 'custom'
    ? [customStartDate ? new Date(customStartDate) : null, customEndDate ? new Date(customEndDate) : null]
    : datePreset === 'today'
      ? [dayjs().startOf('day').toDate(), dayjs().endOf('day').toDate()]
      : datePreset === 'last30days'
        ? [dayjs().subtract(30, 'day').toDate(), dayjs().endOf('day').toDate()]
        : [null, null];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{user?.name || 'Customer'}</span>. Track inbound transfers in a simple, clear view.
          </p>
        </div>

        <div className="flex items-center gap-2.5 min-w-[280px]">
          <DatePickerInput
            type="range"
            placeholder="Select date range"
            value={dateValue}
            onChange={handleDateRangeChange as any}
            leftSection={<Calendar size={16} className="text-slate-500" />}
            className="w-full"
            radius="md"
            size="sm"
            clearable
            maxDate={new Date()}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Most-used actions for daily remittance operations.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsSimulateModalOpen(true)}
              className="px-3.5 py-2 bg-[#0F4C81] text-white text-xs font-semibold rounded-lg hover:bg-[#0A365D] transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              Simulate New Wire
            </button>
            <button
              onClick={() => onNavigate('ir-transactions')}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowDownLeft size={14} />
              Open Transactions
            </button>
            {/* <button
              onClick={handleExportReport}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Download size={14} />
              Download CSV
            </button> */}
          </div>
        </div>
      </section>

      {/* At-a-glance KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inbound Amount */}
        <KPICard
          title="Settled Value"
          value={formatCurrency(analysis.totalSettledMmk, 'MMK')}
          subValue={`${analysis.settled.length} cleared transaction${analysis.settled.length === 1 ? '' : 's'}`}
          icon={<DollarSign size={20} />}
          iconVariant="blue"
        />

        {/* Card 2: Transactions Count */}
        <KPICard
          title="Transactions Count"
          value={formatNumber(filteredTransactions.length)}
          subValue={`${analysis.settled.length} cleared • ${analysis.processing.length} processing`}
          icon={<ArrowDownLeft size={20} />}
          iconVariant="purple"
        />

        {/* Card 3: Processing Amount */}
        <KPICard
          title="Largest Settlement"
          value={formatCurrency(analysis.largestSettlement?.netAmountMmk || analysis.largestSettlement?.convertedAmountMmk || 0, 'MMK')}
          subValue={analysis.largestSettlement ? `${analysis.largestSettlement.currency} • ${analysis.largestSettlement.transactionRef}` : 'No cleared transaction in this view'}
          icon={<TrendingUp size={20} />}
          iconVariant="orange"
        />

        {/* Card 4: Active Settlements */}
        <KPICard
          title="Average Settlement"
          value={formatCurrency(analysis.averageSettlementMmk, 'MMK')}
          subValue={analysis.failed.length ? `${analysis.failed.length} failed transaction${analysis.failed.length === 1 ? '' : 's'} require review` : 'No failed transactions in this view'}
          icon={<Building size={20} />}
          iconVariant="emerald"
        />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeChart transactions={filteredTransactions} />
        </div>
        <div className="lg:col-span-1">
          <CurrencyBreakdownChart transactions={filteredTransactions} />
        </div>
      </div>

      <section className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Operational Insights</h3>
            <p className="text-xs text-slate-500 mt-0.5">Calculated from the transactions in the current view.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="py-3 sm:py-1 sm:pr-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Settlement success</p>
            <p className="mt-1 text-xl font-bold text-emerald-700">{analysis.settlementRate}%</p>
            <p className="mt-1 text-xs text-slate-500">{analysis.settled.length} of {filteredTransactions.length} transactions cleared</p>
          </div>
          <div className="py-3 sm:py-1 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Leading source bank</p>
            <p className="mt-1 text-sm font-bold text-slate-800 truncate">{analysis.leadingBank?.[0] || 'No data'}</p>
            <p className="mt-1 text-xs text-slate-500">{analysis.leadingBank ? `${analysis.leadingBank[1]} transaction${analysis.leadingBank[1] === 1 ? '' : 's'}` : 'No transactions in this view'}</p>
          </div>
          <div className="py-3 sm:py-1 sm:pl-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Dominant currency</p>
            <p className="mt-1 text-xl font-bold text-[#0F4C81]">{analysis.dominantCurrency?.[0] || '—'}</p>
            <p className="mt-1 text-xs text-slate-500">{analysis.dominantCurrency ? `${analysis.dominantCurrency[1]} transaction${analysis.dominantCurrency[1] === 1 ? '' : 's'}` : 'No transactions in this view'}</p>
          </div>
        </div>
      </section>

      {/* Recent inbound activity */}
      <RecentTransactionsTable onNavigateToTransactions={() => onNavigate('ir-transactions')} />
    </div>
  );
};
