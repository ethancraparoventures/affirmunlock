# AffirmUnlock — Mobile App Interface Design

## Brand Identity

**App Name:** AffirmUnlock  
**Tagline:** Speak your truth. Start your day.  
**Tone:** Calm, empowering, intentional — like a morning ritual, not a chore.

### Color Palette

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `primary` | `#7C5CBF` | `#9B7FD4` | Purple — spiritual, intentional, calm authority |
| `background` | `#FAF8FF` | `#0F0D14` | Near-white / near-black with a purple tint |
| `surface` | `#F0EBF9` | `#1C1826` | Cards, modals, input backgrounds |
| `foreground` | `#1A1427` | `#EDE8F7` | Primary text |
| `muted` | `#7B7189` | `#9E97B0` | Secondary text, placeholders |
| `border` | `#DDD5EE` | `#2E2840` | Dividers, card borders |
| `success` | `#4CAF82` | `#6DD9A5` | Affirmation verified / unlocked |
| `warning` | `#E8A838` | `#F0BF5A` | Partial match / retry |
| `error` | `#E05A5A` | `#F07878` | Failed match |
| `accent` | `#C4A8F0` | `#C4A8F0` | Soft lavender for decorative highlights |

---

## Screen List

1. **Onboarding** — First-launch welcome + permission setup
2. **Lock Screen** — Full-screen affirmation challenge (shown when locked)
3. **Home Dashboard** — Today's status, streak, quick access
4. **Affirmations Manager** — List, add, edit, reorder affirmations
5. **Add / Edit Affirmation** — Single affirmation form
6. **Settings** — Unlock time, sensitivity, notifications, about

---

## Screen Designs

### 1. Onboarding (3 slides + permissions)

**Slide 1 — Welcome**
- Full-screen gradient background (deep purple to soft lavender)
- Large centered app icon (glowing orb / lock with speech wave)
- Headline: "Start every day with intention"
- Subtext: "Speak your affirmations to unlock your phone"
- "Get Started" CTA button (full-width, rounded)

**Slide 2 — How It Works**
- 3 illustrated steps with icons:
  1. Write your affirmations
  2. Each morning, speak them aloud
  3. Your phone unlocks for the day
- "Continue" button

**Slide 3 — Permissions**
- Request microphone permission (required for speech recognition)
- Request notification permission (required for morning reminder)
- Clear explanation of why each is needed
- "Allow & Continue" button

---

### 2. Lock Screen

**Layout:** Full-screen, immersive, portrait
- **Top:** App logo + "Good morning, [Name]" greeting
- **Center:** Affirmation text displayed in large, readable serif-style font
  - Shown one at a time if multiple affirmations
  - Progress dots if multiple (e.g., 1 of 3)
- **Bottom half:**
  - Large circular mic button (pulsing animation when recording)
  - Status label: "Tap to speak" / "Listening..." / "Checking..."
  - Transcript preview text (appears as user speaks)
  - Match feedback: green checkmark (pass) or red X with "Try again"
- **Footer:** Small "Emergency: Phone & Messages still work" note

**Color:** Dark mode always (deep purple/black gradient) — feels like waking up to something sacred

---

### 3. Home Dashboard

**Layout:** Scrollable, card-based
- **Header:** Date + greeting + streak badge ("🔥 7-day streak")
- **Status Card:** Large card showing today's status
  - "Locked 🔒" (red/purple) or "Unlocked ✓" (green) with unlock time
  - If locked: "Speak your affirmations" CTA → navigates to Lock Screen
- **Today's Affirmations Card:** Preview of today's affirmation list (read-only)
- **Streak & Stats Card:** Current streak, longest streak, total days completed
- **Quick Actions:** "Edit Affirmations" button, "Settings" button

---

### 4. Affirmations Manager

**Layout:** List with swipe actions
- **Header:** "My Affirmations" + count badge
- **List items:** Each affirmation as a card
  - Drag handle (reorder)
  - Affirmation text (truncated if long)
  - Active/inactive toggle
  - Swipe left: delete
  - Tap: edit
- **Standard Affirmations Section:** Collapsible section with pre-written suggestions
  - Tap any to add to personal list
- **FAB (Floating Action Button):** "+" to add new affirmation

---

### 5. Add / Edit Affirmation

**Layout:** Modal sheet (slides up from bottom)
- **Title:** "New Affirmation" or "Edit Affirmation"
- **Text input:** Large, multi-line, auto-focus
  - Placeholder: "I am confident and capable..."
  - Character counter (max 120 chars)
- **Tips section:** "Speak in first person", "Keep it present tense", "Make it meaningful"
- **Save / Cancel buttons**

---

### 6. Settings

**Layout:** Grouped list (iOS-style)
- **Daily Schedule section:**
  - Lock time: time picker (default: midnight / 12:00 AM)
  - Reminder notification: toggle + time picker
- **Voice Matching section:**
  - Sensitivity slider: Strict ← → Lenient (default: Strict, 90%)
  - "How it works" info button
- **Affirmations section:** Link to Affirmations Manager
- **About section:** Version, privacy policy, App Store review link
- **HomePod section:** "Play affirmations on HomePod" toggle (AirPlay routing)

---

## Key User Flows

### Flow 1: First Launch
Onboarding Slide 1 → Slide 2 → Permissions → Home Dashboard (unlocked, tutorial state)

### Flow 2: Morning Unlock
Morning notification → Tap → Lock Screen → Speak affirmation 1 → Match ✓ → Next affirmation → All done → Unlock animation → Home Dashboard (unlocked)

### Flow 3: Failed Attempt
Lock Screen → Speak → No match → "Try again" feedback → Re-record → Match ✓ → Continue

### Flow 4: Add Custom Affirmation
Home Dashboard → "Edit Affirmations" → Affirmations Manager → "+" FAB → Add/Edit Sheet → Save → Back to list

### Flow 5: Use Standard Affirmation
Affirmations Manager → "Standard Affirmations" section → Tap one → Added to personal list

---

## Typography

- **Display / Lock Screen:** System font, bold, size 28-32pt
- **Body:** System font, regular, size 16-17pt
- **Caption / Muted:** System font, regular, size 13-14pt
- Line height: 1.4× font size minimum

## Spacing & Layout

- Screen padding: 20px horizontal
- Card border radius: 16px
- Button border radius: 14px (full-width) or 50px (circular FAB)
- Card shadow: subtle (2px blur, 10% opacity)

## Animation Principles

- Mic button: pulsing ring animation when recording (scale 1.0 → 1.15, 1s loop)
- Unlock success: green flash + scale-up checkmark + haptic success
- Failed match: red flash + shake animation + haptic error
- Screen transitions: standard iOS push/modal slide
