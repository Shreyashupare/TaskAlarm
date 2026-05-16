# Version 4.0 Technical Implementation

Technical details for v4.0. Product rules and UX: `docs/specs/09-version4.0.md`.

**Implementation order:** motivational sentences → Night Guide. **Do not implement** until product owner confirms specs.

**UI title (single source):** `src/constants/nightGuideConstants.ts` → `NIGHT_GUIDE_TITLE`. Code identifiers remain `NightGuide*`.

**Constants (add to `AppConstants.ts` or feature helpers):**
- `MOTIVATIONAL_SENTENCE_DELAY_MS = 2500`
- `MOTIVATIONAL_SENTENCE_COUNT_MIN = 3`
- `MOTIVATIONAL_SENTENCE_COUNT_MAX = 5`
- `NIGHT_GUIDE_GRACE_HOUR_IST = 9` — deadline hour next calendar day (IST)
- `NIGHT_GUIDE_TIMEZONE = 'Asia/Kolkata'`

---

## 1. Data Models

### 1.1 Night Guide Type

```typescript
// src/constants/types/nightGuide.ts
export type NightGuide = {
  id: string;
  time: string; // HH:MM format
  weekdays: number[]; // 0-6, empty means one-time
  enabled: boolean;
  label?: string;
  soundType: "default" | "custom" | "notification";
  soundName: string;
  soundUri?: string;
  createdAt: number;
  updatedAt: number;
};

export type NightGuideTask = {
  id: string;
  nightGuideId: string;
  text: string;
  order: number;
};

export type NightReflection = {
  id: string;
  nightGuideId: string;
  occurrenceId: string;
  question: string;
  response: string;
  completionPercentage: number; // 0-100
  createdAt: number;
};

/** One scheduled fire per guide per IST calendar day */
export type NightGuideOccurrence = {
  id: string;
  nightGuideId: string;
  scheduledDate: string; // YYYY-MM-DD in IST
  status: "pending" | "completed" | "missed";
  completionPercentage: number; // 0 if none yet
  graceDeadlineAt: number; // epoch ms = 09:00 IST next calendar day
  createdAt: number;
  completedAt?: number;
};
```

### 1.2 Settings Type Updates

```typescript
// src/constants/types/settings.ts
type AppSettings = {
  // ... existing settings
  enableMotivationalSentences: boolean; // default: true
  enableTextToSpeech: boolean; // default: false
};
```

---

## 2. Database Schema

### 2.1 New Tables

```sql
-- Night guides table
CREATE TABLE IF NOT EXISTS night_guides (
  id TEXT PRIMARY KEY,
  time TEXT NOT NULL,
  weekdays TEXT NOT NULL, -- JSON array
  enabled INTEGER NOT NULL DEFAULT 1,
  label TEXT,
  sound_type TEXT NOT NULL DEFAULT 'notification',
  sound_name TEXT NOT NULL,
  sound_uri TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Night guide tasks table
CREATE TABLE IF NOT EXISTS night_guide_tasks (
  id TEXT PRIMARY KEY,
  night_guide_id TEXT NOT NULL,
  text TEXT NOT NULL,
  order_num INTEGER NOT NULL,
  FOREIGN KEY (night_guide_id) REFERENCES night_guides(id) ON DELETE CASCADE
);

-- Pending / completed / missed slots (IST calendar day) — create before night_reflections
CREATE TABLE IF NOT EXISTS night_guide_occurrences (
  id TEXT PRIMARY KEY,
  night_guide_id TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  status TEXT NOT NULL,
  completion_percentage INTEGER NOT NULL DEFAULT 0,
  grace_deadline_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  completed_at INTEGER,
  FOREIGN KEY (night_guide_id) REFERENCES night_guides(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS night_reflections (
  id TEXT PRIMARY KEY,
  night_guide_id TEXT NOT NULL,
  occurrence_id TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  completion_percentage INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (night_guide_id) REFERENCES night_guides(id) ON DELETE CASCADE,
  FOREIGN KEY (occurrence_id) REFERENCES night_guide_occurrences(id) ON DELETE CASCADE
);
```

