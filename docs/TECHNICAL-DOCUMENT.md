# TaskAlarm Technical Documentation

Version 3.0 | Final Implementation Reference

---

## Overview

TaskAlarm is a React Native alarm application with an interactive task-based dismissal system. The app requires users to complete short cognitive tasks before the alarm stop button becomes available, ensuring users are actually awake before dismissing alarms.

**Core Philosophy:** Local-first, privacy-focused, reliable background alarm scheduling with modular architecture.

---

## Architecture

**Stack:** React Native (Expo SDK 54), TypeScript, SQLite (expo-sqlite), Zustand (state management), expo-notifications, expo-audio

**Platform Focus:** Android primary (native AlarmManager for reliable scheduling), iOS secondary

**Architecture Pattern:**
- UI Layer: Screens and reusable components
- State Layer: Zustand stores (useAlarmStore, useSettingsStore, useRingingStore)
- Service Layer: Alarm scheduling, audio playback, task generation
- Persistence Layer: SQLite with repository pattern
- Theme Layer: Centralized design tokens with light/dark/system modes

---

## Navigation Structure

**Root Stack Navigation:**
- AlarmListScreen (entry point with Settings gear icon)
- AlarmFormScreen (create/edit alarms)
- AlarmRingingScreen (full-screen alarm with tasks)
- QuoteScreen (post-stop motivational quote)
- SettingsScreen (app configuration)
- ReflectionsScreen (view past reflections)

**Bottom Tab Navigation (MainTabs):**
- Alarms tab: Alarm list
- My Questions tab: Custom Q&A management

---

## Data Models

**Alarm:** id, time (HH:MM), weekdays[], enabled, label, soundType, soundName, soundUri, vibration, taskType, taskCount, createdAt, updatedAt

**Task (in-memory):** id, type, question, options, correctAnswer, metadata

**AppSettings:** theme, timeFormat, defaultTaskCount, defaultTaskTypes[], snoozePolicy, enableReflection, enableCustomQuestions, customQuestions[]

**CustomQuestion:** id, question, options[], createdAt

**Reflection:** id, alarmId, question, answer, timestamp

**Quote:** id, text, author, active

---

## Key Services

**Alarm Scheduler (alarmScheduler.ts):**
- Calculates next trigger time based on current time and weekday repeat settings
- Uses Android native AlarmManager for reliable exact alarms
- Falls back to expo-notifications if native module unavailable
- Handles alarm rescheduling for repeating alarms
- Reconciles pending alarms on app launch

**Audio Service (alarmAudioService.ts):**
- useAlarmAudio hook manages playback state
- Android: Native foreground service for background audio
- iOS: Vibration support, notification sounds
- Handles cleanup on unmount while keeping native service alive

**Ringtone Service (ringtoneService.ts):**
- Lists device ringtones via native module
- Preview and selection support
- Custom sound URI handling

**Task Engine (tasks/taskEngine.ts):**
- Generates tasks based on configured types
- Math: Addition, subtraction, multiplication problems
- Color: Visual color box matching
- Shape: Rendered shape identification
- Icon Match: Select matching icons from grid
- Position Tap: Tap targets in sequence
- Order Tap: Tap in specified order
- Count Objects: Count displayed items
- Reflection: Open-ended question (always appears last if enabled)
- Custom Questions: User-created Q&A tasks

**Launch Intent Service (launchIntentService.ts):**
- Detects if app launched from alarm trigger
- Passes alarmId to ringing screen

---

## Stores (Zustand)

**useAlarmStore:**
- Manages alarms array and CRUD operations
- Handles persistence via alarmRepository
- Triggers alarm scheduling after modifications

**useSettingsStore:**
- App configuration state
- Loads/saves via settingsRepository
- Default values from AppConstants

**useRingingStore:**
- Manages active alarm session state
- Tracks task progress, current task index
- Controls stop button unlock logic
- Handles audio start/stop coordination

---

## Screens

**AlarmListScreen:**
- Displays alarms in chronological order
- Toggle enable/disable
- Swipe-to-delete or long-press options
- Settings gear icon in header

**AlarmFormScreen:**
- Create and edit alarms
- Time picker with format support
- Weekday selector
- Sound selection (system ringtones)
- Vibration toggle
- Task count slider (3-12)
- Task type selector

