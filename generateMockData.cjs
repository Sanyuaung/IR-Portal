const fs = require('fs');

const fxRates = [
{ "currency": "USD", "buyRate": 2095.8, "sellRate": 2104.2, "middleRate": 2100, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "EUR", "buyRate": 2430.5, "sellRate": 2440.24, "middleRate": 2435.37, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "SGD", "buyRate": 1642.03, "sellRate": 1648.61, "middleRate": 1645.32, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "THB", "buyRate": 63.36, "sellRate": 63.62, "middleRate": 63.49, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "GBP", "buyRate": 2840.76, "sellRate": 2852.14, "middleRate": 2846.45, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "JPY", "buyRate": 1317.28, "sellRate": 1322.56, "middleRate": 1319.92, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "CNY", "buyRate": 311.03, "sellRate": 312.27, "middleRate": 311.65, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" },
{ "currency": "MYR", "buyRate": 516.02, "sellRate": 518.08, "middleRate": 517.05, "change24h": 0, "updatedAt": "2026-08-19T08:00:00.000Z" }
];

const statuses = ['success', 'failed', 'init', 'MFR'];
const txns = [];

const names = ["Aung Aung", "Maung Maung", "Kyaw Kyaw", "Tun Tun", "Aye Aye", "Su Su", "Mya Mya", "Hla Hla"];
const countries = ["USA", "Singapore", "Thailand", "UK", "Japan", "Malaysia", "China", "Europe"];
const banks = ["CitiBank", "DBS Bank", "Kasikornbank", "Barclays", "SMBC", "Maybank", "ICBC", "Deutsche Bank"];
const bics = ["CITIUS33", "DBSSSGSG", "KASITHBK", "BARCGB22", "SMBCJPJT", "MBBEMYKL", "ICBCCNBJ", "DEUTDEFF"];

let idCounter = 1000;
for (let i = 0; i < 50; i++) {
  const fx = fxRates[i % fxRates.length];
  const name = names[i % names.length];
  const country = countries[i % countries.length];
  const bank = banks[i % banks.length];
  const bic = bics[i % bics.length];
  
  const amount = Math.floor(Math.random() * 5000) + 100;
  const status = statuses[i % statuses.length];
  
  // Create past dates
  const valDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000) - (Math.random() * 10000000));
  
  txns.push({
    id: `tx_${idCounter++}`,
    transactionRef: `IR-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${String(Math.floor(Math.random()*100000)).padStart(5, '0')}-${i}`,
    senderName: name,
    senderCountry: country,
    sendingBank: bank,
    sendingBankBic: bic,
    currency: fx.currency,
    amount: amount,
    exchangeRate: fx.middleRate,
    convertedAmountMmk: amount * fx.middleRate,
    feeAmount: 5.0,
    netAmountMmk: (amount * fx.middleRate) - 5000,
    valueDate: valDate.toISOString(),
    status: status,
    statusMessage: status === 'success' ? 'Settled' : status === 'failed' ? 'Rejected' : 'Timeout',
    purpose: 'Family Support',
    beneficiaryAccount: `1042${String(Math.floor(Math.random()*1000000)).padStart(6, '0')}`,
    swiftMetadata: {
      messageType: 'MT103',
      uetr: '12345678-1234-1234-1234-1234567890ab'
    },
    createdAt: valDate.toISOString(),
    updatedAt: valDate.toISOString(),
  });
}

const fileContent = `import { InboundTransaction, FxRate } from '../types';

export const mockFxRates: FxRate[] = ${JSON.stringify(fxRates, null, 2)};

export const mockTransactions: InboundTransaction[] = ${JSON.stringify(txns, null, 2)};
`;

fs.writeFileSync('src/data/mockTransactions.ts', fileContent);

