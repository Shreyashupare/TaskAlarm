# Implementation Tracker

Simple checklist to track what is done and what is pending.

## Status legend

- `[ ]` not started
- `[-]` in progress
- `[x]` done

## Product

- [x] Define product purpose and MVP scope
- [x] Define user flow and screens
- [x] Define coding and testing standards
- [x] Create technical documentation
- [x] Build alarm list screen
- [x] Build create/edit alarm screen
- [x] Build alarm scheduling integration
- [x] Build ringing screen with task lock
- [x] Build optional mini-task templates (Math, Color, Shape)
- [x] Build quote-after-stop flow

## Technical docs progress

- [x] Step 1: Architecture spec
- [x] Step 2: Packages and setup spec
- [x] Step 3: Screen-wise detailed spec
- [x] Step 4: Functional/service spec
- [x] Step 5: Theme design system spec
- [x] Step 6: Scenarios and edge cases
- [x] Step 7: Testing and acceptance spec

## Task engine

- [x] Math task generator (+, -, *)
- [x] Color task generator (6 colors with visual color boxes)
- [x] Shape task generator (4 shapes with visual render)
- [x] Mixed mode selector
- [x] Task progress and unlock logic
- [x] Task generation failure fallback (retry + math fallback)
## V2.0 Features

- [x] Create spec `docs/specs/08-version2.0.md` - Extended Task Engine (Reflection + 4 Mini Tasks + Custom Questions)

### Phase 1: Core Types & Storage
- [x] Update AlarmTaskType (add icon_match, position_tap, order_tap, count_objects)
- [x] Update Task type (add reflection, custom)
- [x] Add CustomQuestion type
- [x] Update AppSettings (enableReflection, enableCustomQuestions, customQuestions)
- [x] Database migrations (enable_reflection, custom_questions, enable_custom_questions columns)
- [x] Create reflections table
- [x] Create defaultReflectionQuestions.ts constants file

### Phase 2: Task Engine
- [x] Implement generateIconMatchTask()
- [x] Implement generatePositionTapTask()
- [x] Implement generateOrderTapTask()
- [x] Implement generateCountObjectsTask()
- [x] Implement generateReflectionTask()
- [x] Implement generateCustomQuestionTask()
- [x] Update generateTasks() with reflection (always last) & custom questions logic
- [x] Update validateAnswer() for reflection type (any non-empty text)
- [x] Update mapTaskType() to include 4 new mini tasks

### Phase 3: My Questions Screen
- [x] Create MyQuestionsScreen folder structure (screen, styles, helpers/)
- [x] Build MyQuestionsScreen list view (question preview, option count)
- [x] Build Add/Edit modal (question 0/80, options 0/20, char counters)
- [x] Implement CRUD: Create, Read, Update, Delete
- [x] Add validation (max 10 questions, 2-4 options, unique options)
- [x] Update MainTabs.tsx (Alarms | My Questions, Settings via gear icon)
- [x] Add Settings gear icon to AlarmListScreen header

### Phase 4: Reflection Features
- [x] Add reflection UI to AlarmRingingScreen (multiline input, submit button)
- [x] Create reflectionRepository.ts (saveReflection, getRecentReflections)
- [x] Create ReflectionsScreen inside Settings (list past reflections, grouped by date)
- [x] Save reflection response on task completion

### Phase 5: Settings Integration
- [x] Add global task type selector in Settings (math, color, shape, 4 new types)
- [x] Add "Include Reflection" toggle in Settings
- [x] Add "Include My Questions" toggle in Settings (disabled if no questions)
- [x] Wire up settings to task generation in AlarmRingingScreen

### Phase 6: Testing (Manual checklist for QA)
- [x] Test all 4 new mini task types render correctly
- [x] Test reflection appears last and accepts any non-empty text
- [x] Test custom questions CRUD operations
- [x] Test custom questions appear in task rotation
- [x] Test max 10 questions enforced
- [x] Test reflections saved and viewable in ReflectionsScreen
- [x] Test settings toggles (reflection, custom questions) work correctly
- [x] Test navigation: Alarms tab, My Questions tab, Settings via gear

### Phase 7: Final Polish
- [x] Add Terms & Conditions modal in Settings About section
- [x] Add Contact Developer row with LinkedIn link
- [x] Clean up console logs and testing comments from services
- [x] Update version to 2.4.0 in Settings UI

## Post-V2 / MVP Remaining

- [ ] Sound preview in alarm form
- [ ] Quick duplicate alarm option
- [ ] Reboot restore (Android receiver)
- [ ] iOS sound limitations handling

## Platform checks

- [x] Android exact alarm permission flow - checkExactAlarmPermission() + openExactAlarmSettings()
- [x] Basic background/foreground behavior testing - Foreground event handler in App.tsx

## Development checklist (start implementation)

- [x] Create project skeleton folders from `docs/specs/01-architecture.md`.
- [x] Install baseline dependencies from `docs/specs/02-packages-and-setup.md`.
- [x] Configure navigation shell (root stack + bottom tabs).
- [x] Set up SQLite schema and repositories (`alarms`, `settings`, `quotes`).
- [x] Implement Zustand stores (`useAlarmStore`, `useSettingsStore`, `useRingingStore`).
- [x] Implement theme tokens/provider and `useThemeTokens()` hook.
- [x] Build reusable UI primitives (`AppButton`, `AppSwitch`, `FormSection`, `TopHeader`).
- [x] Implement common app routing and navigation logic.
- [x] Build Alarm List + Create/Edit screens.
- [x] Implement scheduler service + reconcile-on-launch flow.
- [x] Build ringing session with task gating and audio loop.
- [x] Build quote-after-stop screen with fallback quote behavior (Good Morning/Good Evening).
- [x] Settings screen with proper settings options.
- [x] Run MVP scenario checks from `docs/specs/06-scenarios-and-edge-cases.md`.

## MVP Scenario Checklist Status

- [x] Background trigger works - Notifee foreground event handler in App.tsx
- [x] Lock-screen trigger flow works - Full-screen action in notification config
- [x] App-killed behavior verified - Background event handler in alarmScheduler.ts
- [x] Permission denied path handled - checkExactAlarmPermission() + openExactAlarmSettings()
- [x] Task fallback works - safeGenerateTask() with retry + math fallback
- [x] Quote fallback works - Greeting fallback in QuoteScreen

## Post-MVP / Platform
- [ ] Reboot restore (Android receiver)
- [ ] Custom sound fallback
- [ ] iOS specific implementations
