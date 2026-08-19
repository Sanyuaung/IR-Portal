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
} from 'lucide-react';
import { KPICard } from '../components/dashboard/KPICard';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { CurrencyBreakdownChart } from '../components/dashboard/CurrencyBreakdownChart';
import { RecentTransactionsTable } from '../components/dashboard/RecentTransactionsTable';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../store/useAuthStore';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { exportTransactionsToCsv } from '../utils/export';
import { notifications } from '@mantine/notifications';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const { getStats, transactions, setIsSimulateModalOpen, setDatePreset } = useTransactionStore();

  const [dateFilterLabel, setDateFilterLabel] = useState('Last 30 Days');

  const stats = getStats();

  const handleExportReport = () => {
    exportTransactionsToCsv(transactions, 'KBZ_Remittance_Summary_Report');
    notifications.show({
      title: 'Report Downloaded',
      message: 'Exported transaction ledger to CSV successfully.',
      color: 'red',
    });
  };

  const handleToggleDatePreset = () => {
    if (dateFilterLabel === 'Last 30 Days') {
      setDatePreset('today');
      setDateFilterLabel('Today');
    } else {
      setDatePreset('last30days');
      setDateFilterLabel('Last 30 Days');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls matching Professional Polish */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700">{user?.merchantName?.split(' ')[0] || 'Merchant'}</span>! Here is a summary of your inbound remittances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleDatePreset}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Calendar size={16} className="text-slate-500" />
            <span>{dateFilterLabel}</span>
          </button>

          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-[#E11D2A] text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-md shadow-red-200 hover:bg-[#c91823] transition-all cursor-pointer font-semibold"
          >
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards Grid matching Professional Polish theme */}
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
          subValue={`${stats.completedCount} Cleared • ${stats.pendingCount} Pending`}
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
            text: `${stats.pendingCount} Pending`,
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

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VolumeChart />
        </div>
        <div className="lg:col-span-1">
          <CurrencyBreakdownChart />
        </div>
      </div>

      {/* Recent Activity Table matching Professional Polish theme */}
      <RecentTransactionsTable onNavigateToTransactions={() => onNavigate('ir-transactions')} />
    </div>
  );
};
