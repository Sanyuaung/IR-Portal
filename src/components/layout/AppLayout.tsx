import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TransactionDetailsModal } from '../transactions/TransactionDetailsModal';
import { NewInboundSimulationModal } from '../transactions/NewInboundSimulationModal';
import { CurrencyConverterModal } from '../common/CurrencyConverterModal';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { ShieldAlert, ShieldCheck } from '../common/ui-icons';

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
  const { settings } = useSettingsStore();
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

  const pageTitleMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Quick overview of inbound remittance performance',
    },
    'ir-transactions': {
      title: 'IR Transactions',
      subtitle: 'Search, track, and review every inbound transfer clearly',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Manage account profile and security preferences',
    },
  };

  const activeMeta = pageTitleMap[activePage] || pageTitleMap.dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] flex flex-col font-sans text-[#1E293B] overflow-x-hidden">
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
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0">
          <div className={activePage === 'settings' ? 'w-full space-y-5' : 'max-w-7xl mx-auto w-full space-y-5'}>
            {!settings.is2FaEnabled && (
              <section className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-3.5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-amber-700">
                      <ShieldAlert size={18} />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-amber-900 tracking-tight">2FA Not Enabled</h3>
                      <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                        Please enable Two-Factor Authentication to secure your account and remittance access.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('settings')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 transition-colors"
                  >
                    <ShieldCheck size={14} />
                    Enable 2FA
                  </button>
                </div>
              </section>
            )}
            {/* 
            <section className="bg-white border border-slate-200 rounded-xl px-4 sm:px-5 py-3.5 shadow-xs">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{activeMeta.title}</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{activeMeta.subtitle}</p>
            </section>
             */}
            {children}
          </div>
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
