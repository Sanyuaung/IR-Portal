import React from 'react';
import {
  Menu,
  Pagination,
  Select,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import dayjs from 'dayjs';
import {
  Search,
  Download,
  FileSpreadsheet,
  FileText,
  Eye,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ChevronSelectorVertical,
  RotateCcw,
  Check,
  ShieldCheck,
  Filter,
} from '../components/common/ui-icons';
import { useTransactionStore } from '../store/useTransactionStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { formatDate, formatNumber } from '../utils/formatters';
import { exportTransactionsToCsv } from '../utils/export';
import { notifications } from '@mantine/notifications';
import { CurrencyCode, TransactionStatus, InboundTransaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const {
    getFilteredTransactions,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currencyFilter,
    setCurrencyFilter,
    datePreset,
    setDatePreset,
    customStartDate,
    customEndDate,
    setCustomDateRange,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    sortDirection,
    setSort,
    setSelectedTransaction,
    setIsDetailsModalOpen,
    setIsSimulateModalOpen,
    resetFilters,
    fxRates,
  } = useTransactionStore();

  const filtered = getFilteredTransactions();
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCount);
  const currentItems = filtered.slice(startIndex, endIndex);

  const handleExport = (type: 'csv' | 'excel' | 'pdf') => {
    exportTransactionsToCsv(filtered, `KBZ_IR_Transactions_${type.toUpperCase()}`);
    notifications.show({
      title: 'Ledger Exported',
      message: `Exported ${filtered.length} transactions as ${type.toUpperCase()}`,
      color: 'red',
      icon: <Check size={16} />,
    });
  };

  const handleViewDetails = (tx: any) => {
    setSelectedTransaction(tx);
    setIsDetailsModalOpen(true);
  };

  const renderSortIcon = (field: keyof InboundTransaction) => {
    if (sortField !== field) {
      return <ChevronSelectorVertical size={12} className="text-slate-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp size={12} className="text-[#0B2B66]" />
    ) : (
      <ChevronDown size={12} className="text-[#0B2B66]" />
    );
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
      : datePreset === 'last7days'
        ? [dayjs().subtract(7, 'day').toDate(), dayjs().endOf('day').toDate()]
        : datePreset === 'last30days'
          ? [dayjs().subtract(30, 'day').toDate(), dayjs().endOf('day').toDate()]
          : datePreset === 'thisMonth'
            ? [dayjs().startOf('month').toDate(), dayjs().endOf('month').toDate()]
            : [null, null];

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions matching Professional Polish */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            IR Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Simple searchable list of all inbound remittance records and statuses
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export Dropdown */}
          <Menu shadow="md" width={200} position="bottom-end">
            <Menu.Target>
              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer">
                <Download size={16} className="text-slate-500" />
                <span>Export Report</span>
              </button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>Choose Export Format</Menu.Label>
              <Menu.Item
                leftSection={<FileSpreadsheet size={15} className="text-emerald-600" />}
                onClick={() => handleExport('excel')}
              >
                Excel Spreadsheet (.xlsx)
              </Menu.Item>
              <Menu.Item
                leftSection={<FileSpreadsheet size={15} className="text-blue-600" />}
                onClick={() => handleExport('csv')}
              >
                CSV Data File (.csv)
              </Menu.Item>
              <Menu.Item
                leftSection={<FileText size={15} className="text-rose-600" />}
                onClick={() => handleExport('pdf')}
              >
                Audit Advice PDF (.txt)
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* New Inbound Wire Simulation */}
          <button
            onClick={() => setIsSimulateModalOpen(true)}
            className="px-4 py-2 bg-[#E11D2A] text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-md shadow-red-200 hover:bg-[#c91823] transition-all cursor-pointer font-semibold"
          >
            <Sparkles size={16} />
            <span>Simulate Wire</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Global Search Input */}
          <div className="lg:col-span-4 relative">
            <div className="flex items-center gap-2 bg-slate-100/80 px-3 py-2 rounded-lg border border-slate-200/80 focus-within:bg-white focus-within:border-blue-400 transition-all">
              <Search size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search by Ref, Sender, Bank, BIC, UETR..."
                className="text-xs bg-transparent border-none outline-none w-full text-slate-700 placeholder:text-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
            </div>
          </div>

          {/* Date Preset Filter */}
          <div className="lg:col-span-3">
            <DatePickerInput
              type="range"
              placeholder="Date Range"
              value={dateValue}
              onChange={handleDateRangeChange as any}
              leftSection={<Calendar size={15} className="text-slate-400" />}
              className="w-full"
              radius="md"
              size="sm"
              clearable
              maxDate={new Date()}
            />
          </div>

          {/* Currency Filter */}
          <div className="lg:col-span-2">
            <Select
              placeholder="Currency"
              data={fxRates.map((r) => ({
                value: r.currency,
                label: r.currency,
              }))}
              value={currencyFilter === 'ALL' ? null : currencyFilter}
              onChange={(val) => setCurrencyFilter((val || 'ALL') as any)}
              clearable
              size="sm"
              radius="md"
              rightSection={currencyFilter !== 'ALL' ? <></> : undefined}
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <Select
              placeholder="Status"
              data={[
                { value: 'success', label: 'Success' },
                { value: 'failed', label: 'Failed' },
                { value: 'init', label: 'Init (Timeout Case)' },
                { value: 'MFR', label: 'MFR (Timeout Case)' },
              ]}
              value={statusFilter === 'ALL' ? null : statusFilter}
              onChange={(val) => setStatusFilter((val || 'ALL') as any)}
              clearable
              size="sm"
              radius="md"
              rightSection={statusFilter !== 'ALL' ? <></> : undefined}
            />
          </div>

          {/* Reset Filters */}
          <div className="lg:col-span-1 flex items-center">
            <button
              onClick={() => {
                resetFilters();
              }}
              title="Reset all filters"
              className="w-full h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Mantine Data Table matching Professional Polish theme */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left border-separate border-spacing-0">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
              <tr>
                <th className="px-4 py-3.5 border border-slate-200 w-10 text-center">#</th>
                <th
                  className="px-4 py-3.5 border border-slate-200 cursor-pointer select-none hover:text-[#0B2B66]"
                  onClick={() => setSort('transactionRef')}
                >
                  <div className="flex items-center gap-1">
                    <span>Transaction Ref</span>
                    {renderSortIcon('transactionRef')}
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 border border-slate-200 cursor-pointer select-none hover:text-[#0B2B66]"
                  onClick={() => setSort('senderName')}
                >
                  <div className="flex items-center gap-1">
                    <span>Sender Name</span>
                    {renderSortIcon('senderName')}
                  </div>
                </th>
                <th className="px-4 py-3.5 border border-slate-200">Sending Bank</th>
                <th className="px-4 py-3.5 border border-slate-200">Currency</th>
                <th
                  className="px-4 py-3.5 border border-slate-200 cursor-pointer select-none hover:text-[#0B2B66]"
                  onClick={() => setSort('amount')}
                >
                  <div className="flex items-center gap-1">
                    <span>Amount</span>
                    {renderSortIcon('amount')}
                  </div>
                </th>
                <th className="px-4 py-3.5 border border-slate-200">Exchange Rate</th>
                <th
                  className="px-4 py-3.5 border border-slate-200 cursor-pointer select-none hover:text-[#0B2B66]"
                  onClick={() => setSort('convertedAmountMmk')}
                >
                  <div className="flex items-center gap-1">
                    <span>Converted (MMK)</span>
                    {renderSortIcon('convertedAmountMmk')}
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 border border-slate-200 cursor-pointer select-none hover:text-[#0B2B66]"
                  onClick={() => setSort('valueDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Value Date</span>
                    {renderSortIcon('valueDate')}
                  </div>
                </th>
                <th className="px-4 py-3.5 border border-slate-200 text-center">Status</th>
                <th className="px-4 py-3.5 border border-slate-200 text-right sticky right-0 z-20 bg-slate-50">Action</th>
              </tr>
            </thead>

            <tbody className="text-xs">
              {currentItems.length > 0 ? (
                currentItems.map((tx, idx) => {
                  const rowIndex = startIndex + idx + 1;
                  return (
                    <tr key={tx.id} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 border border-slate-200 text-center font-mono text-slate-400 font-medium">
                        {rowIndex}
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200">
                        <span className="font-mono font-semibold text-[#0B2B66]">{tx.transactionRef}</span>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate max-w-[130px]" title={tx.swiftMetadata.uetr}>
                          <ShieldCheck size={10} className="text-blue-500 shrink-0" />
                          <span>{tx.swiftMetadata.uetr.slice(0, 13)}...</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200">
                        <div className="font-medium text-slate-800 max-w-[180px] truncate" title={tx.senderName}>
                          {tx.senderName}
                        </div>
                        <div className="text-[10px] text-slate-400">{tx.senderCountry}</div>
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200">
                        <div className="text-slate-700 max-w-[160px] truncate" title={tx.sendingBank}>
                          {tx.sendingBank}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{tx.sendingBankBic}</div>
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200">
                        <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-[#0B2B66] font-bold font-mono rounded text-[11px] border border-blue-100">
                          {tx.currency}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200 font-bold font-mono text-slate-900">
                        {formatNumber(tx.amount)} <span className="text-slate-400 font-normal">{tx.currency}</span>
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200 font-mono text-slate-600">
                        {formatNumber(tx.exchangeRate)}
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200 font-bold font-mono text-emerald-700">
                        {formatNumber(tx.convertedAmountMmk)} MMK
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200">
                        <div className="text-slate-700 font-medium">{formatDate(tx.valueDate, 'DD/MM/YYYY')}</div>
                        <div className="text-[10px] text-slate-400">{formatDate(tx.valueDate, 'hh:mm A')}</div>
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200 text-center">
                        <StatusBadge status={tx.status} />
                      </td>

                      <td className="px-4 py-3.5 border border-slate-200 text-right sticky right-0 z-10 bg-white group-hover:bg-slate-50/80">
                        <button
                          onClick={() => handleViewDetails(tx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0B2B66] bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Search size={32} className="text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">No transactions found</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar Matching Professional Polish layout */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Show</span>
              <Select
                size="xs"
                w={70}
                radius="md"
                data={['10', '25', '50', '100']}
                value={pageSize.toString()}
                onChange={(val) => val && setPageSize(parseInt(val, 10))}
              />
              <span>entries</span>
            </div>

            <span className="text-slate-300">|</span>

            <span>
              Showing <span className="font-semibold text-slate-800">{totalCount > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-800">{endIndex}</span> of{' '}
              <span className="font-semibold text-slate-800">{totalCount}</span> records
            </span>
          </div>

          {totalPages > 1 && (
            <Pagination
              value={currentPage}
              onChange={setCurrentPage}
              total={totalPages}
              size="sm"
              radius="md"
              color="corporateBlue"
            />
          )}
        </div>
      </div>
    </div>
  );
};
