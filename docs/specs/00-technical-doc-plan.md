# Technical Documentation Plan

This folder contains detailed technical specs for implementation.

## Selected baseline

- App setup: `Expo prebuild`.
- Notification/alarm: `Notifee` (primary).
- Audio playback: `expo-audio`.
- State: `Zustand`.
- Storage: `SQLite` as single source of truth (MMKV optional runtime cache only).
- Navigation: `Stack + bottom tabs`.
- Screen detail depth: high detail (near pixel-level sectioning).
- Snooze policy: allowed only after all required tasks complete.
- UI density: minimal controls and clear spacing.
- Theme depth: full design tokens.

## Quote strategy

- MVP: local quotes only (offline, bundled/local DB).
- V2 idea: optional AI-generated quotes (out of current scope).

## Task strategy update

- Keep existing core tasks: `math`, `color`, `shape`, `mixed`.
- Add simple extensible mini-task templates for variety:
  - `icon_match`
  - `position_tap`
  - `order_tap`
  - `count_objects`
- Documented in functional specs as optional V1.1 additions without changing core architecture.

## Step-by-step order (architecture first)

1. `01-architecture.md` - app architecture, modules, data flow, storage boundaries.
2. `02-packages-and-setup.md` - package list, why used, install/config notes.
3. `03-screen-specs.md` - screen-by-screen layout positions and control behavior.
4. `04-functional-specs.md` - functions, services, and detailed behavior rules.
5. `05-theme-design-system.md` - global color scheme and full design tokens.
6. `06-scenarios-and-edge-cases.md` - runtime scenarios, failures, and recovery rules.
7. `07-testing-and-acceptance.md` - test matrix and release acceptance.

## Suggested scenarios to include (recommended additions)

- Exact alarm permission denied/revoked while alarms exist.
- Device reboot and app-not-opened rescheduling recovery.
- Multiple alarms within short intervals (queue/conflict handling).
- User force-kills app before alarm trigger.
- Audio file missing or unreadable fallback to default alarm sound.
- Clock changes (manual time change and timezone/DST transitions).
