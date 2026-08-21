import React, { useMemo } from "react";
import {
  Calendar,
  ArrowDownLeft,
  Building,
  Sparkles,
  Globe2,
  Eye,
} from "../components/common/ui-icons";
import { RecentTransactionsTable } from "../components/dashboard/RecentTransactionsTable";
import { RemittanceMap } from "../components/dashboard/RemittanceMap";
import { CountrySettlementPieChart } from "../components/dashboard/CountrySettlementPieChart";
import { useTransactionStore } from "../store/useTransactionStore";
import { useAuthStore } from "../store/useAuthStore";
import { formatCurrency, formatNumber } from "../utils/formatters";
import { exportTransactionsToCsv } from "../utils/export";
import { notifications } from "@mantine/notifications";

import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuthStore();
  const {
    getFilteredTransactions,
    setIsSimulateModalOpen,
    setSelectedTransaction,
    setIsDetailsModalOpen,
    setCustomDateRange,
    setDatePreset,
    datePreset,
    customStartDate,
    customEndDate,
  } = useTransactionStore();
  const filteredTransactions = getFilteredTransactions();
  const analysis = useMemo(() => {
    const settled = filteredTransactions.filter(
      (transaction) => transaction.status === "success",
    );
    const processing = filteredTransactions.filter(
      (transaction) =>
        transaction.status === "init" || transaction.status === "MFR",
    );
    const failed = filteredTransactions.filter(
      (transaction) => transaction.status === "failed",
    );
    const totalSettledMmk = settled.reduce(
      (sum, transaction) =>
        sum + (transaction.netAmountMmk || transaction.convertedAmountMmk || 0),
      0,
    );
    const countBy = (
      key: (transaction: (typeof filteredTransactions)[number]) => string,
    ) => {
      const counts = new Map<string, number>();
      filteredTransactions.forEach((transaction) => {
        const value = key(transaction);
        if (value) counts.set(value, (counts.get(value) || 0) + 1);
      });
      return Array.from(counts.entries()).sort(
        ([, first], [, second]) => second - first,
      )[0];
    };
    const leadingBank = countBy((transaction) => transaction.sendingBank);
    const dominantCurrency = countBy((transaction) => transaction.currency);
    const countryCounts = new Map<string, number>();
    filteredTransactions.forEach((transaction) => {
      if (transaction.senderCountry) {
        countryCounts.set(
          transaction.senderCountry,
          (countryCounts.get(transaction.senderCountry) || 0) + 1,
        );
      }
    });

    return {
      settled,
      failed,
      totalSettledMmk,
      settlementRate: filteredTransactions.length
        ? Math.round((settled.length / filteredTransactions.length) * 100)
        : 0,
      leadingBank,
      dominantCurrency,
      countryCounts: Array.from(countryCounts.entries()).sort(
        ([, first], [, second]) => second - first,
      ),
      recentTransactions: [...filteredTransactions]
        .sort(
          (first, second) =>
            new Date(second.valueDate).getTime() -
            new Date(first.valueDate).getTime(),
        )
        .slice(0, 10),
    };
  }, [filteredTransactions]);

  const handleExportReport = () => {
    exportTransactionsToCsv(
      filteredTransactions,
      "KBZ_Remittance_Summary_Report",
    );
    notifications.show({
      title: "Report Downloaded",
      message: "Exported transaction ledger to CSV successfully.",
      color: "red",
    });
  };

  const toSafeIsoString = (val: any): string | null => {
    if (!val) return null;
    if (val instanceof Date) {
      return !isNaN(val.getTime()) ? val.toISOString() : null;
    }
    if (typeof val === "string" || typeof val === "number") {
      const d = new Date(val);
      return !isNaN(d.getTime()) ? d.toISOString() : null;
    }
    if (typeof val === "object" && typeof val.toISOString === "function") {
      return val.toISOString();
    }
    return null;
  };

  const handleDateRangeChange = (value: any) => {
    if (Array.isArray(value) && (value[0] || value[1])) {
      setDatePreset("custom");
      setCustomDateRange(toSafeIsoString(value[0]), toSafeIsoString(value[1]));
    } else {
      setDatePreset("all");
      setCustomDateRange(null, null);
    }
  };

  const dateValue: [Date | null, Date | null] =
    datePreset === "custom"
      ? [
          customStartDate ? new Date(customStartDate) : null,
          customEndDate ? new Date(customEndDate) : null,
        ]
      : datePreset === "today"
        ? [dayjs().startOf("day").toDate(), dayjs().endOf("day").toDate()]
        : datePreset === "last30days"
          ? [
              dayjs().subtract(30, "day").toDate(),
              dayjs().endOf("day").toDate(),
            ]
          : [null, null];

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back,{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {user?.name || "Customer"}
            </span>
            . Track inbound transfers in a simple, clear view.
          </p>
        </div>

        <div className="flex items-center gap-2.5 min-w-[280px]">
          <DatePickerInput
            type="range"
            placeholder="Select date range"
            value={dateValue}
            onChange={handleDateRangeChange as any}
            leftSection={<Calendar size={16} className="text-slate-500 dark:text-slate-400" />}
            className="w-full"
            radius="md"
            size="sm"
            clearable
            maxDate={new Date()}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Most-used actions for daily remittance operations.
            </p>
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
              onClick={() => onNavigate("ir-transactions")}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowDownLeft size={14} />
              Open Transactions
            </button>
            {/* <button
              onClick={handleExportReport}
              className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors inline-flex items-center gap-1.5"
            >
              <Download size={14} />
              Download CSV
            </button> */}
          </div>
        </div>
      </section>

      <div>
        <section className="bg-gradient-to-br from-[#0B2B66] to-[#0F4C81] rounded-xl p-5 sm:p-6 text-white shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                My Account & Balance
              </p>
              <h2 className="mt-1 text-xl font-bold">
                {user?.name || "Customer Account"}
              </h2>
              <p className="mt-1 text-xs text-blue-100">
                Inbound remittance settlement account
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-2.5 text-blue-100">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="sm:col-span-2">
              <p className="text-xs text-blue-200">
                Settled balance for selected period
              </p>
              <p className="mt-1 text-3xl font-bold tracking-tight">
                {formatCurrency(analysis.totalSettledMmk, "MMK")}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1.5 text-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  {analysis.settled.length} cleared
                </span>
                <span className="inline-flex items-center gap-1.5 text-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                  {analysis.settlementRate}% success rate
                </span>
                <span className="inline-flex items-center gap-1.5 text-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-200" />
                  {filteredTransactions.length} total transactions
                </span>
              </div>
            </div>
            <div className="border-t sm:border-t-0 sm:border-l border-white/15 pt-4 sm:pt-0 sm:pl-5">
              <p className="text-xs text-blue-200">Account number</p>
              <p className="mt-1 text-sm font-semibold font-mono">
                {user?.accountNumber || "Not available"}
              </p>
              <p className="mt-3 text-xs text-blue-200">Primary currency</p>
              <p className="mt-1 text-sm font-semibold">
                {analysis.dominantCurrency?.[0] || "MMK"}
              </p>
            </div>
          </div>
          <div className="mt-6 border-t border-white/15 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Latest 10
            </p>
            {analysis.recentTransactions.length ? (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                {analysis.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="w-52 shrink-0 snap-start rounded-lg bg-white/10 px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-white">
                        {transaction.senderName}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsDetailsModalOpen(true);
                        }}
                        className="shrink-0 rounded-md p-1 text-blue-100 hover:bg-white/15 hover:text-white transition-colors"
                        aria-label={`View details for ${transaction.transactionRef}`}
                        title="View transaction details"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-blue-100">
                      {formatCurrency(
                        transaction.netAmountMmk ||
                          transaction.convertedAmountMmk ||
                          0,
                        "MMK",
                      )}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-blue-200">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${transaction.status === "success" ? "bg-emerald-300" : transaction.status === "failed" ? "bg-rose-300" : "bg-amber-300"}`}
                      />
                      {dayjs(transaction.valueDate).format("DD MMM YYYY")} •{" "}
                      {transaction.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-blue-100">
                No remittance activity in the selected period.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Remittance Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Most 10 sender countries, calculated from transactions in the selected view.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F4C81] dark:text-blue-300">
            <Globe2 size={15} /> {Math.min(analysis.countryCounts.length, 10)} sending countr
            {analysis.countryCounts.length === 1 ? "y" : "ies"}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 flex">
            <RemittanceMap countryCounts={analysis.countryCounts} />
          </div>
          <div className="lg:col-span-2">
            <CountrySettlementPieChart transactions={filteredTransactions} />
          </div>
        </div>
      </section>

      {/* Recent inbound activity */}
      <RecentTransactionsTable
        onNavigateToTransactions={() => onNavigate("ir-transactions")}
      />
    </div>
  );
};
