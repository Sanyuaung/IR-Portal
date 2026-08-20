const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

// Insert TRUNCATE before seeding users
const truncateCode = `
    console.log('Cleaning existing tables...');
    await client.query('TRUNCATE TABLE "InboundTransaction" CASCADE;');
    await client.query('TRUNCATE TABLE "FxRate" CASCADE;');
    await client.query('TRUNCATE TABLE "TwoFactorAuth" CASCADE;');
    await client.query('TRUNCATE TABLE "User" CASCADE;');
    
    // 7. Seed Default Users
`;

if (!code.includes('TRUNCATE TABLE')) {
  code = code.replace('    // 7. Seed Default Users', truncateCode);
  fs.writeFileSync('src/server/seed.ts', code);
}