### 2.2 Settings Table Migration

```sql
ALTER TABLE settings ADD COLUMN enable_motivational_sentences INTEGER DEFAULT 1;
ALTER TABLE settings ADD COLUMN enable_text_to_speech INTEGER DEFAULT 0;
```

---

## 3. Content Files

### 3.1 Motivational Sentences

```typescript
// src/constants/defaultMotivationalSentences.ts
export const DEFAULT_MOTIVATIONAL_SENTENCES = [
  "I'm the best.",
  "I can do it alone.",
  "God is always with me.",
  "I am a winner.",
  "Today is my day.",
  "I believe in myself.",
  "Every challenge makes me stronger.",
  "I am capable of achieving anything.",
  "My potential is limitless.",
  "I choose happiness and success.",
  "I am in control of my destiny.",
  "Today I will shine.",
  "I am grateful for this moment.",
  "I embrace new opportunities.",
  "I am worthy of love and respect.",
  "I trust my instincts.",
  "I am creating my future.",
  "I am focused and determined.",
  "I radiate positivity.",
  "I am unstoppable.",
  // ... expand to 100-200
] as const;

export function getRandomMotivationalSentenceCount(): number {
  const min = 3;
  const max = 5;
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function getRandomMotivationalSentences(count?: number): string[] {
  const n = count ?? getRandomMotivationalSentenceCount();
  const shuffled = [...DEFAULT_MOTIVATIONAL_SENTENCES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
```

### 3.2 Night Reflection Questions

```typescript
// src/constants/defaultNightReflectionQuestions.ts
export const DEFAULT_NIGHT_REFLECTION_QUESTIONS = [
  "What did you accomplish today?",
  "What are you grateful for today?",
  "What did you learn today?",
  "How did you make someone's day better?",
  "What's one thing you want to improve tomorrow?",
  "I did great today.",
  "I'm proud of myself.",
  "I'm ready for tomorrow.",
  "Today was a good day.",
  "I forgive myself for any mistakes.",
  "I release today's worries.",
  "I am at peace.",
  "I deserve a good rest.",
  "Tomorrow is a fresh start.",
] as const;

export function getNightReflectionQuestion(): string {
  const randomIndex = Math.floor(Math.random() * DEFAULT_NIGHT_REFLECTION_QUESTIONS.length);
  return DEFAULT_NIGHT_REFLECTION_QUESTIONS[randomIndex];
}
```

---

## 4. Repository Layer

### 4.1 Night Guide Repository

```typescript
// src/data/repositories/nightGuideRepository.ts
export async function createNightGuide(nightGuide: NightGuide): Promise<void>;
export async function updateNightGuide(nightGuide: NightGuide): Promise<void>;
export async function deleteNightGuide(id: string): Promise<void>;
export async function getNightGuideById(id: string): Promise<NightGuide | null>;
export async function getAllNightGuides(): Promise<NightGuide[]>;
export async function getEnabledNightGuides(): Promise<NightGuide[]>;
```

### 4.2 Night Guide Task Repository

```typescript
// src/data/repositories/nightGuideTaskRepository.ts
export async function createTask(task: NightGuideTask): Promise<void>;
export async function updateTask(task: NightGuideTask): Promise<void>;
export async function deleteTask(id: string): Promise<void>;
export async function getTasksByNightGuideId(nightGuideId: string): Promise<NightGuideTask[]>;
export async function deleteTasksByNightGuideId(nightGuideId: string): Promise<void>;
```

### 4.3 Night Reflection Repository

```typescript
// src/data/repositories/nightReflectionRepository.ts
export async function saveNightReflection(reflection: NightReflection): Promise<void>;
export async function getNightReflectionsByNightGuideId(
  nightGuideId: string,
  limit: number = 30
): Promise<NightReflection[]>;
export async function getNightReflectionsByDateRange(
  startDate: number,
  endDate: number
): Promise<NightReflection[]>;
export async function getCompletionStats(
  nightGuideId: string,
  days: number = 7
): Promise<{ completed: number; total: number }>;
```

### 4.4 Night Guide Occurrence Repository

