import React, { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { corporateTheme } from './theme';
import { useAuthStore } from './store/useAuthStore';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { isAuthenticated } = useAuthStore();
  // Strictly Limited Navigation: 'dashboard' | 'ir-transactions' | 'settings'
  const [activePage, setActivePage] = useState<string>('dashboard');

  return (
    <MantineProvider theme={corporateTheme} defaultColorScheme="light">
      <Notifications position="top-right" zIndex={2000} autoClose={4000} />

      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <AppLayout activePage={activePage} onNavigate={setActivePage}>
          {activePage === 'dashboard' && <DashboardPage onNavigate={setActivePage} />}
          {activePage === 'ir-transactions' && <TransactionsPage />}
          {activePage === 'settings' && <SettingsPage />}
        </AppLayout>
      )}
    </MantineProvider>
  );
}
