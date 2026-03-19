import React, { useEffect } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAppContext } from "@/lib/app-context";
import { ScreenContainer } from "@/components/screen-container";
import {
  LockIcon,
  CheckCircleIcon,
  FlameIcon,
  SunIcon,
  LeafIcon,
  LotusIcon,
  SettingsIcon,
  MicIcon,
  PlusCircleIcon,
} from "@/components/ui/spa-icons";

// Earthy palette constants
const C = {
  bg: "#F7F3EC",
  surface: "#EDE8DF",
  border: "#D6CEBF",
  fg: "#2C2416",
  muted: "#8C7B6B",
  sage: "#7A9E7E",
  sageDark: "#5C7D60",
  cream: "#F7F3EC",
  tan: "#C4A882",
  terracotta: "#B5705A",
  lockedBg: "#2A2720",
  lockedBorder: "#4A4035",
  lockedText: "#EDE8DF",
};

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const {
    affirmations,
    settings,
    appState,
    isLoading,
    refreshAffirmations,
    refreshAppState,
    refreshSettings,
  } = useAppContext();

  const activeAffirmations = affirmations.filter((a) => a.active);
  const isLocked = appState.isLocked;

  const onRefresh = async () => {
    await Promise.all([refreshAffirmations(), refreshAppState(), refreshSettings()]);
  };

  // Onboarding redirect handled by app/index.tsx

  // Auto-redirect to lock screen when locked
  useFocusEffect(
    React.useCallback(() => {
      if (!isLoading && settings.onboardingComplete && appState.isLocked) {
        router.replace("/lock");
      }
    }, [isLoading, settings.onboardingComplete, appState.isLocked])
  );

  const handleGoToLock = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/lock");
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={C.sage}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateStr}</Text>
          <Text style={styles.greetingText}>
            {settings.userName ? `Good morning, ${settings.userName}` : "Good morning"}
          </Text>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, isLocked ? styles.statusCardLocked : styles.statusCardUnlocked]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIconWrap, isLocked ? styles.statusIconWrapLocked : styles.statusIconWrapUnlocked]}>
              {isLocked
                ? <LockIcon size={28} color={C.tan} strokeWidth={1.8} />
                : <CheckCircleIcon size={28} color={C.sageDark} strokeWidth={1.8} />
              }
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusTitle, isLocked ? styles.statusTitleLocked : styles.statusTitleUnlocked]}>
                {isLocked ? "Phone Locked" : "Unlocked Today"}
              </Text>
              <Text style={[styles.statusSubtitle, isLocked ? styles.statusSubtitleLocked : styles.statusSubtitleUnlocked]}>
                {isLocked
                  ? `${activeAffirmations.length} affirmation${activeAffirmations.length !== 1 ? "s" : ""} to speak`
                  : "Well done. Keep the practice going."}
              </Text>
            </View>
          </View>

          {isLocked && (
            <Pressable
              style={({ pressed }) => [
                styles.speakButton,
                pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
              ]}
              onPress={handleGoToLock}
            >
              <MicIcon size={18} color={C.cream} strokeWidth={1.8} />
              <Text style={styles.speakButtonText}>Speak to Unlock</Text>
            </Pressable>
          )}
        </View>

        {/* Streak & Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon={<FlameIcon size={22} color={C.tan} strokeWidth={1.6} />}
            value={appState.currentStreak}
            label="Day Streak"
          />
          <StatCard
            icon={<SunIcon size={22} color={C.sage} strokeWidth={1.6} />}
            value={appState.longestStreak}
            label="Best Streak"
          />
          <StatCard
            icon={<CheckCircleIcon size={22} color={C.sageDark} strokeWidth={1.6} />}
            value={appState.totalDaysCompleted}
            label="Total Days"
          />
        </View>

        {/* Today's Affirmations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Affirmations</Text>
          <Pressable onPress={() => router.push("/(tabs)/affirmations")}>
            <Text style={styles.sectionAction}>Edit</Text>
          </Pressable>
        </View>

        {activeAffirmations.length === 0 ? (
          <Pressable
            style={({ pressed }) => [styles.emptyCard, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/(tabs)/affirmations")}
          >
            <PlusCircleIcon size={36} color={C.muted} strokeWidth={1.4} />
            <Text style={styles.emptyCardTitle}>No affirmations yet</Text>
            <Text style={styles.emptyCardSubtitle}>Tap to add your first affirmation</Text>
          </Pressable>
        ) : (
          <View style={styles.affirmationsList}>
            {activeAffirmations.slice(0, 3).map((aff, index) => (
              <View key={aff.id} style={styles.affirmationItem}>
                <View style={styles.affirmationNumber}>
                  <Text style={styles.affirmationNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.affirmationText} numberOfLines={2}>
                  {aff.text}
                </Text>
              </View>
            ))}
            {activeAffirmations.length > 3 && (
                <Pressable onPress={() => router.push("/(tabs)/affirmations")}>
                <Text style={styles.moreText}>+{activeAffirmations.length - 3} more</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [styles.quickActionButton, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/(tabs)/affirmations")}
          >
            <LotusIcon size={28} color={C.sage} strokeWidth={1.5} />
            <Text style={styles.quickActionText}>Manage{"\n"}Affirmations</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.quickActionButton, pressed && { opacity: 0.8 }]}
            onPress={() => router.push("/(tabs)/settings")}
          >
            <SettingsIcon size={28} color={C.muted} strokeWidth={1.5} />
            <Text style={styles.quickActionText}>Settings</Text>
          </Pressable>
          {isLocked && (
            <Pressable
              style={({ pressed }) => [styles.quickActionButton, styles.quickActionButtonPrimary, pressed && { opacity: 0.8 }]}
              onPress={handleGoToLock}
            >
              <MicIcon size={28} color={C.cream} strokeWidth={1.5} />
              <Text style={[styles.quickActionText, { color: C.cream }]}>Speak{"\n"}Now</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: C.muted,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: "600",
    color: C.fg,
    letterSpacing: -0.3,
  },
  statusCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  statusCardLocked: {
    backgroundColor: C.lockedBg,
    borderColor: C.lockedBorder,
  },
  statusCardUnlocked: {
    backgroundColor: "#EAF0EA",
    borderColor: "#C2D4C2",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statusIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIconWrapLocked: {
    backgroundColor: "#3D3830",
  },
  statusIconWrapUnlocked: {
    backgroundColor: "#D0E4D0",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  statusTitleLocked: {
    color: C.lockedText,
  },
  statusTitleUnlocked: {
    color: "#1E3020",
  },
  statusSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  statusSubtitleLocked: {
    color: "#A89880",
  },
  statusSubtitleUnlocked: {
    color: "#4A6A4A",
  },
  speakButton: {
    backgroundColor: C.sage,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  speakButtonText: {
    color: C.cream,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: C.fg,
    letterSpacing: -0.2,
  },
  sectionAction: {
    fontSize: 14,
    color: C.sage,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  statIconWrap: {
    marginBottom: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    color: C.fg,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  affirmationsList: {
    gap: 10,
  },
  affirmationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  affirmationNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.tan,
    alignItems: "center",
    justifyContent: "center",
  },
  affirmationNumberText: {
    color: C.cream,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  affirmationText: {
    flex: 1,
    fontSize: 15,
    color: C.fg,
    lineHeight: 22,
  },
  moreText: {
    fontSize: 14,
    color: C.sage,
    textAlign: "center",
    paddingVertical: 4,
  },
  emptyCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "dashed",
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: C.fg,
  },
  emptyCardSubtitle: {
    fontSize: 14,
    color: C.muted,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickActionButtonPrimary: {
    backgroundColor: C.sage,
    borderColor: C.sageDark,
  },
  quickActionText: {
    fontSize: 12,
    color: C.fg,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 17,
  },
});