```typescript
// src/data/repositories/nightGuideOccurrenceRepository.ts
export async function createPendingOccurrence(
  nightGuideId: string,
  scheduledDate: string,
  graceDeadlineAt: number
): Promise<NightGuideOccurrence>;
export async function markOccurrenceCompleted(
  id: string,
  completionPercentage: number
): Promise<void>;
export async function markMissedAfterGrace(now: number): Promise<void>; // batch: pending → missed
export async function getPendingOccurrences(): Promise<NightGuideOccurrence[]>;
export async function getOccurrencesByDateRange(
  startDate: string,
  endDate: string
): Promise<NightGuideOccurrence[]>;
```

### 4.5 Weekday enable conflict

```typescript
// When enabling a guide, disable others sharing any weekday
export async function setNightGuideEnabled(
  nightGuideId: string,
  enabled: boolean
): Promise<void>;
```

---

## 5. Scheduling Service

### 5.1 Night Guide Scheduler

```typescript
// src/services/nightGuideScheduler.ts
const NIGHT_GUIDE_CHANNEL_ID = "taskalarm-night-guides";

export async function setupNightGuideNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(NIGHT_GUIDE_CHANNEL_ID, {
    name: "Night Guide Notifications",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200],
    sound: "default",
    enableVibrate: true,
    enableLights: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    bypassDnd: false,
  });
}

export async function scheduleNightGuide(nightGuide: NightGuide): Promise<void> {
  await cancelNightGuide(nightGuide.id);

  const now = new Date();
  const triggerTime = getNextTriggerTime(nightGuide, now);

  if (!triggerTime) return;

  const notificationContent: Notifications.NotificationContentInput = {
    title: nightGuide.label || "Night Guide",
    body: "Time for your bedtime routine",
    data: {
      nightGuideId: nightGuide.id,
      type: "night_guide_trigger",
    },
    sound: nightGuide.soundType === "default" ? "default" : undefined,
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
  };

  if (Platform.OS === "android") {
    const androidContent = notificationContent as Notifications.NotificationContentInput & {
      channelId?: string;
    };
    androidContent.channelId = NIGHT_GUIDE_CHANNEL_ID;
  }

  await Notifications.scheduleNotificationAsync({
    content: notificationContent,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerTime,
    },
  });
}

export async function cancelNightGuide(nightGuideId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(n => n.content.data?.nightGuideId === nightGuideId);
  for (const n of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(n.identifier);
  }
}

export async function onNightGuideCompleted(nightGuide: NightGuide): Promise<void> {
  if (nightGuide.weekdays.length === 0) {
    await nightGuideRepository.updateNightGuide({ ...nightGuide, enabled: false });
    await cancelNightGuide(nightGuide.id);
    return;
  }
  await scheduleNightGuide(nightGuide);
}

/** At trigger: schedule notification + create pending occurrence with grace deadline */
export async function triggerNightGuideOccurrence(nightGuide: NightGuide): Promise<void> {
  const scheduledDate = getIstDateString(new Date());
  const graceDeadlineAt = getGraceDeadlineMs(scheduledDate);
  await nightGuideOccurrenceRepository.createPendingOccurrence(
    nightGuide.id,
    scheduledDate,
    graceDeadlineAt
  );
}
```

### 5.2 Shared Scheduling Utilities

```typescript
// src/services/shared/schedulingUtils.ts
export function getNextTriggerTime(
  time: string,
  weekdays: number[],
  now: Date
): Date | null;

export function formatWeekdays(weekdays: number[]): string;
```

---

## 6. Components

### 6.1 Motivational Sentences Reader

```typescript
// src/components/motivationalSentences/MotivationalSentencesReader.tsx
interface MotivationalSentencesReaderProps {
  sentences: string[];
  onComplete: () => void;
  enableTextToSpeech: boolean;
}

// State:
// - currentSentenceIndex: number
// - completedSentences: Set<number>
// - isNextEnabled: boolean

// Flow:
// 1. Display sentence at currentSentenceIndex
// 2. User taps "Mark as Read"
// 3. Add to completedSentences, disable button
// 4. setTimeout(MOTIVATIONAL_SENTENCE_DELAY_MS) // 2500
// 5. Enable next sentence button
// 6. If all completed, call onComplete()
```

