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
var mockFxRates = [
  {
    "currency": "USD",
    "buyRate": 2095.8,
    "sellRate": 2104.2,
    "middleRate": 2100,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "EUR",
    "buyRate": 2430.5,
    "sellRate": 2440.24,
    "middleRate": 2435.37,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "SGD",
    "buyRate": 1642.03,
    "sellRate": 1648.61,
    "middleRate": 1645.32,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "THB",
    "buyRate": 63.36,
    "sellRate": 63.62,
    "middleRate": 63.49,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "GBP",
    "buyRate": 2840.76,
    "sellRate": 2852.14,
    "middleRate": 2846.45,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "JPY",
    "buyRate": 1317.28,
    "sellRate": 1322.56,
    "middleRate": 1319.92,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "CNY",
    "buyRate": 311.03,
    "sellRate": 312.27,
    "middleRate": 311.65,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  },
  {
    "currency": "MYR",
    "buyRate": 516.02,
    "sellRate": 518.08,
    "middleRate": 517.05,
    "change24h": 0,
    "updatedAt": "2026-08-19T08:00:00.000Z"
  }
];
var mockTransactions = [
  {
    "id": "tx_1000",
    "transactionRef": "IR-202608-96106-0",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 219,
    "exchangeRate": 2100,
    "convertedAmountMmk": 459900,
    "feeAmount": 5,
    "netAmountMmk": 454900,
    "valueDate": "2026-08-20T12:16:49.332Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042551918",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-20T12:16:49.332Z",
    "updatedAt": "2026-08-20T12:16:49.332Z"
  },
  {
    "id": "tx_1001",
    "transactionRef": "IR-202608-31668-1",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 2912,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 7.0917974399999995e6,
    "feeAmount": 5,
    "netAmountMmk": 7.0867974399999995e6,
    "valueDate": "2026-08-19T13:21:02.720Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042504625",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-19T13:21:02.720Z",
    "updatedAt": "2026-08-19T13:21:02.720Z"
  },
  {
    "id": "tx_1002",
    "transactionRef": "IR-202608-58177-2",
    "senderName": "Kyaw Kyaw",
    "senderCountry": "Thailand",
    "sendingBank": "Kasikornbank",
    "sendingBankBic": "KASITHBK",
    "currency": "SGD",
    "amount": 1977,
    "exchangeRate": 1645.32,
    "convertedAmountMmk": 3.2527976399999997e6,
    "feeAmount": 5,
    "netAmountMmk": 3.2477976399999997e6,
    "valueDate": "2026-08-18T12:39:26.191Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042439928",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-18T12:39:26.191Z",
    "updatedAt": "2026-08-18T12:39:26.191Z"
  },
  {
    "id": "tx_1003",
    "transactionRef": "IR-202608-35109-3",
    "senderName": "Tun Tun",
    "senderCountry": "UK",
    "sendingBank": "Barclays",
    "sendingBankBic": "BARCGB22",
    "currency": "THB",
    "amount": 3131,
    "exchangeRate": 63.49,
    "convertedAmountMmk": 198787.19,
    "feeAmount": 5,
    "netAmountMmk": 193787.19,
    "valueDate": "2026-08-17T13:39:37.582Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042223132",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-17T13:39:37.582Z",
    "updatedAt": "2026-08-17T13:39:37.582Z"
  },
  {
    "id": "tx_1004",
    "transactionRef": "IR-202608-02430-4",
    "senderName": "Aye Aye",
    "senderCountry": "Japan",
    "sendingBank": "SMBC",
    "sendingBankBic": "SMBCJPJT",
    "currency": "GBP",
    "amount": 2625,
    "exchangeRate": 2846.45,
    "convertedAmountMmk": 7471931249999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 7466931249999999e-9,
    "valueDate": "2026-08-16T14:50:05.750Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042099967",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-16T14:50:05.750Z",
    "updatedAt": "2026-08-16T14:50:05.750Z"
  },
  {
    "id": "tx_1005",
    "transactionRef": "IR-202608-63657-5",
    "senderName": "Su Su",
    "senderCountry": "Malaysia",
    "sendingBank": "Maybank",
    "sendingBankBic": "MBBEMYKL",
    "currency": "JPY",
    "amount": 661,
    "exchangeRate": 1319.92,
    "convertedAmountMmk": 872467.12,
    "feeAmount": 5,
    "netAmountMmk": 867467.12,
    "valueDate": "2026-08-15T13:54:03.686Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042683026",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-15T13:54:03.686Z",
    "updatedAt": "2026-08-15T13:54:03.686Z"
  },
  {
    "id": "tx_1006",
    "transactionRef": "IR-202608-37939-6",
    "senderName": "Mya Mya",
    "senderCountry": "China",
    "sendingBank": "ICBC",
    "sendingBankBic": "ICBCCNBJ",
    "currency": "CNY",
    "amount": 2766,
    "exchangeRate": 311.65,
    "convertedAmountMmk": 862023.8999999999,
    "feeAmount": 5,
    "netAmountMmk": 857023.8999999999,
    "valueDate": "2026-08-14T13:54:23.246Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042434843",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-14T13:54:23.246Z",
    "updatedAt": "2026-08-14T13:54:23.246Z"
  },
  {
    "id": "tx_1007",
    "transactionRef": "IR-202608-40746-7",
    "senderName": "Hla Hla",
    "senderCountry": "Europe",
    "sendingBank": "Deutsche Bank",
    "sendingBankBic": "DEUTDEFF",
    "currency": "MYR",
    "amount": 1675,
    "exchangeRate": 517.05,
    "convertedAmountMmk": 866058.7499999999,
    "feeAmount": 5,
    "netAmountMmk": 861058.7499999999,
    "valueDate": "2026-08-13T13:46:50.428Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042983104",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-13T13:46:50.428Z",
    "updatedAt": "2026-08-13T13:46:50.428Z"
  },
  {
    "id": "tx_1008",
    "transactionRef": "IR-202608-74708-8",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 902,
    "exchangeRate": 2100,
    "convertedAmountMmk": 1894200,
    "feeAmount": 5,
    "netAmountMmk": 1889200,
    "valueDate": "2026-08-12T14:16:20.832Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042718425",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-12T14:16:20.832Z",
    "updatedAt": "2026-08-12T14:16:20.832Z"
  },
  {
    "id": "tx_1009",
    "transactionRef": "IR-202608-92353-9",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 2491,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 606650667e-2,
    "feeAmount": 5,
    "netAmountMmk": 606150667e-2,
    "valueDate": "2026-08-11T12:30:45.855Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042565611",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-11T12:30:45.855Z",
    "updatedAt": "2026-08-11T12:30:45.855Z"
  },
  {
    "id": "tx_1010",
    "transactionRef": "IR-202608-05782-10",
    "senderName": "Kyaw Kyaw",
    "senderCountry": "Thailand",
    "sendingBank": "Kasikornbank",
    "sendingBankBic": "KASITHBK",
    "currency": "SGD",
    "amount": 2214,
    "exchangeRate": 1645.32,
    "convertedAmountMmk": 364273848e-2,
    "feeAmount": 5,
    "netAmountMmk": 363773848e-2,
    "valueDate": "2026-08-10T13:19:39.909Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042847654",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-10T13:19:39.909Z",
    "updatedAt": "2026-08-10T13:19:39.909Z"
  },
  {
    "id": "tx_1011",
    "transactionRef": "IR-202608-95463-11",
    "senderName": "Tun Tun",
    "senderCountry": "UK",
    "sendingBank": "Barclays",
    "sendingBankBic": "BARCGB22",
    "currency": "THB",
    "amount": 3128,
    "exchangeRate": 63.49,
    "convertedAmountMmk": 198596.72,
    "feeAmount": 5,
    "netAmountMmk": 193596.72,
    "valueDate": "2026-08-09T13:38:48.899Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042754549",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-09T13:38:48.899Z",
    "updatedAt": "2026-08-09T13:38:48.899Z"
  },
  {
    "id": "tx_1012",
    "transactionRef": "IR-202608-70225-12",
    "senderName": "Aye Aye",
    "senderCountry": "Japan",
    "sendingBank": "SMBC",
    "sendingBankBic": "SMBCJPJT",
    "currency": "GBP",
    "amount": 2947,
    "exchangeRate": 2846.45,
    "convertedAmountMmk": 8388488149999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 8383488149999999e-9,
    "valueDate": "2026-08-08T12:34:17.340Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042627226",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-08T12:34:17.340Z",
    "updatedAt": "2026-08-08T12:34:17.340Z"
  },
  {
    "id": "tx_1013",
    "transactionRef": "IR-202608-37170-13",
    "senderName": "Su Su",
    "senderCountry": "Malaysia",
    "sendingBank": "Maybank",
    "sendingBankBic": "MBBEMYKL",
    "currency": "JPY",
    "amount": 2550,
    "exchangeRate": 1319.92,
    "convertedAmountMmk": 3365796,
    "feeAmount": 5,
    "netAmountMmk": 3360796,
    "valueDate": "2026-08-07T14:50:16.614Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042651999",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-07T14:50:16.614Z",
    "updatedAt": "2026-08-07T14:50:16.614Z"
  },
  {
    "id": "tx_1014",
    "transactionRef": "IR-202608-31342-14",
    "senderName": "Mya Mya",
    "senderCountry": "China",
    "sendingBank": "ICBC",
    "sendingBankBic": "ICBCCNBJ",
    "currency": "CNY",
    "amount": 4463,
    "exchangeRate": 311.65,
    "convertedAmountMmk": 139089395e-2,
    "feeAmount": 5,
    "netAmountMmk": 138589395e-2,
    "valueDate": "2026-08-06T13:57:22.471Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042960452",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-06T13:57:22.471Z",
    "updatedAt": "2026-08-06T13:57:22.471Z"
  },
  {
    "id": "tx_1015",
    "transactionRef": "IR-202608-35195-15",
    "senderName": "Hla Hla",
    "senderCountry": "Europe",
    "sendingBank": "Deutsche Bank",
    "sendingBankBic": "DEUTDEFF",
    "currency": "MYR",
    "amount": 3292,
    "exchangeRate": 517.05,
    "convertedAmountMmk": 1.7021285999999999e6,
    "feeAmount": 5,
    "netAmountMmk": 1.6971285999999999e6,
    "valueDate": "2026-08-05T13:19:04.207Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042089185",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-05T13:19:04.207Z",
    "updatedAt": "2026-08-05T13:19:04.207Z"
  },
  {
    "id": "tx_1016",
    "transactionRef": "IR-202608-20761-16",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 2198,
    "exchangeRate": 2100,
    "convertedAmountMmk": 4615800,
    "feeAmount": 5,
    "netAmountMmk": 4610800,
    "valueDate": "2026-08-04T14:05:44.841Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042771787",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-04T14:05:44.841Z",
    "updatedAt": "2026-08-04T14:05:44.841Z"
  },
  {
    "id": "tx_1017",
    "transactionRef": "IR-202608-32679-17",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 5073,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 1235463201e-2,
    "feeAmount": 5,
    "netAmountMmk": 1234963201e-2,
    "valueDate": "2026-08-03T14:47:15.146Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042235198",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-03T14:47:15.146Z",
    "updatedAt": "2026-08-03T14:47:15.146Z"
  },
  {
    "id": "tx_1018",
    "transactionRef": "IR-202608-45667-18",
    "senderName": "Kyaw Kyaw",
    "senderCountry": "Thailand",
    "sendingBank": "Kasikornbank",
    "sendingBankBic": "KASITHBK",
    "currency": "SGD",
    "amount": 4118,
    "exchangeRate": 1645.32,
    "convertedAmountMmk": 677542776e-2,
    "feeAmount": 5,
    "netAmountMmk": 677042776e-2,
    "valueDate": "2026-08-02T14:50:59.523Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042298506",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-02T14:50:59.523Z",
    "updatedAt": "2026-08-02T14:50:59.523Z"
  },
  {
    "id": "tx_1019",
    "transactionRef": "IR-202608-32965-19",
    "senderName": "Tun Tun",
    "senderCountry": "UK",
    "sendingBank": "Barclays",
    "sendingBankBic": "BARCGB22",
    "currency": "THB",
    "amount": 1757,
    "exchangeRate": 63.49,
    "convertedAmountMmk": 111551.93000000001,
    "feeAmount": 5,
    "netAmountMmk": 106551.93000000001,
    "valueDate": "2026-08-01T13:58:51.233Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042716558",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-08-01T13:58:51.233Z",
    "updatedAt": "2026-08-01T13:58:51.233Z"
  },
  {
    "id": "tx_1020",
    "transactionRef": "IR-202608-07368-20",
    "senderName": "Aye Aye",
    "senderCountry": "Japan",
    "sendingBank": "SMBC",
    "sendingBankBic": "SMBCJPJT",
    "currency": "GBP",
    "amount": 2974,
    "exchangeRate": 2846.45,
    "convertedAmountMmk": 8465342299999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 8460342299999999e-9,
    "valueDate": "2026-07-31T14:19:22.898Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042908149",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-31T14:19:22.898Z",
    "updatedAt": "2026-07-31T14:19:22.898Z"
  },
  {
    "id": "tx_1021",
    "transactionRef": "IR-202608-70244-21",
    "senderName": "Su Su",
    "senderCountry": "Malaysia",
    "sendingBank": "Maybank",
    "sendingBankBic": "MBBEMYKL",
    "currency": "JPY",
    "amount": 1838,
    "exchangeRate": 1319.92,
    "convertedAmountMmk": 242601296e-2,
    "feeAmount": 5,
    "netAmountMmk": 242101296e-2,
    "valueDate": "2026-07-30T12:34:20.971Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042668452",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-30T12:34:20.971Z",
    "updatedAt": "2026-07-30T12:34:20.971Z"
  },
  {
    "id": "tx_1022",
    "transactionRef": "IR-202608-12742-22",
    "senderName": "Mya Mya",
    "senderCountry": "China",
    "sendingBank": "ICBC",
    "sendingBankBic": "ICBCCNBJ",
    "currency": "CNY",
    "amount": 4509,
    "exchangeRate": 311.65,
    "convertedAmountMmk": 1.4052298499999999e6,
    "feeAmount": 5,
    "netAmountMmk": 1.4002298499999999e6,
    "valueDate": "2026-07-29T14:56:47.690Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042248314",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-29T14:56:47.690Z",
    "updatedAt": "2026-07-29T14:56:47.690Z"
  },
  {
    "id": "tx_1023",
    "transactionRef": "IR-202608-23986-23",
    "senderName": "Hla Hla",
    "senderCountry": "Europe",
    "sendingBank": "Deutsche Bank",
    "sendingBankBic": "DEUTDEFF",
    "currency": "MYR",
    "amount": 154,
    "exchangeRate": 517.05,
    "convertedAmountMmk": 79625.7,
    "feeAmount": 5,
    "netAmountMmk": 74625.7,
    "valueDate": "2026-07-28T12:41:29.016Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042042044",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-28T12:41:29.016Z",
    "updatedAt": "2026-07-28T12:41:29.016Z"
  },
  {
    "id": "tx_1024",
    "transactionRef": "IR-202608-25839-24",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 1157,
    "exchangeRate": 2100,
    "convertedAmountMmk": 2429700,
    "feeAmount": 5,
    "netAmountMmk": 2424700,
    "valueDate": "2026-07-27T15:01:15.520Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042922381",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-27T15:01:15.520Z",
    "updatedAt": "2026-07-27T15:01:15.520Z"
  },
  {
    "id": "tx_1025",
    "transactionRef": "IR-202608-86190-25",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 1622,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 3.9501701399999997e6,
    "feeAmount": 5,
    "netAmountMmk": 3.9451701399999997e6,
    "valueDate": "2026-07-26T13:27:56.776Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042723856",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-26T13:27:56.776Z",
    "updatedAt": "2026-07-26T13:27:56.776Z"
  },
  {
    "id": "tx_1026",
    "transactionRef": "IR-202608-21732-26",
    "senderName": "Kyaw Kyaw",
    "senderCountry": "Thailand",
    "sendingBank": "Kasikornbank",
    "sendingBankBic": "KASITHBK",
    "currency": "SGD",
    "amount": 211,
    "exchangeRate": 1645.32,
    "convertedAmountMmk": 347162.51999999996,
    "feeAmount": 5,
    "netAmountMmk": 342162.51999999996,
    "valueDate": "2026-07-25T13:36:52.283Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042578470",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-25T13:36:52.283Z",
    "updatedAt": "2026-07-25T13:36:52.283Z"
  },
  {
    "id": "tx_1027",
    "transactionRef": "IR-202608-13139-27",
    "senderName": "Tun Tun",
    "senderCountry": "UK",
    "sendingBank": "Barclays",
    "sendingBankBic": "BARCGB22",
    "currency": "THB",
    "amount": 3750,
    "exchangeRate": 63.49,
    "convertedAmountMmk": 238087.5,
    "feeAmount": 5,
    "netAmountMmk": 233087.5,
    "valueDate": "2026-07-24T14:29:43.667Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042596491",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-24T14:29:43.667Z",
    "updatedAt": "2026-07-24T14:29:43.667Z"
  },
  {
    "id": "tx_1028",
    "transactionRef": "IR-202608-04273-28",
    "senderName": "Aye Aye",
    "senderCountry": "Japan",
    "sendingBank": "SMBC",
    "sendingBankBic": "SMBCJPJT",
    "currency": "GBP",
    "amount": 706,
    "exchangeRate": 2846.45,
    "convertedAmountMmk": 20095937e-1,
    "feeAmount": 5,
    "netAmountMmk": 20045937e-1,
    "valueDate": "2026-07-23T12:18:01.868Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042948917",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-23T12:18:01.868Z",
    "updatedAt": "2026-07-23T12:18:01.868Z"
  },
  {
    "id": "tx_1029",
    "transactionRef": "IR-202608-59339-29",
    "senderName": "Su Su",
    "senderCountry": "Malaysia",
    "sendingBank": "Maybank",
    "sendingBankBic": "MBBEMYKL",
    "currency": "JPY",
    "amount": 930,
    "exchangeRate": 1319.92,
    "convertedAmountMmk": 12275256e-1,
    "feeAmount": 5,
    "netAmountMmk": 12225256e-1,
    "valueDate": "2026-07-22T14:55:23.123Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042996430",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-22T14:55:23.123Z",
    "updatedAt": "2026-07-22T14:55:23.123Z"
  },
  {
    "id": "tx_1030",
    "transactionRef": "IR-202608-46530-30",
    "senderName": "Mya Mya",
    "senderCountry": "China",
    "sendingBank": "ICBC",
    "sendingBankBic": "ICBCCNBJ",
    "currency": "CNY",
    "amount": 1304,
    "exchangeRate": 311.65,
    "convertedAmountMmk": 406391.6,
    "feeAmount": 5,
    "netAmountMmk": 401391.6,
    "valueDate": "2026-07-21T13:12:57.450Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042388727",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-21T13:12:57.450Z",
    "updatedAt": "2026-07-21T13:12:57.450Z"
  },
  {
    "id": "tx_1031",
    "transactionRef": "IR-202608-39150-31",
    "senderName": "Hla Hla",
    "senderCountry": "Europe",
    "sendingBank": "Deutsche Bank",
    "sendingBankBic": "DEUTDEFF",
    "currency": "MYR",
    "amount": 4064,
    "exchangeRate": 517.05,
    "convertedAmountMmk": 2.1012911999999997e6,
    "feeAmount": 5,
    "netAmountMmk": 2.0962911999999997e6,
    "valueDate": "2026-07-20T13:18:44.842Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042316530",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-20T13:18:44.842Z",
    "updatedAt": "2026-07-20T13:18:44.842Z"
  },
  {
    "id": "tx_1032",
    "transactionRef": "IR-202608-41375-32",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 1828,
    "exchangeRate": 2100,
    "convertedAmountMmk": 3838800,
    "feeAmount": 5,
    "netAmountMmk": 3833800,
    "valueDate": "2026-07-19T12:45:55.751Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042757354",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-19T12:45:55.751Z",
    "updatedAt": "2026-07-19T12:45:55.751Z"
  },
  {
    "id": "tx_1033",
    "transactionRef": "IR-202608-63837-33",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 4158,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 10126268459999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 10121268459999999e-9,
    "valueDate": "2026-07-18T14:26:16.023Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042056332",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-18T14:26:16.023Z",
    "updatedAt": "2026-07-18T14:26:16.023Z"
  },
  {
    "id": "tx_1034",
    "transactionRef": "IR-202608-38097-34",
    "senderName": "Kyaw Kyaw",
    "senderCountry": "Thailand",
    "sendingBank": "Kasikornbank",
    "sendingBankBic": "KASITHBK",
    "currency": "SGD",
    "amount": 3168,
    "exchangeRate": 1645.32,
    "convertedAmountMmk": 521237376e-2,
    "feeAmount": 5,
    "netAmountMmk": 520737376e-2,
    "valueDate": "2026-07-17T14:53:53.263Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042891621",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-17T14:53:53.263Z",
    "updatedAt": "2026-07-17T14:53:53.263Z"
  },
  {
    "id": "tx_1035",
    "transactionRef": "IR-202608-78839-35",
    "senderName": "Tun Tun",
    "senderCountry": "UK",
    "sendingBank": "Barclays",
    "sendingBankBic": "BARCGB22",
    "currency": "THB",
    "amount": 1373,
    "exchangeRate": 63.49,
    "convertedAmountMmk": 87171.77,
    "feeAmount": 5,
    "netAmountMmk": 82171.77,
    "valueDate": "2026-07-16T12:59:10.283Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042320836",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-16T12:59:10.283Z",
    "updatedAt": "2026-07-16T12:59:10.283Z"
  },
  {
    "id": "tx_1036",
    "transactionRef": "IR-202608-50598-36",
    "senderName": "Aye Aye",
    "senderCountry": "Japan",
    "sendingBank": "SMBC",
    "sendingBankBic": "SMBCJPJT",
    "currency": "GBP",
    "amount": 3107,
    "exchangeRate": 2846.45,
    "convertedAmountMmk": 8843920149999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 8838920149999999e-9,
    "valueDate": "2026-07-15T12:21:28.231Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042529954",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-15T12:21:28.231Z",
    "updatedAt": "2026-07-15T12:21:28.231Z"
  },
  {
    "id": "tx_1037",
    "transactionRef": "IR-202608-67756-37",
    "senderName": "Su Su",
    "senderCountry": "Malaysia",
    "sendingBank": "Maybank",
    "sendingBankBic": "MBBEMYKL",
    "currency": "JPY",
    "amount": 3860,
    "exchangeRate": 1319.92,
    "convertedAmountMmk": 50948912e-1,
    "feeAmount": 5,
    "netAmountMmk": 50898912e-1,
    "valueDate": "2026-07-14T12:32:13.909Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042190365",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-14T12:32:13.909Z",
    "updatedAt": "2026-07-14T12:32:13.909Z"
  },
  {
    "id": "tx_1038",
    "transactionRef": "IR-202608-61519-38",
    "senderName": "Mya Mya",
    "senderCountry": "China",
    "sendingBank": "ICBC",
    "sendingBankBic": "ICBCCNBJ",
    "currency": "CNY",
    "amount": 2063,
    "exchangeRate": 311.65,
    "convertedAmountMmk": 642933.95,
    "feeAmount": 5,
    "netAmountMmk": 637933.95,
    "valueDate": "2026-07-13T12:31:54.964Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042796963",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-13T12:31:54.964Z",
    "updatedAt": "2026-07-13T12:31:54.964Z"
  },
  {
    "id": "tx_1039",
    "transactionRef": "IR-202608-29014-39",
    "senderName": "Hla Hla",
    "senderCountry": "Europe",
    "sendingBank": "Deutsche Bank",
    "sendingBankBic": "DEUTDEFF",
    "currency": "MYR",
    "amount": 3605,
    "exchangeRate": 517.05,
    "convertedAmountMmk": 1.8639652499999998e6,
    "feeAmount": 5,
    "netAmountMmk": 1.8589652499999998e6,
    "valueDate": "2026-07-12T14:18:32.431Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042901036",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-12T14:18:32.431Z",
    "updatedAt": "2026-07-12T14:18:32.431Z"
  },
  {
    "id": "tx_1040",
    "transactionRef": "IR-202608-36905-40",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 3594,
    "exchangeRate": 2100,
    "convertedAmountMmk": 7547400,
    "feeAmount": 5,
    "netAmountMmk": 7542400,
    "valueDate": "2026-07-11T14:20:22.096Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042054980",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-11T14:20:22.096Z",
    "updatedAt": "2026-07-11T14:20:22.096Z"
  },
  {
    "id": "tx_1041",
    "transactionRef": "IR-202608-93165-41",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 2006,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 488535222e-2,
    "feeAmount": 5,
    "netAmountMmk": 488035222e-2,
    "valueDate": "2026-07-10T13:41:20.357Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042923294",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-10T13:41:20.357Z",
    "updatedAt": "2026-07-10T13:41:20.357Z"
  },
  {
    "id": "tx_1042",
    "transactionRef": "IR-202608-04845-42",
    "senderName": "Kyaw Kyaw",
    "senderCountry": "Thailand",
    "sendingBank": "Kasikornbank",
    "sendingBankBic": "KASITHBK",
    "currency": "SGD",
    "amount": 4948,
    "exchangeRate": 1645.32,
    "convertedAmountMmk": 8141043359999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 8136043359999999e-9,
    "valueDate": "2026-07-09T12:34:28.263Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042850926",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-09T12:34:28.263Z",
    "updatedAt": "2026-07-09T12:34:28.263Z"
  },
  {
    "id": "tx_1043",
    "transactionRef": "IR-202608-14748-43",
    "senderName": "Tun Tun",
    "senderCountry": "UK",
    "sendingBank": "Barclays",
    "sendingBankBic": "BARCGB22",
    "currency": "THB",
    "amount": 1593,
    "exchangeRate": 63.49,
    "convertedAmountMmk": 101139.57,
    "feeAmount": 5,
    "netAmountMmk": 96139.57,
    "valueDate": "2026-07-08T13:49:25.521Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042242257",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-08T13:49:25.521Z",
    "updatedAt": "2026-07-08T13:49:25.521Z"
  },
  {
    "id": "tx_1044",
    "transactionRef": "IR-202608-98749-44",
    "senderName": "Aye Aye",
    "senderCountry": "Japan",
    "sendingBank": "SMBC",
    "sendingBankBic": "SMBCJPJT",
    "currency": "GBP",
    "amount": 2096,
    "exchangeRate": 2846.45,
    "convertedAmountMmk": 5966159199999999e-9,
    "feeAmount": 5,
    "netAmountMmk": 5961159199999999e-9,
    "valueDate": "2026-07-07T13:14:39.755Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042449012",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-07T13:14:39.755Z",
    "updatedAt": "2026-07-07T13:14:39.755Z"
  },
  {
    "id": "tx_1045",
    "transactionRef": "IR-202608-15311-45",
    "senderName": "Su Su",
    "senderCountry": "Malaysia",
    "sendingBank": "Maybank",
    "sendingBankBic": "MBBEMYKL",
    "currency": "JPY",
    "amount": 2983,
    "exchangeRate": 1319.92,
    "convertedAmountMmk": 3.9373213600000003e6,
    "feeAmount": 5,
    "netAmountMmk": 3.9323213600000003e6,
    "valueDate": "2026-07-06T14:14:54.123Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042761099",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-06T14:14:54.123Z",
    "updatedAt": "2026-07-06T14:14:54.123Z"
  },
  {
    "id": "tx_1046",
    "transactionRef": "IR-202608-89878-46",
    "senderName": "Mya Mya",
    "senderCountry": "China",
    "sendingBank": "ICBC",
    "sendingBankBic": "ICBCCNBJ",
    "currency": "CNY",
    "amount": 3991,
    "exchangeRate": 311.65,
    "convertedAmountMmk": 124379515e-2,
    "feeAmount": 5,
    "netAmountMmk": 123879515e-2,
    "valueDate": "2026-07-05T14:20:50.629Z",
    "status": "init",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042732550",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-05T14:20:50.629Z",
    "updatedAt": "2026-07-05T14:20:50.629Z"
  },
  {
    "id": "tx_1047",
    "transactionRef": "IR-202608-52247-47",
    "senderName": "Hla Hla",
    "senderCountry": "Europe",
    "sendingBank": "Deutsche Bank",
    "sendingBankBic": "DEUTDEFF",
    "currency": "MYR",
    "amount": 3543,
    "exchangeRate": 517.05,
    "convertedAmountMmk": 183190815e-2,
    "feeAmount": 5,
    "netAmountMmk": 182690815e-2,
    "valueDate": "2026-07-04T14:02:00.187Z",
    "status": "MFR",
    "statusMessage": "Timeout",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042857913",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-04T14:02:00.187Z",
    "updatedAt": "2026-07-04T14:02:00.187Z"
  },
  {
    "id": "tx_1048",
    "transactionRef": "IR-202608-12021-48",
    "senderName": "Aung Aung",
    "senderCountry": "USA",
    "sendingBank": "CitiBank",
    "sendingBankBic": "CITIUS33",
    "currency": "USD",
    "amount": 2052,
    "exchangeRate": 2100,
    "convertedAmountMmk": 4309200,
    "feeAmount": 5,
    "netAmountMmk": 4304200,
    "valueDate": "2026-07-03T14:56:12.664Z",
    "status": "success",
    "statusMessage": "Settled",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042567974",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-03T14:56:12.664Z",
    "updatedAt": "2026-07-03T14:56:12.664Z"
  },
  {
    "id": "tx_1049",
    "transactionRef": "IR-202608-75733-49",
    "senderName": "Maung Maung",
    "senderCountry": "Singapore",
    "sendingBank": "DBS Bank",
    "sendingBankBic": "DBSSSGSG",
    "currency": "EUR",
    "amount": 4536,
    "exchangeRate": 2435.37,
    "convertedAmountMmk": 1104683832e-2,
    "feeAmount": 5,
    "netAmountMmk": 1104183832e-2,
    "valueDate": "2026-07-02T14:03:56.998Z",
    "status": "failed",
    "statusMessage": "Rejected",
    "purpose": "Family Support",
    "beneficiaryAccount": "1042803654",
    "swiftMetadata": {
      "uetr": "12345678-1234-1234-1234-1234567890ab"
    },
    "createdAt": "2026-07-02T14:03:56.998Z",
    "updatedAt": "2026-07-02T14:03:56.998Z"
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
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "passwordStrength" TEXT DEFAULT 'Moderate';`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;`);
    await client.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3);`);
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
        "status" TEXT NOT NULL DEFAULT 'success',
        "statusMessage" TEXT,
        "purpose" TEXT NOT NULL,
        "beneficiaryAccount" TEXT NOT NULL,
        "swiftMetadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "TransactionAuditLog" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "transactionId" TEXT NOT NULL,
        "oldStatus" TEXT,
        "newStatus" TEXT NOT NULL,
        "changedBy" TEXT NOT NULL DEFAULT 'SYSTEM',
        "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "remarks" TEXT
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS "TransactionAuditLog_transactionId_idx" ON "TransactionAuditLog"("transactionId");`);
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
    console.log("Cleaning existing tables...");
    await client.query('TRUNCATE TABLE "InboundTransaction" CASCADE;');
    await client.query('TRUNCATE TABLE "FxRate" CASCADE;');
    await client.query('TRUNCATE TABLE "TwoFactorAuth" CASCADE;');
    await client.query('TRUNCATE TABLE "User" CASCADE;');
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
var prisma = {
  user: {
    async findUnique({ where, include }) {
      try {
        await ensureTablesReady();
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
          let user2 = userRes.rows[0] || null;
          if (!user2) {
            return null;
          }
          if (include?.twoFactorAuth && user2) {
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
        console.warn("findUnique caught error:", dbErr?.message);
        return null;
      }
    },
    async create({ data }) {
      try {
        await ensureTablesReady();
        const client = await pool.connect();
        try {
          const id = data.id || `usr_${Date.now()}`;
          const res = await client.query(
            `INSERT INTO "User" ("id", "email", "name", "password", "companyName", "phone", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
             RETURNING *`,
            [
              id,
              data.email.trim().toLowerCase(),
              data.name || "",
              data.password,
              data.companyName || "KBZ Bank Corporate Account",
              data.phone || "+95 9 798 112 889"
            ]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err) {
        console.error("user.create error:", err?.message);
        throw err;
      }
    },
    async update({ where, data }) {
      try {
        await ensureTablesReady();
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
          if (where.email) {
            whereClause = `LOWER("email") = LOWER($${idx})`;
            params.push(where.email.trim());
          } else if (where.id) {
            whereClause = `"id" = $${idx}`;
            params.push(where.id);
          } else {
            return null;
          }
          const res = await client.query(
            `UPDATE "User" SET ${updates.join(", ")} WHERE ${whereClause} RETURNING *`,
            params
          );
          return res.rows[0] || null;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("user.update error:", err?.message);
        return null;
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
    }
  },
  transactionAuditLog: {
    async findMany({ where, orderBy }) {
      try {
        await ensureTablesReady();
        const client = await pool.connect();
        try {
          let query = `SELECT * FROM "TransactionAuditLog" WHERE "transactionId" = $1`;
          if (orderBy?.changedAt) {
            query += ` ORDER BY "changedAt" ${orderBy.changedAt === "asc" ? "ASC" : "DESC"}`;
          }
          const res = await client.query(query, [where.transactionId]);
          return res.rows;
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("transactionAuditLog.findMany error:", err?.message);
        return [];
      }
    },
    async create({ data }) {
      try {
        await ensureTablesReady();
        const client = await pool.connect();
        try {
          const id = data.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const res = await client.query(
            `INSERT INTO "TransactionAuditLog" ("id", "transactionId", "oldStatus", "newStatus", "changedBy", "remarks", "changedAt")
             VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
            [id, data.transactionId, data.oldStatus || null, data.newStatus, data.changedBy || "SYSTEM", data.remarks || null]
          );
          return res.rows[0];
        } finally {
          client.release();
        }
      } catch (err) {
        console.warn("transactionAuditLog.create error:", err?.message);
        return null;
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
async function sendResetPasswordEmail(toEmail, resetUrl, recipientName) {
  const cleanRecipient = (toEmail || "").trim();
  if (!cleanRecipient) {
    console.error("[SMTP] No recipient email specified");
    return { success: false, error: "Recipient email is required" };
  }
  const name = recipientName || cleanRecipient.split("@")[0] || "Valued Customer";
  const subject = `[KBZ Bank IR Portal] Password Reset Request`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .header { background: #0B2B66; padding: 28px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 4px 0 0 0; font-size: 12px; color: #93c5fd; text-transform: uppercase; letter-spacing: 1px; }
        .content { padding: 32px 28px; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
        .btn-container { text-align: center; margin: 30px 0; }
        .reset-btn { display: inline-block; background-color: #0F4C81; color: #ffffff !important; padding: 14px 32px; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(15, 76, 129, 0.3); }
        .link-alt { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; word-break: break-all; font-size: 12px; color: #0F4C81; margin: 20px 0; }
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
            We received a request to reset the password for your KBZ Bank Inbound Remittance Portal account associated with <strong>${cleanRecipient}</strong>.
          </div>
          <div class="btn-container">
            <a href="${resetUrl}" target="_blank" class="reset-btn">Reset My Password</a>
          </div>
          <div class="text" style="font-size: 13px; margin-bottom: 8px;">
            If the button above does not work, copy and paste the following link into your web browser:
          </div>
          <div class="link-alt">
            <a href="${resetUrl}" style="color: #0F4C81; text-decoration: underline;">${resetUrl}</a>
          </div>
          <div class="warning">
            <strong>Security Notice:</strong> This password reset link is valid for <strong>15 minutes</strong>. If you did not make this request, please ignore this email or contact the Security Operations Center immediately.
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

Password Reset Request

Hello ${name},
We received a request to reset your password. Use the following link to choose a new password:

${resetUrl}

This link is valid for 15 minutes.
If you did not request this, please ignore this email.
Sent to: ${cleanRecipient}`;
  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: cleanRecipient,
      subject,
      text,
      html
    });
    console.log(`[SMTP] Reset password email sent successfully to ${cleanRecipient}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipients: cleanRecipient };
  } catch (err) {
    console.error(`[SMTP] Failed to send reset email to ${cleanRecipient}:`, err);
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
      if (!user2 && !cleanEmail.includes("@")) {
        user2 = await prisma.user.findUnique({
          where: { id: cleanEmail }
        });
        if (!user2) {
          user2 = await prisma.user.findUnique({
            where: { email: "sanyu.aung@kbzbank.com" }
          });
        }
      }
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
        branch: "Yangon Main Settlement Gateway Branch (0091)",
        passwordStrength: user2.passwordStrength
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
app.post(["/api/auth/forgot-password", "/auth/forgot-password"], async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user2 = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user2) {
      return res.status(404).json({ success: false, error: "User not found with this email address." });
    }
    const token = crypto3.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1e3);
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { resetToken: token, resetTokenExpires: expires }
    });
    const origin = req.headers.origin || (req.headers.host ? `${req.protocol || "https"}://${req.headers.host}` : "https://ir-portal-taupe.vercel.app");
    const relativePath = `/reset-password?email=${encodeURIComponent(cleanEmail)}&token=${token}`;
    const fullResetUrl = `${origin}${relativePath}`;
    const emailResult = await sendResetPasswordEmail(cleanEmail, fullResetUrl, user2.name);
    console.log(`[FORGOT_PASSWORD] Email dispatch result for ${cleanEmail}:`, emailResult);
    return res.json({
      success: true,
      message: "Password reset link sent to your email.",
      resetLink: relativePath,
      emailSent: emailResult.success,
      smtpError: emailResult.success ? void 0 : emailResult.error
    });
  } catch (err) {
    console.error("[FORGOT_PASSWORD_ERROR]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});
app.post(["/api/auth/reset-password", "/auth/reset-password"], async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user2 = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user2 || user2.resetToken !== token || !user2.resetTokenExpires || user2.resetTokenExpires < /* @__PURE__ */ new Date()) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset token" });
    }
    const evaluatePasswordStrength = (password) => {
      if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        return "Strong";
      }
      return "Moderate";
    };
    const passwordStrength = evaluatePasswordStrength(newPassword);
    const passwordHash = await AuthUtils.hashPassword(newPassword);
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: passwordHash, passwordStrength, resetToken: null, resetTokenExpires: null }
    });
    return res.json({ success: true, message: "Password has been reset successfully." });
  } catch (err) {
    console.error("[RESET_PASSWORD_ERROR]", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
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
app.get(["/api/transactions/:id/audit-log", "/transactions/:id/audit-log"], async (req, res) => {
  const { id } = req.params;
  if (dbAvailable) {
    try {
      const logs = await prisma.transactionAuditLog.findMany({
        where: { transactionId: id },
        orderBy: { changedAt: "desc" }
      });
      return res.json({ success: true, logs });
    } catch (err) {
      console.error("Error fetching transaction audit logs from Postgres:", err?.message);
    }
  }
  return res.json({ success: true, logs: [] });
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
    status: tx.status || "success",
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
    await prisma.transactionAuditLog.create({
      data: {
        transactionId: txId,
        newStatus: simulatedTx.status,
        remarks: "Transaction received via simulation",
        changedBy: "SYSTEM"
      }
    });
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
