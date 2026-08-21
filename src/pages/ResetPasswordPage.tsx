import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container, Progress, Badge } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle } from '../components/common/ui-icons';

export const ResetPasswordPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Requirements checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Strength score (0 - 100)
  const calculateStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (hasMinLength) score += 20;
    if (hasUppercase) score += 20;
    if (hasLowercase) score += 20;
    if (hasNumber) score += 20;
    if (hasSpecial) score += 20;
    return score;
  };

  const strength = calculateStrength();

  const getStrengthInfo = (score: number) => {
    if (score === 0) return { label: 'Empty', color: 'gray', barColor: '#cbd5e1' };
    if (score < 40) return { label: 'Weak', color: 'red', barColor: '#ef4444' };
    if (score < 80) return { label: 'Moderate', color: 'yellow', barColor: '#f59e0b' };
    if (score < 100) return { label: 'Good', color: 'blue', barColor: '#3b82f6' };
    return { label: 'Strong', color: 'green', barColor: '#10b981' };
  };

  const strengthInfo = getStrengthInfo(strength);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Validation Error',
        message: 'New passwords do not match.',
        color: 'red',
      });
      return;
    }
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      notifications.show({
        title: 'Validation Error',
        message: 'Please fulfill all password security requirements.',
        color: 'red',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        notifications.show({
          title: 'Success',
          message: 'Password reset successfully in database. You can now login with your new password.',
          color: 'green',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        notifications.show({
          title: 'Error',
          message: data.error || 'Failed to reset password.',
          color: 'red',
        });
      }
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Network error occurred. Please try again.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <Container size="sm" className="w-full max-w-lg">
        <Paper withBorder p="xl" radius="lg" className="bg-white dark:bg-slate-900 shadow-md border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 text-[#0F4C81] dark:text-blue-300 rounded-2xl flex items-center justify-center mb-3 border border-blue-100 dark:border-blue-800/50 shadow-xs">
              <Lock size={28} />
            </div>
            <Title order={3} className="text-[#0F4C81] dark:text-blue-300 font-bold">Set New Password</Title>
            <Text c="dimmed" size="xs" mt="xs" className="max-w-sm">
              Please enter your new password. We will securely update your account in the KBZ Bank database.
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Target Account Email"
              value={email}
              readOnly
              size="sm"
              variant="filled"
              className="opacity-80 pointer-events-none"
            />

            <div>
              <PasswordInput
                label="New Password"
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                required
                size="sm"
              />

              {/* Real-time Password Strength Meter */}
              {newPassword && (
                <div className="mt-2 space-y-1.5 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-md border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Password Strength:</span>
                    <Badge size="xs" variant="light" color={strengthInfo.color} className="font-semibold">
                      {strengthInfo.label} ({strength}%)
                    </Badge>
                  </div>
                  <Progress
                    value={strength}
                    color={strengthInfo.color}
                    size="xs"
                    radius="xl"
                    className="transition-all duration-300"
                  />
                </div>
              )}
            </div>

            <div>
              <PasswordInput
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                required
                size="sm"
                error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              />
            </div>

            {/* Interactive Requirements Checklist */}
            <Paper withBorder p="sm" radius="md" className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 text-[#0F4C81] dark:text-blue-300 font-bold text-xs mb-2">
                <ShieldCheck size={16} />
                <span>Password Requirements</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hasMinLength ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hasUppercase ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
                  <span>1 uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hasLowercase ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
                  <span>1 lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hasNumber ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
                  <span>1 numeric digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {hasSpecial ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
                  <span>1 special symbol (!@#$%^&*)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                  {passwordsMatch ? <CheckCircle2 size={13} /> : <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" />}
                  <span>Passwords match</span>
                </div>
              </div>
            </Paper>

            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial || !passwordsMatch}
              className="bg-[#0F4C81] hover:bg-[#0A365D] text-white h-10 font-semibold shadow-xs disabled:opacity-50"
            >
              Update Password
            </Button>
            
            <div className="text-center pt-1">
               <a href="/" className="text-xs font-semibold text-[#0F4C81] dark:text-blue-300 hover:underline">
                 ← Back to Sign In
               </a>
            </div>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

