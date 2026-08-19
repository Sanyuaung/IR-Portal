import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TransactionDetailsModal } from '../transactions/TransactionDetailsModal';
import { NewInboundSimulationModal } from '../transactions/NewInboundSimulationModal';
import { CurrencyConverterModal } from '../common/CurrencyConverterModal';
import { useTransactionStore } from '../../store/useTransactionStore';

interface AppLayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activePage,
  onNavigate,
}) => {
  const { fetchTransactionsFromDb, fetchFxRatesFromDb } = useTransactionStore();
  // Default sidebar open on large screens, closed on mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Initial fetch from PostgreSQL database
    fetchTransactionsFromDb();
    fetchFxRatesFromDb();
  }, [fetchTransactionsFromDb, fetchFxRatesFromDb]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    // initial check
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#1E293B] overflow-x-hidden">
      {/* Header Bar */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        activePage={activePage}
        onNavigate={onNavigate}
      />

      {/* Main Body Shell */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          activePage={activePage}
          onNavigate={onNavigate}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full min-w-0">
          {children}
        </main>
      </div>

      {/* Corporate Footer */}
      <footer className="bg-[#0F4C81] text-white/70 text-[10px] sm:text-xs py-2.5 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-blue-900/40 select-none">
        <span>© 2026 MM Global Remit Gateway. All rights reserved. Version 2.4.1 (Stable)</span>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="hidden md:inline text-white/80">Secure 256-bit SSL Encrypted</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-white font-medium">SWIFT GPI Active</span>
          </span>
        </div>
      </footer>

      {/* Global Modals */}
      <TransactionDetailsModal />
      <NewInboundSimulationModal />
      <CurrencyConverterModal />
    </div>
  );
};
