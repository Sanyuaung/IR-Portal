import React, { useState } from 'react';
import {
  Menu,
  Text,
  ActionIcon,
  Badge,
  Popover,
  ScrollArea,
  Divider,
  Button,
  useMantineColorScheme
} from '@mantine/core';
import {
  MenuIcon,
  Bell,
  LogOut,
  User,
  Shield,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  Calculator,
  Moon,
  Sun
} from '../common/ui-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatDate } from '../../utils/formatters';
import { KbzHorizontalLogo } from '../common/KbzLogo';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  activePage,
  onNavigate,
}) => {
  const { user, logout } = useAuthStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const {
    transactions,
    setIsSimulateModalOpen,
    setIsCurrencyConverterOpen,
    setSelectedTransaction,
    setIsDetailsModalOpen,
  } = useTransactionStore();

  const [notificationsRead, setNotificationsRead] = useState(false);

  const pendingCount = transactions.filter((t) => t.status === 'init' || t.status === 'MFR').length;
  const recentAlerts = transactions.slice(0, 4);
  const activePageLabel =
    activePage === 'ir-transactions' ? 'IR Transactions' : activePage === 'settings' ? 'Settings' : 'Dashboard';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-30 shadow-xs sticky top-0 transition-colors">
      {/* Left side: Hamburger + KBZ BANK Horizontal Long Logo */}
      <div className="flex items-center gap-2 sm:gap-4">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar menu"
          className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
        >
          <MenuIcon size={22} />
        </ActionIcon>

        {/* KBZ BANK Horizontal Long Logo */}
        <div
          className="flex items-center cursor-pointer select-none"
          onClick={() => onNavigate('dashboard')}
          role="button"
          tabIndex={0}
        >
          <KbzHorizontalLogo height={36} showPortalBadge={true} />
        </div>
        <span className="hidden xl:inline-flex px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
          {activePageLabel}
        </span>
      </div>

      {/* Right side: Simulation button + FX Calc + Notifications + User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Quick Simulation Trigger */}
        {/* <Button
          variant="light"
          size="xs"
          color="corporateBlue"
          leftSection={<Sparkles size={14} className="text-amber-500" />}
          className="hidden sm:flex bg-blue-50 dark:bg-blue-900/30 text-[#0F4C81] dark:text-blue-300 hover:bg-blue-100 dark:bg-blue-800/40 rounded-lg font-medium cursor-pointer"
          onClick={() => setIsSimulateModalOpen(true)}
        >
          Simulate Wire
        </Button> */}

        {/* Currency Converter Quick Tool */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          onClick={() => setIsCurrencyConverterOpen(true)}
          title="Open FX Calculator"
        >
          <Calculator size={19} />
        </ActionIcon>

        {/* Theme Toggle Quick Tool */}
        <ActionIcon
          variant="subtle"
          color="gray"
          size="lg"
          className="text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          onClick={() => toggleColorScheme()}
          title="Toggle Dark Mode"
        >
          {colorScheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </ActionIcon>

        {/* Notifications Popover */}
        <Popover position="bottom-end" withArrow shadow="md" width={340}>
          <Popover.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="lg"
              className="relative text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              aria-label="View notifications"
            >
              <Bell size={20} />
              {!notificationsRead && pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#E11D2A] rounded-full ring-2 ring-white"></span>
              )}
            </ActionIcon>
          </Popover.Target>

          <Popover.Dropdown p={0} className="dark:bg-slate-900 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-[#0F4C81] dark:text-blue-300">Incoming Remittance Feed</span>
                {pendingCount > 0 && (
                  <Badge size="xs" color="yellow" variant="filled">
                    {pendingCount} Timeouts
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={() => setNotificationsRead(true)}
                className="text-[11px] text-[#0F4C81] dark:text-blue-300 hover:underline font-medium cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <ScrollArea h={260}>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {recentAlerts.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-xs"
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{tx.currency} {tx.amount.toLocaleString()}</span>
                      <Badge
                        size="xs"
                        variant="light"
                        color={tx.status === 'success' ? 'green' : tx.status === 'init' || tx.status === 'MFR' ? 'yellow' : 'red'}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 truncate">From: {tx.senderName} ({tx.sendingBank})</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                      <span>Ref: {tx.transactionRef}</span>
                      <span>{formatDate(tx.valueDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-center">
              <Button
                variant="subtle"
                size="xs"
                fullWidth
                color="corporateBlue"
                onClick={() => {
                  onNavigate('ir-transactions');
                }}
              >
                View All Remittances →
              </Button>
            </div>
          </Popover.Dropdown>
        </Popover>

        {/* User Profile / Avatar Dropdown (Matches Screenshot & Cleaned per request) */}
        <Menu shadow="md" width={360} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
          <Menu.Target>
            <button
              type="button"
              className="flex items-center gap-2 pl-2 pr-1 sm:px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              aria-label="Open user profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white">
                {user?.name
                  ? user.name.substring(0, 2).toUpperCase()
                  : user?.email
                  ? user.email.substring(0, 2).toUpperCase()
                  : 'MM'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#0F4C81] dark:text-blue-300 leading-tight">
                  {user?.name || 'San Yu Aung'}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                  {user?.email || 'customer@mmglobalremit.com'}
                </span>
              </div>
            </button>
          </Menu.Target>

          <Menu.Dropdown p={0} className="overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            {/* Dynamic Customer Account Details Header */}
            <div className="p-3.5 bg-gradient-to-br from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-b border-blue-100 dark:border-blue-800/50">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#0F4C81] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                  {user?.name
                    ? user.name.substring(0, 2).toUpperCase()
                    : user?.email
                    ? user.email.substring(0, 2).toUpperCase()
                    : 'MM'}
                </div>
                <div className="overflow-hidden">
                  <Text size="xs" fw={700} className="text-[#0F4C81] dark:text-blue-300" truncate>
                    {user?.name || 'San Yu Aung'}
                  </Text>
                  <Text size="10px" c="dimmed" truncate>
                    {user?.email || 'customer@mmglobalremit.com'}
                  </Text>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-50 dark:bg-blue-900/30 text-[#0F4C81] dark:text-blue-300 flex items-center justify-center">
                  <Shield size={15} />
                </div>
                <div>
                  <Text size="xs" fw={700} className="text-[#0F4C81] dark:text-blue-300">Help & Contact</Text>
                  <Text size="10px" c="dimmed">Remittance guidance and KBZ support</Text>
                </div>
              </div>
              <div className="mt-3 space-y-2.5">
                <div>
                  <Text size="xs" fw={600} className="text-slate-800 dark:text-slate-200">Track a remittance</Text>
                  <Text size="10px" c="dimmed">Open IR Transactions and select a transfer to see its status and advice.</Text>
                </div>
                <div>
                  <Text size="xs" fw={600} className="text-slate-800 dark:text-slate-200">Settlement timing</Text>
                  <Text size="10px" c="dimmed">Cleared transfers are credited to your registered settlement account.</Text>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Text size="10px" c="dimmed">No.(615/1), Pyay Road, Kamayut Township, Yangon City, Myanmar.</Text>
                  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                    <span className="text-slate-500 dark:text-slate-400">KBZ Bank Call Center</span><a href="tel:09951018555" className="font-semibold text-[#0F4C81] dark:text-blue-300 hover:underline">09951018555</a>
                    <span className="text-slate-500 dark:text-slate-400">KBZPAY Call Center</span><a href="tel:3211" className="font-semibold text-[#0F4C81] dark:text-blue-300 hover:underline">3211</a>
                    <span className="text-slate-500 dark:text-slate-400">Customer Service</span><a href="mailto:customer_service@kbzbank.com" className="font-semibold text-[#0F4C81] dark:text-blue-300 hover:underline truncate">customer_service@kbzbank.com</a>
                    <span className="text-slate-500 dark:text-slate-400">Press Office</span><a href="mailto:pressoffice@kbzbank.com" className="font-semibold text-[#0F4C81] dark:text-blue-300 hover:underline truncate">pressoffice@kbzbank.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg transition-colors cursor-pointer border border-rose-200/70 dark:border-rose-800/50"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </Menu.Dropdown>
        </Menu>
      </div>
    </header>
  );
};
