import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AppState as RNAppState } from "react-native";
import {
  Affirmation,
  AppSettings,
  AppState,
  getAffirmations,
  getSettings,
  getAppState,
  saveSettings,
  saveAppState,
  saveAffirmations,
  checkAndApplyDailyLock,
  markUnlockedToday,
} from "./affirmations-store";

interface AppContextValue {
  // Data
  affirmations: Affirmation[];
  settings: AppSettings;
  appState: AppState;
  isLoading: boolean;

  // Actions
  refreshAffirmations: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshAppState: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateAppState: (updates: Partial<AppState>) => Promise<void>;
  setAffirmations: (affirmations: Affirmation[]) => Promise<void>;
  unlockToday: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [affirmations, setAffirmationsState] = useState<Affirmation[]>([]);
  const [settings, setSettingsState] = useState<AppSettings>({
    lockHour: 0,
    lockMinute: 0,
    reminderEnabled: true,
    reminderHour: 7,
    reminderMinute: 0,
    sensitivityThreshold: 0.9,
    userName: "",
    onboardingComplete: false,
  });
  const [appState, setAppStateState] = useState<AppState>({
    isLocked: false,
    lastUnlockedDate: null,
    currentStreak: 0,
    longestStreak: 0,
    totalDaysCompleted: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshAffirmations = useCallback(async () => {
    const data = await getAffirmations();
    setAffirmationsState(data);
  }, []);

  const refreshSettings = useCallback(async () => {
    const data = await getSettings();
    setSettingsState(data);
  }, []);

  const refreshAppState = useCallback(async () => {
    const data = await getAppState();
    setAppStateState(data);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const current = await getSettings();
    const merged = { ...current, ...updates };
    await saveSettings(merged);
    setSettingsState(merged);
  }, []);

  const updateAppState = useCallback(async (updates: Partial<AppState>) => {
    const current = await getAppState();
    const merged = { ...current, ...updates };
    await saveAppState(merged);
    setAppStateState(merged);
  }, []);

  const setAffirmations = useCallback(async (newAffirmations: Affirmation[]) => {
    await saveAffirmations(newAffirmations);
    setAffirmationsState(newAffirmations);
  }, []);

  const unlockToday = useCallback(async () => {
    const newState = await markUnlockedToday();
    setAppStateState(newState);
  }, []);

  // Initial load
  useEffect(() => {
    async function initialize() {
      setIsLoading(true);
      try {
        const [aff, sett, state] = await Promise.all([
          getAffirmations(),
          getSettings(),
          getAppState(),
        ]);
        setAffirmationsState(aff);
        setSettingsState(sett);

        // Check if daily lock should be applied
        const shouldBeLocked = await checkAndApplyDailyLock();
        setAppStateState({ ...state, isLocked: shouldBeLocked });
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);

  // Re-check lock state whenever app comes to foreground
  useEffect(() => {
    const subscription = RNAppState.addEventListener("change", async (nextState) => {
      if (nextState === "active") {
        const shouldBeLocked = await checkAndApplyDailyLock();
        setAppStateState((prev) => ({ ...prev, isLocked: shouldBeLocked }));
      }
    });
    return () => subscription.remove();
  }, []);

  return (
    <AppContext.Provider
      value={{
        affirmations,
        settings,
        appState,
        isLoading,
        refreshAffirmations,
        refreshSettings,
        refreshAppState,
        updateSettings,
        updateAppState,
        setAffirmations,
        unlockToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
