# 04 Functional Specs

## Goal

Define clear functional behavior for stores, services, and app flows so implementation stays modular and consistent.

## Functional modules

- Alarm management
- Scheduling and trigger handling
- Ringing session lifecycle
- Task generation and answer validation
- Audio playback control
- Quote selection and display
- Settings and theme preference

## 1) Store contracts (Zustand)

## `useAlarmStore`

### State

- `alarms: Alarm[]`
- `isLoading: boolean`
- `error?: string`

### Actions

- `loadAlarms(): Promise<void>`
- `createAlarm(input: AlarmInput): Promise<Alarm>`
- `updateAlarm(id: string, patch: Partial<AlarmInput>): Promise<void>`
- `deleteAlarm(id: string): Promise<void>`
- `toggleAlarm(id: string, enabled: boolean): Promise<void>`
- `duplicateAlarm(id: string): Promise<Alarm>` (optional V1.1)

### Rules

- Persist to repository before scheduling.
- On create/update/toggle, scheduler must reconcile trigger(s).
- On delete, cancel scheduled trigger(s) and then remove DB record.

## `useSettingsStore`

### State

- `settings: AppSettings`
- `isHydrated: boolean`

### Actions

- `loadSettings(): Promise<void>`
- `updateSettings(patch: Partial<AppSettings>): Promise<void>`
- `setTheme(theme: 'light' | 'dark' | 'system'): Promise<void>`

### Rules

- Settings save is immediate.
- Settings persist to SQLite (canonical source).
- Theme updates propagate through theme provider instantly.

## `useRingingStore`

### State

- `sessionActive: boolean`
- `alarmId?: string`
- `requiredTasks: number`
- `completedTasks: number`
- `currentTask?: GeneratedTask`
- `stopUnlocked: boolean`
- `sessionError?: string`

### Actions

- `startSession(alarm: Alarm): Promise<void>`
- `submitAnswer(answer: TaskAnswer): SubmitResult`
- `nextTask(): void`
- `unlockStopIfReady(): void`
- `stopAlarm(): Promise<void>`
- `snoozeAlarm(): Promise<void>`
- `endSession(): void`

### Rules

- `stopUnlocked` is false until `completedTasks >= requiredTasks`.
- Snooze allowed only if policy is `afterCompletionOnly` and stop is unlocked.
- Audio must stop when session ends.

## 2) Service contracts

## `alarmScheduler`

### Methods

- `scheduleAlarm(alarm: Alarm): Promise<void>`
- `rescheduleAlarm(alarm: Alarm): Promise<void>`
- `cancelAlarm(alarmId: string): Promise<void>`
- `reconcileAll(alarms: Alarm[]): Promise<void>`
- `getNextTriggerTime(alarm: Alarm, now: Date): Date | null`

### Behavior

- Only schedule if alarm is enabled.
- Compute next valid weekday/time trigger.
- Ensure one canonical schedule per alarm instance (prevent duplicates).

## `alarmPermission`

### Methods

- `checkExactAlarmPermission(): Promise<PermissionState>`
- `requestExactAlarmPermissionIfNeeded(): Promise<PermissionState>`
- `openSystemAlarmSettings(): Promise<void>`

### Behavior

- On denied state, store warning flag and show guidance in UI.

## `alarmAudioService`

### Methods

- `startLoop(source: SoundSource): Promise<void>`
- `setVolume(level: number): Promise<void>`
- `stop(): Promise<void>`
- `isPlaying(): boolean`

### Behavior

- Must support continuous loop during session.
- If selected sound fails, fallback to default sound.

## `taskFactory`

### Methods

- `createTask(type: AlarmTaskType, difficulty: Difficulty): GeneratedTask`
- `createMixedTask(enabledTypes: AlarmTaskType[], difficulty: Difficulty): GeneratedTask`

### Behavior

- Avoid repeating same task subtype too many times in sequence.
- Keep generated tasks valid for chosen difficulty.

## `taskEngine`

### Methods

- `buildSessionTasks(config: TaskSessionConfig): GeneratedTask[]`
- `validateAnswer(task: GeneratedTask, answer: TaskAnswer): boolean`
- `getNextTask(queue: GeneratedTask[], index: number): GeneratedTask | null`

### Behavior

- Session task count equals required count.
- Validation must be deterministic and side-effect free.

## `quoteService`

### Methods

- `getRandomQuote(): Promise<Quote>`
- `getQuoteById(id: string): Promise<Quote | null>`

### Behavior

- Fetch from local source in MVP (SQLite table or local seeded data).
- If quote source empty, return default hardcoded fallback quote.

## 3) Validation rules

## Alarm input

- `time` required and valid.
- `weekdays` must include at least one day.
- `taskCount` must be integer and between `3` and `10`.
- `taskType` must be supported enum.
- If `soundType='custom'`, `soundUri` must exist and be readable; else fallback to default.

## Settings input

- `defaultTaskCount` constrained to `3..10`.
- `defaultTaskType` must be supported enum.
- `snoozePolicy` fixed to `afterCompletionOnly` in MVP.

## Task answer input

- Reject empty answer payload.
- Reject answer if no active session/current task.

## 4) Detailed event flows

## A. Create alarm flow

1. UI validates form.
2. `useAlarmStore.createAlarm` called.
3. Repository inserts alarm.
4. Scheduler schedules next trigger.
5. Store refreshes local alarm list.
6. UI returns to list with success feedback.

## B. Alarm trigger to ringing flow

1. Trigger callback receives alarm reference.
2. Alarm is loaded from repository.
3. `useRingingStore.startSession` initializes counts and first task.
4. `alarmAudioService.startLoop` begins playback.
5. Navigate to ringing screen.

## C. Task submit flow

1. User submits answer.
2. `taskEngine.validateAnswer` executes.
3. If incorrect -> show feedback, keep same task.
4. If correct -> increment completed count and move next task.
5. If final task complete -> unlock stop and update UI.

## D. Stop and quote flow

1. User taps stop (only when unlocked).
2. `useRingingStore.stopAlarm` ends session and audio.
3. Scheduler computes next occurrence for repeating alarms.
4. `quoteService.getRandomQuote` returns quote.
5. Navigate to quote screen.

## E. App launch reconcile flow

1. App boots.
2. Load alarms/settings.
3. `alarmScheduler.reconcileAll` ensures all enabled alarms have valid schedules.
4. If permission issue found, mark warning state for UI.

## 5) Error handling baseline

- Show user-friendly error toasts/messages.
- Keep error logs structured for debugging.
- Use safe fallbacks:
  - default sound fallback
  - default quote fallback
  - retry scheduling once before hard fail state

## Logging behavior

- Logging is minimal and purposeful, not verbose by default.
- Global log level is controlled by shared constant:
  - `LOG_LEVEL_ENABLED = 'error'` (default)
- Allowed levels: `debug`, `info`, `warn`, `error`.
- Log only meaningful events:
  - scheduler failures
  - permission failures
  - task generation/validation failures
  - audio start/stop failures
  - DB read/write failures
- Avoid logging routine success paths unless temporary debug mode is enabled.
- Never log sensitive data (tokens, personal content, full payload dumps).

## 6) Non-functional constraints

- Keep service methods pure where possible.
- Avoid direct DB calls from UI layer.
- No duplicate scheduling logic outside scheduler service.
- Keep task rendering generic via shared `TaskCard`.
