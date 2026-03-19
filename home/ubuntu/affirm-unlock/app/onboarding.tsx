import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Pressable,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import { requestRecordingPermissionsAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useAppContext } from "@/lib/app-context";
import { addStandardAffirmation } from "@/lib/affirmations-store";
import {
  LotusIcon,
  MicIcon,
  LockIcon,
  CheckCircleIcon,
  BellIcon,
  PencilIcon,
  LeafIcon,
} from "@/components/ui/spa-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
  cream: "#F7F3EC",
};

type SlideStep = { icon: React.ReactNode; text: string };
type SlidePermission = { icon: React.ReactNode; name: string; desc: string };
type Slide = {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  steps?: SlideStep[];
  permissions?: SlidePermission[];
};

const SLIDES: Slide[] = [
  {
    id: "welcome",
    icon: <LotusIcon size={72} color={C.sage} strokeWidth={1.3} />,
    title: "Start every day\nwith intention",
    subtitle: "Speak your affirmations to unlock your phone and begin your day with purpose.",
  },
  {
    id: "how",
    icon: <MicIcon size={72} color={C.tan} strokeWidth={1.3} />,
    title: "How it works",
    steps: [
      { icon: <PencilIcon size={24} color={C.sage} strokeWidth={1.5} />, text: "Write your personal affirmations" },
      { icon: <LockIcon size={24} color={C.tan} strokeWidth={1.5} />, text: "Your phone locks each morning until you speak them" },
      { icon: <CheckCircleIcon size={24} color={C.sageDark} strokeWidth={1.5} />, text: "Speak clearly — your phone unlocks when you match" },
    ],
  },
  {
    id: "name",
    icon: <LeafIcon size={72} color={C.sage} strokeWidth={1.3} />,
    title: "What should we\ncall you?",
    subtitle: "We'll use your name for your morning greeting.",
  },
  {
    id: "permissions",
    icon: <LockIcon size={72} color={C.tan} strokeWidth={1.3} />,
    title: "One last step",
    subtitle: "AffirmUnlock needs a couple of permissions to work.",
    permissions: [
      { icon: <MicIcon size={24} color={C.sage} strokeWidth={1.5} />, name: "Microphone", desc: "To hear you speak your affirmations" },
      { icon: <BellIcon size={24} color={C.tan} strokeWidth={1.5} />, name: "Notifications", desc: "For your daily morning reminder" },
    ],
  },
];

export default function OnboardingScreen() {
  const { updateSettings, refreshAffirmations } = useAppContext();
  const scrollRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [userName, setUserName] = useState("");
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentSlide(index);
  };

  const handleNext = async () => {
    if (currentSlide < SLIDES.length - 1) {
      goToSlide(currentSlide + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      await finishOnboarding();
    }
  };

  const handleRequestPermissions = async () => {
    try {
      const audioResult = await requestRecordingPermissionsAsync();
      const notifResult = await Notifications.requestPermissionsAsync();
      const granted = audioResult.status === "granted" && notifResult.status === "granted";
      if (!granted) {
        Alert.alert(
          "Permissions Needed",
          "AffirmUnlock works best with both microphone and notification access. You can grant them later in Settings.",
          [{ text: "Continue Anyway", onPress: () => setPermissionsGranted(true) }]
        );
      } else {
        setPermissionsGranted(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setPermissionsGranted(true);
    }
  };

  const finishOnboarding = async () => {
    await addStandardAffirmation("std_1");
    await addStandardAffirmation("std_2");
    await addStandardAffirmation("std_3");
    await refreshAffirmations();
    await updateSettings({
      userName: userName.trim() || "Friend",
      onboardingComplete: true,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)");
  };

  const renderSlide = (slide: Slide, index: number) => (
    <View key={slide.id} style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={styles.slideContent}>
        <View style={styles.iconWrap}>{slide.icon}</View>
        <Text style={styles.title}>{slide.title}</Text>

        {slide.subtitle ? (
          <Text style={styles.subtitle}>{slide.subtitle}</Text>
        ) : null}

        {slide.steps && (
          <View style={styles.stepsContainer}>
            {slide.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepIconWrap}>{step.icon}</View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        )}

        {slide.id === "name" && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.nameInput}
              value={userName}
              onChangeText={setUserName}
              placeholder="Your first name"
              placeholderTextColor={C.subtle}
              autoFocus={index === currentSlide}
              returnKeyType="done"
              onSubmitEditing={handleNext}
              maxLength={30}
            />
          </View>
        )}

        {slide.id === "permissions" && (
          <View style={styles.permissionsContainer}>
            {slide.permissions?.map((perm, i) => (
              <View key={i} style={styles.permissionRow}>
                <View style={styles.permIconWrap}>{perm.icon}</View>
                <View style={styles.permTextContainer}>
                  <Text style={styles.permName}>{perm.name}</Text>
                  <Text style={styles.permDesc}>{perm.desc}</Text>
                </View>
              </View>
            ))}
            {!permissionsGranted && (
              <Pressable
                style={({ pressed }) => [styles.permButton, pressed && { opacity: 0.8 }]}
                onPress={handleRequestPermissions}
              >
                <Text style={styles.permButtonText}>Grant Permissions</Text>
              </Pressable>
            )}
            {permissionsGranted && (
              <View style={styles.permGranted}>
                <CheckCircleIcon size={18} color={C.sageDark} strokeWidth={1.6} />
                <Text style={styles.permGrantedText}>Permissions granted</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const canProceedOnPermissions = currentSlide === SLIDES.length - 1 ? permissionsGranted : true;

  return (
    <View style={styles.container}>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
      >
        {SLIDES.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.nextButton,
            !canProceedOnPermissions && styles.nextButtonDisabled,
            pressed && canProceedOnPermissions && { transform: [{ scale: 0.97 }] },
          ]}
          onPress={handleNext}
          disabled={!canProceedOnPermissions}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? "Begin My Practice" : "Continue"}
          </Text>
        </Pressable>

        {currentSlide < SLIDES.length - 2 && (
          <Pressable style={styles.skipButton} onPress={() => goToSlide(SLIDES.length - 1)}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  slideContent: {
    alignItems: "center",
    width: "100%",
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    borderWidth: 1,
    borderColor: C.border,
  },
  title: {
    fontSize: 30,
    fontWeight: "600",
    color: C.fg,
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: C.muted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  stepsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: C.fg,
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%",
    marginTop: 16,
  },
  nameInput: {
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 18,
    fontSize: 18,
    color: C.fg,
    borderWidth: 1.5,
    borderColor: C.sage,
    textAlign: "center",
  },
  permissionsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 8,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  permIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  permTextContainer: {
    flex: 1,
  },
  permName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.fg,
    marginBottom: 2,
  },
  permDesc: {
    fontSize: 13,
    color: C.muted,
    lineHeight: 18,
  },
  permButton: {
    backgroundColor: C.sage,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  permButtonText: {
    color: C.cream,
    fontSize: 16,
    fontWeight: "600",
  },
  permGranted: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#EAF0EA",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C2D4C2",
  },
  permGrantedText: {
    color: C.sageDark,
    fontSize: 15,
    fontWeight: "500",
  },
  bottomControls: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 16,
    gap: 12,
    alignItems: "center",
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.border,
  },
  dotActive: {
    backgroundColor: C.tan,
    width: 24,
  },
  nextButton: {
    backgroundColor: C.sage,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
  },
  nextButtonDisabled: {
    backgroundColor: C.border,
  },
  nextButtonText: {
    color: C.cream,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    color: C.muted,
  },
});
