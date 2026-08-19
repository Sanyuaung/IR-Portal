import React, { useState } from 'react';
import {
  Modal,
  Select,
  Button,
  CopyButton,
  SegmentedControl,
  Tabs,
} from '@mantine/core';
import {
  Calculator,
  RefreshCw,
  Check,
  Copy,
  Clock,
  Send,
  ArrowDown,
  ArrowRightLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
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
  const {
    isCurrencyConverterOpen,
    setIsCurrencyConverterOpen,
    fxRates,
    updateFxRates,
    setIsSimulateModalOpen,
  } = useTransactionStore();

  const [calcTab, setCalcTab] = useState<'calc' | 'table'>('calc');
  const [direction, setDirection] = useState<'foreign-to-mmk' | 'mmk-to-foreign'>('foreign-to-mmk');
  const [foreignAmount, setForeignAmount] = useState<string>('1000');
  const [mmkAmount, setMmkAmount] = useState<string>('3550000');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentRateObj = fxRates.find((r) => r.currency === selectedCurrency) || fxRates[0];
  const buyRate = currentRateObj?.buyRate || 3540;
  const sellRate = currentRateObj?.sellRate || 3560;
  const middleRate = currentRateObj?.middleRate || 3550;

  // Calculation: Foreign -> MMK
  const numForeign = parseFloat(foreignAmount.replace(/,/g, '')) || 0;
  const calculatedMmk = Math.round(numForeign * buyRate);

  // Calculation: MMK -> Foreign
  const numMmk = parseFloat(mmkAmount.replace(/,/g, '')) || 0;
  const calculatedForeign = sellRate > 0 ? (numMmk / sellRate).toFixed(2) : '0';

  const selectedCurr = CURRENCIES.find((c) => c.value === selectedCurrency) || CURRENCIES[0];

  const handleRefreshRates = () => {
    setIsRefreshing(true);
    updateFxRates();
    setTimeout(() => {
      setIsRefreshing(false);
      notifications.show({
        title: 'FX Rates Updated',
        message: 'Live Central Bank & Interbank FX quotes refreshed.',
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
            <h3 className="font-bold text-lg text-[#0F4C81] leading-tight">
              Remittance FX Calculator
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Myanmar Kyat (MMK) Real-Time Inbound Exchange Rate
            </p>
          </div>
        </div>
      }
      size="lg"
      centered
      radius="md"
    >
      <div className="space-y-4 pt-1">
        {/* Top Controls: Live status & Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
          <SegmentedControl
            value={calcTab}
            onChange={(val) => setCalcTab(val as 'calc' | 'table')}
            data={[
              { label: '🧮 Simple Calculator', value: 'calc' },
              { label: '📊 All Live FX Rates', value: 'table' },
            ]}
            size="xs"
            color="blue"
            className="w-full sm:w-auto"
          />

          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Rates Active
            </span>
            <button
              type="button"
              onClick={handleRefreshRates}
              className="text-[#0F4C81] hover:text-[#0A365D] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {calcTab === 'calc' ? (
          <div className="space-y-4">
            {/* Direction Toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() =>
                  setDirection(direction === 'foreign-to-mmk' ? 'mmk-to-foreign' : 'foreign-to-mmk')
                }
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0F4C81] text-xs font-semibold rounded-full border border-blue-200 transition-colors cursor-pointer"
              >
                <ArrowRightLeft size={13} />
                <span>
                  {direction === 'foreign-to-mmk'
                    ? 'Switch: MMK → Foreign Currency'
                    : 'Switch: Foreign Currency → MMK'}
                </span>
              </button>
            </div>

            {direction === 'foreign-to-mmk' ? (
              /* PRIMARY MODE: Send Foreign Currency -> Receive MMK */
              <div className="space-y-3">
                {/* 1. YOU SEND */}
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200 shadow-xs focus-within:border-[#0F4C81] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      You Send (From Overseas)
                    </span>
                    <span className="text-xs text-slate-400">Incoming wire transfer</span>
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
                        className="w-full pl-9 pr-3 py-2 text-2xl font-black font-mono text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                      />
                    </div>

                    <div className="w-full sm:w-56">
                      <Select
                        data={CURRENCIES.map((c) => ({
                          value: c.value,
                          label: `${c.flag} ${c.value} (${c.name})`,
                        }))}
                        value={selectedCurrency}
                        onChange={(val) => val && setSelectedCurrency(val as CurrencyCode)}
                        size="md"
                        className="font-semibold"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400 mr-1">Presets:</span>
                    {['100', '500', '1000', '2500', '5000', '10000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setForeignAmount(amt)}
                        className={`text-xs px-2.5 py-1 rounded-md font-mono font-semibold transition-colors cursor-pointer ${
                          foreignAmount === amt
                            ? 'bg-[#0F4C81] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {selectedCurr.symbol}{formatNumber(Number(amt))}
                      </button>
                    ))}
                  </div>
                </div>

                {/* EXCHANGE RATE BADGE */}
                <div className="flex items-center justify-between px-4 py-2 bg-blue-50/90 rounded-lg border border-blue-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-[#0F4C81] text-white flex items-center justify-center text-[10px] font-bold">
                      <ArrowDown size={12} />
                    </div>
                    <span>Exchange Rate:</span>
                    <strong className="text-[#0F4C81] font-mono text-sm">
                      1 {selectedCurrency} = {formatNumber(buyRate)} MMK
                    </strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                      Fee: 0 MMK (Free)
                    </span>
                  </div>
                </div>

                {/* 2. RECIPIENT RECEIVES */}
                <div className="p-5 bg-gradient-to-br from-[#0F4C81] to-[#0A365D] text-white rounded-xl shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                      Recipient Receives (In Myanmar)
                    </span>
                    <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded">
                      Guaranteed Payout
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                      Ks {formatNumber(calculatedMmk)}{' '}
                      <span className="text-xl font-bold text-amber-300">MMK</span>
                    </div>
                    <div className="text-sm font-semibold text-amber-200 mt-1">
                      ≈ {formatLakhs(calculatedMmk)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/20 flex items-center justify-between text-xs text-blue-100">
                    <span>Channel: <strong>SWIFT GPI Direct Settlement</strong></span>

                    <CopyButton
                      value={`MM Global Remit Quote:\nSend: ${formatNumber(numForeign)} ${selectedCurrency}\nRate: 1 ${selectedCurrency} = ${formatNumber(buyRate)} MMK\nReceive: Ks ${formatNumber(calculatedMmk)} MMK (${formatLakhs(calculatedMmk)})\nFee: 0 MMK`}
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
                  </div>
                </div>
              </div>
            ) : (
              /* INVERSE MODE: Enter MMK -> Calculate Foreign */
              <div className="space-y-3">
                {/* 1. ENTER MMK */}
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200 shadow-xs focus-within:border-[#0F4C81] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Target Payout in Myanmar Kyat
                    </span>
                    <span className="text-xs text-slate-400">Desired MMK amount</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xl">
                        Ks
                      </span>
                      <input
                        type="number"
                        min="1000"
                        value={mmkAmount}
                        onChange={(e) => setMmkAmount(e.target.value)}
                        placeholder="3550000"
                        className="w-full pl-10 pr-3 py-2 text-2xl font-black font-mono text-slate-800 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-[#0F4C81]"
                      />
                    </div>

                    <div className="w-full sm:w-56">
                      <Select
                        data={CURRENCIES.map((c) => ({
                          value: c.value,
                          label: `${c.flag} ${c.value} (${c.name})`,
                        }))}
                        value={selectedCurrency}
                        onChange={(val) => val && setSelectedCurrency(val as CurrencyCode)}
                        size="md"
                        className="font-semibold"
                      />
                    </div>
                  </div>

                  {/* MMK Presets */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                    <span className="text-[11px] font-medium text-slate-400 mr-1">Presets:</span>
                    {[
                      { label: '10 Lakhs (1M)', val: '1000000' },
                      { label: '35.5 Lakhs (3.55M)', val: '3550000' },
                      { label: '50 Lakhs (5M)', val: '5000000' },
                      { label: '100 Lakhs (10M)', val: '10000000' },
                    ].map((p) => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setMmkAmount(p.val)}
                        className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          mmkAmount === p.val
                            ? 'bg-[#0F4C81] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RESULT: Needed Foreign Currency */}
                <div className="p-5 bg-gradient-to-br from-[#0F4C81] to-[#0A365D] text-white rounded-xl shadow-md space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Required Remittance Amount Overseas
                  </span>

                  <div className="py-1">
                    <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                      {selectedCurr.symbol} {formatNumber(Number(calculatedForeign))}{' '}
                      <span className="text-xl font-bold text-amber-300">{selectedCurrency}</span>
                    </div>
                    <div className="text-xs text-blue-200 mt-1">
                      Calculated at indicative 1 {selectedCurrency} = {formatNumber(sellRate)} MMK
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ALL LIVE FX RATES TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Currency</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3 text-right">Buy Rate (MMK)</th>
                  <th className="py-2.5 px-3 text-right">Sell Rate (MMK)</th>
                  <th className="py-2.5 px-3 text-right">Middle Rate</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CURRENCIES.map((curr) => {
                  const rate = fxRates.find((r) => r.currency === curr.value);
                  const isSelected = selectedCurrency === curr.value;
                  return (
                    <tr
                      key={curr.value}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isSelected ? 'bg-blue-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        <span className="text-base">{curr.flag}</span>
                        <span className="font-bold text-slate-900">{curr.value}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{curr.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0F4C81]">
                        {formatNumber(rate?.buyRate || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                        {formatNumber(rate?.sellRate || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {formatNumber(rate?.middleRate || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCurrency(curr.value);
                            setCalcTab('calc');
                          }}
                          className="text-[11px] font-bold text-[#0F4C81] hover:underline cursor-pointer"
                        >
                          Use in Calc
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200">
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
        </div>
      </div>
    </Modal>
  );
};