### 6.2 Reflection Input Component

```typescript
// src/components/reflection/ReflectionInput.tsx
interface ReflectionInputProps {
  question: string;
  onSubmit: (answer: string) => void;
  theme: ThemeTokens;
}
```

### 6.3 Task Checklist Component

```typescript
// src/components/taskChecklist/TaskChecklist.tsx
interface TaskChecklistProps {
  tasks: { id: string; text: string; completed: boolean }[];
  onToggle: (id: string) => void;
  onAdd?: (text: string) => void;
  onRemove?: (id: string) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  editable?: boolean;
  theme: ThemeTokens;
}
```

---

## 7. Screen Implementations

### 7.1 Night Guide List Screen

```typescript
// src/screens/nightGuide/NightGuideListScreen/
- List all night guides (time, label, weekdays, enabled)
- Pending occurrence cards (until grace deadline)
- Header: navigate to NightGuideHistory
- FAB: add guide; tap edit; swipe delete
- Enable toggle runs setNightGuideEnabled (weekday conflict)
```

### 7.2 Night Guide Form Screen

```typescript
// src/screens/nightGuide/NightGuideFormScreen.tsx
- Time picker
- Weekday selector
- Label input
- Sound selector
- Task checklist editor (optional)
- Save/Cancel
```

### 7.3 Night Guide Active Screen

```typescript
// src/screens/nightGuide/NightGuideActiveScreen.tsx
- Task checklist (if tasks configured)
- Night reflection
- Good Night message
```

### 7.4 Night Guide History Screen

```typescript
// src/screens/nightGuide/NightGuideHistoryScreen/
- Month grid (IST), prev/next month
- Colors: green / red / gray per product spec §2.9
- Tap day → sheet (%, reflection snippet, status)
- Week summary "X/7", month "X/30"
- Optional list mode grouped by date (like ReflectionsScreen)
```

---

## 8. Navigation Updates

### 8.1 Main Tabs

```typescript
// src/navigation/MainTabs.tsx
export type MainTabParamList = {
  Alarms: undefined;
  MyQuestions: undefined;
  NightGuide: undefined;
};
```

### 8.2 Root Stack

```typescript
// src/navigation/RootStack.tsx
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  AlarmForm: { alarmId?: string };
  AlarmRinging: { alarmId: string };
  Quote: { alarmId: string };
  Settings: undefined;
  Reflections: undefined;
  NightGuideForm: { nightGuideId?: string };
  NightGuideActive: { nightGuideId: string };
  NightGuideHistory: undefined;
};
```

---

## 9. Text-to-Speech Integration

```typescript
// Using expo-speech
import * as Speech from 'expo-speech';

export function speakSentence(sentence: string): void {
  Speech.speak(sentence, {
    language: 'en',
    pitch: 1.0,
    rate: 0.8,
  });
}

export function stopSpeaking(): void {
  Speech.stop();
}
```

---

## 10. App Integration

### 10.1 Notification handling (`App.tsx`)

Route by `data.type` — never treat `nightGuideId` as `alarmId`.

```typescript
function handleNotificationResponse(response: Notifications.NotificationResponse) {
  const data = response.notification.request.content.data;
  if (data?.type === "night_guide_trigger" && data.nightGuideId) {
    navigationRef.current?.navigate("NightGuideActive", {
      nightGuideId: data.nightGuideId as string,
    });
    return;
  }
  if (data?.alarmId) {
    handleAlarmTrigger(data.alarmId as string);
  }
}

// Cold start: getLastNotificationResponseAsync — same branching
```

Foreground received listener: night guide → create/update pending occurrence; alarm → existing handler.

### 10.2 Reconcile on launch

```typescript
// src/services/nightGuideScheduler.ts
export async function reconcileNightGuides(guides: NightGuide[]): Promise<void> {
  await setupNightGuideNotificationChannel();
  for (const guide of guides) {
    if (guide.enabled) await scheduleNightGuide(guide);
    else await cancelNightGuide(guide.id);
  }
  await nightGuideOccurrenceRepository.markMissedAfterGrace(Date.now());
}

// App.tsx — mirror reconcileAlarms:
useEffect(() => {
  if (isReady && nightGuides.length > 0) {
    reconcileNightGuides(nightGuides);
  }
}, [nightGuides, isReady]);
```

