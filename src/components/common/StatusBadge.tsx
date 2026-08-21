import React from 'react';
import { TransactionStatus } from '../../types';

interface StatusBadgeProps {
  status: TransactionStatus | 'Active' | 'Inactive' | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normStatus = String(status).trim().toLowerCase();

  if (normStatus === 'active' || normStatus === 'success' || normStatus === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F8EE] text-[#1E7E34] text-xs font-semibold rounded-full border border-[#BDE8CA]/80 select-none shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
        <span>{normStatus === 'active' ? 'Active' : 'Success'}</span>
      </span>
    );
  }

  if (normStatus === 'inactive' || normStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDE8E8] text-[#D9383A] text-xs font-semibold rounded-full border border-[#F8B4B4]/80 select-none shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#E02424]"></span>
        <span>{normStatus === 'inactive' ? 'Inactive' : 'Failed'}</span>
      </span>
    );
  }

  if (normStatus === 'init' || normStatus === 'mfr' || normStatus === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FEF3C7] text-[#B45309] text-xs font-semibold rounded-full border border-[#FCD34D]/80 select-none shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
        <span>{normStatus === 'init' ? 'Init (Timeout)' : normStatus === 'mfr' ? 'MFR (Timeout)' : 'Pending'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 select-none">
      <span className="w-2 h-2 rounded-full bg-slate-400"></span>
      <span>{status}</span>
    </span>
  );
};
