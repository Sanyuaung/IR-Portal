const fs = require('fs');
let appTs = fs.readFileSync('src/server/app.ts', 'utf8');

// Password evaluation function
const evaluatePasswordStrength = (password) => {
  if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
    return 'Strong';
  }
  return 'Moderate';
};

// 1. Add passwordStrength to login response
appTs = appTs.replace(
  'fullName: user.name,',
  `fullName: user.name,
        passwordStrength: user.passwordStrength || evaluatePasswordStrength(password),`
);

// 2. Add /api/auth/forgot-password and /api/auth/reset-password routes
const forgotPasswordRoutes = `
/**
 * POST /api/auth/forgot-password
 */
app.post(['/api/auth/forgot-password', '/auth/forgot-password'], async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 1000); // 1 minute
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { resetToken: token, resetTokenExpires: expires }
    });
    // Return the reset link for demo purposes
    const resetLink = \`/reset-password?email=\${encodeURIComponent(cleanEmail)}&token=\${token}\`;
    return res.json({ success: true, message: 'Password reset link sent to your email.', resetLink });
  } catch (err) {
    console.error('[FORGOT_PASSWORD_ERROR]', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/reset-password
 */
app.post(['/api/auth/reset-password', '/auth/reset-password'], async (req, res) => {
  try {
    const { email, token, newPassword } = req.body || {};
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (!user || user.resetToken !== token || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }
    
    // Evaluate strength
    const evaluatePasswordStrength = (password) => {
      if (password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        return 'Strong';
      }
      return 'Moderate';
    };

    const passwordStrength = evaluatePasswordStrength(newPassword);

    // Using the same hash function as seed.ts
    const ENCRYPTION_SALT = 'KBZ_IR_PORTAL_SECURE_SALT_2026';
    const hashPassword = (password) => crypto.createHash('sha256').update(password + ENCRYPTION_SALT).digest('hex');
    const passwordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: passwordHash, passwordStrength, resetToken: null, resetTokenExpires: null }
    });

    return res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('[RESET_PASSWORD_ERROR]', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

`;

appTs = appTs.replace(
  '/**\n * POST /api/auth/signup',
  forgotPasswordRoutes + '/**\n * POST /api/auth/signup'
);

fs.writeFileSync('src/server/app.ts', appTs);
