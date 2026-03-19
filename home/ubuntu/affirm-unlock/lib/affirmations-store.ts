import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Affirmation {
  id: string;
  text: string;
  active: boolean;
  order: number;
  isStandard?: boolean;
}

export interface AppSettings {
  lockHour: number;
  lockMinute: number;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
  sensitivityThreshold: number; // 0.0 to 1.0, default 0.90
  userName: string;
  onboardingComplete: boolean;
}

export interface AppState {
  isLocked: boolean;
  lastUnlockedDate: string | null; // ISO date string "YYYY-MM-DD"
  currentStreak: number;
  longestStreak: number;
  totalDaysCompleted: number;
}

const KEYS = {
  AFFIRMATIONS: "affirm_unlock:affirmations",
  SETTINGS: "affirm_unlock:settings",
  APP_STATE: "affirm_unlock:app_state",
};

export const STANDARD_AFFIRMATIONS: Omit<Affirmation, "order">[] = [
  { id: "std_1", text: "I am confident, capable, and ready for today.", active: false, isStandard: true },
  { id: "std_2", text: "I choose joy, peace, and gratitude in every moment.", active: false, isStandard: true },
  { id: "std_3", text: "I am worthy of love, success, and abundance.", active: false, isStandard: true },
  { id: "std_4", text: "My mind is clear, my heart is open, and I am present.", active: false, isStandard: true },
  { id: "std_5", text: "I embrace challenges as opportunities to grow.", active: false, isStandard: true },
  { id: "std_6", text: "I am grateful for this new day and all it brings.", active: false, isStandard: true },
  { id: "std_7", text: "I trust myself and my ability to create the life I want.", active: false, isStandard: true },
  { id: "std_8", text: "I radiate positivity and attract good things into my life.", active: false, isStandard: true },
];

const DEFAULT_SETTINGS: AppSettings = {
  lockHour: 0,
  lockMinute: 0,
  reminderEnabled: true,
  reminderHour: 7,
  reminderMinute: 0,
  sensitivityThreshold: 0.90,
  userName: "",
  onboardingComplete: false,
};

const DEFAULT_APP_STATE: AppState = {
  isLocked: false,
  lastUnlockedDate: null,
  currentStreak: 0,
  longestStreak: 0,
  totalDaysCompleted: 0,
};

// ─── Affirmations ────────────────────────────────────────────────────────────

export async function getAffirmations(): Promise<Affirmation[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.AFFIRMATIONS);
    if (!raw) return [];
    return JSON.parse(raw) as Affirmation[];
  } catch {
    return [];
  }
}

export async function saveAffirmations(affirmations: Affirmation[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.AFFIRMATIONS, JSON.stringify(affirmations));
}

export async function addAffirmation(text: string): Promise<Affirmation> {
  const existing = await getAffirmations();
  const newAffirmation: Affirmation = {
    id: `custom_${Date.now()}`,
    text: text.trim(),
    active: true,
    order: existing.length,
  };
  await saveAffirmations([...existing, newAffirmation]);
  return newAffirmation;
}

export async function updateAffirmation(id: string, updates: Partial<Affirmation>): Promise<void> {
  const existing = await getAffirmations();
  const updated = existing.map((a) => (a.id === id ? { ...a, ...updates } : a));
  await saveAffirmations(updated);
}

export async function deleteAffirmation(id: string): Promise<void> {
  const existing = await getAffirmations();
  await saveAffirmations(existing.filter((a) => a.id !== id));
}

export async function addStandardAffirmation(standardId: string): Promise<void> {
  const standard = STANDARD_AFFIRMATIONS.find((s) => s.id === standardId);
  if (!standard) return;
  const existing = await getAffirmations();
  if (existing.some((a) => a.id === standardId)) return; // already added
  const newAffirmation: Affirmation = {
    ...standard,
    active: true,
    order: existing.length,
  };
  await saveAffirmations([...existing, newAffirmation]);
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
}

// ─── App State ───────────────────────────────────────────────────────────────

export async function getAppState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.APP_STATE);
    if (!raw) return DEFAULT_APP_STATE;
    return { ...DEFAULT_APP_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export async function saveAppState(state: Partial<AppState>): Promise<void> {
  const current = await getAppState();
  await AsyncStorage.setItem(KEYS.APP_STATE, JSON.stringify({ ...current, ...state }));
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function markUnlockedToday(): Promise<AppState> {
  const current = await getAppState();
  const today = getTodayString();

  if (current.lastUnlockedDate === today) {
    return current; // already unlocked today
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const newStreak =
    current.lastUnlockedDate === yesterdayStr ? current.currentStreak + 1 : 1;

  const newState: AppState = {
    isLocked: false,
    lastUnlockedDate: today,
    currentStreak: newStreak,
    longestStreak: Math.max(current.longestStreak, newStreak),
    totalDaysCompleted: current.totalDaysCompleted + 1,
  };

  await saveAppState(newState);
  return newState;
}

export async function checkAndApplyDailyLock(): Promise<boolean> {
  const [state, settings] = await Promise.all([getAppState(), getSettings()]);
  const today = getTodayString();

  // If already unlocked today, don't lock
  if (state.lastUnlockedDate === today) {
    if (state.isLocked) {
      await saveAppState({ isLocked: false });
      return false;
    }
    return false;
  }

  // Otherwise, should be locked
  if (!state.isLocked) {
    await saveAppState({ isLocked: true });
  }
  return true;
}
