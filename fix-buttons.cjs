const fs = require('fs');
let content = fs.readFileSync('src/pages/LoginPage.tsx', 'utf8');

content = content.replace(
  /<button\s+type="submit"\s+disabled=\{isLoading\}\s+className="w-full py-2.5 px-4 bg-\[#002C76\].*?>([\s\S]*?)<\/button>/g,
  '<Button type="submit" fullWidth loading={isLoading} size="md" radius="md" color="#002C76">$1</Button>'
);

content = content.replace(
  /<button\s+type="submit"\s+disabled=\{isLoading \|\| \(\!isUsingBackupCode.*?\)\}\s+className="w-full.*?>([\s\S]*?)<\/button>/g,
  '<Button type="submit" fullWidth loading={isLoading} disabled={isLoading || (!isUsingBackupCode && (!twoFactorPin || String(twoFactorPin).trim().length !== 6)) || (isUsingBackupCode && (!backupCodeInput || String(backupCodeInput).trim().length < 6))} size="md" radius="md" color="#002C76">$1</Button>'
);

fs.writeFileSync('src/pages/LoginPage.tsx', content);
