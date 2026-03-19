import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { useAppContext } from "@/lib/app-context";
import { verifyAffirmation } from "@/lib/speech-verify";
import { trpc } from "@/lib/trpc";
import {
  LockIcon,
  MicIcon,
  CheckCircleIcon,
  XCircleIcon,
  WaveIcon,
  LeafIcon,
} from "@/components/ui/spa-icons";

// Earthy lock-screen palette — warm dark
const C = {
  bg: "#1C1A17",
  surface: "#2A2720",
  border: "#3D3830",
  fg: "#EDE8DF",
  muted: "#A89880",
  subtle: "#6B5F52",
  sage: "#7A9E7E",
  sageDark: "#5C7D60",
  tan: "#C4A882",
  terracotta: "#B5705A",
  cream: "#F7F3EC",
  transcriptBorder: "#8A9E7E",
};

type VerifyState = "idle" | "listening" | "checking" | "success" | "failed";

export default function LockScreen() {
  const { affirmations, settings, unlockToday, refreshAppState } = useAppContext();
  const activeAffirmations = affirmations.filter((a) => a.active);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const transcribeMutation = trpc.affirmation.transcribe.useMutation();

  const currentAffirmation = activeAffirmations[currentIndex];

  // Set up audio mode on mount
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });
  }, []);

  // Pulse animation when listening
  useEffect(() => {
    if (verifyState === "listening") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      Animated.timing(pulseAnim, { toValue: 1.0, duration: 200, useNativeDriver: true }).start();
    }
  }, [verifyState]);

  const startListening = async () => {
    setTranscript("");
    setErrorMessage("");
    setVerifyState("listening");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setVerifyState("failed");
        setErrorMessage("Microphone access is required. Please enable it in Settings.");
        return;
      }
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      setVerifyState("failed");
      setErrorMessage("Could not start recording. Please try again.");
    }
  };

  const stopListeningAndVerify = async () => {
    if (!recorderState.isRecording) return;
    setVerifyState("checking");
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) {
        throw new Error("No recording URI available");
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to server for Whisper transcription
      const result = await transcribeMutation.mutateAsync({
        audioBase64: base64,
        mimeType: "audio/m4a",
      });

      const spokenText = result.transcript;
      setTranscript(spokenText);

      if (!spokenText) {
        handleFailure(0);
        return;
      }

      const verification = verifyAffirmation(
        spokenText,
        currentAffirmation?.text ?? "",
        settings.sensitivityThreshold
      );

      if (verification.passed) {
        handleSuccess();
      } else {
        handleFailure(verification.similarity);
      }
    } catch (err) {
      setVerifyState("failed");
      setErrorMessage("Could not process your recording. Please try again.");
    }
  };

  const handleSuccess = () => {
    setVerifyState("success");
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Animated.spring(successAnim, { toValue: 1, useNativeDriver: true, tension: 100, friction: 8 }).start();
    setTimeout(async () => {
      if (currentIndex < activeAffirmations.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setVerifyState("idle");
        setTranscript("");
        successAnim.setValue(0);
      } else {
        await unlockToday();
        await refreshAppState();
        router.replace("/(tabs)");
      }
    }, 1200);
  };

  const handleFailure = (similarity: number) => {
    setVerifyState("failed");
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    const pct = Math.round(similarity * 100);
    setErrorMessage(`${pct}% match — speak clearly and try again`);
  };

  const handleRetry = () => {
    setVerifyState("idle");
    setTranscript("");
    setErrorMessage("");
    shakeAnim.setValue(0);
  };

  const handleMicPress = () => {
    if (verifyState === "failed") {
      handleRetry();
      return;
    }
    if (verifyState === "listening") {
      stopListeningAndVerify();
      return;
    }
    if (verifyState === "idle") {
      startListening();
    }
  };

  // Mic button color based on state
  const micBgColor =
    verifyState === "listening" ? C.sage :
    verifyState === "success"   ? C.sageDark :
    verifyState === "failed"    ? C.terracotta :
    C.tan;

  const statusLabel =
    verifyState === "idle"      ? "Tap the circle to speak" :
    verifyState === "listening" ? "Listening — tap again to stop" :
    verifyState === "checking"  ? "Checking your words..." :
    verifyState === "success"   ? "Wonderful" :
    "Try again";

  if (!activeAffirmations.length) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <LeafIcon size={64} color={C.muted} strokeWidth={1.2} />
          <Text style={styles.emptyTitle}>No affirmations set</Text>
          <Text style={styles.emptySubtitle}>
            Add affirmations in the app to enable the lock feature.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.unlockButton, pressed && { opacity: 0.8 }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.unlockButtonText}>Go to App</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.lockIconWrap}>
          <LockIcon size={32} color={C.tan} strokeWidth={1.6} />
        </View>
        <Text style={styles.greeting}>
          Good morning{settings.userName ? `, ${settings.userName}` : ""}
        </Text>
        <Text style={styles.instruction}>Speak your affirmation to begin your day</Text>
      </View>

      {/* Progress dots */}
      {activeAffirmations.length > 1 && (
        <View style={styles.progressDots}>
          {activeAffirmations.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i < currentIndex && styles.progressDotDone,
                i === currentIndex && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Affirmation card */}
      <Animated.View
        style={[styles.affirmationCard, { transform: [{ translateX: shakeAnim }] }]}
      >
        <Text style={styles.affirmationCounter}>
          {currentIndex + 1} of {activeAffirmations.length}
        </Text>
        <Text style={styles.affirmationText}>{currentAffirmation?.text}</Text>
      </Animated.View>

      {/* Transcript preview */}
      {(verifyState === "checking" || verifyState === "failed") && transcript ? (
        <View style={styles.transcriptContainer}>
          <WaveIcon size={16} color={C.transcriptBorder} strokeWidth={1.5} />
          <Text style={styles.transcriptText}>"{transcript}"</Text>
        </View>
      ) : null}

      {/* Error message */}
      {verifyState === "failed" && errorMessage ? (
        <View style={styles.errorContainer}>
          <XCircleIcon size={16} color={C.terracotta} strokeWidth={1.5} />
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      {/* Mic button */}
      <View style={styles.micSection}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            style={[styles.micButton, { backgroundColor: micBgColor }]}
            onPress={handleMicPress}
            disabled={verifyState === "checking" || verifyState === "success"}
          >
            {verifyState === "success" ? (
              <CheckCircleIcon size={44} color={C.cream} strokeWidth={1.6} />
            ) : verifyState === "failed" ? (
              <XCircleIcon size={44} color={C.cream} strokeWidth={1.6} />
            ) : (
              <MicIcon size={44} color={C.cream} strokeWidth={1.6} />
            )}
          </Pressable>
        </Animated.View>
        <Text style={styles.statusLabel}>{statusLabel}</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <LeafIcon size={14} color={C.subtle} strokeWidth={1.4} />
        <Text style={styles.footerText}>
          Phone calls and messages are always available
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  lockIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "600",
    color: C.fg,
    letterSpacing: -0.3,
  },
  instruction: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  progressDots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.subtle,
  },
  progressDotActive: {
    backgroundColor: C.tan,
    width: 24,
  },
  progressDotDone: {
    backgroundColor: C.sageDark,
  },
  affirmationCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 16,
    gap: 8,
  },
  affirmationCounter: {
    fontSize: 12,
    color: C.subtle,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  affirmationText: {
    fontSize: 20,
    fontWeight: "500",
    color: C.fg,
    lineHeight: 30,
    letterSpacing: -0.2,
  },
  transcriptContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1E2D1E",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#3A5C3A",
  },
  transcriptText: {
    flex: 1,
    fontSize: 14,
    color: "#A8C8A8",
    fontStyle: "italic",
    lineHeight: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#2D1E1A",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#5C3A30",
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: C.terracotta,
    lineHeight: 20,
  },
  micSection: {
    alignItems: "center",
    marginTop: "auto",
    gap: 16,
    paddingTop: 16,
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusLabel: {
    fontSize: 15,
    color: C.muted,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: C.subtle,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: C.fg,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 15,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  unlockButton: {
    backgroundColor: C.sage,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  unlockButtonText: {
    color: C.cream,
    fontSize: 16,
    fontWeight: "600",
  },
});
