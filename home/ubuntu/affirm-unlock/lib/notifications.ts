import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { AppSettings } from "./affirmations-store";

const REMINDER_IDENTIFIER = "affirm_unlock_daily_reminder";

/**
 * Schedule (or reschedule) the daily morning reminder notification.
 * Cancels any existing reminder first.
 */
export async function scheduleDailyReminder(settings: AppSettings): Promise<void> {
  if (!settings.reminderEnabled) {
    await cancelDailyReminder();
    return;
  }

  try {
    // Cancel existing reminder
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => {});

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDENTIFIER,
      content: {
        title: "🌅 Good morning! Time to affirm.",
        body: settings.userName
          ? `${settings.userName}, speak your affirmations to unlock your phone.`
          : "Speak your affirmations to unlock your phone for the day.",
        sound: true,
        data: { type: "daily_reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: settings.reminderHour,
        minute: settings.reminderMinute,
        repeats: true,
      },
    });
  } catch {
    // Notifications may not be available in Expo Go preview
  }
}

/**
 * Cancel the daily reminder notification.
 */
export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER);
  } catch {
    // Ignore errors if notification doesn't exist
  }
}

/**
 * Request notification permissions and return whether they were granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/**
 * Set up the Android notification channel.
 * Should be called once on app startup.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  try {
    await Notifications.setNotificationChannelAsync("affirmations", {
      name: "Daily Affirmations",
      description: "Morning reminders to speak your affirmations",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7C5CBF",
    });
  } catch {
    // Ignore
  }
}
