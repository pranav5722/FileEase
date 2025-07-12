import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  appLockEnabled: boolean;
  useBiometrics: boolean;
  pin: string | null;
  firstLaunch: boolean;
  
  // Actions
  toggleDarkMode: () => void;
  toggleAppLock: () => void;
  toggleBiometrics: () => void;
  setPin: (pin: string) => void;
  clearPin: () => void;
  setFirstLaunch: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      appLockEnabled: false,
      useBiometrics: false,
      pin: null,
      firstLaunch: true,
      
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      
      toggleAppLock: () => set((state) => ({ appLockEnabled: !state.appLockEnabled })),
      
      toggleBiometrics: () => set((state) => ({ useBiometrics: !state.useBiometrics })),
      
      setPin: (pin) => set({ pin }),
      
      clearPin: () => set({ pin: null }),
      
      setFirstLaunch: (value) => set({ firstLaunch: value }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);