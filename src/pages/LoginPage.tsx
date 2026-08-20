import React, { useState, useEffect } from 'react';
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Title,
  Text,
  Alert,
  PinInput,

  Progress,
} from '@mantine/core';
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  Globe2,
  Smartphone,
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  Key,
  User,
  UserPlus,
  LogIn,
} from '../components/common/ui-icons';
import { z } from 'zod';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { notifications } from '@mantine/notifications';
import { KbzStackedWhiteLogo, KbzHorizontalLogo } from '../components/common/KbzLogo';
import { TwoFactorService } from '../services/twoFactorService';

// Zod Validation Schema for Login
const loginSchema = z.object({
  email: z.string().min(3, { message: 'Email or User ID is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

// Zod Validation Schema for Registration / Sign Up
const signupSchema = z
  .object({
    name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const LoginPage: React.FC = () => {
  const { completeLogin, savedMerchantId, rememberMerchantId } = useAuthStore();
  const { settings, sendEmailOtp, mockGeneratedOtpCode } = useSettingsStore();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState(savedMerchantId || '');
  const [loginPassword, setLoginPassword] = useState('');
  const [remember, setRemember] = useState(rememberMerchantId);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  // Sign Up Form States
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(false);

  // 2FA Challenge Flow State
  const [is2FaStep, setIs2FaStep] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'GOOGLE_AUTH' | 'EMAIL'>('EMAIL');
  const [twoFactorPin, setTwoFactorPin] = useState('');
  const [backupCodeInput, setBackupCodeInput] = useState('');
  const [isUsingBackupCode, setIsUsingBackupCode] = useState(false);
  const [twoFactorError, setTwoFactorError] = useState('');
  const [activeEmailOtp, setActiveEmailOtp] = useState(mockGeneratedOtpCode);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 6) score += 30;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 35;
    if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 8) score += 35;
    return score;
  };

  const passStrength = getPasswordStrength(signupPassword);

  // Handle Step 1: Sign In Credentials Submission
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});

    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      const formattedErrors: { email?: string; password?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === 'email') formattedErrors.email = err.message;
        if (err.path[0] === 'password') formattedErrors.password = err.message;
      });
      setLoginErrors(formattedErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Call Backend API /api/auth/login
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const text = await resp.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: 'Unexpected server error. Please try again.' };
      }

      setIsLoading(false);

      if (resp.ok) {
        if (data.requiresOtp || data.require2Fa) {
          setIs2FaStep(true);
          setTempToken(data.tempToken || null);
          setTwoFactorMethod(data.method || 'EMAIL');
          if (data.activeOtp) setActiveEmailOtp(data.activeOtp);
          setTwoFactorPin('');
          setBackupCodeInput('');
          setTwoFactorError('');
          return;
        }

        completeLogin(loginEmail, loginPassword, remember, data.user);
        notifications.show({
          title: 'Sign In Successful',
          message: `Welcome back, ${data.user?.name || loginEmail}!`,
          color: 'green',
          icon: <ShieldCheck size={16} />,
        });
      } else {
        setLoginErrors({ general: data?.error || data?.message || 'Invalid credentials' });
      }
    } catch (err: any) {
      setIsLoading(false);
      setLoginErrors({ general: err?.message || 'Network error. Please try again.' });
    }
  };

  // Handle Sign Up Form Submission
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});

    const validation = signupSchema.safeParse({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      confirmPassword: signupConfirmPassword,
    });

    if (!validation.success) {
      const formatted: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) formatted[err.path[0] as string] = err.message;
      });
      setSignupErrors(formatted);
      return;
    }

    setIsLoading(true);

    try {
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signupName.trim(),
          email: signupEmail.trim(),
          password: signupPassword,
        }),
      });

      const text = await resp.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: 'Unexpected server error. Please try again.' };
      }

      setIsLoading(false);

      if (resp.ok && (data.success || data.user)) {
        setLoginEmail(signupEmail);
        setLoginPassword('');
        setSignupPassword('');
        setSignupConfirmPassword('');
        setAuthMode('signin');
        notifications.show({
          title: 'Account Registered Successfully',
          message: `Welcome, ${signupName}! Your account has been registered. Please sign in with your password.`,
          color: 'green',
          icon: <CheckCircle2 size={16} />,
        });
      } else {
        setSignupErrors({ general: data?.error || data?.message || 'Failed to create account.' });
      }
    } catch (err: any) {
      setIsLoading(false);
      setSignupErrors({ general: err?.message || 'Network error. Please try again.' });
    }
  };

  // Handle Step 2: 2FA Verification (Pin or Backup Code)
  const handleVerify2FaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorError('');

    const codeToVerify = isUsingBackupCode ? backupCodeInput.trim() : twoFactorPin.trim();

    if (!isUsingBackupCode && (!codeToVerify || String(codeToVerify).trim().length !== 6)) {
      setTwoFactorError('Please enter all 6 digits of the security code.');
      return;
    }

    if (isUsingBackupCode && (!codeToVerify || String(codeToVerify).trim().length < 6)) {
      setTwoFactorError('Please enter a valid emergency backup code.');
      return;
    }

    setIsLoading(true);

    try {
      // Call Backend /api/auth/verify-2fa
      const resp = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: loginEmail,
          tempToken,
          code: codeToVerify,
        }),
      });

      const text = await resp.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: 'Unexpected server error. Please try again.' };
      }

      setIsLoading(false);

      if (resp.ok && data.success) {
        completeLogin(loginEmail, loginPassword, remember, data.user);
        notifications.show({
          title: '2FA Verification Successful',
          message: `Multi-factor authorization verified for ${loginEmail}.`,
          color: 'green',
          icon: <CheckCircle2 size={16} />,
        });
      } else {
        setTwoFactorError(data?.error || data?.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setTwoFactorError(err?.message || 'Network error. Please try again.');
    }
  };

  const handleResendEmailOtp = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    const newCode = await sendEmailOtp(loginEmail);
    setActiveEmailOtp(newCode);
    notifications.show({
      title: 'New Verification Code Dispatched',
      message: `A 6-digit OTP (${newCode}) was sent to ${loginEmail}`,
      color: 'blue',
      icon: <Mail size={16} />,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC]">
      {/* LEFT PANEL: Public Customer Remittance Portal Banner */}
      <div className="lg:w-1/2 bg-[#0F4C81] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header & Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <KbzStackedWhiteLogo />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-blue-100 border border-white/10 mb-4">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>Secure Inbound Remittance Gateway</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Cross-Border Inbound <br />
            <span className="text-amber-300">Customer Remit Portal</span>
          </h1>

          <p className="mt-4 text-sm text-slate-200 max-w-md leading-relaxed">
            Real-time tracking of international remittances, instant Myanmar Kyat (MMK) foreign exchange settlements, and transparent SWIFT GPI delivery audit trails.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-200 mb-2">
              <Globe2 size={18} />
            </div>
            <h4 className="font-bold text-sm text-white">Global SWIFT Inbound Feed</h4>
            <p className="text-xs text-slate-300 mt-1">
              Live tracking from international remitting partners across Singapore, Thailand, US, Japan, EU, and UAE.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 mb-2">
              <ShieldCheck size={18} />
            </div>
            <h4 className="font-bold text-sm text-white">Bank-Grade 2FA Security</h4>
            <p className="text-xs text-slate-300 mt-1">
              End-to-end multi-factor authentication via Google Authenticator and verified Email OTP.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2 relative z-10">
          <div>
            <span>Version 3.1.0 • Public Customer Portal</span>
          </div>
          <div>
            <span>© {new Date().getFullYear()} MM Global Remit Gateway. All rights reserved.</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Form Card (Sign In / Sign Up) */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden mb-6 text-center">
            <div className="flex justify-center mb-2">
              <KbzHorizontalLogo />
            </div>
            <Text size="xs" c="dimmed">
              Inbound Remittance Merchant Portal
            </Text>
          </div>

          {/* MAIN AUTHENTICATION CARD */}
          {!is2FaStep ? (
            <div className="bg-white border border-[#d9dbe9] rounded-xl p-6 sm:p-8 shadow-xs">
              {/* Tab Selector: Sign In vs Sign Up */}
              <div className="flex bg-[#eff0f6] p-1 rounded-lg mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setLoginErrors({});
                  }}
                  className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-[#002C76] shadow-xs'
                      : 'text-[#6e7191] hover:text-[#14142b]'
                  }`}
                >
                  <LogIn size={15} />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setSignupErrors({});
                  }}
                  className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-[#002C76] shadow-xs'
                      : 'text-[#6e7191] hover:text-[#14142b]'
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Sign Up</span>
                </button>
              </div>

              {/* VIEW A: SIGN IN FORM */}
              {authMode === 'signin' ? (
                <div>
                  <div className="mb-5">
                    <Title order={2} size="h3" fw={700} c="#002C76">
                      Sign In to IR Portal
                    </Title>
                    <Text size="xs" c="dimmed" mt={1}>
                      Enter your registered email address and password.
                    </Text>
                  </div>

                  {loginErrors.general && (
                    <Alert icon={<AlertCircle size={16} />} color="red" radius="md" mb="md">
                      {loginErrors.general}
                    </Alert>
                  )}

                  <form onSubmit={handleSignInSubmit} className="space-y-4">
                    <TextInput
                      label="Email Address / User ID"
                      placeholder="e.g. sanyu.aung@kbzbank.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.currentTarget.value)}
                      error={loginErrors.email}
                      required
                      size="sm"
                      leftSection={<User size={16} className="text-[#a0a3bd]" />}
                    />

                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.currentTarget.value)}
                      error={loginPassword ? undefined : loginErrors.password}
                      required
                      size="sm"
                      leftSection={<Lock size={16} className="text-[#a0a3bd]" />}
                    />

                    <div className="flex items-center justify-between pt-1">
                      <Checkbox
                        label="Remember Me"
                        checked={remember}
                        onChange={(e) => setRemember(e.currentTarget.checked)}
                        size="xs"
                        color="primary"
                      />

                      <a
                        href="#forgot-password"
                        onClick={(e) => {
                          e.preventDefault();
                          notifications.show({
                            title: 'Password Reset',
                            message: 'Please contact MM Global Remit Support or use your registered email 2FA recovery.',
                            color: 'blue',
                          });
                        }}
                        className="text-xs text-[#0F4C81] font-medium hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </a>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 bg-[#0F4C81] hover:bg-[#0A365D] font-semibold text-white text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{isLoading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>

                  <div className="mt-6 pt-4 border-t border-[#eff0f6] text-center">
                    <p className="text-xs text-[#6e7191]">
                      Don't have an account yet?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setSignupErrors({});
                        }}
                        className="text-[#0F4C81] font-bold hover:underline cursor-pointer"
                      >
                        Create an account
                      </button>
                    </p>
                  </div>
                </div>
              ) : (
                /* VIEW B: SIGN UP / REGISTRATION FORM */
                <div>
                  <div className="mb-5">
                    <Title order={2} size="h3" fw={700} c="#0F4C81">
                      Create Customer Account
                    </Title>
                    <Text size="xs" c="dimmed" mt={1}>
                      Register for public inbound cross-border remittance tracking.
                    </Text>
                  </div>

                  {signupErrors.general && (
                    <Alert icon={<AlertCircle size={16} />} color="red" radius="md" mb="md">
                      {signupErrors.general}
                    </Alert>
                  )}

                  <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
                    <TextInput
                      label="Full Name"
                      placeholder="e.g. San Yu Aung"
                      value={signupName}
                      onChange={(e) => setSignupName(e.currentTarget.value)}
                      error={signupErrors.name}
                      required
                      size="sm"
                      leftSection={<User size={16} className="text-[#a0a3bd]" />}
                    />

                    <TextInput
                      label="Email Address"
                      placeholder="e.g. sanyu.aung@gmail.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.currentTarget.value)}
                      error={signupErrors.email}
                      required
                      size="sm"
                      leftSection={<Mail size={16} className="text-[#a0a3bd]" />}
                    />

                    <PasswordInput
                      label="Password"
                      placeholder="Minimum 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.currentTarget.value)}
                      error={signupErrors.password}
                      required
                      size="sm"
                      leftSection={<Lock size={16} className="text-[#a0a3bd]" />}
                    />

                    {signupPassword && (
                      <div>
                        <div className="flex justify-between text-[11px] text-[#6e7191] mb-1">
                          <span>Password Strength</span>
                          <span className={passStrength >= 70 ? 'text-[#27ae60] font-semibold' : 'text-[#e2b93b]'}>
                            {passStrength >= 70 ? 'Strong' : 'Medium'}
                          </span>
                        </div>
                        <Progress value={passStrength} size="xs" color={passStrength >= 70 ? 'success' : 'warning'} radius="xl" />
                      </div>
                    )}

                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Re-enter password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.currentTarget.value)}
                      error={signupErrors.confirmPassword}
                      required
                      size="sm"
                      leftSection={<Lock size={16} className="text-[#a0a3bd]" />}
                    />

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 bg-[#0F4C81] hover:bg-[#0A365D] font-semibold text-white text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>{isLoading ? 'Registering Account...' : 'Register Account'}</span>
                        <UserPlus size={16} />
                      </button>
                    </div>
                  </form>

                  <div className="mt-5 pt-3 border-t border-[#eff0f6] text-center">
                    <p className="text-xs text-[#6e7191]">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setLoginErrors({});
                        }}
                        className="text-[#0F4C81] font-bold hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[#eff0f6] flex items-center justify-center gap-1.5 text-xs text-[#6e7191]">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Encrypted 256-Bit SSL Connection</span>
              </div>
            </div>
          ) : (
            /* STEP 2: TWO-FACTOR AUTHENTICATION (2FA) CHALLENGE CARD */
            <div className="bg-white border border-[#d9dbe9] rounded-xl p-8 shadow-xs">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-[#e6eaf1] text-[#0F4C81] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#b0bed5] shadow-xs">
                  {isUsingBackupCode ? (
                    <Key size={24} className="text-[#0F4C81]" />
                  ) : twoFactorMethod === 'GOOGLE_AUTH' ? (
                    <Smartphone size={24} className="text-[#0F4C81]" />
                  ) : (
                    <Mail size={24} className="text-[#0F4C81]" />
                  )}
                </div>

                <Title order={2} size="h3" fw={700} c="#0F4C81">
                  {isUsingBackupCode ? 'Emergency Backup Code' : 'Two-Factor Authentication'}
                </Title>
                <Text size="xs" c="dimmed" mt={1}>
                  {isUsingBackupCode
                    ? 'Enter one of your 8-character emergency backup recovery codes.'
                    : twoFactorMethod === 'GOOGLE_AUTH'
                    ? 'Enter the 6-digit verification code from your Google Authenticator app.'
                    : `Enter the 6-digit OTP security code sent to ${loginEmail}`}
                </Text>

                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#eff0f6] rounded-full text-xs font-mono text-[#393652]">
                  <KeyRound size={12} className="text-[#6e7191]" />
                  <span>Account: <strong>{loginEmail}</strong></span>
                </div>
              </div>

              {/* Method-specific helper alerts */}
              {twoFactorMethod === 'EMAIL' && !isUsingBackupCode ? (
                <Alert color="info" icon={<Mail size={16} />} radius="md" mb="md">
                  <div className="text-xs">
                    <span>A 6-digit verification code was sent to <strong>{loginEmail}</strong> via MM Global Remit service.</span>
                    <div className="text-[11px] text-[#0F4C81] mt-1 font-medium">
                      Please check your inbox or spam folder.
                    </div>
                  </div>
                </Alert>
              ) : twoFactorMethod === 'GOOGLE_AUTH' && !isUsingBackupCode ? (
                <Alert color="success" icon={<Smartphone size={16} />} radius="md" mb="md">
                  <div className="text-xs">
                    <span>Active Device: </span>
                    <strong className="text-[#104928]">Google Authenticator</strong>
                    <div className="text-[11px] text-[#4e4b66] mt-0.5">
                      Open Google Authenticator and enter the active 6-digit code for <strong>MM Global Remit</strong>.
                    </div>
                  </div>
                </Alert>
              ) : null}

              {twoFactorError && (
                <Alert icon={<AlertCircle size={16} />} color="error" radius="md" mb="md">
                  {twoFactorError}
                </Alert>
              )}

              <form onSubmit={handleVerify2FaSubmit} className="space-y-5">
                {!isUsingBackupCode ? (
                  <div className="flex flex-col items-center justify-center">
                    <Text size="xs" fw={600} c="neutral.6" mb="xs">
                      Enter 6-Digit Code:
                    </Text>
                    <PinInput
                      length={6}
                      size="lg"
                      value={twoFactorPin}
                      onChange={setTwoFactorPin}
                      type="number"
                      placeholder="○"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div>
                    <TextInput
                      label="8-Character Emergency Backup Code"
                      placeholder="e.g. 8K9M2L7Q"
                      value={backupCodeInput}
                      onChange={(e) => setBackupCodeInput(e.currentTarget.value.toUpperCase())}
                      size="md"
                      className="font-mono text-center"
                      maxLength={8}
                      autoFocus
                    />
                  </div>
                )}

                {twoFactorMethod === 'EMAIL' && (
                  <div className="text-center">
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendEmailOtp}
                      className={`text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                        resendCooldown > 0
                          ? 'text-[#a0a3bd] cursor-not-allowed'
                          : 'text-[#0F4C81] hover:underline'
                      }`}
                    >
                      <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'animate-spin-slow'} />
                      <span>
                        {resendCooldown > 0
                          ? `Resend code in ${resendCooldown}s`
                          : 'Resend Verification Code'}
                      </span>
                    </button>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || (!isUsingBackupCode && (!twoFactorPin || String(twoFactorPin).trim().length !== 6)) || (isUsingBackupCode && (!backupCodeInput || String(backupCodeInput).trim().length < 6))}
                    className="w-full py-2.5 px-4 bg-[#0F4C81] hover:bg-[#0A365D] font-semibold text-white text-sm rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#0F4C81] disabled:shadow-none"
                  >
                    <span>{isLoading ? 'Verifying...' : 'Verify & Access Portal'}</span>
                    <ShieldCheck size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIs2FaStep(false);
                      setTwoFactorError('');
                    }}
                    className="w-full py-2 text-xs font-medium text-[#6e7191] hover:text-[#14142b] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