**AlarmRingingScreen:**
- Full-screen alarm display
- Current time and alarm label
- Task progress indicator
- Dynamic task rendering based on task type
- Color/shape/icon visual components
- Math number pad
- Reflection text input
- Locked stop button (unlocks after all tasks)
- Handles background/foreground transitions

**QuoteScreen:**
- Displays random quote after alarm stop
- Fallback to greeting based on time of day
- Auto-dismiss or manual close

**SettingsScreen:**
- Theme selector (light/dark/system)
- Time format selector (12h/24h)
- Default task count slider
- Default task types multi-select
- Reflection toggle with info modal
- Custom questions toggle
- View Reflections link
- Terms & Conditions modal
- Contact Developer (LinkedIn)
- Version display

**ReflectionsScreen:**
- Lists past reflections grouped by date
- Question and answer display
- Delete individual reflections

**MyQuestionsScreen:**
- List of custom questions with option count
- Add/Edit modal with validation
- Max 10 questions enforced
- 2-4 options per question required

---

## Theme System

**Tokens (theme/tokens.ts):**
- Semantic color tokens: bg (app, surface, elevated), text (primary, secondary, inverse), border, icon, action (primary, secondary, danger), state (success, warning, error)
- Typography: xs, sm, md, lg, xl sizes
- Spacing: 0-10 scale (0-40px)
- Radius: sm, md, lg, xl, full

**Theme Files:**
- lightTheme.ts: Light color values
- darkTheme.ts: Dark color values
- ThemeContext.tsx: Provider and useThemeTokens hook

**Usage:**
All components consume tokens via useThemeTokens() hook. No hardcoded colors.

---

## Database (SQLite)

**Tables:**
- alarms: Alarm configuration and scheduling data
- settings: User preferences and defaults
- quotes: Local quote library
- reflections: User reflection responses
- custom_questions: User-created Q&A tasks

**Repositories:**
- alarmRepository: Alarm CRUD, getEnabledAlarms
- settingsRepository: Settings load/save
- quoteRepository: Quote fetch, mark used
- reflectionRepository: Save and fetch reflections

**Initialization:**
- Migrations handled in sqlite.ts
- Default quotes seeded on first run

---

## Native Modules (Android)

**AlarmManagerModule:**
- scheduleAlarm, cancelAlarm, canScheduleExactAlarms, requestExactAlarmPermission
- Uses AlarmManager for exact alarm scheduling

**AlarmServiceModule:**
- startAlarmService, stopAlarmService
- Foreground service with notification for reliable audio

**RingtoneModule:**
- getDeviceRingtones, previewRingtone, stopPreview, getDefaultAlarmUri
- Accesses system ringtone database

**LaunchIntentModule:**
- getLaunchAlarmId, clearLaunchAlarm, wasLaunchedFromAlarm
- Passes alarm trigger intent data

**BatteryOptimizationModule:**
- isIgnoringBatteryOptimizations, requestIgnoreBatteryOptimizations
- Guides users to disable battery optimization

---

## Permissions

**Required Permissions (Android):**
- POST_NOTIFICATIONS (alarm notifications)
- SCHEDULE_EXACT_ALARM (Android 12+ exact timing)
- FOREGROUND_SERVICE (background audio service)
- WAKE_LOCK (alarm wake-up)
- VIBRATE (alarm vibration)
- REQUEST_IGNORE_BATTERY_OPTIMIZATIONS (prevent app killing)

**PermissionGate Component:**
- Checks all required permissions on first launch
- Guides users to system settings if needed
- Blocks app usage until critical permissions granted

---

