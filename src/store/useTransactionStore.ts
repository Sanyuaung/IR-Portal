import { create } from 'zustand';
import { InboundTransaction, TransactionStatus, CurrencyCode, FxRate } from '../types';
import { mockTransactions, mockFxRates } from '../data/mockTransactions';
import dayjs from 'dayjs';

export type DatePreset = 'all' | 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'custom';

interface TransactionState {
  transactions: InboundTransaction[];
  fxRates: FxRate[];
  selectedTransaction: InboundTransaction | null;
  isDetailsModalOpen: boolean;
  isSimulateModalOpen: boolean;
  isCurrencyConverterOpen: boolean;
  isLoadingDb: boolean;

  // Filters
  searchTerm: string;
  statusFilter: TransactionStatus | 'ALL';
  currencyFilter: CurrencyCode | 'ALL';
  datePreset: DatePreset;
  customStartDate: string | null;
  customEndDate: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;

  // Sorting
  sortField: keyof InboundTransaction;
  sortDirection: 'asc' | 'desc';

  // Actions
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: TransactionStatus | 'ALL') => void;
  setCurrencyFilter: (currency: CurrencyCode | 'ALL') => void;
  setDatePreset: (preset: DatePreset) => void;
  setCustomDateRange: (start: string | null, end: string | null) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSort: (field: keyof InboundTransaction) => void;
  setSelectedTransaction: (tx: InboundTransaction | null) => void;
  setIsDetailsModalOpen: (open: boolean) => void;
  setIsSimulateModalOpen: (open: boolean) => void;
  setIsCurrencyConverterOpen: (open: boolean) => void;
  resetFilters: () => void;

  // Operations
  fetchTransactionsFromDb: () => Promise<void>;
  fetchFxRatesFromDb: () => Promise<void>;
  triggerDatabaseMigration: () => Promise<{ success: boolean; message?: string }>;
  addSimulatedTransaction: (tx: Partial<InboundTransaction>) => InboundTransaction;
  updateFxRates: () => void;
  getFilteredTransactions: () => InboundTransaction[];
  getStats: () => {
    totalInboundAmountMmk: number;
    totalInboundAmountUsd: number;
    totalTransactionsCount: number;
    completedCount: number;
    pendingCount: number;
    pendingAmountMmk: number;
    pendingAmountUsd: number;
    failedCount: number;
    todayInboundMmk: number;
  };
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: mockTransactions,
  fxRates: mockFxRates,
  selectedTransaction: null,
  isDetailsModalOpen: false,
  isSimulateModalOpen: false,
  isCurrencyConverterOpen: false,
  isLoadingDb: false,

  searchTerm: '',
  statusFilter: 'ALL',
  currencyFilter: 'ALL',
  datePreset: 'all',
  customStartDate: null,
  customEndDate: null,

  currentPage: 1,
  pageSize: 10,

  sortField: 'valueDate',
  sortDirection: 'desc',

  setSearchTerm: (searchTerm) => set({ searchTerm, currentPage: 1 }),
  setStatusFilter: (statusFilter) => set({ statusFilter, currentPage: 1 }),
  setCurrencyFilter: (currencyFilter) => set({ currencyFilter, currentPage: 1 }),
  setDatePreset: (datePreset) => set({ datePreset, currentPage: 1 }),
  setCustomDateRange: (customStartDate, customEndDate) =>
    set({ customStartDate, customEndDate, datePreset: 'custom', currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),

  setSort: (field) => {
    const currentField = get().sortField;
    const currentDir = get().sortDirection;
    if (currentField === field) {
      set({ sortDirection: currentDir === 'asc' ? 'desc' : 'asc' });
    } else {
      set({ sortField: field, sortDirection: 'desc' });
    }
  },

  setSelectedTransaction: (tx) => set({ selectedTransaction: tx }),
  setIsDetailsModalOpen: (open) => set({ isDetailsModalOpen: open }),
  setIsSimulateModalOpen: (open) => set({ isSimulateModalOpen: open }),
  setIsCurrencyConverterOpen: (open) => set({ isCurrencyConverterOpen: open }),

  resetFilters: () =>
    set({
      searchTerm: '',
      statusFilter: 'ALL',
      currencyFilter: 'ALL',
      datePreset: 'all',
      customStartDate: null,
      customEndDate: null,
      currentPage: 1,
    }),

  fetchTransactionsFromDb: async () => {
    set({ isLoadingDb: true });
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        const data = await res.json();
        if (data.transactions && data.transactions.length > 0) {
          set({ transactions: data.transactions });
        }
      }
    } catch (err) {
      console.warn('Could not fetch transactions from database API, using in-memory store:', err);
    } finally {
      set({ isLoadingDb: false });
    }
  },

  fetchFxRatesFromDb: async () => {
    try {
      const res = await fetch('/api/fx-rates');
      if (res.ok) {
        const data = await res.json();
        if (data.fxRates && data.fxRates.length > 0) {
          set({ fxRates: data.fxRates });
        }
      }
    } catch (err) {
      console.warn('Could not fetch fx rates from database API:', err);
    }
  },

  triggerDatabaseMigration: async () => {
    try {
      const res = await fetch('/api/database/migrate', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await get().fetchTransactionsFromDb();
        await get().fetchFxRatesFromDb();
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  },

  updateFxRates: () => {
    const updated = get().fxRates.map((rate) => {
      const delta = (Math.random() - 0.5) * 2;
      const newMid = Math.round((rate.middleRate + delta) * 100) / 100;
      return {
        ...rate,
        middleRate: newMid,
        buyRate: Math.round((newMid - 10) * 100) / 100,
        sellRate: Math.round((newMid + 10) * 100) / 100,
        change24h: Math.round((rate.change24h + (Math.random() - 0.5) * 0.1) * 100) / 100,
        updatedAt: new Date().toISOString(),
      };
    });
    set({ fxRates: updated });
  },

  addSimulatedTransaction: (customData) => {
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const uetrId = crypto.randomUUID ? crypto.randomUUID() : `uetr-${Date.now()}`;
    const curr = customData.currency || 'USD';
    const rate =
      get().fxRates.find((r) => r.currency === curr)?.middleRate || 3550;
    const amt = customData.amount || 50000;
    const converted = Math.round(amt * rate);
    const fee = 30000;
    const net = converted - fee;

    const newTx: InboundTransaction = {
      id: `tx-sim-${Date.now()}`,
      transactionRef: `IR-2026-${curr}-${randomId}`,
      senderName: customData.senderName || 'Global Merchant Settlement Corp',
      senderCountry: customData.senderCountry || 'Singapore',
      sendingBank: customData.sendingBank || 'DBS Bank Singapore',
      sendingBankBic: customData.sendingBankBic || 'DBSSSGSG',
      currency: curr,
      amount: amt,
      exchangeRate: rate,
      convertedAmountMmk: converted,
      feeAmount: fee,
      netAmountMmk: net,
      valueDate: new Date().toISOString(),
      status: customData.status || 'Completed',
      purpose: customData.purpose || 'Trade invoice settlement via SWIFT GPI',
      beneficiaryAccount: '0091-2384-992019',
      swiftMetadata: {
        senderReference: `SIM-REF-${randomId}`,
        bankOpCode: 'CRED',
        orderingCustomer: {
          name: customData.senderName || 'Global Merchant Settlement Corp',
          address: '8 Shenton Way, #45-01 AXA Tower',
          city: 'Singapore',
          country: customData.senderCountry || 'Singapore',
        },
        orderingInstitution: {
          bic: customData.sendingBankBic || 'DBSSSGSGXXX',
          name: customData.sendingBank || 'DBS Bank Singapore',
          branch: 'Main Corporate Branch',
          country: customData.senderCountry || 'Singapore',
        },
        accountWithInstitution: {
          bic: 'KBZMMMYMXXX',
          name: 'Kanbawza Bank Limited',
          branch: 'Yangon Main Corporate Branch',
        },
        beneficiaryCustomer: {
          accountNumber: '0091-2384-992019',
          name: 'KBZ Golden Horizon Trading Co., Ltd.',
          address: 'No. 45 Strand Road, Kyauktada Township, Yangon',
        },
        remittanceInfo: customData.purpose || 'Commercial invoice settlement batch',
        detailsOfCharges: 'OUR',
        uetr: uetrId,
        settlementChannel: 'SWIFT GPI',
        settlementSteps: [
          {
            title: 'Remittance Instructed',
            description: 'SWIFT MT103 message acknowledged by receiving gateway',
            timestamp: dayjs().format('DD/MM/YYYY hh:mm A'),
            completed: true,
          },
          {
            title: 'Intermediary Sanctions & AML Screening',
            description: 'Cleared compliance verification in 1.4s',
            timestamp: dayjs().format('DD/MM/YYYY hh:mm A'),
            completed: true,
          },
          {
            title: 'KBZ Inbound FX Matched',
            description: `Auto-converted at rate ${rate} MMK/${curr}`,
            timestamp: dayjs().format('DD/MM/YYYY hh:mm A'),
            completed: true,
          },
          {
            title: 'Settled to Beneficiary Account',
            description: 'Final MMK settlement posted to 0091-2384-992019',
            timestamp: dayjs().format('DD/MM/YYYY hh:mm A'),
            completed: customData.status !== 'Pending',
            current: customData.status === 'Pending',
          },
        ],
      },
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));

    // Async persist to PostgreSQL backend
    fetch('/api/transactions/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx),
    }).catch((err) => console.warn('Could not persist simulated transaction to DB:', err));

    return newTx;
  },

  getFilteredTransactions: () => {
    const {
      transactions,
      searchTerm,
      statusFilter,
      currencyFilter,
      datePreset,
      customStartDate,
      customEndDate,
      sortField,
      sortDirection,
    } = get();

    let filtered = [...transactions];

    // Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.transactionRef.toLowerCase().includes(term) ||
          t.senderName.toLowerCase().includes(term) ||
          t.sendingBank.toLowerCase().includes(term) ||
          t.purpose.toLowerCase().includes(term) ||
          t.amount.toString().includes(term)
      );
    }

    // Status Filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Currency Filter
    if (currencyFilter !== 'ALL') {
      filtered = filtered.filter((t) => t.currency === currencyFilter);
    }

    // Date Preset Filter
    const now = dayjs();
    if (datePreset === 'today') {
      filtered = filtered.filter((t) => dayjs(t.valueDate).isSame(now, 'day'));
    } else if (datePreset === 'last7days') {
      const sevenDaysAgo = now.subtract(7, 'day').startOf('day');
      filtered = filtered.filter((t) => dayjs(t.valueDate).isAfter(sevenDaysAgo));
    } else if (datePreset === 'last30days') {
      const thirtyDaysAgo = now.subtract(30, 'day').startOf('day');
      filtered = filtered.filter((t) => dayjs(t.valueDate).isAfter(thirtyDaysAgo));
    } else if (datePreset === 'thisMonth') {
      filtered = filtered.filter((t) => dayjs(t.valueDate).isSame(now, 'month'));
    } else if (datePreset === 'custom') {
      if (customStartDate) {
        filtered = filtered.filter((t) =>
          dayjs(t.valueDate).isAfter(dayjs(customStartDate).startOf('day'))
        );
      }
      if (customEndDate) {
        filtered = filtered.filter((t) =>
          dayjs(t.valueDate).isBefore(dayjs(customEndDate).endOf('day'))
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'valueDate') {
        aVal = new Date(a.valueDate).getTime();
        bVal = new Date(b.valueDate).getTime();
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  },

  getStats: () => {
    const { transactions } = get();
    const completed = transactions.filter((t) => t.status === 'Completed');
    const pending = transactions.filter((t) => t.status === 'Pending');
    const failed = transactions.filter((t) => t.status === 'Failed');

    const totalInboundAmountMmk = completed.reduce(
      (sum, t) => sum + (t.netAmountMmk || t.convertedAmountMmk),
      0
    );

    // Approximate USD equivalent (MMK / 3550)
    const totalInboundAmountUsd = Math.round(totalInboundAmountMmk / 3550);

    const pendingAmountMmk = pending.reduce(
      (sum, t) => sum + (t.netAmountMmk || t.convertedAmountMmk),
      0
    );
    const pendingAmountUsd = Math.round(pendingAmountMmk / 3550);

    const today = dayjs();
    const todayInboundMmk = completed
      .filter((t) => dayjs(t.valueDate).isSame(today, 'day'))
      .reduce((sum, t) => sum + (t.netAmountMmk || t.convertedAmountMmk), 0);

    return {
      totalInboundAmountMmk,
      totalInboundAmountUsd,
      totalTransactionsCount: transactions.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      pendingAmountMmk,
      pendingAmountUsd,
      failedCount: failed.length,
      todayInboundMmk,
    };
  },
}));
