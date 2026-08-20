import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Paper, Title, Text, Container } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Lock, ShieldCheck } from '../components/common/ui-icons';

export const ResetPasswordPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  const token = params.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      notifications.show({
        title: 'Error',
        message: 'Passwords do not match.',
        color: 'red',
      });
      return;
    }
    if (newPassword.length < 8) {
      notifications.show({
        title: 'Error',
        message: 'Password must be at least 8 characters long.',
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
          message: 'Password reset successfully. You can now login.',
          color: 'green',
        });
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
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
        message: 'Network error occurred.',
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Container size="sm" className="w-full max-w-md">
        <Paper withBorder p="xl" radius="md" className="bg-white shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mb-4">
              <Lock size={24} />
            </div>
            <Title order={3} className="text-slate-800 text-center">Set New Password</Title>
            <Text c="dimmed" size="sm" ta="center" mt="xs">
              Enter your new password below to regain access to your account.
            </Text>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextInput
              label="Email Address"
              value={email}
              readOnly
              variant="filled"
              className="opacity-70 pointer-events-none"
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.currentTarget.value)}
              required
            />

            <Paper withBorder p="md" radius="md" className="bg-slate-50 border-slate-200 my-4">
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
              fullWidth
              loading={isLoading}
              className="bg-[#0F4C81] hover:bg-[#0B3A66] text-white h-11"
            >
              Reset Password
            </Button>
            
            <div className="text-center mt-4">
               <a href="/" className="text-sm text-blue-600 hover:underline">Back to Login</a>
            </div>
          </form>
        </Paper>
      </Container>
    </div>
  );
};
