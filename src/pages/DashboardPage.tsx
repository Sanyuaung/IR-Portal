import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  Download,
  ArrowDownLeft,
  Clock,
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
  const { getStats, transactions, setIsSimulateModalOpen, setCustomDateRange, setDatePreset, datePreset, customStartDate, customEndDate } = useTransactionStore();

  const stats = getStats();

  const handleExportReport = () => {
    exportTransactionsToCsv(transactions, 'KBZ_Remittance_Summary_Report');
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
            <button
              onClick={handleExportReport}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
            >
              <Download size={14} />
              Download CSV
            </button>
          </div>
        </div>
      </section>

      {/* At-a-glance KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Inbound Amount */}
        <KPICard
          title="Total Inbound Amount"
          value={`$${formatNumber(stats.totalInboundAmountUsd)}`}
          subValue={formatCurrency(stats.totalInboundAmountMmk, 'MMK')}
          icon={<DollarSign size={20} />}
          iconVariant="blue"
          trend={{
            value: '+12.5%',
            isPositive: true,
          }}
        />

        {/* Card 2: Transactions Count */}
        <KPICard
          title="Transactions Count"
          value={formatNumber(stats.completedCount + stats.pendingCount)}
          subValue={`${stats.completedCount} Cleared • ${stats.pendingCount} Timeouts`}
          icon={<ArrowDownLeft size={20} />}
          iconVariant="purple"
          trend={{
            value: '+4%',
            isPositive: true,
          }}
        />

        {/* Card 3: Processing Amount */}
        <KPICard
          title="Processing Amount"
          value={`$${formatNumber(stats.pendingAmountUsd)}`}
          subValue={formatCurrency(stats.pendingAmountMmk, 'MMK')}
          icon={<Clock size={20} />}
          iconVariant="orange"
          badge={{
            text: `${stats.pendingCount} Timeouts`,
            color: 'orange',
          }}
        />

        {/* Card 4: Active Settlements */}
        <KPICard
          title="Active Settlements"
          value={formatCurrency(stats.todayInboundMmk, 'MMK')}
          subValue="Settled to main corporate account"
          icon={<Building size={20} />}
          iconVariant="emerald"
          trend={{
            value: 'Real-Time',
            isPositive: true,
          }}
        />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeChart />
        </div>
        <div className="lg:col-span-1">
          <CurrencyBreakdownChart />
        </div>
      </div>

      {/* Recent inbound activity */}
      <RecentTransactionsTable onNavigateToTransactions={() => onNavigate('ir-transactions')} />
    </div>
  );
};
