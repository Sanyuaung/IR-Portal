import React, { useState } from 'react';
import { Modal, Select, Button, CopyButton } from '@mantine/core';
import { Calculator, RefreshCw, Check, Copy, Send, ArrowDown } from './ui-icons';
import { useTransactionStore } from '../../store/useTransactionStore';
import { CurrencyCode } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { notifications } from '@mantine/notifications';

interface CurrencyOption {
  value: CurrencyCode;
  label: string;
  name: string;
  country: string;
  flag: string;
  symbol: string;
}

const CURRENCIES: CurrencyOption[] = [
  { value: 'USD', label: 'USD - US Dollar', name: 'US Dollar', country: 'United States', flag: '🇺🇸', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', name: 'Euro', country: 'European Union', flag: '🇪🇺', symbol: '€' },
  { value: 'SGD', label: 'SGD - Singapore Dollar', name: 'Singapore Dollar', country: 'Singapore', flag: '🇸🇬', symbol: 'S$' },
  { value: 'THB', label: 'THB - Thai Baht', name: 'Thai Baht', country: 'Thailand', flag: '🇹🇭', symbol: '฿' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit', name: 'Malaysian Ringgit', country: 'Malaysia', flag: '🇲🇾', symbol: 'RM' },
  { value: 'GBP', label: 'GBP - British Pound', name: 'British Pound', country: 'United Kingdom', flag: '🇬🇧', symbol: '£' },
  { value: 'JPY', label: 'JPY - Japanese Yen', name: 'Japanese Yen', country: 'Japan', flag: '🇯🇵', symbol: '¥' },
  { value: 'CNY', label: 'CNY - Chinese Yuan', name: 'Chinese Yuan', country: 'China', flag: '🇨🇳', symbol: '¥' },
];

export const CurrencyConverterModal: React.FC = () => {
  const { isCurrencyConverterOpen, setIsCurrencyConverterOpen, fxRates, updateFxRates, setIsSimulateModalOpen } =
    useTransactionStore();

  const [foreignAmount, setForeignAmount] = useState<string>('1000');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentRateObj = fxRates.find((r) => r.currency === selectedCurrency) || fxRates[0];
  const buyRate = currentRateObj?.buyRate || 3540;
  const numForeign = parseFloat(foreignAmount.replace(/,/g, '')) || 0;
  const calculatedMmk = Math.round(numForeign * buyRate);
  const selectedCurr = CURRENCIES.find((c) => c.value === selectedCurrency) || CURRENCIES[0];

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    updateFxRates();
    setTimeout(() => {
      setIsRefreshing(false);
      notifications.show({
        title: 'FX Rates Updated',
        message: 'Live exchange rates refreshed.',
        color: 'blue',
        icon: <RefreshCw size={16} />,
      });
    }, 300);
  };

  const handleOpenSimulate = () => {
    setIsCurrencyConverterOpen(false);
    setIsSimulateModalOpen(true);
  };

  const formatLakhs = (val: number) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(2)} Billion MMK`;
    if (val >= 100000) return `${(val / 100000).toFixed(1)} Lakhs (${(val / 1000000).toFixed(2)}M MMK)`;
    return `${formatNumber(val)} MMK`;
  };

  return (
    <Modal
      opened={isCurrencyConverterOpen}
      onClose={() => setIsCurrencyConverterOpen(false)}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C81] text-white flex items-center justify-center shadow-xs">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#0F4C81] leading-tight">Remittance FX Calculator</h3>
            <p className="text-xs text-slate-500 font-medium">Quick estimate for inbound MMK payout</p>
          </div>
        </div>
      }
      size="lg"
      centered
      radius="md"
    >
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold text-xs bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Live FX rates active
          </span>
          <button
            type="button"
            onClick={handleRefreshRates}
            className="text-[#0F4C81] hover:text-[#0A365D] font-bold flex items-center justify-center gap-1 text-xs cursor-pointer"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh rates</span>
          </button>
        </div>

        <div className="p-4 bg-white rounded-xl border-2 border-slate-200 shadow-xs focus-within:border-[#0F4C81] transition-colors">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">You Send (Overseas)</span>
            <span className="text-xs text-slate-400">Simple estimate</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">
                {selectedCurr.symbol}
              </span>
              <input
                type="number"
                min="1"
                value={foreignAmount}
                onChange={(e) => setForeignAmount(e.target.value)}
                placeholder="1000"
                className="w-full pl-10 pr-3 py-2 text-2xl font-black font-mono text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
              />
            </div>

            <div className="w-full sm:w-56">
              <Select
                data={fxRates.map((r) => {
                  const currMatch = CURRENCIES.find(c => c.value === r.currency);
                  return {
                    value: r.currency,
                    label: currMatch ? `${currMatch.flag} ${r.currency} (${currMatch.name})` : `${r.currency} - ${r.currency}`,
                  };
                })}
                value={selectedCurrency}
                onChange={(val) => val && setSelectedCurrency(val as CurrencyCode)}
                size="md"
                className="font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
            <span className="text-[11px] font-medium text-slate-400 mr-1">Quick amounts:</span>
            {['100', '500', '1000', '2500', '5000', '10000'].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setForeignAmount(amt)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-semibold transition-colors cursor-pointer ${
                  foreignAmount === amt ? 'bg-[#0F4C81] text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {selectedCurr.symbol}
                {formatNumber(Number(amt))}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 bg-blue-50/90 rounded-lg border border-blue-100 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-5 h-5 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-[10px] font-bold">
              <ArrowDown size={12} />
            </div>
            <span>Rate:</span>
            <strong className="text-[#0F4C81] font-mono text-sm">
              1 {selectedCurrency} = {formatNumber(buyRate)} MMK
            </strong>
          </div>
        </div>

        <div className="p-5 bg-gradient-to-br from-[#0F4C81] to-[#0A365D] text-white rounded-xl shadow-md space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">Recipient Receives (MMK)</span>

          <div className="py-1">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              Ks {formatNumber(calculatedMmk)} <span className="text-xl font-bold text-amber-300">MMK</span>
            </div>
            <div className="text-sm font-semibold text-amber-200 mt-1">≈ {formatLakhs(calculatedMmk)}</div>
          </div>

          {/* <div className="pt-3 border-t border-white/20 flex items-center justify-end text-xs text-blue-100">
            <CopyButton
              value={`MM Global Remit Quote:\nSend: ${formatNumber(numForeign)} ${selectedCurrency}\nRate: 1 ${selectedCurrency} = ${formatNumber(buyRate)} MMK\nReceive: Ks ${formatNumber(calculatedMmk)} MMK (${formatLakhs(calculatedMmk)})`}
            >
              {({ copied, copy }) => (
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copied ? 'Copied!' : 'Copy Quote'}</span>
                </button>
              )}
            </CopyButton>
          </div> */}
        </div>

        {/* <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200">
          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCurrencyConverterOpen(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          <Button
            size="sm"
            className="bg-[#0F4C81] hover:bg-[#0A365D] text-white w-full sm:w-auto font-semibold"
            leftSection={<Send size={15} />}
            onClick={handleOpenSimulate}
          >
            Simulate Inbound Remittance
          </Button>
        </div> */}
      </div>
    </Modal>
  );
};
