export type CurrencyCode = 'USD' | 'EUR' | 'SGD' | 'THB' | 'GBP' | 'JPY' | 'CNY' | 'MYR';

export type TransactionStatus = 'success' | 'failed' | 'init' | 'MFR';

export type ChargeType = 'OUR' | 'SHA' | 'BEN';

export interface SwiftMetadata {
  senderReference: string; // :20:
  bankOpCode: string; // :23B: (e.g. CRED)
  orderingCustomer: { // :50K:
    name: string;
    address: string;
    city: string;
    country: string;
    accountNumber?: string;
  };
  orderingInstitution: { // :52A:
    bic: string;
    name: string;
    branch: string;
    country: string;
  };
  intermediaryBank?: { // :56A:
    bic: string;
    name: string;
  };
  accountWithInstitution: { // :57A:
    bic: string;
    name: string;
    branch: string;
  };
  beneficiaryCustomer: { // :59:
    accountNumber: string;
    name: string;
    address: string;
  };
  remittanceInfo: string; // :70: (e.g., Invoice #INV-2026-883)
  detailsOfCharges: ChargeType; // :71A:
  uetr: string; // :121: Unique End-to-End Transaction Reference
  settlementChannel: 'SWIFT GPI' | 'SWIFT MT103' | 'RTGS' | 'CROSS-BORDER API';
  settlementSteps: {
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
    failed?: boolean;
  }[];
}

export interface InboundTransaction {
  id: string;
  transactionRef: string;
  senderName: string;
  senderCountry: string;
  sendingBank: string;
  sendingBankBic: string;
  currency: CurrencyCode;
  amount: number;
  exchangeRate: number; // to MMK
  convertedAmountMmk: number;
  feeAmount: number;
  netAmountMmk: number;
  valueDate: string; // ISO date string
  status: TransactionStatus;
  statusMessage?: string;
  purpose: string;
  beneficiaryAccount: string;
  swiftMetadata: SwiftMetadata;
}

export interface FxRate {
  currency: CurrencyCode;
  buyRate: number;
  sellRate: number;
  middleRate: number;
  change24h: number; // percentage e.g. +0.45%
  updatedAt: string;
}

export interface UserProfile {
  id?: string;
  merchantId: string;
  merchantName: string;
  name?: string;
  fullName?: string;
  companyName?: string;
  accountNumber: string;
  email: string;
  phone: string;
  role: string;
  branch: string;
  lastLogin: string;
  avatarUrl?: string;
  passwordStrength?: "Weak" | "Moderate" | "Strong";
}

export type TwoFactorMethod = 'totp' | 'email' | 'sms';

export interface SecuritySettings {
  is2FaEnabled: boolean;
  twoFactorMethod: TwoFactorMethod;
  emailForOtp: string;
  phoneForOtp: string;
  totpSecret: string;
  totpQrUrl: string;
  totpVerified: boolean;
  emailVerified: boolean;
  backupCodes: string[];
  loginAlerts: boolean;
  inboundAlertThreshold: number;
  dailySummaryEmail: boolean;
  passwordStrength?: 'Weak' | 'Moderate' | 'Strong';
}
