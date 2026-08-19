import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';
import { hashPassword } from '../utils/crypto';

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  rememberMerchantId: boolean;
  savedMerchantId: string;
  encryptedPasswordHash: string | null;
  lastActiveSession: string | null;
  completeLogin: (
    loginEmail: string,
    plainPassword: string,
    remember?: boolean,
    serverUserData?: Partial<UserProfile>
  ) => void;
  logout: () => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  fullName: 'San Yu Aung',
  name: 'San Yu Aung',
  companyName: 'Myanmar Horizon Trading Co., Ltd.',
  merchantId: 'MMR-8839201',
  merchantName: 'Myanmar Horizon Trading Co., Ltd.',
  accountNumber: '0091-2384-992019',
  email: 'sanyuaung.ygn.mm@gmail.com',
  phone: '+95 9 798 112 889',
  role: 'Customer Account Admin',
  branch: 'Yangon Main Settlement Branch (0091)',
  lastLogin: 'Today at 09:14 AM (IP: 103.119.22.1)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: true, // Start logged in for seamless initial review
      user: DEFAULT_USER,
      rememberMerchantId: true,
      savedMerchantId: 'sanyuaung.ygn.mm@gmail.com',
      encryptedPasswordHash: null,
      lastActiveSession: new Date().toISOString(),

      completeLogin: (loginEmail: string, plainPassword: string, remember = true, serverUserData?: Partial<UserProfile>) => {
        const passwordHash = hashPassword(plainPassword);
        const cleanEmail = loginEmail.trim().toLowerCase();
        const baseName = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : cleanEmail;
        const displayName =
          serverUserData?.merchantName ||
          (cleanEmail === 'sanyuaung.ygn.mm@gmail.com'
            ? 'Myanmar Horizon Trading Co., Ltd.'
            : `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Trading Co., Ltd.`);

        const cleanMerchantId =
          serverUserData?.merchantId && !serverUserData.merchantId.includes('@')
            ? serverUserData.merchantId
            : 'MMR-8839201';

        set({
          isAuthenticated: true,
          user: {
            ...DEFAULT_USER,
            merchantId: cleanMerchantId,
            merchantName: displayName,
            email: cleanEmail,
            accountNumber: serverUserData?.accountNumber || '0091-2384-992019',
            branch: serverUserData?.branch || 'Yangon Main Settlement Branch (0091)',
            role: serverUserData?.role || 'Customer Account Admin',
            lastLogin: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (IP: 103.119.22.1)`,
            ...serverUserData,
          },
          rememberMerchantId: remember,
          savedMerchantId: remember ? cleanEmail : '',
          encryptedPasswordHash: passwordHash,
          lastActiveSession: new Date().toISOString(),
        });
      },

      logout: () => {
        try {
          fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        } catch {}
        const savedId = get().rememberMerchantId ? get().savedMerchantId : '';
        set({
          isAuthenticated: false,
          user: null,
          savedMerchantId: savedId,
          encryptedPasswordHash: null,
        });
      },

      updateProfile: (partial) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        }));
      },
    }),
    {
      name: 'mm-global-remit-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        rememberMerchantId: state.rememberMerchantId,
        savedMerchantId: state.savedMerchantId,
      }),
    }
  )
);
