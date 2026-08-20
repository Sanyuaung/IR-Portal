// src/server/server.ts
import path from "path";
import fs from "fs";
import express2 from "express";

// src/server/app.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";
import speakeasy2 from "speakeasy";
import QRCode from "qrcode";
import crypto3 from "crypto";

// src/server/db.ts
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
var rawDbUrl = (process.env.DATABASE_URL || "").trim().replace(/^["']|["']$/g, "");
var connectionString = rawDbUrl && (rawDbUrl.startsWith("postgres://") || rawDbUrl.startsWith("postgresql://")) ? rawDbUrl : "postgresql://neondb_owner:npg_4SwEzqo1GRMZ@ep-mute-cake-a1eppdph-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
var pool = new pg.Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 3e4,
  connectionTimeoutMillis: 1e4
});
pool.on("error", (err) => {
  console.error("[DB_POOL_ERROR] Unexpected database pool error:", err?.message || err);
});

// src/server/seed.ts
import crypto from "crypto";

// src/data/mockTransactions.ts
import dayjs from "dayjs";
var mockFxRates = [
  {
    currency: "USD",
    buyRate: 3540,
    sellRate: 3560,
    middleRate: 3550,
    change24h: 0.28,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "EUR",
    buyRate: 3810,
    sellRate: 3835,
    middleRate: 3822.5,
    change24h: -0.15,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "SGD",
    buyRate: 2675,
    sellRate: 2690,
    middleRate: 2682,
    change24h: 0.42,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "THB",
    buyRate: 101.8,
    sellRate: 103.2,
    middleRate: 102.5,
    change24h: 0.12,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "GBP",
    buyRate: 4480,
    sellRate: 4515,
    middleRate: 4498,
    change24h: -0.35,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "JPY",
    buyRate: 23.4,
    sellRate: 24.1,
    middleRate: 23.75,
    change24h: 0.05,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "CNY",
    buyRate: 490,
    sellRate: 496,
    middleRate: 493,
    change24h: 0.18,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    currency: "MYR",
    buyRate: 785,
    sellRate: 795,
    middleRate: 790,
    change24h: -0.08,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var now = dayjs();
var mockTransactions = [
  {
    id: "tx-001",
    transactionRef: "IR-2026-SG-994821",
    senderName: "Apex Logistics Global Pte Ltd",
    senderCountry: "Singapore",
    sendingBank: "DBS Bank Singapore",
    sendingBankBic: "DBSSSGSG",
    currency: "USD",
    amount: 145e3,
    exchangeRate: 3550,
    convertedAmountMmk: 51475e4,
    feeAmount: 5e4,
    netAmountMmk: 5147e5,
    valueDate: now.subtract(12, "minute").toISOString(),
    status: "Completed",
    purpose: "Commercial Invoicing - Ocean Freight & Container Clearance",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "APX-2026-08819",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Apex Logistics Global Pte Ltd",
        address: "12 Marina Boulevard, Marina Bay Financial Centre Tower 3",
        city: "Singapore",
        country: "Singapore",
        accountNumber: "003-902910-1"
      },
      orderingInstitution: {
        bic: "DBSSSGSGXXX",
        name: "DBS Bank Ltd Singapore",
        branch: "Marina Bay Financial Centre Branch",
        country: "Singapore"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited (KBZ Bank)",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "INV#EXP-2026-9901 / Freight forwarding settlement Q3",
      detailsOfCharges: "OUR",
      uetr: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated by DBS Bank SG via SWIFT GPI",
          timestamp: now.subtract(45, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Intermediary Clearing",
          description: "Passed international sanctions & AML compliance filter",
          timestamp: now.subtract(30, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "KBZ Inbound Processing",
          description: "Auto-FX matched at rate 3,550.00 MMK/USD",
          timestamp: now.subtract(18, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds cleared to Account 0091-2384-992019",
          timestamp: now.subtract(12, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-002",
    transactionRef: "IR-2026-US-883190",
    senderName: "Vanguard Tech Solutions Inc.",
    senderCountry: "United States",
    sendingBank: "Citibank N.A. New York",
    sendingBankBic: "CITIUS33",
    currency: "USD",
    amount: 82500,
    exchangeRate: 3550,
    convertedAmountMmk: 292875e3,
    feeAmount: 35e3,
    netAmountMmk: 29284e4,
    valueDate: now.subtract(42, "minute").toISOString(),
    status: "Completed",
    purpose: "Software Engineering Services & Offshore Delivery Milestone 4",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "VANGUARD-US-4491",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Vanguard Tech Solutions Inc.",
        address: "388 Greenwich Street, New York, NY 10013",
        city: "New York",
        country: "United States",
        accountNumber: "882019481"
      },
      orderingInstitution: {
        bic: "CITIUS33XXX",
        name: "Citibank N.A.",
        branch: "Wall Street Operations",
        country: "United States"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "PO-88231 IT Consulting August 2026 Retainer",
      detailsOfCharges: "SHA",
      uetr: "3b241101-e2bb-4255-8caf-4136c566a964",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated by Citibank NA via SWIFT GPI",
          timestamp: now.subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Intermediary Clearing",
          description: "Cleared Fedwire & Correspondent Nostro",
          timestamp: now.subtract(1, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "KBZ Inbound Processing",
          description: "FX Conversion confirmed",
          timestamp: now.subtract(50, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Settled successfully in MMK",
          timestamp: now.subtract(42, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-003",
    transactionRef: "IR-2026-TH-773012",
    senderName: "Siam Agro Industries Co., Ltd.",
    senderCountry: "Thailand",
    sendingBank: "Bangkok Bank Public Company",
    sendingBankBic: "BKKBTHTH",
    currency: "THB",
    amount: 185e4,
    exchangeRate: 102.5,
    convertedAmountMmk: 189625e3,
    feeAmount: 25e3,
    netAmountMmk: 1896e5,
    valueDate: now.subtract(1, "hour").subtract(15, "minute").toISOString(),
    status: "Pending",
    purpose: "Agricultural Commodities & Fertilizer Import Consignment",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SIAM-BKK-0929",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Siam Agro Industries Co., Ltd.",
        address: "333 Silom Road, Bangrak, Bangkok 10500",
        city: "Bangkok",
        country: "Thailand",
        accountNumber: "101-992-8831"
      },
      orderingInstitution: {
        bic: "BKKBTHTHXXX",
        name: "Bangkok Bank PCL",
        branch: "Head Office Silom",
        country: "Thailand"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "LC Ref # LC-KBZ-TH-202608 / Bill of Lading BL#88219",
      detailsOfCharges: "OUR",
      uetr: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      settlementChannel: "SWIFT MT103",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated by Bangkok Bank PCL",
          timestamp: now.subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Compliance Document Review",
          description: "Verifying trade supporting documents and invoice proof",
          timestamp: now.subtract(1, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          current: true
        },
        {
          title: "KBZ Treasury FX Matching",
          description: "Pending document release for treasury rate lock",
          timestamp: "Pending",
          completed: false
        },
        {
          title: "Settlement",
          description: "Will credit into 0091-2384-992019 upon officer sign-off",
          timestamp: "Pending",
          completed: false
        }
      ]
    }
  },
  {
    id: "tx-004",
    transactionRef: "IR-2026-EU-662910",
    senderName: "EuroLux Pharma Distribution SA",
    senderCountry: "Luxembourg",
    sendingBank: "BNP Paribas Luxembourg",
    sendingBankBic: "BNPALULL",
    currency: "EUR",
    amount: 46800,
    exchangeRate: 3822.5,
    convertedAmountMmk: 178893e3,
    feeAmount: 4e4,
    netAmountMmk: 178853e3,
    valueDate: now.subtract(2, "hour").subtract(30, "minute").toISOString(),
    status: "Completed",
    purpose: "Medical Supplies & WHO Certified Laboratory Equipment",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "EURLUX-INV-9921",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "EuroLux Pharma Distribution SA",
        address: "16 Boulevard Royal, L-2449 Luxembourg",
        city: "Luxembourg",
        country: "Luxembourg"
      },
      orderingInstitution: {
        bic: "BNPALULLXXX",
        name: "BNP Paribas",
        branch: "Luxembourg Corporate Center",
        country: "Luxembourg"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "EU-PHARMA-BATCH-20260812 / Vaccine cold chain components",
      detailsOfCharges: "OUR",
      uetr: "4f964023-e186-4e50-9854-469b82142e2a",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment initiated in EUR via Target2 / SWIFT",
          timestamp: now.subtract(4, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Intermediary Clearing",
          description: "Approved by European Central Bank clearing gateway",
          timestamp: now.subtract(3, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "KBZ Inbound Processing",
          description: "EUR to MMK converted at 3,822.50 MMK",
          timestamp: now.subtract(2, "hour").subtract(40, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Direct credit completed",
          timestamp: now.subtract(2, "hour").subtract(30, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-005",
    transactionRef: "IR-2026-SG-551829",
    senderName: "SingaPay Financial Services Pte Ltd",
    senderCountry: "Singapore",
    sendingBank: "OCBC Bank Singapore",
    sendingBankBic: "OCBCSGSG",
    currency: "SGD",
    amount: 11e4,
    exchangeRate: 2682,
    convertedAmountMmk: 29502e4,
    feeAmount: 3e4,
    netAmountMmk: 29499e4,
    valueDate: now.subtract(3, "hour").toISOString(),
    status: "Completed",
    purpose: "Cross-Border Merchant Payouts & Settlement Batch 401",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SG-PAY-2026-778",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "SingaPay Financial Services Pte Ltd",
        address: "65 Chulia Street, OCBC Centre",
        city: "Singapore",
        country: "Singapore"
      },
      orderingInstitution: {
        bic: "OCBCSGSGXXX",
        name: "Oversea-Chinese Banking Corporation Ltd",
        branch: "OCBC Centre Branch",
        country: "Singapore"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "E-commerce merchant gateway daily settlement",
      detailsOfCharges: "OUR",
      uetr: "88a31902-39c4-4b47-814d-54128f7a6379",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment submitted via FAST / SWIFT GPI",
          timestamp: now.subtract(4, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Nostro Settlement",
          description: "KBZ SG Nostro Account credited",
          timestamp: now.subtract(3, "hour").subtract(20, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds available in account",
          timestamp: now.subtract(3, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-006",
    transactionRef: "IR-2026-UK-441209",
    senderName: "Caledonian Maritime Energy Ltd",
    senderCountry: "United Kingdom",
    sendingBank: "Standard Chartered Bank London",
    sendingBankBic: "SCBLGB2L",
    currency: "GBP",
    amount: 35e3,
    exchangeRate: 4498,
    convertedAmountMmk: 15743e4,
    feeAmount: 45e3,
    netAmountMmk: 157385e3,
    valueDate: now.subtract(5, "hour").toISOString(),
    status: "Completed",
    purpose: "Offshore Drilling Engineering Inspection Retainer",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SCB-LON-UK-9182",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Caledonian Maritime Energy Ltd",
        address: "1 Basinghall Avenue, London EC2V 5DD",
        city: "London",
        country: "United Kingdom"
      },
      orderingInstitution: {
        bic: "SCBLGB2LXXX",
        name: "Standard Chartered Bank",
        branch: "London Principal Office",
        country: "United Kingdom"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "INV#UK-2026-4401 Technical advisory offshore project",
      detailsOfCharges: "SHA",
      uetr: "1a938cde-8419-485a-ba38-124801e91c77",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Initiated via Standard Chartered London",
          timestamp: now.subtract(6, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Completed and confirmed",
          timestamp: now.subtract(5, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-007",
    transactionRef: "IR-2026-JP-330918",
    senderName: "Tokyo Electronic Components Corp",
    senderCountry: "Japan",
    sendingBank: "Sumitomo Mitsui Banking Corp (SMBC)",
    sendingBankBic: "SMBCJPJT",
    currency: "JPY",
    amount: 145e5,
    exchangeRate: 23.75,
    convertedAmountMmk: 344375e3,
    feeAmount: 6e4,
    netAmountMmk: 344315e3,
    valueDate: now.subtract(8, "hour").toISOString(),
    status: "Completed",
    purpose: "Industrial Micro-controller Units & Semiconductor Parts",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "SMBC-TYO-99120",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Tokyo Electronic Components Corp",
        address: "1-1-2 Marunouchi, Chiyoda-ku, Tokyo 100-0005",
        city: "Tokyo",
        country: "Japan"
      },
      orderingInstitution: {
        bic: "SMBCJPJTXXX",
        name: "Sumitomo Mitsui Banking Corporation",
        branch: "Tokyo Head Office",
        country: "Japan"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "PO#JP-ELEC-44093 / Customs clearance ready",
      detailsOfCharges: "OUR",
      uetr: "5f918029-47bb-4001-a128-984410e2fa41",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment dispatched from Tokyo",
          timestamp: now.subtract(9, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Processed in MMK to merchant account",
          timestamp: now.subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-008",
    transactionRef: "IR-2026-MY-229103",
    senderName: "Kuala Lumpur Palm Agri Tech Sdn Bhd",
    senderCountry: "Malaysia",
    sendingBank: "Maybank (Malayan Banking Berhad)",
    sendingBankBic: "MBBEMYKL",
    currency: "MYR",
    amount: 16e4,
    exchangeRate: 790,
    convertedAmountMmk: 1264e5,
    feeAmount: 2e4,
    netAmountMmk: 12638e4,
    valueDate: now.subtract(14, "hour").toISOString(),
    status: "Failed",
    statusMessage: "Ordering institution account number mismatch with declaration",
    purpose: "Refined Edible Oils Export Contract #KL-082",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "MBB-KL-88210",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Kuala Lumpur Palm Agri Tech Sdn Bhd",
        address: "Menara Maybank, 100 Jalan Tun Perak, 50050 Kuala Lumpur",
        city: "Kuala Lumpur",
        country: "Malaysia"
      },
      orderingInstitution: {
        bic: "MBBEMYKLXXX",
        name: "Malayan Banking Berhad",
        branch: "Kuala Lumpur Main Branch",
        country: "Malaysia"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "Palm olein grade A consignment invoice 8820",
      detailsOfCharges: "BEN",
      uetr: "9e881023-4122-4411-bd21-0029418eab88",
      settlementChannel: "SWIFT MT103",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Received via Maybank Kuala Lumpur",
          timestamp: now.subtract(16, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Compliance Validation",
          description: "Beneficiary TIN / Import Permit number discrepancy rejected by CBM clearing rules",
          timestamp: now.subtract(14, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          failed: true
        },
        {
          title: "Return to Sender (SWIFT MT199)",
          description: "Dispatched return advice to ordering institution",
          timestamp: now.subtract(13, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-009",
    transactionRef: "IR-2026-US-118274",
    senderName: "Horizon Pacific Trading Corp",
    senderCountry: "United States",
    sendingBank: "JPMorgan Chase Bank, N.A.",
    sendingBankBic: "CHASUS33",
    currency: "USD",
    amount: 22e4,
    exchangeRate: 3550,
    convertedAmountMmk: 781e6,
    feeAmount: 5e4,
    netAmountMmk: 78095e4,
    valueDate: now.subtract(1, "day").toISOString(),
    status: "Completed",
    purpose: "Heavy Industrial Solar Panels & Inverters Procurement",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "JPMC-NY-992100",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Horizon Pacific Trading Corp",
        address: "270 Park Ave, New York, NY 10017",
        city: "New York",
        country: "United States"
      },
      orderingInstitution: {
        bic: "CHASUS33XXX",
        name: "JPMorgan Chase Bank, N.A.",
        branch: "New York Global Clearing",
        country: "United States"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "SOLAR-GRID-IMPORT-MM-2026-08 / Clean energy grant project",
      detailsOfCharges: "OUR",
      uetr: "22b91841-5582-411a-8800-4718293e5510",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Dispatched via JPMorgan Chase Fedwire",
          timestamp: now.subtract(1, "day").subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds cleared and reflected in MMK account",
          timestamp: now.subtract(1, "day").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-010",
    transactionRef: "IR-2026-CN-009182",
    senderName: "Shenzhen Microtek Semiconductor Co., Ltd.",
    senderCountry: "China",
    sendingBank: "Bank of China (BOC)",
    sendingBankBic: "BKCHCNBJ",
    currency: "CNY",
    amount: 55e4,
    exchangeRate: 493,
    convertedAmountMmk: 27115e4,
    feeAmount: 3e4,
    netAmountMmk: 27112e4,
    valueDate: now.subtract(1, "day").subtract(5, "hour").toISOString(),
    status: "Completed",
    purpose: "Telecommunications Fibre Optic Cables & Transceivers",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "BOC-SZ-2026-4418",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Shenzhen Microtek Semiconductor Co., Ltd.",
        address: "Fuxing Road, Futian District, Shenzhen, Guangdong",
        city: "Shenzhen",
        country: "China"
      },
      orderingInstitution: {
        bic: "BKCHCNBJXXX",
        name: "Bank of China Limited",
        branch: "Shenzhen Special Economic Zone Branch",
        country: "China"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "CIPS direct clearing / Optical hardware settlement",
      detailsOfCharges: "OUR",
      uetr: "33e89124-7712-421b-aa31-5918239e9921",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "CIPS Cross-Border direct message",
          timestamp: now.subtract(1, "day").subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Settled to account",
          timestamp: now.subtract(1, "day").subtract(5, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-011",
    transactionRef: "IR-2026-SG-990142",
    senderName: "Temasek Sea Logistics Hub Pte Ltd",
    senderCountry: "Singapore",
    sendingBank: "United Overseas Bank (UOB)",
    sendingBankBic: "UOVBSGSG",
    currency: "USD",
    amount: 67400,
    exchangeRate: 3550,
    convertedAmountMmk: 23927e4,
    feeAmount: 35e3,
    netAmountMmk: 239235e3,
    valueDate: now.subtract(2, "day").toISOString(),
    status: "Completed",
    purpose: "Port Terminal Handling Charges & Vessel Bunkering Settlement",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "UOB-SG-99218",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Temasek Sea Logistics Hub Pte Ltd",
        address: "80 Raffles Place, UOB Plaza 1",
        city: "Singapore",
        country: "Singapore"
      },
      orderingInstitution: {
        bic: "UOVBSGSGXXX",
        name: "United Overseas Bank Limited",
        branch: "Raffles Place Branch",
        country: "Singapore"
      },
      accountWithInstitution: {
        bic: "KBZMMMYMXXX",
        name: "Kanbawza Bank Limited",
        branch: "Yangon Main Corporate Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "KBZ Golden Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "INV#TMSK-2026-0811 Marine fuel bunker invoice",
      detailsOfCharges: "OUR",
      uetr: "44a89100-1123-4e41-b829-192837465019",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Processed via UOB SWIFT GPI",
          timestamp: now.subtract(2, "day").subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to Beneficiary",
          description: "Funds cleared to account",
          timestamp: now.subtract(2, "day").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-012",
    transactionRef: "IR-2026-DE-882710",
    senderName: "Bavaria Industrial Machinery GmbH",
    senderCountry: "Germany",
    sendingBank: "Deutsche Bank Frankfurt",
    sendingBankBic: "DEUTDEDD",
    currency: "EUR",
    amount: 195e3,
    exchangeRate: 3822.5,
    convertedAmountMmk: 745387500,
    feeAmount: 75e3,
    netAmountMmk: 745312500,
    valueDate: now.subtract(2, "day").subtract(6, "hour").toISOString(),
    status: "Pending",
    purpose: "Turnkey Hydro-Turbine Generator Spare Parts",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "DB-FRA-2026-90",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Bavaria Industrial Machinery GmbH",
        address: "Taunusanlage 12, 60325 Frankfurt am Main",
        city: "Frankfurt",
        country: "Germany"
      },
      orderingInstitution: {
        bic: "DEUTDEDDXXX",
        name: "Deutsche Bank AG",
        branch: "Frankfurt Head Office",
        country: "Germany"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Main Settlement Branch"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Myanmar Horizon Trading Co., Ltd.",
        address: "No. 45 Strand Road, Kyauktada Township, Yangon"
      },
      remittanceInfo: "HYDRO-DE-INV-009 / LC#LC-2026-GER-441",
      detailsOfCharges: "OUR",
      uetr: "66d81920-3321-4991-8842-591820491028",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment dispatched via Deutsche Bank Frankfurt",
          timestamp: now.subtract(2, "day").subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Under Foreign Exchange Settlement Allocation Review",
          description: "High-value remittance awaiting routine compliance authorization",
          timestamp: now.subtract(2, "day").subtract(6, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          current: true
        },
        {
          title: "Final Settlement",
          description: "Expected to credit on next clearance batch",
          timestamp: "Pending",
          completed: false
        }
      ]
    }
  },
  {
    id: "tx-011",
    transactionRef: "IR-2026-JP-449102",
    senderName: "Tokyo Precision Robotics Inc.",
    senderCountry: "Japan",
    sendingBank: "Mitsubishi UFJ Financial Group (MUFG)",
    sendingBankBic: "BOTKJPJTXXX",
    currency: "JPY",
    amount: 185e5,
    exchangeRate: 23.75,
    convertedAmountMmk: 439375e3,
    feeAmount: 35e3,
    netAmountMmk: 43934e4,
    valueDate: now.subtract(3, "hour").subtract(15, "minute").toISOString(),
    status: "Completed",
    purpose: "Industrial Automation & CNC Spare Parts Supply Contract",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "MUFG-TYO-991240",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Tokyo Precision Robotics Inc.",
        address: "2-7-1 Marunouchi, Chiyoda-ku, Tokyo 100-8388",
        city: "Tokyo",
        country: "Japan",
        accountNumber: "JP-9918-0029-41"
      },
      orderingInstitution: {
        bic: "BOTKJPJTXXX",
        name: "MUFG Bank Ltd.",
        branch: "Tokyo Head Office",
        country: "Japan"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Apex Myanmar Industrial Supply Ltd.",
        address: "Pyay Road, Hlaing Township, Yangon"
      },
      remittanceInfo: "PO-2026-JPN-8812 / CNC-CONT-991",
      detailsOfCharges: "SHA",
      uetr: "aa491028-1120-4991-88f2-901847102911",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Payment Instructed",
          description: "MUFG Bank Tokyo originated wire",
          timestamp: now.subtract(3, "hour").subtract(15, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "FX Conversion Quoted",
          description: "Locked at 23.75 MMK per JPY",
          timestamp: now.subtract(3, "hour").subtract(5, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to MMK Account",
          description: "Beneficiary account 0091-2384-992019 credited in full",
          timestamp: now.subtract(3, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-012",
    transactionRef: "IR-2026-AE-773819",
    senderName: "Gulf Horizon Petrochemical FZE",
    senderCountry: "United Arab Emirates",
    sendingBank: "First Abu Dhabi Bank (FAB)",
    sendingBankBic: "FABAAEADXXX",
    currency: "USD",
    amount: 32e4,
    exchangeRate: 3550,
    convertedAmountMmk: 1136e6,
    feeAmount: 6e4,
    netAmountMmk: 113594e4,
    valueDate: now.subtract(5, "hour").subtract(40, "minute").toISOString(),
    status: "Completed",
    purpose: "Import of Bitumen & Construction Raw Materials (Containerized)",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "FAB-DXB-2026-3391",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Gulf Horizon Petrochemical FZE",
        address: "Jebel Ali Free Zone, Building 4B, Dubai",
        city: "Dubai",
        country: "United Arab Emirates",
        accountNumber: "AE-3918-4491-002"
      },
      orderingInstitution: {
        bic: "FABAAEADXXX",
        name: "First Abu Dhabi Bank PJSC",
        branch: "Dubai Main Financial Centre",
        country: "United Arab Emirates"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Corporate Center"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Myanmar Infrastructure & Logistics Co., Ltd.",
        address: "No. 88 Merchant Street, Yangon"
      },
      remittanceInfo: "INV#GULF-MM-9941 / BL#DXB-YGN-2026",
      detailsOfCharges: "OUR",
      uetr: "ff881920-5541-4771-a892-339182049182",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Wire Debited in UAE",
          description: "FAB Dubai processed MT103",
          timestamp: now.subtract(5, "hour").subtract(40, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Remittance Cleared",
          description: "MMK 1,135,940,000 net settlement verified",
          timestamp: now.subtract(5, "hour").subtract(20, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-013",
    transactionRef: "IR-2026-MY-119284",
    senderName: "Selangor Agro Commodity Sdn Bhd",
    senderCountry: "Malaysia",
    sendingBank: "Maybank (Malayan Banking Berhad)",
    sendingBankBic: "MBBEMYKLXXX",
    currency: "MYR",
    amount: 28e4,
    exchangeRate: 790,
    convertedAmountMmk: 2212e5,
    feeAmount: 25e3,
    netAmountMmk: 221175e3,
    valueDate: now.subtract(8, "hour").toISOString(),
    status: "Completed",
    purpose: "Refined Palm Oil & Agri Derivative Bulk Shipment Settlement",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "MYB-KL-882910",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Selangor Agro Commodity Sdn Bhd",
        address: "Menara Maybank, 100 Jalan Tun Perak, Kuala Lumpur",
        city: "Kuala Lumpur",
        country: "Malaysia",
        accountNumber: "MY-5519-2049-11"
      },
      orderingInstitution: {
        bic: "MBBEMYKLXXX",
        name: "Malayan Banking Berhad",
        branch: "Kuala Lumpur Main Branch",
        country: "Malaysia"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Golden Myanmar Agro Trade Co., Ltd.",
        address: "Bayintnaung Wholesale Market, Mayangone, Yangon"
      },
      remittanceInfo: "AGRO-MY-INV-2026-778",
      detailsOfCharges: "BEN",
      uetr: "cc281900-4491-4991-b992-118471029482",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Initiated",
          description: "Payment released from Maybank Kuala Lumpur",
          timestamp: now.subtract(8, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Conversion Settled",
          description: "280,000 MYR converted to 221,175,000 MMK",
          timestamp: now.subtract(7, "hour").subtract(45, "minute").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-014",
    transactionRef: "IR-2026-KR-993812",
    senderName: "Seoul Semiconductor Components Corp",
    senderCountry: "South Korea",
    sendingBank: "KB Kookmin Bank",
    sendingBankBic: "CZNBKRSEXXX",
    currency: "USD",
    amount: 195e3,
    exchangeRate: 3550,
    convertedAmountMmk: 69225e4,
    feeAmount: 45e3,
    netAmountMmk: 692205e3,
    valueDate: now.subtract(14, "hour").toISOString(),
    status: "Pending",
    purpose: "Procurement of Microcontroller Units & LED Assemblies",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "KB-SEL-99120",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Seoul Semiconductor Components Corp",
        address: "Gangnam-daero, Seocho-gu, Seoul 06621",
        city: "Seoul",
        country: "South Korea",
        accountNumber: "KR-9918-2049-11"
      },
      orderingInstitution: {
        bic: "CZNBKRSEXXX",
        name: "KB Kookmin Bank",
        branch: "Seoul Corporate Branch",
        country: "South Korea"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Central Clearing Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Yangon High-Tech Components Ltd.",
        address: "Thilawa Special Economic Zone (SEZ), Yangon"
      },
      remittanceInfo: "INVOICE#KOR-SEZ-8839",
      detailsOfCharges: "OUR",
      uetr: "88a91028-3319-4881-c772-901847102911",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Remittance Instructed",
          description: "Payment dispatched via KB Kookmin Bank Seoul",
          timestamp: now.subtract(14, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Inbound Clearance & FX Locking",
          description: "Transaction undergoing standard settlement matching",
          timestamp: now.subtract(13, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: false,
          current: true
        },
        {
          title: "Credited to MMK Account",
          description: "Beneficiary MMK payout pending final release",
          timestamp: "Pending",
          completed: false
        }
      ]
    }
  },
  {
    id: "tx-015",
    transactionRef: "IR-2026-GB-884910",
    senderName: "Thames Maritime & Insurance Services Ltd",
    senderCountry: "United Kingdom",
    sendingBank: "Barclays Bank UK PLC",
    sendingBankBic: "BARCGB22XXX",
    currency: "GBP",
    amount: 65e3,
    exchangeRate: 4498,
    convertedAmountMmk: 29237e4,
    feeAmount: 3e4,
    netAmountMmk: 29234e4,
    valueDate: now.subtract(1, "day").subtract(2, "hour").toISOString(),
    status: "Completed",
    purpose: "Marine Cargo Hull Insurance Claim Payout - Vessel MV Ayeyarwady Star",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "BARC-LON-2026-449",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Thames Maritime & Insurance Services Ltd",
        address: "1 Churchill Place, Canary Wharf, London E14 5HP",
        city: "London",
        country: "United Kingdom",
        accountNumber: "GB-29-BARC-2004-991"
      },
      orderingInstitution: {
        bic: "BARCGB22XXX",
        name: "Barclays Bank PLC",
        branch: "London Head Office",
        country: "United Kingdom"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Ayeyarwady Marine Shipping Co., Ltd.",
        address: "Pansodan Street, Kyauktada, Yangon"
      },
      remittanceInfo: "CLAIM#MAR-2026-004491-INS",
      detailsOfCharges: "OUR",
      uetr: "44e81920-7719-4881-a992-118471029482",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Payment Executed in London",
          description: "Barclays London initiated international wire",
          timestamp: now.subtract(1, "day").subtract(2, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "MMK Funds Deposited",
          description: "292,340,000 MMK settled into beneficiary account",
          timestamp: now.subtract(1, "day").subtract(1, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  },
  {
    id: "tx-016",
    transactionRef: "IR-2026-TH-663819",
    senderName: "Siam Consumer Goods & Retail PCL",
    senderCountry: "Thailand",
    sendingBank: "Kasikornbank (KBank)",
    sendingBankBic: "KASITHBKXXX",
    currency: "THB",
    amount: 15e5,
    exchangeRate: 102.5,
    convertedAmountMmk: 15375e4,
    feeAmount: 2e4,
    netAmountMmk: 15373e4,
    valueDate: now.subtract(1, "day").subtract(6, "hour").toISOString(),
    status: "Completed",
    purpose: "FMCG Packaged Goods Export Invoice Clearing - Mae Sot / Myawaddy Gateway",
    beneficiaryAccount: "0091-2384-992019",
    swiftMetadata: {
      senderReference: "KBANK-BKK-99182",
      bankOpCode: "CRED",
      orderingCustomer: {
        name: "Siam Consumer Goods & Retail PCL",
        address: "400/22 Phahon Yothin Rd, Samsen Nai, Phaya Thai, Bangkok",
        city: "Bangkok",
        country: "Thailand",
        accountNumber: "TH-004-9918-22"
      },
      orderingInstitution: {
        bic: "KASITHBKXXX",
        name: "Kasikornbank Public Company Limited",
        branch: "Bangkok Head Office",
        country: "Thailand"
      },
      accountWithInstitution: {
        bic: "MMGRMMYMXXX",
        name: "Myanmar Global Remittance Gateway",
        branch: "Yangon Settlement Hub"
      },
      beneficiaryCustomer: {
        accountNumber: "0091-2384-992019",
        name: "Myanmar Royal FMCG Distributors Ltd.",
        address: "Bayintnaung Road, Yangon"
      },
      remittanceInfo: "INV#SIAM-FMCG-2026-992",
      detailsOfCharges: "SHA",
      uetr: "11b91028-8819-4771-c882-901847102911",
      settlementChannel: "SWIFT GPI",
      settlementSteps: [
        {
          title: "Dispatched via KBank",
          description: "1,500,000 THB wire instruction verified",
          timestamp: now.subtract(1, "day").subtract(6, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        },
        {
          title: "Credited to MMK Account",
          description: "153,730,000 MMK settled via cross-border payment link",
          timestamp: now.subtract(1, "day").subtract(5, "hour").format("DD/MM/YYYY hh:mm A"),
          completed: true
        }
      ]
    }
  }
];

// src/server/seed.ts
var ENCRYPTION_SALT = "KBZ_IR_PORTAL_SECURE_SALT_2026";
function hashPassword(password) {
  return crypto.createHash("sha256").update(password + ENCRYPTION_SALT).digest("hex");
}
async function ensureDatabaseSchema(existingClient) {
  const client = existingClient || await pool.connect();
  try {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TwoFactorMethod" AS ENUM ('EMAIL', 'GOOGLE_AUTH');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "companyName" TEXT,
        "phone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyName" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;`);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "User" ADD CONSTRAINT "User_email_unique" UNIQUE ("email");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TwoFactorAuth" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "isEnabled" BOOLEAN NOT NULL DEFAULT false,
        "method" "TwoFactorMethod" NOT NULL DEFAULT 'EMAIL',
        "secret" TEXT,
        "backupCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
        "emailOtp" TEXT,
        "emailOtpExpiry" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "TwoFactorAuth" ADD CONSTRAINT "TwoFactorAuth_userId_unique" UNIQUE ("userId");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "InboundTransaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "transactionRef" TEXT NOT NULL,
        "senderName" TEXT NOT NULL,
        "senderCountry" TEXT NOT NULL,
        "sendingBank" TEXT NOT NULL,
        "sendingBankBic" TEXT NOT NULL,
        "currency" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "exchangeRate" DOUBLE PRECISION NOT NULL,
        "convertedAmountMmk" DOUBLE PRECISION NOT NULL,
        "feeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "netAmountMmk" DOUBLE PRECISION NOT NULL,
        "valueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "status" TEXT NOT NULL DEFAULT 'Completed',
        "statusMessage" TEXT,
        "purpose" TEXT NOT NULL,
        "beneficiaryAccount" TEXT NOT NULL,
        "swiftMetadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "FxRate" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "currency" TEXT NOT NULL,
        "buyRate" DOUBLE PRECISION NOT NULL,
        "sellRate" DOUBLE PRECISION NOT NULL,
        "middleRate" DOUBLE PRECISION NOT NULL,
        "change24h" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "FxRate" ADD CONSTRAINT "FxRate_currency_unique" UNIQUE ("currency");
      EXCEPTION
        WHEN duplicate_object THEN null;
        WHEN duplicate_table THEN null;
      END $$;
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT,
        "action" TEXT NOT NULL,
        "details" JSONB,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "TwoFactorAuth_userId_idx" ON "TwoFactorAuth"("userId");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "InboundTransaction_txRef_idx" ON "InboundTransaction"("transactionRef");`);
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS "FxRate_curr_idx" ON "FxRate"("currency");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_status_idx" ON "InboundTransaction"("status");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_currency_idx" ON "InboundTransaction"("currency");`);
    await client.query(`CREATE INDEX IF NOT EXISTS "InboundTransaction_valueDate_idx" ON "InboundTransaction"("valueDate");`);
  } catch (schemaErr) {
    console.warn("[SCHEMA_ENSURE_WARN]", schemaErr?.message || schemaErr);
  } finally {
    if (!existingClient) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
}
async function seedDatabase() {
  const client = await pool.connect();
  try {
    console.log("\u26A1 Initializing and migrating PostgreSQL database tables...");
    await ensureDatabaseSchema(client);
    const encryptedPassword = hashPassword("password");
    const defaultUsers = [
      {
        id: "usr_sanyuaung_01",
        name: "SanYuAung",
        email: "sanyuaung.ygn.mm@gmail.com",
        companyName: "Myanmar Horizon Trading Co., Ltd.",
        phone: "+95 9 798 112 889",
        password: encryptedPassword
      },
      {
        id: "usr_sya_kbz_02",
        name: "SYA_KBZ",
        email: "sanyu.aung@kbzbank.com",
        companyName: "KBZ Bank Co., Ltd.",
        phone: "+95 9 798 112 889",
        password: encryptedPassword
      },
      {
        id: "usr_sya_kbz_03",
        name: "SYA_KBZ",
        email: "sanyu.aung.kbzbank.com",
        companyName: "KBZ Bank Co., Ltd.",
        phone: "+95 9 798 112 889",
        password: encryptedPassword
      }
    ];
    for (const u of defaultUsers) {
      const userRes = await client.query(
        `
        INSERT INTO "User" ("id", "name", "email", "password", "companyName", "phone", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT ("email")
        DO UPDATE SET "password" = $4, "name" = $2, "companyName" = $5, "phone" = $6, "updatedAt" = NOW()
        RETURNING "id";
      `,
        [u.id, u.name, u.email, u.password, u.companyName, u.phone]
      );
      const actualUserId = userRes.rows[0].id;
      await client.query(
        `
        INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "updatedAt")
        VALUES ($1, $2, false, 'EMAIL', NOW())
        ON CONFLICT ("userId") DO NOTHING;
      `,
        [`tfa_${actualUserId}`, actualUserId]
      );
    }
    for (const fx of mockFxRates) {
      await client.query(
        `
        INSERT INTO "FxRate" ("id", "currency", "buyRate", "sellRate", "middleRate", "change24h", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ("currency")
        DO UPDATE SET
          "buyRate" = $3,
          "sellRate" = $4,
          "middleRate" = $5,
          "change24h" = $6,
          "updatedAt" = $7;
      `,
        [
          `fx_${fx.currency.toLowerCase()}`,
          fx.currency,
          fx.buyRate,
          fx.sellRate,
          fx.middleRate,
          fx.change24h,
          new Date(fx.updatedAt)
        ]
      );
    }
    for (const tx of mockTransactions) {
      await client.query(
        `
        INSERT INTO "InboundTransaction" (
          "id",
          "transactionRef",
          "senderName",
          "senderCountry",
          "sendingBank",
          "sendingBankBic",
          "currency",
          "amount",
          "exchangeRate",
          "convertedAmountMmk",
          "feeAmount",
          "netAmountMmk",
          "valueDate",
          "status",
          "statusMessage",
          "purpose",
          "beneficiaryAccount",
          "swiftMetadata",
          "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
        ON CONFLICT ("id")
        DO UPDATE SET
          "transactionRef" = $2,
          "senderName" = $3,
          "senderCountry" = $4,
          "sendingBank" = $5,
          "sendingBankBic" = $6,
          "currency" = $7,
          "amount" = $8,
          "exchangeRate" = $9,
          "convertedAmountMmk" = $10,
          "feeAmount" = $11,
          "netAmountMmk" = $12,
          "valueDate" = $13,
          "status" = $14,
          "statusMessage" = $15,
          "purpose" = $16,
          "beneficiaryAccount" = $17,
          "swiftMetadata" = $18,
          "updatedAt" = NOW();
      `,
        [
          tx.id,
          tx.transactionRef,
          tx.senderName,
          tx.senderCountry,
          tx.sendingBank,
          tx.sendingBankBic,
          tx.currency,
          tx.amount,
          tx.exchangeRate,
          tx.convertedAmountMmk,
          tx.feeAmount || 0,
          tx.netAmountMmk,
          new Date(tx.valueDate),
          tx.status,
          tx.statusMessage || null,
          tx.purpose,
          tx.beneficiaryAccount,
          JSON.stringify(tx.swiftMetadata || {})
        ]
      );
    }
    console.log(`\u2705 Database migration complete: Seeded ${mockTransactions.length} transactions, ${mockFxRates.length} FX rates, and default users.`);
  } catch (error) {
    console.error("Database migration/seed error:", error);
  } finally {
    client.release();
  }
}

// src/lib/prisma.ts
var isSeedingPromise = null;
var tablesInitialized = false;
async function ensureTablesReady() {
  if (tablesInitialized) return;
  if (!isSeedingPromise) {
    isSeedingPromise = ensureDatabaseSchema().then(() => {
      tablesInitialized = true;
    }).catch((err) => {
      console.error("[PRISMA_INIT_WARN] Warning during auto table initialization:", err?.message || err);
    }).finally(() => {
      isSeedingPromise = null;
    });
  }
  await isSeedingPromise;
}
var FALLBACK_USERS = [
  {
    id: "usr_sanyuaung_01",
    name: "San Yu Aung",
    email: "sanyuaung.ygn.mm@gmail.com",
    companyName: "Myanmar Horizon Trading Co., Ltd.",
    phone: "+95 9 798 112 889",
    password: hashPassword("password"),
    twoFactorAuth: { isEnabled: false, method: "EMAIL" }
  },
  {
    id: "usr_sya_kbz_02",
    name: "San Yu Aung",
    email: "sanyu.aung@kbzbank.com",
    companyName: "KBZ Bank Co., Ltd.",
    phone: "+95 9 798 112 889",
    password: hashPassword("password"),
    twoFactorAuth: { isEnabled: false, method: "EMAIL" }
  },
  {
    id: "usr_sya_kbz_03",
    name: "San Yu Aung",
    email: "sanyu.aung.kbzbank.com",
    companyName: "KBZ Bank Co., Ltd.",
    phone: "+95 9 798 112 889",
    password: hashPassword("password"),
    twoFactorAuth: { isEnabled: false, method: "EMAIL" }
  }
];
var prisma = {
  user: {
    async findUnique({ where, include }) {
      try {
        const client = await pool.connect();
        try {
          let query = `SELECT * FROM "User" WHERE `;
          const params = [];
          if (where.email) {
            query += `LOWER(email) = LOWER($1)`;
            params.push(where.email.trim());
          } else if (where.id) {
            query += `id = $1`;
            params.push(where.id);
          } else {
            return null;
          }
          const userRes = await client.query(query, params);
          const user2 = userRes.rows[0];
          if (!user2) {
            const fallback = FALLBACK_USERS.find(
              (u) => where.email && u.email.toLowerCase() === where.email.trim().toLowerCase() || where.id && u.id === where.id
            );
            return fallback || null;
          }
          if (include?.twoFactorAuth) {
            try {
              const tfaRes = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [user2.id]);
              user2.twoFactorAuth = tfaRes.rows[0] || null;
            } catch (tfaErr) {
              user2.twoFactorAuth = { isEnabled: false, method: "EMAIL" };
            }
          }
          return user2;
        } finally {
          client.release();
        }
      } catch (dbErr) {
        console.warn("findUnique caught error, attempting ensureTablesReady:", dbErr?.message);
        if (dbErr?.code === "42P01" || dbErr?.message?.includes("does not exist")) {
          await ensureTablesReady();
          try {
            const client = await pool.connect();
            try {
              let query = `SELECT * FROM "User" WHERE `;
              const params = [];
              if (where.email) {
                query += `LOWER(email) = LOWER($1)`;
                params.push(where.email.trim());
              } else if (where.id) {
                query += `id = $1`;
                params.push(where.id);
              }
              const userRes = await client.query(query, params);
              return userRes.rows[0] || null;
            } finally {
              client.release();
            }
          } catch (retryErr) {
            console.error("findUnique retry error:", retryErr);
          }
        }
        const fallback = FALLBACK_USERS.find(
          (u) => where.email && u.email.toLowerCase() === where.email.trim().toLowerCase() || where.id && u.id === where.id
        );
        return fallback || null;
      }
    },
    async create({ data }) {
      try {
        const client = await pool.connect();
        try {
          const id = data.id || `usr_${Date.now()}`;
          const res = await client.query(
            `INSERT INTO "User" ("id", "email", "name", "password", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())
             RETURNING *`,
            [id, data.email.trim().toLowerCase(), data.name || "", data.password]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err) {
        if (err?.code === "42P01" || err?.message?.includes("does not exist")) {
          await ensureTablesReady();
          const client = await pool.connect();
          try {
            const id = data.id || `usr_${Date.now()}`;
            const res = await client.query(
              `INSERT INTO "User" ("id", "email", "name", "password", "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, NOW(), NOW())
               RETURNING *`,
              [id, data.email.trim().toLowerCase(), data.name || "", data.password]
            );
            return res.rows[0];
          } finally {
            client.release();
          }
        }
        throw err;
      }
    }
  },
  twoFactorAuth: {
    async findUnique({ where }) {
      try {
        const client = await pool.connect();
        try {
          const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [where.userId]);
          return res.rows[0] || null;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("twoFactorAuth.findUnique error:", err?.message);
        return { isEnabled: false, method: "EMAIL", userId: where.userId };
      }
    },
    async update({ where, data }) {
      try {
        const client = await pool.connect();
        try {
          const updates = [];
          const params = [];
          let idx = 1;
          Object.keys(data).forEach((key) => {
            updates.push(`"${key}" = $${idx}`);
            params.push(data[key]);
            idx++;
          });
          updates.push(`"updatedAt" = NOW()`);
          let whereClause = "";
          if (where.userId) {
            whereClause = `"userId" = $${idx}`;
            params.push(where.userId);
          } else if (where.id) {
            whereClause = `"id" = $${idx}`;
            params.push(where.id);
          }
          const res = await client.query(
            `UPDATE "TwoFactorAuth" SET ${updates.join(", ")} WHERE ${whereClause} RETURNING *`,
            params
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("twoFactorAuth.update error:", err?.message);
        return { isEnabled: false, method: "EMAIL", ...data };
      }
    }
  }
};

// src/lib/auth.ts
import crypto2 from "crypto";
var ENCRYPTION_SALT2 = process.env.AUTH_SALT || "KBZ_IR_PORTAL_SECURE_SALT_2026";
var JWT_SECRET = process.env.JWT_SECRET || "KBZ_JWT_SECRET_SUPER_SECURE_KEY_2026";
var AuthUtils = class {
  /**
   * Hashes plain text password with SHA-256 and secure salt
   */
  static async hashPassword(password) {
    return crypto2.createHash("sha256").update(password + ENCRYPTION_SALT2).digest("hex");
  }
  /**
   * Compares plain password with stored hash
   */
  static async comparePassword(plain, hash) {
    const hashed = await this.hashPassword(plain);
    return hashed === hash || hash === plain;
  }
  /**
   * Generates a temporary token for 2FA verification challenge
   */
  static generateTempToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1e3),
        exp: Math.floor(Date.now() / 1e3) + 10 * 60
        // 10 minutes
      })
    ).toString("base64url");
    const signature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  }
  /**
   * Generates a full access token for authenticated session
   */
  static generateAccessToken(payload) {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({
        ...payload,
        iat: Math.floor(Date.now() / 1e3),
        exp: Math.floor(Date.now() / 1e3) + 7 * 24 * 60 * 60
        // 7 days
      })
    ).toString("base64url");
    const signature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  }
  /**
   * Verifies and decodes a token
   */
  static verifyToken(token) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;
      const [header, body, signature] = parts;
      const expectedSignature = crypto2.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
      if (signature !== expectedSignature) return null;
      const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1e3)) return null;
      return decoded;
    } catch {
      return null;
    }
  }
};

// src/lib/two-factor.ts
import speakeasy from "speakeasy";

// src/server/email.ts
import nodemailer from "nodemailer";
var host = process.env.MAIL_HOST || "smtp.gmail.com";
var port = parseInt(process.env.MAIL_PORT || "587", 10);
var user = process.env.MAIL_USERNAME || "sanyuaung.ygn.mm@gmail.com";
var pass = process.env.MAIL_PASSWORD || "xpkbqrjshoayiomx";
var fromName = process.env.MAIL_FROM_NAME || "KBZ Bank IR Portal";
var fromAddress = process.env.MAIL_FROM_ADDRESS || "sanyuaung.ygn.mm@gmail.com";
var transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: {
    user,
    pass
  },
  tls: {
    rejectUnauthorized: false
  }
});
async function sendOtpEmail(toEmail, otpCode, recipientName) {
  const cleanRecipient = (toEmail || "").trim();
  if (!cleanRecipient) {
    console.error("[SMTP] No recipient email specified");
    return { success: false, error: "Recipient email is required" };
  }
  const name = recipientName || cleanRecipient.split("@")[0] || "Valued Customer";
  const subject = `[KBZ Bank IR Portal] Your 2FA Security Code: ${otpCode}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0B2B66; padding: 28px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 12px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .otp-box { background: #f8fafc; border: 2px dashed #0B2B66; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #0B2B66; margin: 0; }
        .otp-sub { font-size: 12px; color: #64748b; margin-top: 8px; }
        .warning { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #92400e; margin-bottom: 24px; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>KBZ BANK</h1>
          <p>Inbound Remittance Portal</p>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${name}</div>
          <div class="text">
            You recently requested a Two-Factor Authentication (2FA) verification code to authenticate your session on the KBZ Bank Inbound Remittance Portal.
          </div>
          <div class="otp-box">
            <div class="otp-code">${otpCode}</div>
            <div class="otp-sub">This verification code is valid for 1 minute (60 seconds)</div>
          </div>
          <div class="warning">
            <strong>Security Notice:</strong> Never share this code with anyone. KBZ Bank staff will never ask for your password or 2FA OTP code.
          </div>
          <div class="text" style="font-size: 12px; color: #64748b; margin-bottom: 0;">
            Sent to your registered email: <strong>${cleanRecipient}</strong><br>
            If you did not initiate this request, please contact KBZ Bank Security Operations immediately.
          </div>
        </div>
        <div class="footer">
          \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Kanbawza Bank Limited (KBZ Bank). All rights reserved.<br>
          Yangon Main Corporate Branch \u2022 Security & Compliance Dept
        </div>
      </div>
    </body>
    </html>
  `;
  const text = `KBZ BANK - Inbound Remittance Portal

Your Two-Factor Authentication (2FA) Verification Code is: ${otpCode}

This code will expire in 1 minute (60 seconds). Never share this code with anyone.
Sent to: ${cleanRecipient}`;
  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: cleanRecipient,
      subject,
      text,
      html
    });
    console.log(`[SMTP] 2FA Email sent successfully to ${cleanRecipient}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipients: cleanRecipient };
  } catch (err) {
    console.error(`[SMTP] Failed to send email to ${cleanRecipient}:`, err);
    return { success: false, error: err.message };
  }
}

// src/lib/two-factor.ts
var TwoFactorService = class {
  /**
   * Generates and stores a 6-digit email OTP for the user in Neon DB and sends real email via SMTP
   */
  static async sendEmailOtp(userId, targetEmail) {
    const client = await pool.connect();
    try {
      let email = targetEmail;
      let name = "";
      if (!email) {
        const uRes = await client.query(`SELECT email, name FROM "User" WHERE id = $1 OR email = $1`, [userId]);
        if (uRes.rows.length > 0) {
          email = uRes.rows[0].email;
          name = uRes.rows[0].name;
        }
      }
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiry = new Date(Date.now() + 1 * 60 * 1e3);
      await client.query(
        `UPDATE "TwoFactorAuth"
         SET "emailOtp" = $1, "emailOtpExpiry" = $2, "updatedAt" = NOW()
         WHERE "userId" = $3`,
        [otp, expiry, userId]
      );
      if (email) {
        await sendOtpEmail(email, otp, name);
      }
      return {
        success: true,
        otp,
        expiry,
        message: `Security OTP sent to ${email || userId}`
      };
    } finally {
      client.release();
    }
  }
  /**
   * Verifies OTP or Google Authenticator TOTP code
   */
  static async verifyCode(userId, code) {
    const client = await pool.connect();
    try {
      const res = await client.query(`SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`, [userId]);
      const tfa = res.rows[0];
      if (!tfa || !tfa.isEnabled) return false;
      const cleanCode = code.trim().toUpperCase();
      if (tfa.method === "GOOGLE_AUTH") {
        if (tfa.secret && cleanCode.length === 6) {
          const valid = speakeasy.totp.verify({
            secret: tfa.secret,
            encoding: "base32",
            token: cleanCode,
            window: 6
          });
          if (valid) return true;
        }
        if (tfa.backupCodes && tfa.backupCodes.includes(cleanCode)) {
          const remaining = tfa.backupCodes.filter((c) => c !== cleanCode);
          await client.query(`UPDATE "TwoFactorAuth" SET "backupCodes" = $1 WHERE "id" = $2`, [remaining, tfa.id]);
          return true;
        }
        return false;
      } else {
        if (!tfa.emailOtp || !tfa.emailOtpExpiry || /* @__PURE__ */ new Date() > new Date(tfa.emailOtpExpiry)) {
          return false;
        }
        const valid = tfa.emailOtp === cleanCode;
        if (valid) {
          await client.query(`UPDATE "TwoFactorAuth" SET "emailOtp" = NULL, "emailOtpExpiry" = NULL WHERE "id" = $1`, [
            tfa.id
          ]);
        }
        return valid;
      }
    } finally {
      client.release();
    }
  }
};

// src/server/app.ts
dotenv2.config();
var app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  if (req.url.startsWith("/api/index")) {
    req.url = req.url.replace("/api/index", "") || "/";
    if (!req.url.startsWith("/api") && req.url !== "/") {
      req.url = "/api" + req.url;
    }
  }
  next();
});
ensureDatabaseSchema().catch((err) => {
  console.warn("[DB_INIT_WARN] Schema auto-verification:", err?.message || err);
});
if (process.env.ENABLE_DB_SEED === "true") {
  seedDatabase().catch((err) => console.error("[DB_SEED_WARN] Seed error:", err?.message || err));
}
app.get(["/api/health", "/health"], async (req, res) => {
  try {
    const dbRes = await pool.query("SELECT NOW()");
    res.json({ status: "ok", database: "connected", time: dbRes.rows[0].now });
  } catch (err) {
    res.status(200).json({ status: "degraded", database: "offline_fallback", message: err?.message || "DB cold standby" });
  }
});
app.post(["/api/auth/login", "/auth/login", "/login"], async (req, res) => {
  const requestTime = (/* @__PURE__ */ new Date()).toISOString();
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      console.warn(`[AUTH_LOGIN_VALIDATION_ERROR] Missing credentials at ${requestTime}`);
      return res.status(400).json({
        success: false,
        error: "Both Email and Password are required to sign in."
      });
    }
    const cleanEmail = String(email).trim().toLowerCase();
    console.log(`[AUTH_LOGIN_ATTEMPT] Target: ${cleanEmail} | Time: ${requestTime}`);
    let user2 = null;
    try {
      user2 = await prisma.user.findUnique({
        where: { email: cleanEmail }
      });
    } catch (dbError) {
      console.error(`[AUTH_LOGIN_DB_ERROR] Query failed for ${cleanEmail}:`, {
        message: dbError?.message,
        code: dbError?.code,
        stack: dbError?.stack
      });
      try {
        await ensureDatabaseSchema();
        user2 = await prisma.user.findUnique({
          where: { email: cleanEmail }
        });
      } catch (retryError) {
        console.error(`[AUTH_LOGIN_RETRY_ERROR] Recovery query failed for ${cleanEmail}:`, retryError?.message);
      }
    }
    if (!user2) {
      console.warn(`[AUTH_LOGIN_NOT_FOUND] No user account matched for email: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: "No account found with this email address. Please check your spelling or register a new account."
      });
    }
    let isPasswordValid = false;
    try {
      isPasswordValid = await AuthUtils.comparePassword(password, user2.password);
    } catch (hashError) {
      console.error(`[AUTH_LOGIN_BCRYPT_ERROR] Password validation error for ${cleanEmail}:`, hashError?.message);
    }
    if (!isPasswordValid) {
      console.warn(`[AUTH_LOGIN_INVALID_PASSWORD] Authentication mismatch for email: ${cleanEmail}`);
      return res.status(401).json({
        success: false,
        error: "Invalid password. Please double-check your password and try again."
      });
    }
    let twoFactorAuth = null;
    try {
      twoFactorAuth = await prisma.twoFactorAuth.findUnique({ where: { userId: user2.id } });
    } catch (tfaLookupError) {
      console.warn("[AUTH_LOGIN_2FA_LOOKUP_WARN] 2FA check warning:", tfaLookupError?.message);
    }
    if (twoFactorAuth?.isEnabled) {
      let activeOtp;
      if (twoFactorAuth.method === "EMAIL") {
        try {
          const otpRes = await TwoFactorService.sendEmailOtp(user2.id);
          activeOtp = otpRes.otp;
        } catch (otpErr) {
          console.error("[AUTH_LOGIN_OTP_SEND_ERROR] OTP generation failed:", otpErr?.message);
        }
      }
      const tempToken = AuthUtils.generateTempToken({
        sub: user2.id,
        email: user2.email,
        requiresOtp: true
      });
      return res.json({
        success: true,
        requiresOtp: true,
        require2Fa: true,
        tempToken,
        method: twoFactorAuth.method,
        userId: user2.id,
        userEmail: user2.email,
        activeOtp
      });
    }
    const accessToken = AuthUtils.generateAccessToken({
      sub: user2.id,
      email: user2.email,
      requiresOtp: false
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1e3
    });
    const profileCompanyName = user2.companyName || (user2.name ? `${user2.name} Trading Co., Ltd.` : "Myanmar Horizon Trading Co., Ltd.");
    const profilePhone = user2.phone || "+95 9 798 112 889";
    const userMerchantId = cleanEmail === "sanyuaung.ygn.mm@gmail.com" || cleanEmail.includes("sanyu") ? "MMR-8839201" : `MMR-${Math.abs(cleanEmail.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0) % 9e6 + 1e6)}`;
    console.log(`[AUTH_LOGIN_SUCCESS] Successfully signed in: ${cleanEmail}`);
    return res.json({
      success: true,
      accessToken,
      requiresOtp: false,
      require2Fa: false,
      user: {
        id: user2.id,
        email: user2.email,
        name: user2.name || "San Yu Aung",
        companyName: profileCompanyName,
        merchantId: userMerchantId,
        merchantName: profileCompanyName,
        phone: profilePhone,
        role: "Customer Account Admin",
        accountNumber: "0091-2384-992019",
        branch: "Yangon Main Settlement Gateway Branch (0091)"
      }
    });
  } catch (error) {
    console.error("[AUTH_LOGIN_CRITICAL_ERROR] Unexpected login failure:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    return res.status(401).json({
      success: false,
      error: error?.message || "Login service temporarily unavailable. Please verify your credentials or try again in a moment."
    });
  }
});
app.post(["/api/auth/logout", "/auth/logout", "/logout"], async (req, res) => {
  try {
    res.cookie("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0
    });
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.json({ success: true, message: "Logged out" });
  }
});
app.post(["/api/auth/signup", "/api/auth/register"], async (req, res) => {
  const requestTime = (/* @__PURE__ */ new Date()).toISOString();
  const { name, email, password } = req.body || {};
  if (!email || !password) {
    console.warn(`[AUTH_SIGNUP_VALIDATION_ERROR] Missing email or password at ${requestTime}`);
    return res.status(400).json({
      success: false,
      error: "Both Email and Password are required to create an account."
    });
  }
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = (name || "").trim() || cleanEmail.split("@")[0];
  console.log(`[AUTH_SIGNUP_ATTEMPT] Email: ${cleanEmail}, Name: ${cleanName} | Time: ${requestTime}`);
  let client = null;
  const userId = `usr_${Date.now()}`;
  let hashedPassword = "";
  try {
    hashedPassword = await AuthUtils.hashPassword(password);
  } catch (hashErr) {
    console.error("[AUTH_SIGNUP_HASH_ERROR]", hashErr?.message);
    return res.status(500).json({
      success: false,
      error: "Failed to securely process credentials. Please try again."
    });
  }
  try {
    try {
      client = await pool.connect();
      await ensureDatabaseSchema(client);
    } catch (connErr) {
      console.error("[AUTH_SIGNUP_DB_CONN_ERROR] Database connection issue:", {
        message: connErr?.message,
        code: connErr?.code
      });
    }
    if (client) {
      try {
        const existing = await client.query(`SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)`, [cleanEmail]);
        if (existing.rows && existing.rows.length > 0) {
          console.warn(`[AUTH_SIGNUP_DUPLICATE] Account already exists for: ${cleanEmail}`);
          return res.status(409).json({
            success: false,
            error: "An account with this email address already exists. Please sign in instead."
          });
        }
      } catch (existingCheckErr) {
        console.warn("[AUTH_SIGNUP_EXISTING_CHECK_WARN]", existingCheckErr?.message);
      }
      try {
        await client.query(
          `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, NOW(), NOW())`,
          [userId, cleanName, cleanEmail, hashedPassword]
        );
      } catch (insertUserErr) {
        console.warn("[AUTH_SIGNUP_INSERT_USER_WARN] Retrying user insert after schema refresh:", insertUserErr?.message);
        if (insertUserErr?.code === "23505") {
          return res.status(409).json({
            success: false,
            error: "An account with this email address already exists. Please sign in instead."
          });
        }
        try {
          await ensureDatabaseSchema(client);
          await client.query(
            `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, NOW(), NOW())`,
            [userId, cleanName, cleanEmail, hashedPassword]
          );
        } catch (retryInsertErr) {
          console.error("[AUTH_SIGNUP_RETRY_INSERT_ERROR]", retryInsertErr?.message);
        }
      }
      try {
        await client.query(
          `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "createdAt", "updatedAt")
           VALUES ($1, $2, false, 'EMAIL', NOW(), NOW())`,
          [`tfa_${userId}`, userId]
        );
      } catch (tfaInsertError) {
        console.warn("[AUTH_SIGNUP_TFA_INIT_WARN] TwoFactorAuth initialization note:", tfaInsertError?.message);
      }
    }
    const accessToken = AuthUtils.generateAccessToken({
      sub: userId,
      email: cleanEmail,
      requiresOtp: false
    });
    try {
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7 * 1e3
      });
    } catch (cookieErr) {
    }
    const userMerchantId = cleanEmail === "sanyuaung.ygn.mm@gmail.com" || cleanEmail.includes("sanyu") ? "MMR-8839201" : `MMR-${Math.abs(cleanEmail.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0) % 9e6 + 1e6)}`;
    console.log(`[AUTH_SIGNUP_SUCCESS] New user account created: ${cleanEmail}`);
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      accessToken,
      user: {
        id: userId,
        email: cleanEmail,
        name: cleanName,
        merchantId: userMerchantId,
        merchantName: cleanName,
        role: "Customer Account Admin",
        accountNumber: `0091-${Math.floor(1e3 + Math.random() * 9e3)}-${Math.floor(1e5 + Math.random() * 9e5)}`,
        branch: "Yangon Main Settlement Gateway Branch (0091)"
      }
    });
  } catch (err) {
    console.error("[AUTH_SIGNUP_CRITICAL_ERROR]", {
      email: cleanEmail,
      message: err?.message,
      code: err?.code,
      stack: err?.stack
    });
    return res.status(400).json({
      success: false,
      error: err?.message || "Registration request could not be processed. Please verify your information and try again."
    });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
async function resolveOrCreateUser(client, userIdOrEmail, fallbackEmail) {
  const cleanTarget = (fallbackEmail || userIdOrEmail || "sanyu.aung@kbzbank.com").trim().toLowerCase();
  const cleanId = (userIdOrEmail || "").trim();
  try {
    const userRes = await client.query(
      `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) OR LOWER(email) = LOWER($2) LIMIT 1`,
      [cleanId, cleanTarget]
    );
    if (userRes.rows.length > 0) {
      return userRes.rows[0];
    }
  } catch (err) {
    if (err?.code === "42P01" || err?.message?.includes("does not exist")) {
      await ensureDatabaseSchema(client);
    }
  }
  const uId = cleanId.startsWith("usr_") ? cleanId : `usr_${Date.now()}`;
  const defaultName = cleanTarget.split("@")[0] || "San Yu Aung";
  const defaultHash = await AuthUtils.hashPassword("Password@123");
  let insertRes;
  try {
    insertRes = await client.query(
      `INSERT INTO "User" ("id", "name", "email", "password", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uId, defaultName, cleanTarget, defaultHash]
    );
  } catch (insErr) {
    const existing = await client.query(`SELECT * FROM "User" WHERE LOWER(email) = LOWER($1) LIMIT 1`, [cleanTarget]);
    if (existing.rows && existing.rows[0]) return existing.rows[0];
    throw insErr;
  }
  return insertRes.rows[0];
}
app.post(["/api/auth/verify-2fa", "/auth/verify-2fa", "/verify-2fa"], async (req, res) => {
  const { userId, tempToken, code } = req.body;
  const targetId = userId || (tempToken ? AuthUtils.verifyToken(tempToken)?.sub : null);
  if (!targetId || !code) {
    return res.status(400).json({ error: "User ID / session token and verification code required." });
  }
  let client;
  try {
    client = await pool.connect();
    const userRes = await client.query(
      `SELECT u.*, t."isEnabled" as "tfaEnabled", t."method" as "tfaMethod", t.secret, t."backupCodes", t."emailOtp", t."emailOtpExpiry"
       FROM "User" u
       LEFT JOIN "TwoFactorAuth" t ON u.id = t."userId"
       WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)`,
      [targetId]
    );
    const user2 = userRes.rows[0];
    if (!user2 || !user2.tfaEnabled) {
      return res.status(400).json({ error: "2FA is not enabled for this account." });
    }
    const cleanCode = code.trim().toUpperCase();
    let isValid = false;
    if (user2.tfaMethod === "GOOGLE_AUTH") {
      if (user2.secret && cleanCode.length === 6) {
        isValid = speakeasy2.totp.verify({
          secret: user2.secret,
          encoding: "base32",
          token: cleanCode,
          window: 6
        });
      }
      if (!isValid && user2.backupCodes && user2.backupCodes.includes(cleanCode)) {
        isValid = true;
        const remaining = user2.backupCodes.filter((bc) => bc !== cleanCode);
        await client.query(`UPDATE "TwoFactorAuth" SET "backupCodes" = $1 WHERE "userId" = $2`, [remaining, user2.id]);
      }
    } else {
      if (!user2.emailOtp || !user2.emailOtpExpiry || /* @__PURE__ */ new Date() > new Date(user2.emailOtpExpiry)) {
        return res.status(400).json({ error: "OTP expired. Please request a new code." });
      }
      isValid = user2.emailOtp === cleanCode;
      if (isValid) {
        await client.query(`UPDATE "TwoFactorAuth" SET "emailOtp" = NULL, "emailOtpExpiry" = NULL WHERE "userId" = $1`, [
          user2.id
        ]);
      }
    }
    if (!isValid) {
      return res.status(400).json({
        error: user2.tfaMethod === "GOOGLE_AUTH" ? "Invalid code. Please enter the current 6-digit code displayed in Google Authenticator." : "Invalid email verification code."
      });
    }
    const accessToken = AuthUtils.generateAccessToken({
      sub: user2.id,
      email: user2.email,
      requiresOtp: false
    });
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7 * 1e3
    });
    const profileCompanyName = user2.companyName || (user2.name ? `${user2.name} Trading Co., Ltd.` : "Myanmar Horizon Trading Co., Ltd.");
    const profilePhone = user2.phone || "+95 9 798 112 889";
    const userMerchantId = (user2.email || "").toLowerCase().includes("sanyu") ? "MMR-8839201" : `MMR-${Math.abs((user2.email || "").split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0) | 0, 0) % 9e6 + 1e6)}`;
    return res.json({
      success: true,
      accessToken,
      user: {
        id: user2.id,
        email: user2.email,
        name: user2.name || "San Yu Aung",
        companyName: profileCompanyName,
        merchantId: userMerchantId,
        merchantName: profileCompanyName,
        phone: profilePhone,
        role: "Customer Account Admin",
        accountNumber: "0091-2384-992019",
        branch: "Yangon Main Settlement Gateway Branch (0091)"
      }
    });
  } catch (err) {
    console.error("2FA verification error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  } finally {
    if (client) client.release();
  }
});
app.post(["/api/2fa/enable", "/2fa/enable"], async (req, res) => {
  const { userId, method, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: "User ID or Email is required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId, email);
    const targetEmail = (email || user2.email || "customer@mmglobalremit.com").trim();
    if (method === "GOOGLE_AUTH") {
      const label = `MM Global Remit:${targetEmail}`;
      const issuer = "MM Global Remit";
      const secretObj = speakeasy2.generateSecret({
        name: label,
        issuer,
        length: 20
      });
      const secret = secretObj.base32;
      const otpauthUrl = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
      const qrCode = await QRCode.toDataURL(otpauthUrl);
      const backupCodes = [];
      for (let i = 0; i < 10; i++) {
        backupCodes.push(crypto3.randomBytes(4).toString("hex").toUpperCase());
      }
      await client.query(
        `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "secret", "backupCodes", "updatedAt")
         VALUES ($1, $2, false, 'GOOGLE_AUTH', $3, $4, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET "isEnabled" = false, "method" = 'GOOGLE_AUTH', "secret" = $3, "backupCodes" = $4, "updatedAt" = NOW()`,
        [`tfa_${user2.id}`, user2.id, secret, backupCodes]
      );
      return res.json({
        success: true,
        method: "GOOGLE_AUTH",
        secret,
        qrCode,
        otpauthUrl,
        backupCodes
      });
    } else {
      const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiry = new Date(Date.now() + 1 * 60 * 1e3);
      await client.query(
        `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "emailOtp", "emailOtpExpiry", "updatedAt")
         VALUES ($1, $2, false, 'EMAIL', $3, $4, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET "isEnabled" = false, "method" = 'EMAIL', "emailOtp" = $3, "emailOtpExpiry" = $4, "updatedAt" = NOW()`,
        [`tfa_${user2.id}`, user2.id, otp, expiry]
      );
      await sendOtpEmail(targetEmail, otp, user2.name);
      return res.json({
        success: true,
        method: "EMAIL",
        otp,
        userEmail: targetEmail,
        message: `OTP sent to ${targetEmail}`
      });
    }
  } catch (err) {
    console.error("2FA enable error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
app.post(["/api/2fa/send-email-otp", "/api/auth/resend-otp"], async (req, res) => {
  const { userId, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: "User ID or Email is required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId, email);
    const targetEmail = (email || user2.email || "sanyu.aung@kbzbank.com").trim();
    const otp = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiry = new Date(Date.now() + 1 * 60 * 1e3);
    await client.query(
      `INSERT INTO "TwoFactorAuth" ("id", "userId", "isEnabled", "method", "emailOtp", "emailOtpExpiry", "updatedAt")
       VALUES ($1, $2, false, 'EMAIL', $3, $4, NOW())
       ON CONFLICT ("userId")
       DO UPDATE SET "emailOtp" = $3, "emailOtpExpiry" = $4, "updatedAt" = NOW()`,
      [`tfa_${user2.id}`, user2.id, otp, expiry]
    );
    await sendOtpEmail(targetEmail, otp, user2.name);
    return res.json({
      success: true,
      otp,
      userEmail: targetEmail,
      message: `New verification code sent to ${targetEmail}`
    });
  } catch (err) {
    console.error("Send email OTP error:", err);
    return res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
app.get(["/api/2fa/status/:userId", "/2fa/status/:userId"], async (req, res) => {
  const { userId } = req.params;
  let client;
  try {
    client = await pool.connect();
    const userRes = await client.query(
      `SELECT t."isEnabled", t."method" FROM "TwoFactorAuth" t
       JOIN "User" u ON t."userId" = u.id
       WHERE u.id = $1 OR LOWER(u.email) = LOWER($1)`,
      [userId]
    );
    if (userRes.rows.length === 0) {
      return res.json({ isEnabled: false, method: null });
    }
    return res.json({
      isEnabled: userRes.rows[0].isEnabled,
      method: userRes.rows[0].method
    });
  } catch (err) {
    return res.status(200).json({ isEnabled: false, method: null, error: err?.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
app.post(["/api/2fa/verify-and-enable", "/2fa/verify-and-enable"], async (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) return res.status(400).json({ error: "User ID and code are required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId);
    const tfaRes = await client.query(
      `SELECT * FROM "TwoFactorAuth" WHERE "userId" = $1`,
      [user2.id]
    );
    const tfa = tfaRes.rows[0];
    if (!tfa) return res.status(400).json({ error: "2FA setup not initiated" });
    const cleanCode = code.trim();
    let isValid = false;
    if (tfa.method === "GOOGLE_AUTH") {
      if (tfa.secret) {
        isValid = speakeasy2.totp.verify({
          secret: tfa.secret,
          encoding: "base32",
          token: cleanCode,
          window: 6
        });
      }
    } else {
      if (!tfa.emailOtp || !tfa.emailOtpExpiry || /* @__PURE__ */ new Date() > new Date(tfa.emailOtpExpiry)) {
        return res.status(400).json({ error: "Verification code expired. Please request a new 1-minute OTP." });
      }
      isValid = tfa.emailOtp === cleanCode;
    }
    if (!isValid) {
      return res.status(400).json({
        error: tfa.method === "GOOGLE_AUTH" ? "Invalid code. Please check your Google Authenticator app and enter the real 6-digit code currently displayed." : "Invalid email verification code."
      });
    }
    await client.query(
      `UPDATE "TwoFactorAuth" SET "isEnabled" = true, "emailOtp" = NULL, "emailOtpExpiry" = NULL, "updatedAt" = NOW() WHERE "id" = $1`,
      [tfa.id]
    );
    return res.json({
      success: true,
      message: "Two-factor authentication enabled successfully in Neon PostgreSQL."
    });
  } catch (err) {
    console.error("2FA verify-and-enable error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
app.post(["/api/2fa/disable", "/2fa/disable"], async (req, res) => {
  const { userId, password } = req.body;
  if (!userId || !password) return res.status(400).json({ error: "Password is required" });
  let client;
  try {
    client = await pool.connect();
    const user2 = await resolveOrCreateUser(client, userId);
    const isValid = await AuthUtils.comparePassword(password, user2.password);
    if (!isValid) {
      return res.status(401).json({ error: "Incorrect password." });
    }
    await client.query(`DELETE FROM "TwoFactorAuth" WHERE "userId" = $1`, [
      user2.id
    ]);
    return res.json({ success: true, message: "Two-factor authentication deleted from database successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
});
app.post(["/api/auth/change-password", "/auth/change-password", "/change-password"], async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (!userId || !currentPassword || !newPassword) {
    return res.status(400).json({ error: "User ID, current password, and new password are required." });
  }
  let client;
  try {
    client = await pool.connect();
    const cleanId = (userId || "").trim();
    let userRes = await client.query(
      `SELECT * FROM "User" WHERE id = $1 OR LOWER(email) = LOWER($1) LIMIT 1`,
      [cleanId]
    );
    let user2 = userRes.rows[0];
    if (!user2) {
      user2 = await resolveOrCreateUser(client, cleanId);
    }
    const isValid = await AuthUtils.comparePassword(currentPassword, user2.password);
    if (!isValid) {
      return res.status(401).json({ error: "Current password is incorrect. Please enter your valid current password." });
    }
    const newHash = await AuthUtils.hashPassword(newPassword);
    await client.query(`UPDATE "User" SET "password" = $1, "updatedAt" = NOW() WHERE "id" = $2`, [newHash, user2.id]);
    return res.json({ success: true, message: "Password updated successfully in PostgreSQL database." });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});
app.get(["/api/transactions", "/transactions"], async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" ORDER BY "valueDate" DESC`
    );
    if (result.rows && result.rows.length > 0) {
      const transactions = result.rows.map((row) => ({
        id: row.id,
        transactionRef: row.transactionRef,
        senderName: row.senderName,
        senderCountry: row.senderCountry,
        sendingBank: row.sendingBank,
        sendingBankBic: row.sendingBankBic,
        currency: row.currency,
        amount: row.amount,
        exchangeRate: row.exchangeRate,
        convertedAmountMmk: row.convertedAmountMmk,
        feeAmount: row.feeAmount,
        netAmountMmk: row.netAmountMmk,
        valueDate: row.valueDate ? new Date(row.valueDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        status: row.status,
        statusMessage: row.statusMessage,
        purpose: row.purpose,
        beneficiaryAccount: row.beneficiaryAccount,
        swiftMetadata: typeof row.swiftMetadata === "string" ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {}
      }));
      return res.json({ success: true, transactions, count: transactions.length });
    }
  } catch (err) {
    console.warn("[TRANSACTIONS_FETCH_DB_WARN] Using fallback transactions:", err?.message || err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  return res.json({ success: true, transactions: mockTransactions, count: mockTransactions.length, source: "fallback" });
});
app.get(["/api/transactions/:id", "/transactions/:id"], async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT * FROM "InboundTransaction" WHERE id = $1 OR "transactionRef" = $1 LIMIT 1`,
      [id]
    );
    if (result.rows.length > 0) {
      const row = result.rows[0];
      const tx = {
        id: row.id,
        transactionRef: row.transactionRef,
        senderName: row.senderName,
        senderCountry: row.senderCountry,
        sendingBank: row.sendingBank,
        sendingBankBic: row.sendingBankBic,
        currency: row.currency,
        amount: row.amount,
        exchangeRate: row.exchangeRate,
        convertedAmountMmk: row.convertedAmountMmk,
        feeAmount: row.feeAmount,
        netAmountMmk: row.netAmountMmk,
        valueDate: row.valueDate ? new Date(row.valueDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
        status: row.status,
        statusMessage: row.statusMessage,
        purpose: row.purpose,
        beneficiaryAccount: row.beneficiaryAccount,
        swiftMetadata: typeof row.swiftMetadata === "string" ? JSON.parse(row.swiftMetadata) : row.swiftMetadata || {}
      };
      return res.json({ success: true, transaction: tx });
    }
  } catch (err) {
    console.warn("[TRANSACTION_BY_ID_DB_WARN]", err?.message);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  const foundMock = mockTransactions.find((t) => t.id === id || t.transactionRef === id);
  if (foundMock) {
    return res.json({ success: true, transaction: foundMock });
  }
  return res.status(404).json({ error: "Transaction not found" });
});
app.post(["/api/transactions/simulate", "/transactions/simulate"], async (req, res) => {
  const tx = req.body;
  if (!tx || !tx.amount || !tx.currency) {
    return res.status(400).json({ error: "Valid transaction data is required" });
  }
  let client;
  const txId = tx.id || `tx-${Date.now()}`;
  const txRef = tx.transactionRef || `IR-2026-SIM-${Math.floor(1e5 + Math.random() * 9e5)}`;
  const valueDate = tx.valueDate ? new Date(tx.valueDate) : /* @__PURE__ */ new Date();
  const simulatedTx = {
    id: txId,
    transactionRef: txRef,
    senderName: tx.senderName || "Global Remittance Partner Ltd",
    senderCountry: tx.senderCountry || "Singapore",
    sendingBank: tx.sendingBank || "DBS Bank Ltd",
    sendingBankBic: tx.sendingBankBic || "DBSSSGSG",
    currency: tx.currency,
    amount: Number(tx.amount),
    exchangeRate: Number(tx.exchangeRate || 3550),
    convertedAmountMmk: Number(tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
    feeAmount: Number(tx.feeAmount || 0),
    netAmountMmk: Number(tx.netAmountMmk || tx.convertedAmountMmk || tx.amount * (tx.exchangeRate || 3550)),
    valueDate: valueDate.toISOString(),
    status: tx.status || "Completed",
    statusMessage: tx.statusMessage || null,
    purpose: tx.purpose || "Commercial Remittance Clearing",
    beneficiaryAccount: tx.beneficiaryAccount || "0091-2384-992019",
    swiftMetadata: tx.swiftMetadata || {}
  };
  try {
    client = await pool.connect();
    await client.query(
      `INSERT INTO "InboundTransaction" (
        "id", "transactionRef", "senderName", "senderCountry", "sendingBank", "sendingBankBic",
        "currency", "amount", "exchangeRate", "convertedAmountMmk", "feeAmount", "netAmountMmk",
        "valueDate", "status", "statusMessage", "purpose", "beneficiaryAccount", "swiftMetadata", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())`,
      [
        txId,
        txRef,
        simulatedTx.senderName,
        simulatedTx.senderCountry,
        simulatedTx.sendingBank,
        simulatedTx.sendingBankBic,
        simulatedTx.currency,
        simulatedTx.amount,
        simulatedTx.exchangeRate,
        simulatedTx.convertedAmountMmk,
        simulatedTx.feeAmount,
        simulatedTx.netAmountMmk,
        valueDate,
        simulatedTx.status,
        simulatedTx.statusMessage,
        simulatedTx.purpose,
        simulatedTx.beneficiaryAccount,
        JSON.stringify(simulatedTx.swiftMetadata)
      ]
    );
  } catch (err) {
    console.warn("[SIMULATE_TRANSACTION_DB_WARN] Saved in memory:", err?.message || err);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  return res.status(201).json({ success: true, transaction: simulatedTx });
});
app.get(["/api/fx-rates", "/fx-rates"], async (req, res) => {
  const targetCurrencies = ["USD", "EUR", "SGD", "THB", "GBP", "JPY", "CNY", "MYR"];
  const cbmApiUrl = process.env.CBM_FOREX_API_URL || "https://forex.cbm.gov.mm/api/latest";
  const parseRate = (value) => {
    if (value === void 0 || value === null) return null;
    const parsed = Number(String(value).replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };
  let client;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4e3);
    const cbmResp = await fetch(cbmApiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (cbmResp.ok) {
      const cbmData = await cbmResp.json();
      const ratesMap = cbmData?.rates || {};
      const ts = cbmData?.timestamp ? new Date(Number(cbmData.timestamp) * 1e3).toISOString() : (/* @__PURE__ */ new Date()).toISOString();
      const fxRates = targetCurrencies.map((currency) => {
        const middleRate = parseRate(ratesMap[currency]);
        if (!middleRate) return null;
        const spread = middleRate * 2e-3;
        const buyRate = Math.round((middleRate - spread) * 100) / 100;
        const sellRate = Math.round((middleRate + spread) * 100) / 100;
        return {
          currency,
          buyRate,
          sellRate,
          middleRate: Math.round(middleRate * 100) / 100,
          change24h: 0,
          updatedAt: ts
        };
      }).filter(Boolean);
      if (fxRates.length > 0) {
        (async () => {
          let cacheClient;
          try {
            cacheClient = await pool.connect();
            for (const rate of fxRates) {
              await cacheClient.query(
                `INSERT INTO "FxRate" ("id", "currency", "buyRate", "sellRate", "middleRate", "change24h", "updatedAt")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT ("currency")
                 DO UPDATE SET
                   "buyRate" = EXCLUDED."buyRate",
                   "sellRate" = EXCLUDED."sellRate",
                   "middleRate" = EXCLUDED."middleRate",
                   "change24h" = EXCLUDED."change24h",
                   "updatedAt" = EXCLUDED."updatedAt"`,
                [`fx_${rate.currency.toLowerCase()}`, rate.currency, rate.buyRate, rate.sellRate, rate.middleRate, rate.change24h, rate.updatedAt]
              );
            }
          } catch (cacheErr) {
          } finally {
            if (cacheClient) {
              try {
                cacheClient.release();
              } catch (e) {
              }
            }
          }
        })();
        return res.json({ success: true, source: "cbm", fxRates });
      }
    }
  } catch (cbmErr) {
    console.warn("[FX_RATES_CBM_WARN] CBM feed unavailable, querying database or mock fallback:", cbmErr?.message);
  }
  try {
    client = await pool.connect();
    const result = await client.query(`SELECT * FROM "FxRate" ORDER BY "currency" ASC`);
    if (result.rows && result.rows.length > 0) {
      const rates = result.rows.map((row) => ({
        currency: row.currency,
        buyRate: row.buyrate ?? row.buyRate,
        sellRate: row.sellrate ?? row.sellRate,
        middleRate: row.middlerate ?? row.middleRate,
        change24h: row.change24h ?? 0,
        updatedAt: row.updatedat?.toISOString?.() || row.updatedAt?.toISOString?.() || (/* @__PURE__ */ new Date()).toISOString()
      }));
      return res.json({ success: true, source: "database-fallback", fxRates: rates });
    }
  } catch (dbErr) {
    console.warn("[FX_RATES_DB_WARN] DB query error, using built-in mock fallback:", dbErr?.message);
  } finally {
    if (client) {
      try {
        client.release();
      } catch (relErr) {
      }
    }
  }
  return res.json({
    success: true,
    source: "fallback",
    fxRates: mockFxRates
  });
});
app.post("/api/database/migrate", async (req, res) => {
  try {
    await seedDatabase();
    return res.json({ success: true, message: "All tables migrated and mock data seeded into PostgreSQL." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// src/server/server.ts
var PORT = process.env.PORT || 3e3;
var distPath = path.resolve(process.cwd(), "dist");
if (fs.existsSync(distPath)) {
  const router = express2.Router();
  router.use(express2.static(distPath));
  router.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.use(router);
}
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`\u{1F680} KBZ Bank IR Portal server listening on 0.0.0.0:${PORT}`);
});
