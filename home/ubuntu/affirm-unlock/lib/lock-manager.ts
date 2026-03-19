import { AppState as RNAppState, AppStateStatus } from "react-native";
import {
  getAppState,
  getSettings,
  saveAppState,
  getTodayString,
} from "./affirmations-store";

type LockChangeCallback = (isLocked: boolean) => void;

let appStateSubscription: ReturnType<typeof RNAppState.addEventListener> | null = null;
let lockChangeCallback: LockChangeCallback | null = null;

/**
 * Determine whether the phone should currently be locked.
 * Logic:
 *  - If the user has already unlocked today → not locked
 *  - Otherwise → locked
 */
export async function shouldBeLocked(): Promise<boolean> {
  const [state] = await Promise.all([getAppState()]);
  const today = getTodayString();
  return state.lastUnlockedDate !== today;
}

/**
 * Check the lock state and update storage if needed.
 * Returns the current lock state.
 */
export async function checkLockState(): Promise<boolean> {
  const locked = await shouldBeLocked();
  const current = await getAppState();

  if (current.isLocked !== locked) {
    await saveAppState({ isLocked: locked });
  }

  return locked;
}

/**
 * Start listening for app foreground events to re-check lock state.
 * Call this once on app mount.
 */
export function startLockWatcher(onLockChange: LockChangeCallback): () => void {
  lockChangeCallback = onLockChange;

  const handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === "active") {
      const locked = await checkLockState();
      lockChangeCallback?.(locked);
    }
  };

  appStateSubscription = RNAppState.addEventListener("change", handleAppStateChange);

  return () => {
    appStateSubscription?.remove();
    appStateSubscription = null;
    lockChangeCallback = null;
  };
}
