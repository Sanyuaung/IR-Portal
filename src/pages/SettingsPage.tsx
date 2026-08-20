import React, { useState, useEffect } from 'react';
import {
  Paper,
  Tabs,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Stack,
  Text,
  Badge,
  Modal,
  PinInput,
  Progress,
  Divider,
  Alert,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  Shield,
  ShieldCheck,
  KeyRound,
  Smartphone,
  Mail,
  QrCode,
  Check,
  Copy,
  AlertCircle,
  Lock,
  User,
  Building,
  RefreshCw,
  Eye,
  ShieldAlert,
  X,
  Database,
  Server,
  Layers,
} from '../components/common/ui-icons';
import { z } from 'zod';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { notifications } from '@mantine/notifications';
import { TwoFactorMethod } from '../types';
import { QRCodeSVG } from 'qrcode.react';

// Zod schema for password change
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Must contain at least 1 uppercase letter' })
      .regex(/[a-z]/, { message: 'Must contain at least 1 lowercase letter' })
      .regex(/[0-9]/, { message: 'Must contain at least 1 number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Must contain at least 1 special character (!@#$%^&*)' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your new password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const {
    settings,
    set2FaEnabled,
    setTwoFactorMethod,
    initiateTotpSetup,
    verifyTotpCode,
    sendEmailOtp,
    verifyEmailOtp,
    disableTwoFactor,
    changePassword,
    tempTotpSecret,
    mockGeneratedOtpCode,
  } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<string | null>('security');

  // 2FA Setup Dialog states
  const [totpInputPin, setTotpInputPin] = useState('');
  const [emailInputPin, setEmailInputPin] = useState('');
  const [totpError, setTotpError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Disable 2FA with password confirmation modal
  const [showDisable2FaModal, setShowDisable2FaModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableError, setDisableError] = useState('');
  const [isDisabling, setIsDisabling] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isVerifyingTotp, setIsVerifyingTotp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [emailOtpSecondsLeft, setEmailOtpSecondsLeft] = useState(60);

  // 1-minute countdown timer for Email OTP
  useEffect(() => {
    let interval: any;
    if (showEmailModal && emailOtpSecondsLeft > 0) {
      interval = setInterval(() => {
        setEmailOtpSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showEmailModal, emailOtpSecondsLeft]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const strength = getPasswordStrength(newPassword);
  const getStrengthColor = (val: number) => {
    if (val < 50) return 'red';
    if (val < 75) return 'yellow';
    return 'green';
  };

  const handle2FaToggle = (checked: boolean) => {
    if (!checked && settings.is2FaEnabled) {
      // Prompt password verification before disabling 2FA per enterprise flow
      setDisablePassword('');
      setDisableError('');
      setShowDisable2FaModal(true);
    } else if (checked && !settings.is2FaEnabled) {
      handleEnable2FaClick();
    }
  };

  const handleEnable2FaClick = () => {
    if (settings.twoFactorMethod === 'totp') {
      handleStartTotpSetup();
    } else {
      handleStartEmailOtp();
    }
  };

  const handleConfirmDisable2Fa = async () => {
    if (!disablePassword) {
      setDisableError('Please enter your account password to confirm.');
      return;
    }

    setIsDisabling(true);
    setDisableError('');

    const res = await disableTwoFactor(disablePassword, user?.email || user?.merchantId);
    setIsDisabling(false);

    if (res.success) {
      setShowDisable2FaModal(false);
      notifications.show({
        title: '2FA Disabled',
        message: 'Two-Factor Authentication has been successfully deleted.',
        color: 'orange',
      });
    } else {
      setDisableError(res.message || 'Invalid password');
    }
  };

  const handleStartTotpSetup = async () => {
    await initiateTotpSetup(user?.email || user?.merchantId);
    setTotpInputPin('');
    setTotpError('');
    setShowQrModal(true);
  };

  const handleConfirmTotp = async () => {
    if (!totpInputPin || String(totpInputPin).trim().length !== 6) {
      setTotpError('Please enter a 6-digit code');
      return;
    }
    setTotpError('');
    setIsVerifyingTotp(true);
    const res = await verifyTotpCode(totpInputPin, user?.email || user?.merchantId);
    if (res.success) {
      setShowQrModal(false);
      setIsVerifyingTotp(false);
      notifications.show({
        title: 'Google Authenticator Configured',
        message: 'Two-factor authentication enabled successfully.',
        color: 'green',
        icon: <Check size={16} />,
      });
    } else {
      setTotpError(res.message || 'Invalid code. Please enter the current 6-digit code from Google Authenticator.');
      setIsVerifyingTotp(false);
    }
  };

  const handleStartEmailOtp = async () => {
    const emailToSend = user?.email || settings.emailForOtp || 'sanyu.aung@kbzbank.com';
    setEmailOtpSecondsLeft(60);
    await sendEmailOtp(user?.email || user?.merchantId, emailToSend);
    setEmailInputPin('');
    setEmailError('');
    setShowEmailModal(true);
    notifications.show({
      title: 'Verification Code Dispatched',
      message: `A 6-digit security OTP was sent to ${emailToSend}. The code is valid for 1 minute.`,
      color: 'blue',
      icon: <Mail size={16} />,
    });
  };

  const handleConfirmEmailOtp = async () => {
    if (!emailInputPin || String(emailInputPin).trim().length !== 6) {
      setEmailError('Please enter a 6-digit code');
      return;
    }
    setIsVerifyingEmail(true);
    const success = await verifyEmailOtp(emailInputPin, user?.email || user?.merchantId);
    if (success) {
      setShowEmailModal(false);
      setIsVerifyingEmail(false);
      notifications.show({
        title: 'Email 2FA Verified',
        message: `Registered email ${user?.email || settings.emailForOtp} verified for 2FA logins.`,
        color: 'green',
        icon: <Check size={16} />,
      });
    } else {
      setEmailError('Invalid OTP code. Please enter the security code sent to your email.');
      setIsVerifyingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    const result = passwordChangeSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) errMap[err.path[0] as string] = err.message;
      });
      setPasswordErrors(errMap);
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await changePassword(currentPassword, newPassword, user?.email || user?.merchantId);
      setIsChangingPass(false);

      if (res.success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        notifications.show({
          title: 'Password Updated Successfully',
          message: 'Your password has been changed. For security, please log in with your new password.',
          color: 'green',
          icon: <ShieldCheck size={16} />,
        });
        setTimeout(() => {
          logout();
        }, 1200);
      } else {
        setPasswordErrors({ currentPassword: res.message || 'Error updating password. Please check your current password.' });
      }
    } catch (err: any) {
      setIsChangingPass(false);
      setPasswordErrors({ currentPassword: err?.message || 'Failed to update password' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F4C81] tracking-tight">
          Portal Settings & Security
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage account protection and profile settings in one simple place.
        </p>
      </div>

      {/* At-a-glance status cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Paper withBorder p="md" radius="md" className="bg-white border-slate-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0F4C81] flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wide">
                Account Identity
              </Text>
              <Text size="sm" fw={700} c="#0F4C81">
                {user?.name || 'Customer'}
              </Text>
              <Text size="xs" c="dimmed" className="font-mono">
                {user?.email || 'customer@mmglobalremit.com'}
              </Text>
            </div>
          </div>
        </Paper>

        <Paper withBorder p="md" radius="md" className="bg-white border-slate-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                settings.is2FaEnabled ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {settings.is2FaEnabled ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wide">
                2FA Protection
              </Text>
              <Text size="sm" fw={700} c={settings.is2FaEnabled ? 'teal' : 'orange'}>
                {settings.is2FaEnabled ? 'Enabled' : 'Not Enabled'}
              </Text>
              <Text size="xs" c="dimmed">
                {settings.is2FaEnabled
                  ? `${settings.twoFactorMethod === 'totp' ? 'Google Authenticator' : 'Email OTP'} is active`
                  : 'Enable 2FA for stronger account security'}
              </Text>
            </div>
          </div>
        </Paper>

        <Paper withBorder p="md" radius="md" className="bg-white border-slate-200 shadow-xs">
          <div className="flex items-start gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${settings.passwordStrength === 'Strong' ? 'bg-emerald-50 text-emerald-700' : settings.passwordStrength === 'Moderate' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
              <Lock size={16} />
            </div>
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wide">
                Password Hygiene
              </Text>
              <Text size="sm" fw={700} c={settings.passwordStrength === 'Strong' ? 'teal' : settings.passwordStrength === 'Moderate' ? 'orange' : 'red'}>
                {settings.passwordStrength || 'Moderate'} Password
              </Text>
              <Text size="xs" c="dimmed">
                {settings.passwordStrength === 'Strong' ? 'Your password is secure.' : 'Update regularly to improve security.'}
              </Text>
            </div>
          </div>
        </Paper>
      </div>

      {/* {!settings.is2FaEnabled && (
        <Alert
          icon={<ShieldAlert size={18} />}
          color="orange"
          variant="light"
          radius="md"
          title="2FA Not Enabled"
        >
          <div className="space-y-2">
            <Text size="sm" c="orange.9">
              Your account is currently less secure. Please enable Two-Factor Authentication to protect logins and
              remittance access.
            </Text>
            <Group gap="xs">
              <Button
                size="xs"
                color="orange"
                leftSection={<ShieldCheck size={14} />}
                onClick={() => {
                  setActiveTab('security');
                  handleEnable2FaClick();
                }}
              >
                Enable 2FA Now
              </Button>
            </Group>
          </div>
        </Alert>
      )} */}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <div className="overflow-x-auto pb-1 mb-6">
          <Tabs.List className="bg-white p-1 rounded-lg border border-slate-200 flex-nowrap min-w-max">
            <Tabs.Tab value="security" leftSection={<ShieldCheck size={16} />}>
              Security & 2FA
            </Tabs.Tab>
            <Tabs.Tab value="password" leftSection={<KeyRound size={16} />}>
              Password
            </Tabs.Tab>
            <Tabs.Tab value="merchant" leftSection={<Building size={16} />}>
              Profile
            </Tabs.Tab>
          </Tabs.List>
        </div>

        {/* Tab 1: Two-Factor Authentication Module */}
        <Tabs.Panel value="security">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* CLEAN LIGHT THEME 2FA CARD MATCHING USER SPECIFICATIONS */}
              {!settings.is2FaEnabled ? (
                /* STATE 1: 2FA Disabled / Setup View */
                <Paper withBorder p="lg" radius="md" className="bg-white border-slate-200 shadow-xs">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-5">
                    <div className="text-[#0F4C81] mt-0.5">
                      <Shield size={26} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#0F4C81] tracking-tight leading-tight">
                        Two-Factor Authentication
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                  </div>

                  {/* Method Selection */}
                  <div className="mb-6">
                    <p className="text-slate-700 text-xs sm:text-sm font-semibold mb-3">
                      Choose your 2FA method:
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Email Button */}
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('email')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          settings.twoFactorMethod === 'email'
                            ? 'bg-[#0F4C81] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Mail size={16} />
                        <span>Email</span>
                      </button>

                      {/* Google Authenticator Button */}
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('totp')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          settings.twoFactorMethod === 'totp'
                            ? 'bg-[#0F4C81] text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Shield size={16} />
                        <span>Google Authenticator</span>
                      </button>
                    </div>
                  </div>

                  {/* Action: Enable 2FA Button */}
                  <button
                    type="button"
                    onClick={handleEnable2FaClick}
                    className="w-full py-2.5 sm:py-3 px-4 bg-[#0F4C81] hover:bg-[#0A365D] active:scale-[0.99] text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <Shield size={18} />
                    <span>Enable 2FA</span>
                  </button>
                </Paper>
              ) : (
                /* STATE 2: 2FA Enabled View */
                <Paper withBorder p="lg" radius="md" className="bg-white border-slate-200 shadow-xs space-y-5">
                  {/* Header with Enabled Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-[#0F4C81] mt-0.5">
                        <Shield size={26} strokeWidth={2.2} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-[#0F4C81] tracking-tight leading-tight">
                          Two-Factor Authentication
                        </h2>
                        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>

                    {/* ENABLED Badge */}
                    <div className="bg-[#16a34a] text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs uppercase tracking-wide shrink-0">
                      <Check size={14} strokeWidth={3} />
                      <span>ENABLED</span>
                    </div>
                  </div>

                  {/* Method Display */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <span className="text-slate-600 text-sm font-medium">Method:</span>
                    <span className="bg-blue-50 text-[#0F4C81] border border-blue-200 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide font-mono">
                      {settings.twoFactorMethod === 'totp' ? 'GOOGLE AUTHENTICATOR' : 'EMAIL'}
                    </span>
                  </div>

                  {/* Action Button: ONLY Disable 2FA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handle2FaToggle(false)}
                      className="bg-[#dc2626] hover:bg-[#b91c1c] active:scale-[0.99] text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <X size={16} strokeWidth={2.5} />
                      <span>Disable 2FA</span>
                    </button>
                  </div>
                </Paper>
              )}
            </div>

            {/* Right Column: Security Checklist */}
            <div className="space-y-4">
              <Paper withBorder p="md" radius="md" className="bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2 text-[#0F4C81] font-bold text-sm mb-2">
                  <ShieldCheck size={18} />
                  <span>Security Checklist</span>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <p>
                    • Keep 2FA enabled to protect remittance access from unauthorized login attempts.
                  </p>
                  <p>
                    • If you disable 2FA, password confirmation is required immediately.
                  </p>
                  <p>
                    • Security sessions automatically expire after inactivity.
                  </p>
                  <p>
                    • Use a strong password with letters, numbers, and special characters.
                  </p>
                </div>
              </Paper>
            </div>
          </div>
        </Tabs.Panel>

        {/* Tab 2: Password Change Module */}
        <Tabs.Panel value="password">
          <div className="w-full">
            <Paper withBorder p="lg" radius="md" className="bg-white border-slate-200">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <Text fw={700} size="md" c="#0F4C81">
                    Change Portal Password
                  </Text>
                  <Text size="xs" c="dimmed">
                    Ensure your account uses a strong password with letters, numbers, and symbols.
                  </Text>
                </div>

                <PasswordInput
                  label="Current Password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                  error={passwordErrors.currentPassword}
                  required
                  size="sm"
                />

                <PasswordInput
                  label="New Password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.currentTarget.value)}
                  error={passwordErrors.newPassword}
                  required
                  size="sm"
                />

                {newPassword && (
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs">
                      <span className="text-slate-500">Password Strength:</span>
                      <span className="font-semibold" style={{ color: getStrengthColor(strength) }}>
                        {strength < 50 ? 'Weak' : strength < 75 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                    <Progress value={strength} color={getStrengthColor(strength)} size="xs" radius="xl" />
                  </div>
                )}

                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  error={passwordErrors.confirmPassword}
                  required
                  size="sm"
                />

                <Paper withBorder p="md" radius="md" className="bg-slate-50 border-slate-200">
                  <div className="flex items-center gap-2 text-[#0F4C81] font-bold text-sm mb-2">
                    <ShieldCheck size={18} />
                    <span>Password Requirements</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <p>• At least 8 characters</p>
                    <p>• At least 1 uppercase & 1 lowercase letter</p>
                    <p>• At least 1 number and 1 special symbol (!@#$%^&*)</p>
                  </div>
                </Paper>

                <Button
                  type="submit"
                  color="corporateBlue"
                  className="bg-[#0F4C81] hover:bg-[#0A365D]"
                  loading={isChangingPass}
                  leftSection={<ShieldCheck size={16} />}
                >
                  Update & Encrypt Password
                </Button>
              </form>
            </Paper>
          </div>
        </Tabs.Panel>

        {/* Tab 3: Customer Account Profile (Strictly Matching Sign Up Registration Fields) */}
        <Tabs.Panel value="merchant">
          <div className="w-full">
            <Paper withBorder p="lg" radius="md" className="bg-white border-slate-200 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Text fw={700} size="md" c="#0F4C81">
                    Customer Account Profile
                  </Text>
                  <Text size="xs" c="dimmed">
                    Registered account details on file with MM Global Remit Gateway.
                  </Text>
                </div>
                <Badge color="blue" variant="light" size="sm">
                  KYC Verified
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* 1. Full Name */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block font-medium">Full Name</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {user?.name || 'San Yu Aung'}
                  </span>
                </div>

                {/* 2. Authorized Email Address */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-slate-500 block font-medium">Authorized Email Address</span>
                  <span className="font-medium text-slate-800 text-sm mt-0.5 block font-mono">
                    {user?.email || 'sanyuaung.ygn.mm@gmail.com'}
                  </span>
                </div>
              </div>
            </Paper>
          </div>
        </Tabs.Panel>
      </Tabs>

      {/* Modal 1: Google Authenticator QR Code Setup Modal */}
      <Modal
        opened={showQrModal}
        onClose={() => setShowQrModal(false)}
        title={
          <div className="flex items-center gap-2 font-bold text-[#0F4C81]">
            <QrCode size={20} />
            <span>Setup Google Authenticator (TOTP)</span>
          </div>
        }
        size="md"
        centered
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Scan the QR code below using Google Authenticator on your phone.
          </Text>

          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Native Vector SVG QR Code */}
            <div className="p-3 bg-white rounded-md shadow-xs border border-slate-200 flex items-center justify-center">
              <QRCodeSVG
                value={`otpauth://totp/${encodeURIComponent(`MM Global Remit:${user?.email || settings.emailForOtp || 'customer@mmglobalremit.com'}`)}?secret=${tempTotpSecret}&issuer=${encodeURIComponent('MM Global Remit')}`}
                size={180}
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="mt-3 text-center">
              <span className="text-[11px] text-slate-500 block">Manual Key:</span>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span className="font-mono font-bold text-xs bg-white px-2.5 py-1 rounded border border-slate-300 tracking-wider text-slate-800 select-all">
                  {tempTotpSecret}
                </span>
                <CopyButton value={tempTotpSecret || ''} timeout={2000}>
                  {({ copied, copy }) => (
                    <ActionIcon size="sm" color={copied ? 'teal' : 'gray'} variant="light" onClick={copy}>
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </ActionIcon>
                  )}
                </CopyButton>
              </div>
            </div>
          </div>

          <div>
            <Text size="xs" fw={600} c="slate.8" mb="xs" ta="center">
              Enter 6-Digit Code from Google Authenticator App:
            </Text>

            <div className="flex justify-center">
              <PinInput
                length={6}
                size="md"
                value={totpInputPin}
                onChange={setTotpInputPin}
                type="number"
                placeholder="○"
              />
            </div>
            {totpError && (
              <Text size="xs" c="red" ta="center" mt="xs">
                {totpError}
              </Text>
            )}
            <Text size="11px" c="dimmed" ta="center" mt="xs">
              Scan the QR code with your phone, then type the 6-digit code generated by the app.
            </Text>
          </div>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setShowQrModal(false)}>
              Cancel
            </Button>
            <Button
              color="corporateBlue"
              className="bg-[#0B2B66] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!totpInputPin || String(totpInputPin).trim().length !== 6}
              loading={isVerifyingTotp} onClick={handleConfirmTotp}
            >
              Verify & Enable TOTP
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal 2: Email OTP Verification Modal */}
      <Modal
        opened={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        title={
          <div className="flex items-center gap-2 font-bold text-[#0F4C81]">
            <Mail size={20} />
            <span>Verify Email Security Code</span>
          </div>
        }
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert color="blue" icon={<Mail size={16} />} title="Security Email Dispatched">
            A 6-digit verification code was dispatched to <strong>{user?.email || settings.emailForOtp}</strong> via MM Global Remit.
            <div className="mt-1 text-xs text-blue-800">
              Please check your inbox ({user?.email || settings.emailForOtp}). The code is valid for <strong>1 minute (60 seconds)</strong>.
            </div>
          </Alert>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Text size="xs" fw={600} c="slate.8">
                Enter 6-Digit Verification Code:
              </Text>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                  emailOtpSecondsLeft > 15
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : emailOtpSecondsLeft > 0
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {emailOtpSecondsLeft > 0
                  ? `⏱ Expires in 00:${emailOtpSecondsLeft.toString().padStart(2, '0')}`
                  : '⚠️ Code Expired'}
              </span>
            </div>

            <div className="flex justify-center">
              <PinInput
                length={6}
                size="md"
                value={emailInputPin}
                onChange={setEmailInputPin}
                type="number"
                placeholder="○"
              />
            </div>
            {emailError && (
              <Text size="xs" c="red" ta="center" mt="xs">
                {emailError}
              </Text>
            )}

            <div className="flex justify-center mt-3">
              <button
                type="button"
                onClick={handleStartEmailOtp}
                className="text-xs text-[#0B2B66] hover:underline font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RefreshCw size={12} className={emailOtpSecondsLeft === 0 ? 'animate-spin' : ''} />
                <span>
                  {emailOtpSecondsLeft > 0
                    ? `Didn't receive email? Resend code (${emailOtpSecondsLeft}s)`
                    : "Didn't receive email? Click to resend new code"}
                </span>
              </button>
            </div>
          </div>

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => setShowEmailModal(false)}>
              Cancel
            </Button>
            <Button
              color="corporateBlue"
              className="bg-[#0B2B66] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!emailInputPin || String(emailInputPin).trim().length !== 6}
              loading={isVerifyingEmail} onClick={handleConfirmEmailOtp}
            >
              Confirm Email 2FA
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal 3: Password Confirmation Modal to Disable 2FA */}
      <Modal
        opened={showDisable2FaModal}
        onClose={() => setShowDisable2FaModal(false)}
        title={
          <div className="flex items-center gap-2 font-bold text-red-600">
            <ShieldAlert size={20} />
            <span>Confirm 2FA Deactivation</span>
          </div>
        }
        size="sm"
        centered
      >
        <Stack gap="md">
          <Text size="xs" c="dimmed">
            Please enter your account password to confirm deactivating Two-Factor Authentication.
          </Text>

          <PasswordInput
            label="Account Password"
            placeholder="Enter your password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.currentTarget.value)}
            error={disableError}
            required
            autoFocus
          />

          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={() => setShowDisable2FaModal(false)}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={isDisabling}
              onClick={handleConfirmDisable2Fa}
            >
              Disable 2FA
            </Button>
          </Group>
        </Stack>
      </Modal>
    </div>
  );
};
