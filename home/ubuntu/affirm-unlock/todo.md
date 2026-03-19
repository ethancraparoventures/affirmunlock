# AffirmUnlock — Project TODO

## Branding & Setup
- [x] Generate app logo (purple lock + speech wave)
- [x] Update app.config.ts with branding (name, colors, logo)
- [x] Update theme.config.js with brand color palette
- [x] Add icon mappings to icon-symbol.tsx

## Data Layer
- [x] Define Affirmation type and storage schema
- [x] Implement affirmations store (AsyncStorage)
- [x] Implement app state store (locked/unlocked, streak, settings)
- [x] Implement settings store (lock time, sensitivity, notifications)

## Onboarding
- [x] Onboarding screen with 4 slides
- [x] Microphone permission request
- [x] Notification permission request
- [x] Mark onboarding complete in storage

## Home Dashboard
- [x] Home screen with today's status card
- [x] Streak and stats display
- [x] Today's affirmations preview
- [x] Navigation to Lock Screen (when locked)
- [x] Navigation to Affirmations Manager

## Affirmations Manager
- [x] List screen with all affirmations
- [x] Active/inactive toggle per affirmation
- [x] Standard affirmations library section
- [x] Add new affirmation button

## Add / Edit Affirmation
- [x] Modal sheet for add/edit
- [x] Text input with character limit (120)
- [x] Save and cancel actions
- [x] Tips section in form

## Lock Screen
- [x] Full-screen lock UI
- [x] Display affirmation text (one at a time)
- [x] Progress indicator for multiple affirmations
- [x] Mic button with recording animation
- [x] Transcript preview while speaking
- [x] Match success feedback (green, haptic)
- [x] Match failure feedback (red, shake, haptic)
- [x] "Try again" retry flow
- [x] Unlock animation on all affirmations passed

## Voice Verification Engine
- [x] Install and configure expo-speech-recognition
- [x] Record audio on mic button press
- [x] Transcribe speech to text
- [x] Normalize text (lowercase, strip punctuation)
- [x] Fuzzy match comparison (≥90% similarity threshold)
- [x] Configurable sensitivity setting

## Daily Lock Flow
- [x] Schedule daily lock activation (midnight)
- [x] Schedule morning reminder notification
- [x] Persist lock state in AsyncStorage
- [x] Check lock state on app launch
- [x] Auto-redirect to lock screen when locked
- [x] Re-check lock on app foreground

## Settings Screen
- [x] Lock time picker
- [x] Morning reminder toggle + time picker
- [x] Voice sensitivity slider
- [x] Reset streak/stats option
- [x] About section (version, privacy note)

## iOS Screen Time Integration (Advanced)
- [ ] Document FamilyControls entitlement requirement
- [ ] Add react-native-device-activity or equivalent
- [ ] Block all apps except Phone and Messages
- [ ] Unblock on successful affirmation completion

## Polish & QA
- [x] Dark mode support throughout
- [x] Haptic feedback on all key interactions
- [x] Empty states (no affirmations yet)
- [x] Unit tests for speech verification (15 tests passing)
- [ ] Accessibility labels

## Redesign: Earthy Spa Aesthetic
- [x] Generate new app icon in warm earthy/spa style
- [x] Update theme.config.js with earthy palette (cream, sage, warm grey, brown)
- [x] Create custom SVG icon components (home, list, settings, mic, lock, check, etc.)
- [x] Replace all emoji icons in lock screen with custom SVG icons
- [x] Replace all emoji icons in home screen with custom SVG icons
- [x] Replace all emoji icons in onboarding with custom SVG icons
- [x] Replace all emoji icons in affirmations screen with custom SVG icons
- [x] Replace all emoji icons in settings screen with custom SVG icons
- [x] Update tab bar icons to use custom SVG icons

## Bug Fixes
- [x] Fix unmatched route error after onboarding completes — app crashes instead of navigating to tabs
- [x] Replace expo-speech-recognition (requires custom build) with Expo Go compatible speech-to-text using server-side transcription
- [x] Fix /(tabs) navigation — removed conflicting unstable_settings and fullScreenModal presentation from lock screen