### 10.3 Alarm Ringing Screen — motivational sentences

```typescript
// Requires BOTH flags; only after reflection task submitted
if (
  currentTask.type === "reflection" &&
  reflectionAnswered &&
  settings.enableReflection &&
  settings.enableMotivationalSentences
) {
  return (
    <MotivationalSentencesReader
      sentences={getRandomMotivationalSentences()}
      onComplete={handleMotivationalSentencesComplete}
      enableTextToSpeech={settings.enableTextToSpeech}
    />
  );
}
```

### 10.4 IST helpers

```typescript
// src/utils/istDate.ts
export function getIstDateString(date: Date): string;
export function getGraceDeadlineMs(scheduledDateYmd: string): number; // 09:00 IST next day
export function isPastGrace(deadlineMs: number, now?: Date): boolean;
```

---

## 11. Migration Script

```typescript
// src/data/db/sqlite.ts
export async function migrateToV4(): Promise<void> {
  // Create night_guides table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS night_guides (
      id TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      weekdays TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      label TEXT,
      sound_type TEXT NOT NULL DEFAULT 'notification',
      sound_name TEXT NOT NULL,
      sound_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  // Create night_guide_tasks table
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS night_guide_tasks (
      id TEXT PRIMARY KEY,
      night_guide_id TEXT NOT NULL,
      text TEXT NOT NULL,
      order_num INTEGER NOT NULL,
      FOREIGN KEY (night_guide_id) REFERENCES night_guides(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS night_guide_occurrences (
      id TEXT PRIMARY KEY,
      night_guide_id TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      status TEXT NOT NULL,
      completion_percentage INTEGER NOT NULL DEFAULT 0,
      grace_deadline_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (night_guide_id) REFERENCES night_guides(id) ON DELETE CASCADE
    );
  `);

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS night_reflections (
      id TEXT PRIMARY KEY,
      night_guide_id TEXT NOT NULL,
      occurrence_id TEXT NOT NULL,
      question TEXT NOT NULL,
      response TEXT NOT NULL,
      completion_percentage INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (night_guide_id) REFERENCES night_guides(id) ON DELETE CASCADE,
      FOREIGN KEY (occurrence_id) REFERENCES night_guide_occurrences(id) ON DELETE CASCADE
    );
  `);

  // Add settings columns
  const settingsColumns = await database.getAllAsync<{ name: string }>(
    "PRAGMA table_info(settings)"
  );
  const columnNames = settingsColumns.map(c => c.name);

  if (!columnNames.includes("enable_motivational_sentences")) {
    await database.execAsync(`ALTER TABLE settings ADD COLUMN enable_motivational_sentences INTEGER DEFAULT 1`);
  }

  if (!columnNames.includes("enable_text_to_speech")) {
    await database.execAsync(`ALTER TABLE settings ADD COLUMN enable_text_to_speech INTEGER DEFAULT 0`);
  }
}
```

---

## 12. Package Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "expo-speech": "~12.0.0"
  }
}
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

- Repository functions (CRUD operations)
- Scheduling utilities (getNextTriggerTime)
- Random selection functions
- Completion percentage calculation
- IST grace deadline and `markMissedAfterGrace`
- `setNightGuideEnabled` weekday conflict
- One-time auto-disable after completion

### 13.2 Integration Tests

- Night guide scheduling and notification
- Navigation from notification to screen
- Database migrations
- Settings persistence

### 13.3 Manual Testing Checklist

See testing checklist in `docs/specs/09-version4.0.md`

---

## 14. Performance Considerations

- Lazy load motivational sentences (not all in memory)
- Cache night guide history data
- Optimize calendar view rendering
- Use efficient database queries for history stats

---

## 15. Error Handling

- Graceful fallback if text-to-speech fails
- Handle notification permission denial
- Database migration rollback on failure
- Network-independent (all local storage)