## Alarm Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALARM CREATION FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User creates alarm ──► SQLite storage ──► AlarmManager scheduling          │
│        │                      │                      │                        │
│        ▼                      ▼                      ▼                        │
│  AlarmFormScreen        alarmRepository        alarmScheduler                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ (waits for trigger time)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALARM TRIGGER FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  System AlarmManager ──► AlarmReceiver ──► AlarmService (foreground)        │
│        │                      │                      │                        │
│        ▼                      ▼                      ▼                        │
│  Exact alarm time      Native Android         Notification + Audio          │
│                        broadcast receiver     with wake lock                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           APP LAUNCH FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LaunchIntentModule ──► App.tsx detects alarm ──► AlarmRingingScreen      │
│        │                      │                      │                        │
│        ▼                      ▼                      ▼                        │
│  getLaunchAlarmId()    Navigation to ringing    startAudioLoop()            │
│                              screen              generateTasks()            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TASK COMPLETION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│  │ Task 1   │────►│ Task 2   │────►│ Task 3   │────►│ ...      │           │
│  │ (math)   │     │ (color)  │     │ (shape)  │     │ (more)   │           │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘           │
│       │                │                │                                   │
│       ▼                ▼                ▼                                   │
│  validateAnswer()  validateAnswer()  validateAnswer()                        │
│       │                │                │                                   │
│       └────────────────┴────────────────┘                                   │
│                    │                                                        │
│                    ▼                                                        │
│           All tasks complete?                                               │
│               /        \                                                     │
│             YES        NO                                                   │
│             │          │                                                    │
│             ▼          ▼                                                    │
│    Unlock stop    Continue tasks                                            │
│       button                                                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ALARM STOP FLOW                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User taps stop ──► Audio stop ──► Save reflection (if enabled)           │
│        │               │                      │                            │
│        ▼               ▼                      ▼                            │
│  stopRinging()    native service         reflectionRepository               │
│                   stops audio                                               │
│        │                                                                    │
│        ▼                                                                    │
│  Navigate to QuoteScreen                                                    │
│        │                                                                    │
│        ▼                                                                    │
│  Display random quote / greeting                                            │
│        │                                                                    │
│        ▼                                                                    │
│  User dismisses ──► Return to AlarmListScreen                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Step-by-Step:**
1. User creates alarm -> saved to SQLite -> scheduled via AlarmManager
2. Alarm triggers at scheduled time -> AlarmReceiver starts AlarmService
3. AlarmService shows notification and starts foreground service
4. LaunchIntentService detects alarm launch -> navigates to AlarmRingingScreen
5. AlarmRingingScreen starts audio loop and generates tasks
6. User completes tasks -> progress tracked in useRingingStore
7. All tasks complete -> stop button unlocks
8. User taps stop -> audio stops -> reflection saved (if applicable)
9. QuoteScreen displays random quote
10. User dismisses quote screen -> returns to alarm list

---

## Task Generation

Tasks are generated when ringing screen mounts based on:
- Default task count from settings
- Default task types from settings
- Reflection enabled (adds one reflection task at end)
- Custom questions enabled and available (adds to rotation)

Validation:
- Math answers evaluated numerically
- Color/shape/icon matches checked against correct index
- Order taps validated against expected sequence
- Reflection accepts any non-empty text
- Custom questions checked against stored correct answer

---

## Constants

AppConstants.ts defines:
- DEBUG flag (dev-only logging)
- MIN_TASK_COUNT: 3, MAX_TASK_COUNT: 12, DEFAULT_TASK_COUNT: 5
- DEFAULT_TASK_TYPES: math, color, shape
- DEFAULT_THEME: system, DEFAULT_TIME_FORMAT: 12h
- Default ringtone configuration

---

## Build & Development

**Scripts:**
- npm start: Expo development server
- npm run android: Build and run Android
- npm run typecheck: TypeScript validation
- npm run test: Jest tests

**Pre-commit Hooks (Husky):**
- Runs typecheck and test:ci

**Platform-Specific:**
- Android: Native modules in android/app/src/main/java/
- iOS: Expo managed workflow compatible

---

## Reliability Features

- Android AlarmManager with exact alarm permission
- Foreground service for background audio
- Battery optimization bypass guidance
- Lock screen notification visibility
- Alarm reconciliation on app launch
- Task generation fallback (math if primary fails)
- Quote fallback (time-based greeting)
- Session resume if screen dismissed accidentally

---

## Privacy & Security

- All data stored locally in SQLite
- No network requests
- No analytics or tracking
- No account system
- Open source (link in README)

---

## Version History

3.0: Final polished version
- Terms & Conditions, Contact Developer in Settings
- All features complete (reflection, custom questions, 4 mini tasks)
- Code cleanup complete

2.0: Major feature release
- Reflection system
- Custom questions
- 4 new mini task types
- My Questions tab

1.0: MVP
- Core alarm functionality
- Math, color, shape tasks
- Quote display

---

## File Structure Summary

