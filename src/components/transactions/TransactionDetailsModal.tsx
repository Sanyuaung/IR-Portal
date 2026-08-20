import React, { useState } from 'react';
import {
  Modal,
  Group,
  Text,
  Badge,
  Button,
  Tabs,
  Paper,
  Divider,
  Timeline,
  ActionIcon,
  Tooltip,
  CopyButton,
  Grid,
} from '@mantine/core';
import {
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Download,
  Building2,
  ArrowRight,
  ShieldCheck,
  Globe2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
} from '../common/ui-icons';
import { useTransactionStore } from '../../store/useTransactionStore';
import { StatusBadge } from '../common/StatusBadge';
import { formatCurrency, formatDate, formatNumber } from '../../utils/formatters';
import { exportSingleTransactionAdvice } from '../../utils/export';
import { notifications } from '@mantine/notifications';

export const TransactionDetailsModal: React.FC = () => {
  const { selectedTransaction, isDetailsModalOpen, setIsDetailsModalOpen } = useTransactionStore();
  const [activeTab, setActiveTab] = useState<string | null>('swift');

  if (!selectedTransaction) return null;

  const tx = selectedTransaction;
  const meta = tx.swiftMetadata;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAdvice = () => {
    exportSingleTransactionAdvice(tx);
    notifications.show({
      title: 'SWIFT Advice Generated',
      message: `Downloaded SWIFT MT103 advice statement for ${tx.transactionRef}`,
      color: 'blue',
      icon: <Check size={16} />,
    });
  };

  return (
    <Modal
      opened={isDetailsModalOpen}
      onClose={() => setIsDetailsModalOpen(false)}
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0B2B66]/10 flex items-center justify-center text-[#0B2B66]">
            <FileText size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Text fw={700} size="md" c="slate.9">
                Transaction Advice & SWIFT Details
              </Text>
              <StatusBadge status={tx.status} size="sm" />
            </div>
            <Text size="xs" c="dimmed">
              Reference: <span className="font-mono font-medium text-slate-700">{tx.transactionRef}</span>
            </Text>
          </div>
        </div>
      }
      size="xl"
      centered
      padding="lg"
    >
      <div id="swift-advice-print-area">
        {/* Header Summary Banner */}
        <Paper p="md" radius="md" className="bg-slate-50 border border-slate-200 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Text size="xs" c="dimmed" fw={600}>
                INBOUND REMITTANCE AMOUNT
              </Text>
              <div className="flex items-baseline gap-2 mt-0.5">
                <Text size="xl" fw={800} c="#0B2B66" className="tracking-tight">
                  {formatCurrency(tx.amount, tx.currency)}
                </Text>
                <Badge variant="outline" color="blue" size="sm">
                  {tx.currency}
                </Badge>
              </div>
              <Text size="xs" c="dimmed" mt={1}>
                Exchange Rate: 1 {tx.currency} = <span className="font-semibold text-slate-700">{formatNumber(tx.exchangeRate)} MMK</span>
              </Text>
            </div>

            <div className="sm:border-l sm:border-slate-200 sm:pl-4">
              <Text size="xs" c="dimmed" fw={600}>
                NET SETTLEMENT CREDITED
              </Text>
              <Text size="xl" fw={800} c="emerald.8" className="tracking-tight mt-0.5 text-emerald-700">
                {formatCurrency(tx.netAmountMmk, 'MMK')}
              </Text>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <span>Fee: {formatNumber(tx.feeAmount)} MMK</span>
                <span>•</span>
                <span>Value Date: {formatDate(tx.valueDate, 'DD/MM/YYYY')}</span>
              </div>
            </div>
          </div>
        </Paper>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List className="mb-4">
            <Tabs.Tab value="swift" leftSection={<Globe2 size={16} />}>
              SWIFT MT103 Metadata
            </Tabs.Tab>
            <Tabs.Tab value="parties" leftSection={<Building2 size={16} />}>
              Sender & Beneficiary
            </Tabs.Tab>
            <Tabs.Tab value="timeline" leftSection={<Clock size={16} />}>
              Settlement Tracking
            </Tabs.Tab>
          </Tabs.List>

          {/* SWIFT MT103 Metadata Tab */}
          <Tabs.Panel value="swift">
            <div className="space-y-3">
              <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-xs overflow-x-auto shadow-inner">
                <div className="flex justify-between items-center text-slate-400 pb-2 border-b border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>SWIFT MT103 / ISO 15022 SINGLE CUSTOMER CREDIT TRANSFER</span>
                  </div>
                  <Badge size="xs" color="blue" variant="filled">
                    {meta.settlementChannel}
                  </Badge>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:20: TRN</div>
                  <div className="col-span-9 text-slate-200 flex items-center justify-between">
                    <span>{meta.senderReference}</span>
                    <CopyButton value={meta.senderReference} timeout={2000}>
                      {({ copied, copy }) => (
                        <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </ActionIcon>
                      )}
                    </CopyButton>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:23B: Bank Op Code</div>
                  <div className="col-span-9 text-slate-200">{meta.bankOpCode} (CRED - Standard Credit Transfer)</div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:32A: Value/Curr/Amt</div>
                  <div className="col-span-9 text-amber-300 font-semibold">
                    {formatDate(tx.valueDate, 'YYMMDD')} {tx.currency} {formatNumber(tx.amount)}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:50K: Ordering Customer</div>
                  <div className="col-span-9 text-slate-200">
                    <div>{meta.orderingCustomer.name}</div>
                    <div className="text-slate-400 text-[11px]">{meta.orderingCustomer.address}, {meta.orderingCustomer.country}</div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:52A: Ordering Inst.</div>
                  <div className="col-span-9 text-slate-200">
                    {meta.orderingInstitution.bic} - {meta.orderingInstitution.name}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:57A: Account Inst.</div>
                  <div className="col-span-9 text-slate-200">
                    {meta.accountWithInstitution.bic} - {meta.accountWithInstitution.name} ({meta.accountWithInstitution.branch})
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:59: Beneficiary Cust.</div>
                  <div className="col-span-9 text-slate-200">
                    <div className="text-emerald-400 font-bold">/{meta.beneficiaryCustomer.accountNumber}</div>
                    <div>{meta.beneficiaryCustomer.name}</div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:70: Remittance Info</div>
                  <div className="col-span-9 text-slate-300 italic">{meta.remittanceInfo}</div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1">
                  <div className="col-span-3 text-cyan-400 font-bold">:71A: Details of Charges</div>
                  <div className="col-span-9 text-slate-200 font-bold">
                    {meta.detailsOfCharges} ({meta.detailsOfCharges === 'OUR' ? 'All sender side' : meta.detailsOfCharges === 'SHA' ? 'Shared charges' : 'Beneficiary pays'})
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2 py-1 border-t border-slate-800 mt-2 pt-2">
                  <div className="col-span-3 text-emerald-400 font-bold">:121: UETR Ref</div>
                  <div className="col-span-9 text-slate-300 text-[11px] flex items-center justify-between">
                    <span>{meta.uetr}</span>
                    <CopyButton value={meta.uetr} timeout={2000}>
                      {({ copied, copy }) => (
                        <ActionIcon size="xs" color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </ActionIcon>
                      )}
                    </CopyButton>
                  </div>
                </div>
              </div>
            </div>
          </Tabs.Panel>

          {/* Sender & Beneficiary Tab */}
          <Tabs.Panel value="parties">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Paper withBorder p="md" radius="md" className="border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-3 text-[#0B2B66] font-semibold text-sm">
                  <Building2 size={18} />
                  <span>Ordering Party (Sender)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <Text c="dimmed">Company / Individual Name</Text>
                    <Text fw={600} className="text-slate-800">{meta.orderingCustomer.name}</Text>
                  </div>
                  <div>
                    <Text c="dimmed">Originating Bank</Text>
                    <Text fw={600} className="text-slate-800">{tx.sendingBank}</Text>
                    <Text size="xs" c="dimmed">BIC: {tx.sendingBankBic}</Text>
                  </div>
                  <div>
                    <Text c="dimmed">Sender Address</Text>
                    <Text className="text-slate-700">{meta.orderingCustomer.address}, {tx.senderCountry}</Text>
                  </div>
                </div>
              </Paper>

              <Paper withBorder p="md" radius="md" className="border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-3 text-[#0B2B66] font-semibold text-sm">
                  <ShieldCheck size={18} />
                  <span>Beneficiary Customer (Recipient)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <Text c="dimmed">Beneficiary Corporate Name</Text>
                    <Text fw={600} className="text-slate-800">{meta.beneficiaryCustomer.name}</Text>
                  </div>
                  <div>
                    <Text c="dimmed">KBZ Settlement Account</Text>
                    <Text fw={700} className="text-[#0B2B66] font-mono text-sm">{tx.beneficiaryAccount}</Text>
                  </div>
                  <div>
                    <Text c="dimmed">Receiving Institution</Text>
                    <Text fw={600} className="text-slate-800">Kanbawza Bank Limited (KBZ Bank)</Text>
                    <Text size="xs" c="dimmed">Yangon Main Corporate Branch • BIC: KBZMMMYM</Text>
                  </div>
                </div>
              </Paper>
            </div>
          </Tabs.Panel>

          {/* Settlement Tracking Timeline Tab */}
          <Tabs.Panel value="timeline">
            <Paper withBorder p="md" radius="md" className="border-slate-200 bg-white">
              <Text size="sm" fw={600} c="slate.8" mb="md">
                End-to-End SWIFT GPI Milestone Status
              </Text>
              <Timeline active={meta.settlementSteps.filter((s) => s.completed).length - 1} bulletSize={24} lineWidth={2}>
                {meta.settlementSteps.map((step, idx) => (
                  <Timeline.Item
                    key={idx}
                    bullet={
                      step.failed ? (
                        <AlertCircle size={14} className="text-rose-600" />
                      ) : step.completed ? (
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      ) : (
                        <Clock size={14} className="text-amber-500" />
                      )
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <Text size="sm" fw={600} c={step.failed ? 'red.7' : 'slate.8'}>
                          {step.title}
                        </Text>
                        {step.current && (
                          <Badge size="xs" color="yellow" variant="filled">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    }
                  >
                    <Text size="xs" c="dimmed">
                      {step.description}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4} className="font-mono">
                      {step.timestamp}
                    </Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Paper>
          </Tabs.Panel>
        </Tabs>

        <Divider my="md" />

        {/* Modal Actions */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              leftSection={<Download size={15} />}
              onClick={handleDownloadAdvice}
            >
              Download Advice (TXT)
            </Button>
            <Button
              variant="default"
              size="sm"
              leftSection={<Printer size={15} />}
              onClick={handlePrint}
            >
              Print Statement
            </Button>
          </div>

          <Button
            color="corporateBlue"
            className="bg-[#0B2B66]"
            onClick={() => setIsDetailsModalOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
