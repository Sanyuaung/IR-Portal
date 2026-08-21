import React from 'react';
import { Eye, ShieldCheck } from '../common/ui-icons';
import { useTransactionStore } from '../../store/useTransactionStore';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import dayjs from 'dayjs';

interface RecentTransactionsTableProps {
  onNavigateToTransactions: () => void;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  onNavigateToTransactions,
}) => {
  const { transactions, setSelectedTransaction, setIsDetailsModalOpen } = useTransactionStore();

  const recent = transactions.slice(0, 5);

  const handleViewDetails = (tx: any) => {
    setSelectedTransaction(tx);
    setIsDetailsModalOpen(true);
  };

  const formatDate = (dateString: string, format: string) => {
    return dayjs(dateString).format(format);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-base">Recent Inbound Transactions</h3>
        <button
          onClick={onNavigateToTransactions}
          className="text-xs font-bold text-[#0B2B66] hover:underline cursor-pointer"
        >
          View All Transactions
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-0 whitespace-nowrap">
          <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500">
            <tr>
              <th className="px-4 py-3.5 border border-slate-200 text-center w-[40px]">#</th>
              <th className="px-4 py-3.5 border border-slate-200">Transaction Ref</th>
              <th className="px-4 py-3.5 border border-slate-200">Sender Name</th>
              <th className="px-4 py-3.5 border border-slate-200">Sending Bank</th>
              <th className="px-4 py-3.5 border border-slate-200">Currency</th>
              <th className="px-4 py-3.5 border border-slate-200">Amount</th>
              <th className="px-4 py-3.5 border border-slate-200">Exchange Rate</th>
              <th className="px-4 py-3.5 border border-slate-200">Converted (MMK)</th>
              <th className="px-4 py-3.5 border border-slate-200">Value Date</th>
              <th className="px-4 py-3.5 border border-slate-200 text-center">Status</th>
              <th className="px-4 py-3.5 border border-slate-200 text-right sticky right-0 z-20 bg-slate-50">Action</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {recent.map((tx, idx) => {
              const rowIndex = idx + 1;
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