src/
  components/      Reusable UI components, PermissionGate, RingtoneSelector
  constants/       Types, AppConstants, default quotes and reflection questions
  data/
    db/            SQLite setup and migrations
    repositories/  Data access layer
  navigation/      RootStack, MainTabs
  screens/         Screen components organized by feature
    alarms/        AlarmList, AlarmForm
    ringing/       AlarmRinging, Quote
    settings/      Settings, Reflections
    myQuestions/   Custom questions management
  services/        Business logic
    alarmScheduler.ts
    alarmAudioService.ts
    ringtoneService.ts
    launchIntentService.ts
    alarmPermission.ts
    tasks/         Task generation engine
  stores/          Zustand state stores
  theme/           Design tokens, themes, ThemeContext

docs/
  product/         Product context, features, user flow
  specs/           Detailed technical specifications
  techDoc.md       This file

logs/
  implementation-tracker.md
  changeLogs.md

android/           Android native project with custom modules

---

## Unused Assets & Code Cleanup Recommendations

### Unused Assets (Safe to Delete)

| File | Size | Status | Notes |
|------|------|--------|-------|
| assets/sounds/alarm_default.mp3 | 448 KB | NOT USED | App uses system ringtones via RingtoneModule |
| assets/sounds/alarm_digital.mp3 | 151 KB | NOT USED | Same as above |
| assets/sounds/alarm_gentle.mp3 | 495 KB | NOT USED | Same as above |
| assets/TaskAlarm-logo-01.png | ? | NOT USED | Not referenced anywhere |
| assets/TaskAlarm-logo-02.png | ? | NOT USED | Not referenced anywhere |

**Potential Savings:** ~1.1 MB from audio files alone

### Unused / Underutilized Dependencies

| Dependency | Status | Recommendation |
|------------|--------|----------------|
| expo-audio | Underutilized | Only imported but playback happens via native service. Can remove if native service handles all audio |
| expo-document-picker | USED | Used in RingtoneSelector for selecting custom audio files - KEEP |

### Unused Code Patterns

1. **alarmAudioService.ts:**
   - `useAudioPlayer` and `AudioPlayer` imported but never configured for actual playback
   - `playerRef` only used for cleanup, never for starting playback
   - `configureAudioSession()` - empty function only logs in debug
   - `playTestSound()` - not called anywhere

2. **AppConstants.ts:**
   - `DEFAULT_SNOOZE_INTERVAL` (5 min) - snooze not implemented
   - `DEFAULT_SNOOZE_MAX` (3) - snooze not implemented
   - `DEFAULT_RINGTONES` array - app uses device ringtones instead

---

## App Size Reduction Strategy (100MB → Target: ~20-30MB)

### Immediate Actions (Can save ~5-10MB)

1. **Remove unused assets**
   ```bash
   rm assets/sounds/*.mp3
   rm assets/TaskAlarm-logo-*.png
   ```

2. **Enable ProGuard/R8 minification** in `android/app/build.gradle`:
   ```gradle
   def enableMinifyInReleaseBuilds = true
   def enableShrinkResources = true
   ```

3. **Enable bundle compression** in `android/app/build.gradle`:
   ```gradle
   enableBundleCompression = true
   ```

4. **Split APK by architecture** in `android/app/build.gradle`:
   ```gradle
   android {
       splits {
           abi {
               enable true
               reset()
               include 'arm64-v8a', 'armeabi-v7a'
               universalApk false
           }
       }
   }
   ```

### Medium-term Optimizations (Can save ~30-50MB)

5. **Hermes is already enabled** - good for JS bundle size

6. **Remove unused native dependencies:**
   - If expo-audio is truly not needed, uninstall it:
     ```bash
     npm uninstall expo-audio
     cd android && ./gradlew clean
     ```

7. **Optimize JSC (JavaScriptCore):**
   - Use smaller JSC variant in `android/app/build.gradle`:
     ```gradle
     def jscFlavor = 'io.github.react-native-community:jsc-android:2026004.0.0'
     ```
     - International variant adds ~6MB per architecture (currently using `+` which pulls latest)

8. **Android App Bundle (AAB) instead of APK:**
   - Upload AAB to Play Store instead of universal APK
   - Google Play generates optimized APKs per device
   - Can reduce download size by ~40%

### Verification Steps

After each change, verify build size:
```bash
cd android
./gradlew assembleRelease
ls -lh app/build/outputs/apk/release/
```

Target breakdown:
- Base React Native: ~15-20 MB
- Native modules (SQLite, Notifications): ~5-8 MB
- JS bundle: ~2-3 MB
- Resources: ~2-3 MB
- **Total target: ~25-35 MB**

---

End of Technical Documentation
