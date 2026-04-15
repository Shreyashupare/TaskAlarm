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
- [ ] Build alarm list screen
- [ ] Build create/edit alarm screen
- [ ] Build alarm scheduling integration
- [ ] Build ringing screen with task lock
- [ ] Build optional mini-task templates
- [ ] Build quote-after-stop flow

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
- [x] Color task generator (6 colors with text labels)
- [x] Shape task generator (5 shapes)
- [x] Mixed mode selector
- [x] Task progress and unlock logic
- [x] Task generation failure fallback (retry + math fallback)
- [ ] Use AI for random task ? (Post-MVP)

## Platform checks

- [x] Android exact alarm permission flow - checkExactAlarmPermission() + openExactAlarmSettings()
- [x] Basic background/foreground behavior testing - Foreground event handler in App.tsx
- [ ] iOS sound limitations handling (Post-MVP)

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
