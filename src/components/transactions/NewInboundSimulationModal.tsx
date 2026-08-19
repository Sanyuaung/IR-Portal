import React, { useState } from 'react';
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
} from '@mantine/core';
import { PlusCircle, Sparkles, Check } from 'lucide-react';
import { useTransactionStore } from '../../store/useTransactionStore';
import { CurrencyCode, TransactionStatus } from '../../types';
import { notifications } from '@mantine/notifications';
import confetti from 'canvas-confetti';

export const NewInboundSimulationModal: React.FC = () => {
  const { isSimulateModalOpen, setIsSimulateModalOpen, addSimulatedTransaction } = useTransactionStore();

  const [senderName, setSenderName] = useState('DBS Trade Settlement Corp');
  const [senderCountry, setSenderCountry] = useState('Singapore');
  const [sendingBank, setSendingBank] = useState('DBS Bank Singapore');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [amount, setAmount] = useState<number | string>(75000);
  const [status, setStatus] = useState<TransactionStatus>('Completed');
  const [purpose, setPurpose] = useState('Export Goods Final Payment Batch #8839');

  const handleSimulate = () => {
    const numAmt = typeof amount === 'number' ? amount : parseFloat(amount) || 50000;

    const newTx = addSimulatedTransaction({
      senderName,
      senderCountry,
      sendingBank,
      currency,
      amount: numAmt,
      status,
      purpose,
    });

    setIsSimulateModalOpen(false);

    // Fire celebratory confetti if completed
    if (status === 'Completed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore in tests
      }
    }

    notifications.show({
      title: 'Incoming Remittance Received',
      message: `Received ${currency} ${numAmt.toLocaleString()} from ${senderName} (${newTx.transactionRef})`,
      color: status === 'Completed' ? 'green' : status === 'Pending' ? 'yellow' : 'red',
      icon: <Check size={16} />,
      autoClose: 5000,
    });
  };

  return (
    <Modal
      opened={isSimulateModalOpen}
      onClose={() => setIsSimulateModalOpen(false)}
      title={
        <div className="flex items-center gap-2 font-bold text-[#0B2B66]">
          <Sparkles size={20} className="text-amber-500" />
          <span>Simulate Incoming International Remittance</span>
        </div>
      }
      size="md"
      centered
    >
      <Stack gap="sm">
        <Text size="xs" c="dimmed">
          Simulate a new incoming SWIFT MT103 credit message to test real-time dashboard analytics and transaction list updates.
        </Text>

        <TextInput
          label="Ordering Customer (Sender Name)"
          placeholder="e.g. Acme Global Logistics Pte Ltd"
          value={senderName}
          onChange={(e) => setSenderName(e.currentTarget.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Sender Country"
            data={[
              { value: 'Singapore', label: '🇸🇬 Singapore' },
              { value: 'United States', label: '🇺🇸 United States' },
              { value: 'Thailand', label: '🇹🇭 Thailand' },
              { value: 'Germany', label: '🇩🇪 Germany' },
              { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
              { value: 'Japan', label: '🇯🇵 Japan' },
              { value: 'China', label: '🇨🇳 China' },
              { value: 'Malaysia', label: '🇲🇾 Malaysia' },
            ]}
            value={senderCountry}
            onChange={(val) => val && setSenderCountry(val)}
          />

          <Select
            label="Originating Bank"
            data={[
              { value: 'DBS Bank Singapore', label: 'DBS Bank SG' },
              { value: 'Citibank N.A. New York', label: 'Citibank N.A.' },
              { value: 'Bangkok Bank PCL', label: 'Bangkok Bank' },
              { value: 'Deutsche Bank AG', label: 'Deutsche Bank' },
              { value: 'Standard Chartered Bank', label: 'Standard Chartered' },
              { value: 'SMBC Tokyo', label: 'SMBC Tokyo' },
              { value: 'Bank of China', label: 'Bank of China' },
            ]}
            value={sendingBank}
            onChange={(val) => val && setSendingBank(val)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Currency"
            data={[
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'SGD', label: 'SGD (S$)' },
              { value: 'THB', label: 'THB (฿)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'JPY', label: 'JPY (¥)' },
              { value: 'CNY', label: 'CNY (¥)' },
              { value: 'MYR', label: 'MYR (RM)' },
            ]}
            value={currency}
            onChange={(val) => val && setCurrency(val as CurrencyCode)}
          />

          <NumberInput
            label="Remittance Amount"
            value={amount}
            onChange={(val) => setAmount(val)}
            min={100}
            step={5000}
          />
        </div>

        <Select
          label="Initial Status"
          data={[
            { value: 'Completed', label: '✅ Completed (Directly Settled)' },
            { value: 'Pending', label: '⏳ Pending (Compliance Review)' },
            { value: 'Failed', label: '❌ Failed (Discrepancy / Rejected)' },
          ]}
          value={status}
          onChange={(val) => val && setStatus(val as TransactionStatus)}
        />

        <TextInput
          label="Remittance Purpose / Field :70:"
          value={purpose}
          onChange={(e) => setPurpose(e.currentTarget.value)}
        />

        <Paper p="xs" radius="sm" className="bg-blue-50/50 border border-blue-100 text-xs text-blue-800">
          💡 The transaction will be posted with full SWIFT GPI tracking, simulated exchange rate conversion, and notification alert.
        </Paper>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setIsSimulateModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="corporateBlue"
            className="bg-[#0B2B66]"
            leftSection={<PlusCircle size={16} />}
            onClick={handleSimulate}
          >
            Post Inbound Wire
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
