# 01 Architecture

## Goal

Define a simple, modular architecture that is easy to extend without rewriting core logic.

## Architecture principles

- Small modules with clear ownership.
- Shared logic in services/stores, not duplicated in screens.
- Theme and tokens from one global source only.
- Offline-first MVP behavior.

## High-level layers

1. `UI layer` (screens/components)
   - Renders views, handles user input.
   - Calls store actions and service methods.
2. `State layer` (Zustand stores)
   - Holds app state for alarms, settings, ringing session, and quote display state.
3. `Domain/service layer`
   - Alarm scheduling orchestration (Notifee).
   - Audio playback orchestration (`expo-audio`).
   - Task generation and task validation.
   - Quote selection.
4. `Persistence layer` (SQLite)
   - Alarms table.
   - Settings table.
   - Quotes table (or seeded quotes dataset loaded into table).

## Suggested folder structure

```txt
src/
  app/
    App.tsx
    providers/
      ThemeProvider.tsx
      StoreProvider.tsx
  navigation/
    RootStack.tsx
    MainTabs.tsx
  screens/
    alarms/
      AlarmListScreen.tsx
      AlarmFormScreen.tsx
    ringing/
      AlarmRingingScreen.tsx
      QuoteScreen.tsx
    settings/
      SettingsScreen.tsx
  components/
    alarm/
      AlarmCard.tsx
      WeekdaySelector.tsx
    task/
      TaskCard.tsx
      TaskProgress.tsx
    common/
      AppButton.tsx
      AppSwitch.tsx
      AppTextInput.tsx
  stores/
    useAlarmStore.ts
    useSettingsStore.ts
    useRingingStore.ts
  services/
    alarm/
      alarmScheduler.ts
      alarmPermission.ts
    audio/
      alarmAudioService.ts
    tasks/
      taskEngine.ts
      taskFactory.ts
      taskCatalog.ts
    quotes/
      quoteService.ts
  data/
    db/
      sqlite.ts
      repositories/
        alarmRepository.ts
        settingsRepository.ts
        quoteRepository.ts
  theme/
    tokens.ts
    lightTheme.ts
    darkTheme.ts
    index.ts
  types/
    alarm.ts
    task.ts
    settings.ts
    quote.ts
  utils/
    dateTime.ts
    validators.ts
```

## Core runtime flows

## A. Alarm scheduling flow

1. User creates/edits alarm.
2. `useAlarmStore` validates and saves alarm via repository.
3. `alarmScheduler` registers next trigger(s) through Notifee.
4. On app launch, scheduler reconciles pending alarms from DB.

## B. Alarm ringing flow

1. Trigger received -> open ringing route.
2. `useRingingStore` starts session.
3. `alarmAudioService` starts looped playback.
4. `taskEngine` serves tasks one by one.
5. After required tasks complete, stop button unlocks.
6. Stop action ends audio + session.
7. `quoteService` returns random quote and shows quote screen.

## C. Theme flow

1. App reads theme preference from settings store.
2. Theme provider loads `lightTheme` or `darkTheme`.
3. All components consume tokens from provider.
4. No component-level hardcoded colors.

## Data model (MVP baseline)

```ts
type AlarmTaskType =
  | 'math'
  | 'color'
  | 'shape'
  | 'mixed'
  | 'icon_match'
  | 'position_tap'
  | 'order_tap'
  | 'count_objects';

type Alarm = {
  id: string;
  time: string;
  weekdays: number[];
  enabled: boolean;
  label?: string;
  soundType: 'default' | 'custom';
  soundName: string;
  soundUri?: string;
  vibration: boolean;
  taskType: AlarmTaskType;
  taskCount: number; // 3..10
  createdAt: number;
  updatedAt: number;
};

type AppSettings = {
  theme: 'light' | 'dark' | 'system';
  defaultTaskCount: number; // default 4
  minTaskCount: 3;
  maxTaskCount: 10;
  defaultTaskType: AlarmTaskType;
  snoozePolicy: 'afterCompletionOnly';
};

type Quote = {
  id: string;
  text: string;
  author?: string;
  active: boolean;
};
```

## Screen-to-store ownership

- Alarm list/form screens -> `useAlarmStore`.
- Ringing/task/quote screens -> `useRingingStore`.
- Settings screen -> `useSettingsStore`.

## Extensibility points

- Add new task types through `taskFactory` without changing ringing screen.
- Add new themes by extending tokens/theme files only.
- Add quote providers (API/AI in V2) behind `quoteService` interface.
- Keep task templates in `taskCatalog` so UI stays reusable with one `TaskCard` shell.
