import { create } from 'zustand';

export interface UserPreferences {
  defaultZipCode?: string;
  defaultRetirementAge?: number;
  accessibilityMode?: boolean;
}

interface PersonalizationState {
  preferences: UserPreferences;
  setPreference: (key: keyof UserPreferences, value: any) => void;
  loadPreferences: (prefs: UserPreferences) => void;
}

export const usePersonalization = create<PersonalizationState>((set) => ({
  preferences: {},
  setPreference: (key, value) => set((state) => ({
    preferences: { ...state.preferences, [key]: value }
  })),
  loadPreferences: (prefs) => set({ preferences: prefs })
}));
