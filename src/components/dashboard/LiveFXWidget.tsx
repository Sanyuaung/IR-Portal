import React, { useState } from 'react';
import { Paper, Text, Button, Group, Badge, Tooltip } from '@mantine/core';
import { RefreshCw, Calculator, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatNumber, getCurrencyFlag } from '../../utils/formatters';

export const LiveFXWidget: React.FC = () => {
  const { fxRates, updateFxRates, setIsCurrencyConverterOpen } = useTransactionStore();
  const [showAllRates, setShowAllRates] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const displayedCurrencies = showAllRates
    ? fxRates
    : fxRates.filter((r) => ['USD', 'EUR', 'SGD', 'THB'].includes(r.currency));

  const handleRefresh = () => {
    setIsSpinning(true);
    updateFxRates();
    setTimeout(() => setIsSpinning(false), 500);
  };

  return (
    <Paper withBorder p="lg" radius="md" className="bg-white border-slate-200 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <Text fw={800} size="sm" c="#0F4C81" className="tracking-tight">
              Live Remittance FX Indicative Rates
            </Text>
            <Badge size="xs" variant="light" color="blue">
              Real-Time Feed
            </Badge>
          </div>
          <Text size="xs" c="dimmed" mt={1}>
            All Base Settlement Rates quoted in <span className="font-semibold text-slate-800">Myanmar Kyat (MMK)</span>
          </Text>
        </div>

        <Group gap="xs">
          <Button
            variant="light"
            size="xs"
            color="corporateBlue"
            className="bg-blue-50 text-[#0F4C81] hover:bg-blue-100 font-semibold"
            leftSection={<Calculator size={14} />}
            onClick={() => setIsCurrencyConverterOpen(true)}
          >
            Open FX Calculator
          </Button>

          <Tooltip label="Fetch latest treasury market rates">
            <Button
              variant="subtle"
              size="xs"
              color="gray"
              leftSection={<RefreshCw size={14} className={isSpinning ? 'animate-spin' : ''} />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </Tooltip>
        </Group>
      </div>

      {/* Responsive Rates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {displayedCurrencies.map((rate) => {
          const isUp = rate.change24h >= 0;
          return (
            <div
              key={rate.currency}
              onClick={() => setIsCurrencyConverterOpen(true)}
              className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/80 hover:bg-white hover:border-[#0F4C81]/30 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{getCurrencyFlag(rate.currency)}</span>
                  <Text fw={700} size="xs" c="slate.8">
                    {rate.currency} / MMK
                  </Text>
                </div>
                <div
                  className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {isUp ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {isUp ? `+${rate.change24h}%` : `${rate.change24h}%`}
                </div>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-black text-[#0F4C81] font-mono group-hover:text-blue-700 transition-colors">
                  {formatNumber(rate.middleRate)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">MMK</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-200/60 text-[10px]">
                <div>
                  <span className="text-slate-400 block text-[9px]">Buy Rate:</span>
                  <span className="font-semibold text-slate-700 font-mono">{formatNumber(rate.buyRate)}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">Sell Rate:</span>
                  <span className="font-semibold text-slate-700 font-mono">{formatNumber(rate.sellRate)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More / Show Less Toggle */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAllRates((prev) => !prev)}
          className="text-xs text-[#0F4C81] hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer py-1 px-3 rounded hover:bg-slate-50 transition-colors"
        >
          <span>{showAllRates ? 'Show Fewer Currencies' : `View All ${fxRates.length} Inbound Currency Pairs`}</span>
          {showAllRates ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
    </Paper>
  );
};
