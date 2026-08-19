import React from 'react';
import {
  LayoutDashboard,
  ArrowDownLeft,
  Settings,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Badge, Tooltip, ActionIcon } from '@mantine/core';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatNumber } from '../../utils/formatters';
import { KbzEmblem } from '../common/KbzLogo';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  activePage,
  onNavigate,
}) => {
  const { fxRates } = useTransactionStore();

  // STRICTLY LIMITED TO: Dashboard, IR Transactions, Settings
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
      badge: null,
    },
    {
      id: 'ir-transactions',
      label: 'IR Transactions',
      icon: <ArrowDownLeft size={18} />,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={18} />,
      badge: null,
    },
  ];

  const topRates = fxRates.filter((r) => ['USD', 'EUR', 'SGD'].includes(r.currency));

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`
          fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-20
          bg-[#0B2B66] text-slate-300 flex flex-col justify-between
          transition-all duration-300 ease-in-out shrink-0 select-none
          ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
          shadow-2xl lg:shadow-none
        `}
        style={{ minHeight: '100vh' }}
      >
        {/* Top Header inside mobile sidebar (only on small screens) */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <KbzEmblem size={28} primaryColor="#FFFFFF" accentColor="#F59E0B" />
            <div className="flex flex-col">
              <span className="font-bold text-base text-white tracking-tight leading-none">MM GLOBAL REMIT</span>
              <span className="text-[8px] text-amber-300 uppercase tracking-widest font-semibold mt-0.5">CUSTOMER PORTAL</span>
            </div>
          </div>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            onClick={onCloseMobile}
            className="text-white hover:bg-white/10"
          >
            <X size={18} />
          </ActionIcon>
        </div>

        {/* Top Nav Items */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            const isExpanded = isOpen;

            const content = (
              <button
                key={item.id}
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium cursor-pointer text-left ${
                  isActive
                    ? 'bg-white/10 text-white shadow-xs'
                    : 'hover:bg-white/5 text-slate-300 hover:text-white'
                } ${!isExpanded ? 'lg:justify-center lg:px-2' : ''}`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>

                <span className={`flex-1 flex items-center justify-between ${!isExpanded ? 'lg:hidden' : ''}`}>
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge size="xs" variant="filled" className="bg-[#E11D2A] text-white">
                      {item.badge}
                    </Badge>
                  )}
                </span>
              </button>
            );

            return !isExpanded ? (
              <div key={item.id} className="w-full">
                <Tooltip label={item.label} position="right" withArrow className="hidden lg:block">
                  {content}
                </Tooltip>
                <div className="lg:hidden">{content}</div>
              </div>
            ) : (
              content
            );
          })}
        </nav>

        {/* Embedded Live FX Rates widget in sidebar */}
        <div className={`p-4 mt-auto ${!isOpen ? 'hidden lg:block' : ''}`}>
          {isOpen ? (
            <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-inner">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3 flex items-center justify-between">
                <span>Live FX Rates</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </p>
              <div className="space-y-2.5">
                {topRates.map((rate) => (
                  <div key={rate.currency} className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{rate.currency}/MMK</span>
                    <span className="font-mono text-white font-semibold">
                      {formatNumber(rate.middleRate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-1 text-center">
              <Tooltip label="256-bit Encrypted Banking Session" position="right" withArrow>
                <div className="p-2 rounded-lg bg-white/5 text-emerald-400 inline-flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
