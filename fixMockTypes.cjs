const fs = require('fs');
let code = fs.readFileSync('src/data/mockTransactions.ts', 'utf8');
code = code.replace(/"messageType": "MT103",\s*/g, '');
fs.writeFileSync('src/data/mockTransactions.ts', code);
