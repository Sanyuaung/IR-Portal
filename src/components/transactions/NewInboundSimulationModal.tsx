import React, { useMemo, useState } from 'react';
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  Text,
  Paper,
  Divider,
} from '@mantine/core';
import { PlusCircle, Sparkles, Check, Building2 } from '../common/ui-icons';
import { useTransactionStore } from '../../store/useTransactionStore';
import { CurrencyCode, TransactionStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { notifications } from '@mantine/notifications';
import confetti from 'canvas-confetti';

interface RemittanceRoute {
  country: string;
  bank: string;
  bic: string;
  currency: CurrencyCode;
}

export const NewInboundSimulationModal: React.FC = () => {
  const {
    isSimulateModalOpen,
    setIsSimulateModalOpen,
    addSimulatedTransaction,
    transactions,
    fxRates,
  } = useTransactionStore();
  const routes = useMemo<RemittanceRoute[]>(() => {
    const routeByCountry = new Map<string, RemittanceRoute>();
    transactions.forEach((transaction) => {
      if (!routeByCountry.has(transaction.senderCountry)) {
        routeByCountry.set(transaction.senderCountry, {
          country: transaction.senderCountry,
          bank: transaction.sendingBank,
          bic: transaction.sendingBankBic,
          currency: transaction.currency,
        });
      }
    });
    return Array.from(routeByCountry.values()).sort((first, second) =>
      first.country.localeCompare(second.country)
    );
  }, [transactions]);
  const initialRoute = routes.find((route) => route.country === 'Singapore') || routes[0];

  const [senderName, setSenderName] = useState('DBS Trade Settlement Corp');
  const [senderCountry, setSenderCountry] = useState(initialRoute?.country || 'Singapore');
  const [sendingBank, setSendingBank] = useState(initialRoute?.bank || 'DBS Bank Singapore');
  const [sendingBankBic, setSendingBankBic] = useState(initialRoute?.bic || 'DBSSSGSG');
  const [currency, setCurrency] = useState<CurrencyCode>(initialRoute?.currency || 'USD');
  const [amount, setAmount] = useState<number | string | bigint>(75000);
  const [feeAmount, setFeeAmount] = useState<number | string | bigint>(30000);
  const [status, setStatus] = useState<TransactionStatus>('success');
  const [purpose, setPurpose] = useState('Export goods invoice settlement');

  const currentRate = fxRates.find((rate) => rate.currency === currency)?.middleRate || 3550;
  const numericAmount = typeof amount === 'number' ? amount : Number(amount) || 0;
  const numericFee = typeof feeAmount === 'number' ? feeAmount : Number(feeAmount) || 0;
  const convertedAmountMmk = Math.round(numericAmount * currentRate);
  const netAmountMmk = Math.max(convertedAmountMmk - numericFee, 0);

  const selectRoute = (country: string | null) => {
    const route = routes.find((item) => item.country === country) || initialRoute;
    if (!route) return;

    setSenderCountry(route.country);
    setSendingBank(route.bank);
    setSendingBankBic(route.bic);
    setCurrency(route.currency);
  };

  const handleSimulate = () => {
    if (!senderName.trim() || !purpose.trim() || numericAmount <= 0 || !sendingBankBic.trim()) {
      notifications.show({
        title: 'Complete the remittance details',
        message: 'Sender, route, amount, BIC, and payment purpose are required.',
        color: 'red',
      });
      return;
    }

    const newTx = addSimulatedTransaction({
      senderName: senderName.trim(),
      senderCountry,
      sendingBank,
      sendingBankBic: sendingBankBic.trim().toUpperCase(),
      currency,
      amount: numericAmount,
      feeAmount: numericFee,
      status,
      purpose: purpose.trim(),
    });

    setIsSimulateModalOpen(false);

    if (status === 'success') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    notifications.show({
      title: 'Incoming Remittance Posted',
      message: `${currency} ${numericAmount.toLocaleString()} from ${senderName} was added as ${newTx.transactionRef}.`,
      color: status === 'success' ? 'green' : status === 'init' || status === 'MFR' ? 'yellow' : 'red',
      icon: <Check size={16} />,
      autoClose: 5000,
    });
  };

  return (
    <Modal
      opened={isSimulateModalOpen}
      onClose={() => setIsSimulateModalOpen(false)}
      title={
        <div className="flex items-center gap-2 font-bold text-[#0B2B66] dark:text-blue-300">
          <Sparkles size={20} className="text-amber-500" />
          <span>Simulate Incoming International Remittance</span>
        </div>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        <Text size="xs" c="dimmed">
          Create a realistic inbound remittance using an existing transaction corridor. The new record is posted to the transaction table and updates the dashboard.
        </Text>

        <Paper p="sm" radius="md" withBorder className="border-blue-100 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/30/60">
          <div className="flex items-center gap-2">
            <Building2 size={17} className="text-[#0B2B66] dark:text-blue-300" />
            <div>
              <Text size="sm" fw={700} c="#0B2B66">Incoming corridor</Text>
              <Text size="xs" c="dimmed">Bank, BIC, and currency are prefilled from existing transaction data.</Text>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Sender country / region"
              data={routes.map((route) => ({ value: route.country, label: route.country }))}
              value={senderCountry}
              onChange={selectRoute}
              searchable
              required
            />
            <Select
              label="Originating bank"
              data={routes.map((route) => ({
                value: route.bank,
                label: `${route.bank} (${route.country})`,
              }))}
              value={sendingBank}
              onChange={(bank) => {
                const route = routes.find((item) => item.bank === bank) || initialRoute;
                if (route) selectRoute(route.country);
              }}
              searchable
              required
            />
            <TextInput
              label="SWIFT BIC"
              value={sendingBankBic}
              onChange={(event) => setSendingBankBic(event.currentTarget.value)}
              maxLength={11}
              required
            />
            <Select
              label="Remittance currency"
              data={fxRates.map((rate) => ({ value: rate.currency, label: rate.currency }))}
              value={currency}
              onChange={(value) => setCurrency((value || currency) as CurrencyCode)}
              required
            />
          </div>
        </Paper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextInput
            label="Ordering customer (sender)"
            placeholder="Company or individual name"
            value={senderName}
            onChange={(event) => setSenderName(event.currentTarget.value)}
            required
          />
          <Select
            label="Initial settlement status"
            data={[
              { value: 'success', label: 'Cleared and settled' },
              { value: 'init', label: 'Awaiting settlement' },
              { value: 'MFR', label: 'Manual review required' },
              { value: 'failed', label: 'Rejected / failed' },
            ]}
            value={status}
            onChange={(value) => setStatus((value || 'success') as TransactionStatus)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberInput
            label={`Incoming amount (${currency})`}
            value={amount}
            onChange={setAmount}
            min={1}
            thousandSeparator=","
            required
          />
          <NumberInput
            label="Settlement fee (MMK)"
            value={feeAmount}
            onChange={setFeeAmount}
            min={0}
            thousandSeparator=","
            required
          />
        </div>

        <TextInput
          label="Payment purpose (SWIFT field :70:)"
          placeholder="e.g. Export goods invoice settlement"
          value={purpose}
          onChange={(event) => setPurpose(event.currentTarget.value)}
          required
        />

        <Paper p="sm" radius="md" className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Text size="xs" fw={700} c="dark.8">Settlement preview</Text>
              <Text size="11px" c="dimmed">Live FX rate: 1 {currency} = {currentRate.toLocaleString()} MMK</Text>
            </div>
            <div className="text-right">
              <Text size="sm" fw={800} c="#0B2B66">{formatCurrency(netAmountMmk, 'MMK')}</Text>
              <Text size="11px" c="dimmed">after {formatCurrency(numericFee, 'MMK')} fee</Text>
            </div>
          </div>
        </Paper>

        <Divider />
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setIsSimulateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="corporateBlue"
            className="bg-[#0B2B66]"
            leftSection={<PlusCircle size={16} />}
            onClick={handleSimulate}
          >
            Post Incoming Remittance
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
