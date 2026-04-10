# 02 Packages And Setup

## Goal

Define a practical package baseline for `Expo prebuild` with simple implementation and stable alarm behavior.

## Core packages

## Runtime

- `react`
- `react-native`
- `expo`

## Navigation

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`
- `react-native-gesture-handler`

## State and storage

- `zustand`
- `react-native-mmkv` (optional fast runtime cache; not canonical persistence)
- `expo-sqlite` (primary structured storage for alarms, quotes, and history)

## Alarm and notifications

- `@notifee/react-native`

## Audio

- `expo-audio`

## Forms and validation

- `react-hook-form`
- `zod`

## Utilities

- `dayjs`
- `nanoid`

## UI and icons

- `@expo/vector-icons`

## Development and quality

- `typescript`
- `eslint`
- `prettier`
- `jest`
- `@testing-library/react-native`

## Why this package mix

- `Notifee` gives strong local notification/alarm control for React Native.
- `expo-audio` fits selected audio choice and Expo workflow.
- `SQLite` supports structured alarm/task/quote data cleanly.
- `MMKV` can be used for fast temporary runtime caching if needed.
- `Zustand` keeps state simple without heavy boilerplate.

## Installation sequence (high-level)

1. Initialize Expo app and enable prebuild workflow.
2. Add navigation dependencies and configure root navigation.
3. Add state/storage packages (`zustand`, `mmkv`, `expo-sqlite`).
4. Add Notifee and configure platform requirements.
5. Add `expo-audio` and define alarm playback behavior.
6. Add validation/testing/tooling packages.

## Setup notes by concern

## 1) Navigation setup

- Use root stack for global flows.
- Use bottom tabs for primary app areas.
- Present ringing flow as full-screen route above tabs.

## 2) Data setup

- Keep alarms and quotes in SQLite tables.
- Keep settings in SQLite as the canonical source of truth.
- Use MMKV only for optional runtime cache/flags derived from SQLite state.
- Avoid duplicating same data in multiple stores.

## 3) Notification/alarm setup

- Create notification channel(s) on Android.
- Register trigger notifications via scheduler service.
- On app launch, reconcile persisted alarms with scheduled triggers.

## 4) Audio setup

- Configure playback to loop during ringing session.
- Stop audio only when session rules are satisfied or emergency policy applies.
- Always include fallback default sound.

## 5) Validation setup

- Validate alarm input at form boundary and service boundary.
- Enforce task count limits (`3..10`) centrally in schema.

## Suggested minimal package policy

- Add only packages used in current milestone.
- Avoid adding optional UI libraries until needed.
- Prefer one library per responsibility.

## Risks and watchouts

- Notifee platform behavior can differ across iOS/Android; test both.
- Expo prebuild adds native config surface; keep setup steps documented.
- Alarm reliability needs scenario testing (background, lock screen, reboot, timezone changes).
