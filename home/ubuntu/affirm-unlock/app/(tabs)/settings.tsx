import React from "react";
import {
  View,
  Text,
  Switch,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useAppContext } from "@/lib/app-context";
import { ScreenContainer } from "@/components/screen-container";
import { saveAppState } from "@/lib/affirmations-store";
import {
  BellIcon,
  LockIcon,
  MicIcon,
  LeafIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@/components/ui/spa-icons";

// Earthy palette
const C = {
  bg: "#F7F3EC",
  surface: "#EDE8DF",
  border: "#D6CEBF",
  fg: "#2C2416",
  muted: "#8C7B6B",
  subtle: "#B8A898",
  sage: "#7A9E7E",
  sageDark: "#5C7D60",
  tan: "#C4A882",
  terracotta: "#B5705A",
  cream: "#F7F3EC",
};

function SettingRow({
  label,
  subtitle,
  icon,
  children,
}: {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      {icon && <View style={styles.settingIconWrap}>{icon}</View>}
      <View style={styles.settingLabelContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function TimeSelector({
  hour,
  minute,
  onHourChange,
  onMinuteChange,
}: {
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
}) {
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  const ampm = hour < 12 ? "AM" : "PM";

  return (
    <View style={styles.timeSelector}>
      <View style={styles.timeUnit}>
        <Pressable onPress={() => onHourChange((hour + 1) % 24)} style={styles.timeArrow}>
          <ChevronUpIcon size={14} color={C.sage} strokeWidth={2} />
        </Pressable>
        <Text style={styles.timeValue}>{String(displayHour).padStart(2, "0")}</Text>
        <Pressable onPress={() => onHourChange((hour + 23) % 24)} style={styles.timeArrow}>
          <ChevronDownIcon size={14} color={C.sage} strokeWidth={2} />
        </Pressable>
      </View>
      <Text style={styles.timeSeparator}>:</Text>
      <View style={styles.timeUnit}>
        <Pressable onPress={() => onMinuteChange((minute + 15) % 60)} style={styles.timeArrow}>
          <ChevronUpIcon size={14} color={C.sage} strokeWidth={2} />
        </Pressable>
        <Text style={styles.timeValue}>{String(minute).padStart(2, "0")}</Text>
        <Pressable onPress={() => onMinuteChange((minute + 45) % 60)} style={styles.timeArrow}>
          <ChevronDownIcon size={14} color={C.sage} strokeWidth={2} />
        </Pressable>
      </View>
      <Text style={styles.timeAmpm}>{ampm}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const { settings, updateSettings, refreshAppState } = useAppContext();

  const handleSensitivityChange = (direction: "up" | "down") => {
    const step = 0.05;
    const current = settings.sensitivityThreshold;
    const next =
      direction === "up"
        ? Math.min(1.0, current + step)
        : Math.max(0.5, current - step);
    updateSettings({ sensitivityThreshold: Math.round(next * 100) / 100 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleScheduleReminder = async () => {
    if (!settings.reminderEnabled) return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time for your affirmations",
          body: "Speak your affirmations to unlock your phone and begin your day.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: settings.reminderHour,
          minute: settings.reminderMinute,
          repeats: true,
        },
      });
    } catch {
      // Notifications may not be available in preview
    }
  };

  const handleResetStreak = () => {
    Alert.alert(
      "Reset Progress",
      "This will reset your streak and stats. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await saveAppState({
              currentStreak: 0,
              longestStreak: 0,
              totalDaysCompleted: 0,
              lastUnlockedDate: null,
            });
            await refreshAppState();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const sensitivityLabel =
    settings.sensitivityThreshold >= 0.95
      ? "Very Strict (95%+)"
      : settings.sensitivityThreshold >= 0.9
      ? "Strict (90%)"
      : settings.sensitivityThreshold >= 0.8
      ? "Moderate (80%)"
      : settings.sensitivityThreshold >= 0.7
      ? "Lenient (70%)"
      : "Very Lenient (50%+)";

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Daily Schedule */}
        <SectionHeader title="Daily Schedule" />
        <View style={styles.card}>
          <SettingRow
            label="Lock Time"
            subtitle="Phone locks at this time each day"
            icon={<LockIcon size={18} color={C.tan} strokeWidth={1.6} />}
          >
            <TimeSelector
              hour={settings.lockHour}
              minute={settings.lockMinute}
              onHourChange={(h) => updateSettings({ lockHour: h })}
              onMinuteChange={(m) => updateSettings({ lockMinute: m })}
            />
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow
            label="Morning Reminder"
            subtitle="Notification to speak affirmations"
            icon={<BellIcon size={18} color={C.sage} strokeWidth={1.6} />}
          >
            <Switch
              value={settings.reminderEnabled}
              onValueChange={(v) => {
                updateSettings({ reminderEnabled: v });
                if (v) handleScheduleReminder();
                else Notifications.cancelAllScheduledNotificationsAsync();
              }}
              trackColor={{ false: C.border, true: C.sage }}
              thumbColor={settings.reminderEnabled ? C.cream : C.subtle}
            />
          </SettingRow>

          {settings.reminderEnabled && (
            <>
              <View style={styles.divider} />
              <SettingRow
                label="Reminder Time"
                subtitle="When to send the morning notification"
                icon={<BellIcon size={18} color={C.muted} strokeWidth={1.6} />}
              >
                <TimeSelector
                  hour={settings.reminderHour}
                  minute={settings.reminderMinute}
                  onHourChange={(h) => {
                    updateSettings({ reminderHour: h });
                    setTimeout(handleScheduleReminder, 500);
                  }}
                  onMinuteChange={(m) => {
                    updateSettings({ reminderMinute: m });
                    setTimeout(handleScheduleReminder, 500);
                  }}
                />
              </SettingRow>
            </>
          )}
        </View>

        {/* Voice Matching */}
        <SectionHeader title="Voice Matching" />
        <View style={styles.card}>
          <SettingRow
            label="Match Sensitivity"
            subtitle={sensitivityLabel}
            icon={<MicIcon size={18} color={C.tan} strokeWidth={1.6} />}
          >
            <View style={styles.sensitivityControls}>
              <Pressable
                style={({ pressed }) => [styles.sensitivityButton, pressed && { opacity: 0.7 }]}
                onPress={() => handleSensitivityChange("down")}
              >
                <Text style={styles.sensitivityButtonText}>−</Text>
              </Pressable>
              <Text style={styles.sensitivityValue}>
                {Math.round(settings.sensitivityThreshold * 100)}%
              </Text>
              <Pressable
                style={({ pressed }) => [styles.sensitivityButton, pressed && { opacity: 0.7 }]}
                onPress={() => handleSensitivityChange("up")}
              >
                <Text style={styles.sensitivityButtonText}>+</Text>
              </Pressable>
            </View>
          </SettingRow>

          <View style={styles.divider} />
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Higher sensitivity requires a closer match to your affirmation text.
              90% is recommended — it allows for minor mispronunciations while keeping the match meaningful.
            </Text>
          </View>
        </View>

        {/* About */}
        <SectionHeader title="About" />
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={styles.settingIconWrap}>
              <LeafIcon size={18} color={C.sage} strokeWidth={1.6} />
            </View>
            <Text style={styles.aboutLabel}>AffirmUnlock</Text>
            <Text style={styles.aboutValue}>v1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>iOS Screen Blocking: </Text>
              Full app blocking requires Apple's Family Controls entitlement, approved during App Store review. The voice unlock flow is fully functional in this build.
            </Text>
          </View>
        </View>

        {/* Data */}
        <SectionHeader title="Data" />
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.dangerRow, pressed && { opacity: 0.7 }]}
            onPress={handleResetStreak}
          >
            <View style={styles.settingIconWrap}>
              <TrashIcon size={18} color={C.terracotta} strokeWidth={1.6} />
            </View>
            <Text style={styles.dangerButtonText}>Reset Streak & Stats</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
    gap: 8,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "600",
    color: C.fg,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: C.fg,
  },
  settingSubtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  settingControl: {
    alignItems: "flex-end",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 16,
  },
  timeSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeUnit: {
    alignItems: "center",
    gap: 2,
  },
  timeArrow: {
    padding: 4,
  },
  timeValue: {
    fontSize: 20,
    fontWeight: "600",
    color: C.fg,
    minWidth: 32,
    textAlign: "center",
  },
  timeSeparator: {
    fontSize: 20,
    fontWeight: "600",
    color: C.fg,
    marginBottom: 2,
  },
  timeAmpm: {
    fontSize: 13,
    fontWeight: "500",
    color: C.muted,
    marginLeft: 4,
  },
  sensitivityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sensitivityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  sensitivityButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: C.sage,
    lineHeight: 22,
  },
  sensitivityValue: {
    fontSize: 17,
    fontWeight: "600",
    color: C.fg,
    minWidth: 48,
    textAlign: "center",
  },
  infoBox: {
    padding: 16,
    backgroundColor: C.bg,
  },
  infoText: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 20,
  },
  infoBold: {
    fontWeight: "600",
    color: C.fg,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  aboutLabel: {
    flex: 1,
    fontSize: 15,
    color: C.fg,
    fontWeight: "500",
  },
  aboutValue: {
    fontSize: 14,
    color: C.muted,
  },
  dangerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  dangerButtonText: {
    fontSize: 15,
    color: C.terracotta,
    fontWeight: "500",
  },
});
