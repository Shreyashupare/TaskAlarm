# Version 2.0 Spec - Extended Task Engine

## Overview

Extend the TaskAlarm task engine with:
1. **Reflection Task** - Open-ended questions with no right/wrong answer (always last task)
2. **Custom User Questions** - Users can create their own MCQ questions
3. **Four New Mini Tasks** - icon_match, position_tap, order_tap, count_objects
4. **Reflection History** - View past reflections in Settings

## Navigation Structure

- **2 Tabs**: Alarms | My Questions
- **Settings**: Accessible via top-right corner gear icon
- **Reflections**: New sub-tab inside Settings

---

## 1. Reflection Task Engine

### 1.1 Concept
A new task type `reflection` that asks users open-ended questions. Any non-empty text response is considered "correct" and allows proceeding.

### 1.2 Requirements

- Always appears as the **LAST task** in the sequence (not mixed with other tasks)
- Pre-defined rotating question list:
  - "What's your goal for today?"
  - "What do you want to achieve in life?"
  - "Are you on the right track?"
  - "What are you grateful for?"
  - "What's one thing you want to improve today?"
- Any non-empty text input is accepted as correct
- Text input should be multi-line text area
- Optional: Save reflection responses to local storage for user review

### 1.3 Technical Implementation

```typescript
// 1. Add to AlarmTaskType in src/constants/types/alarm.ts
type AlarmTaskType = 
  | "math" 
  | "color" 
  | "shape" 
  | "mixed" 
  | "icon_match" 
  | "position_tap" 
  | "order_tap" 
  | "count_objects" 
  | "reflection" 
  | "custom";

// 2. Add to Task type in src/stores/types.ts
export type Task = {
  id: string;
  type: 
    | "math" 
    | "color" 
    | "shape" 
    | "icon_match" 
    | "position_tap" 
    | "order_tap" 
    | "count_objects" 
    | "reflection" 
    | "custom";
  question: string;
  answer: string | number;
  options?: string[];
  visualData?: TaskVisualData[];
};

// 3. Create generateReflectionTask() in src/services/tasks/taskEngine.ts
function generateReflectionTask(index: number): Task {
  const questions = [
    "What's your goal for today?",
    "What do you want to achieve in life?",
    "Are you on the right track?",
    "What are you grateful for?",
    "What's one thing you want to improve today?",
  ];
  const question = questions[index % questions.length];
  
  return {
    id: `reflection_${index}_${Date.now()}`,
    type: "reflection",
    question,
    answer: "", // Any answer is valid
  };
}

// 4. Modify generateTasks() to add reflection as LAST task
export function generateTasks(
  count: number,
  taskTypes: AlarmTaskType[],
  includeReflection: boolean = false,
  includeCustomQuestions: boolean = false,
  customQuestions: CustomQuestion[] = []
): Task[] {
  const tasks: Task[] = [];
  let regularCount = count;
  
  // Reserve 1 slot for reflection if enabled
  if (includeReflection) {
    regularCount -= 1;
  }
  
  // Reserve up to 2 slots for custom questions if enabled and available
  let customCount = 0;
  if (includeCustomQuestions && customQuestions.length > 0) {
    customCount = Math.min(2, customQuestions.length);
    regularCount -= customCount;
  }
  
  // Generate regular tasks (math/color/shape/icon_match/position_tap/order_tap/count_objects)
  for (let i = 0; i < regularCount; i++) {
    tasks.push(safeGenerateTask(getRandomTaskType(taskTypes), i));
  }
  
  // Add custom questions (shuffled, max 2)
  if (customCount > 0) {
    const shuffled = [...customQuestions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < customCount; i++) {
      tasks.push(generateCustomQuestionTask(shuffled[i], i));
    }
  }
  
  // Add reflection as last task if enabled
  if (includeReflection) {
    tasks.push(generateReflectionTask(regularCount + customCount));
  }
  
  return tasks;
}

// 5. Update validateAnswer() in taskEngine.ts
export function validateAnswer(task: Task, answer: string | number): boolean {
  if (task.type === "reflection") {
    return typeof answer === "string" && answer.trim().length > 0;
  }
  return task.answer === answer;
}
```

### 1.4 UI Changes

In `src/screens/ringing/AlarmRingingScreen/AlarmRingingScreen.tsx`:

```typescript
// Add to renderTaskContent():
if (currentTask.type === "reflection") {
  return (
    <View style={styles.taskCard}>
      <Text style={styles.taskQuestion}>{currentTask.question}</Text>
      <TextInput
        style={styles.reflectionInput}
        value={userAnswer}
        onChangeText={setUserAnswer}
        placeholder="Type your thoughts..."
        placeholderTextColor="#666"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
        onPress={handleAnswerSubmit}
        disabled={!userAnswer.trim()}
      >
        <Text style={styles.submitText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 1.5 Settings Integration

Add to `src/constants/types/settings.ts`:

```typescript
type AppSettings = {
  // ... existing settings
  enableReflection: boolean; // default: true
  enableCustomQuestions: boolean; // default: true
};
```

**Global Task Type Settings (in Settings Screen):**
Multi-select checkboxes for regular task types:
- [x] math
- [x] color  
- [x] shape
- [ ] icon_match
- [ ] position_tap
- [ ] order_tap
- [ ] count_objects

Separate toggles:
- [x] Include Reflection (always appears last if enabled)
- [x] Include My Questions (if user has custom questions count > 0)

### 1.6 Reflection Storage

Create `reflections` table:

```sql
CREATE TABLE IF NOT EXISTS reflections (
  id TEXT PRIMARY KEY,
  alarm_id TEXT NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (alarm_id) REFERENCES alarms(id) ON DELETE CASCADE
);
```

### 1.7 Reflections Screen (Inside Settings)

New screen accessible from Settings: **"Your Reflection Journey"**

**UI:**
- List of past reflections (last 30 days)
- Each item: Date, Question preview (truncated), Response preview
- Tap to expand full reflection
- Group by week/month
- Empty state: "Start your morning reflections to see your journey here"

**Repository:**
```typescript
// src/data/repositories/reflectionRepository.ts
export async function saveReflection(alarmId: string, question: string, response: string): Promise<void>
export async function getRecentReflections(limit: number): Promise<Reflection[]>
export async function getReflectionsByDateRange(start: number, end: number): Promise<Reflection[]>
```

---

## 2. Four New Mini Task Types

### 2.1 icon_match
Find and tap matching icons from a grid.

**Generator:**
```typescript
function generateIconMatchTask(index: number): Task {
  const icons = [
    { name: "Coffee", symbol: "☕" },
    { name: "Phone", symbol: "📱" },
    { name: "Car", symbol: "🚗" },
    { name: "Book", symbol: "📚" },
    { name: "Star", symbol: "⭐" },
    { name: "Heart", symbol: "❤️" },
  ];
  
  const target = icons[Math.floor(Math.random() * icons.length)];
  const matches = Math.floor(Math.random() * 2) + 2; // 2-3 matches
  const distractors = 9 - matches;
  
  // Build grid: matches + distractors
  const gridItems = Array(matches).fill(target)
    .concat(Array(distractors).fill(null).map(() => 
      icons[Math.floor(Math.random() * icons.length)]
    ));
  
  // Shuffle
  const shuffled = gridItems.sort(() => Math.random() - 0.5);
  
  return {
    id: `icon_${index}_${Date.now()}`,
    type: "icon_match",
    question: `Find all ${target.name} icons`,
    answer: target.name,
    visualData: shuffled.map(item => ({ type: "icon", icon: item.symbol, name: item.name })),
  };
}
```

**UI:** 3x3 grid of icons. User taps to select, tap again to deselect. Submit when confident.

### 2.2 position_tap
Tap item at specific position.

**Generator:**
```typescript
function generatePositionTapTask(index: number): Task {
  const positions = ["top-left", "top-right", "bottom-left", "bottom-right", "center"];
  const colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF"];
  
  const targetPos = positions[Math.floor(Math.random() * positions.length)];
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  
  // Build 2x2 or 3x3 grid with target at position
  const is3x3 = Math.random() > 0.5;
  const gridSize = is3x3 ? 9 : 4;
  const targetIndex = is3x3 
    ? [0, 2, 4, 6, 8][Math.floor(Math.random() * 5)] // corners + center
    : [0, 1, 2, 3][Math.floor(Math.random() * 4)];
  
  const visualData = Array(gridSize).fill(null).map((_, i) => ({
    type: "position" as const,
    color: i === targetIndex ? targetColor : colors[Math.floor(Math.random() * colors.length)],
    isTarget: i === targetIndex,
  }));
  
  return {
    id: `position_${index}_${Date.now()}`,
    type: "position_tap",
    question: `Tap the ${targetColor === "#FF0000" ? "RED" : targetColor === "#00FF00" ? "GREEN" : targetColor === "#0000FF" ? "BLUE" : targetColor === "#FFFF00" ? "YELLOW" : "PURPLE"} box`,
    answer: targetIndex,
    visualData,
  };
}
```

**UI:** 2x2 or 3x3 colored boxes. User taps the box matching the color in question.

### 2.3 order_tap
Tap items in sequence (1-2-3).

**Generator:**
```typescript
function generateOrderTapTask(index: number): Task {
  const sequenceLength = Math.floor(Math.random() * 2) + 3; // 3-4 items
  const shapes = ["circle", "square", "triangle", "star"];
  
  // Generate numbered items
  const items = Array(sequenceLength).fill(null).map((_, i) => ({
    number: i + 1,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: ["#FF0000", "#00FF00", "#0000FF"][Math.floor(Math.random() * 3)],
  }));
  
  // Shuffle for display
  const displayItems = [...items].sort(() => Math.random() - 0.5);
  
  return {
    id: `order_${index}_${Date.now()}`,
    type: "order_tap",
    question: `Tap in order: 1, 2, 3${sequenceLength === 4 ? ", 4" : ""}`,
    answer: "completed", // Handled by tracking tap sequence
    visualData: displayItems.map(item => ({
      type: "ordered_item",
      number: item.number,
      shape: item.shape,
      color: item.color,
    })),
  };
}
```

**UI:** Scattered shapes with numbers. User taps 1 → 2 → 3 (in that order). Wrong order shows error.

### 2.4 count_objects
Count objects and enter number.

**Generator:**
```typescript
function generateCountObjectsTask(index: number): Task {
  const shapes = ["circle", "square", "triangle"];
  const colors = ["red", "blue", "green", "yellow"];
  
  const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
  const targetColor = colors[Math.floor(Math.random() * colors.length)];
  
  const targetCount = Math.floor(Math.random() * 5) + 3; // 3-7
  const distractorCount = Math.floor(Math.random() * 5) + 2; // 2-6
  
  // Generate visual data
  const targets = Array(targetCount).fill(null).map(() => ({
    type: "count_item" as const,
    shape: targetShape,
    color: targetColor,
    isTarget: true,
  }));
  
  const distractors = Array(distractorCount).fill(null).map(() => ({
    type: "count_item" as const,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    isTarget: false,
  }));
  
  const allItems = [...targets, ...distractors].sort(() => Math.random() - 0.5);
  
  return {
    id: `count_${index}_${Date.now()}`,
    type: "count_objects",
    question: `How many ${targetColor} ${targetShape}s?`,
    answer: targetCount,
    visualData: allItems,
  };
}
```

**UI:** Scattered colored shapes. Text input for number entry. Submit button.

---

## 3. Custom User Questions (My Questions)

### 3.1 Concept
Allow users to create their own multiple-choice questions with custom options and correct answers.

### 3.2 Requirements

- UI: New "My Questions" screen accessible from bottom navigation
- Each question has:
  - Question text (max 120 chars)
  - 2-4 options (max 30 chars each)
  - Correct answer selection
- Storage: JSON array in settings table
- Task generation: Include custom questions in pool when enabled
- CRUD: Create, Read, Update, Delete operations
- Limits: Max 10 custom questions, max 4 options per question
- Validation: All fields required, distinct option values

### 3.3 Data Model

```typescript
// src/constants/types/settings.ts
type CustomQuestion = {
  id: string;
  question: string;        // max 80 chars (display-friendly)
  options: string[];       // 2-4 items, max 20 chars each
  correctAnswer: string;  // must be one of options
};

// Update AppSettings
type AppSettings = {
  // ... existing settings
  customQuestions: CustomQuestion[]; // max 10 items
  enableCustomQuestions: boolean;      // default: true
};
```

### 3.4 Database Schema

Add to settings table:

```sql
-- In src/data/db/sqlite.ts migration
ALTER TABLE settings ADD COLUMN custom_questions TEXT DEFAULT '[]';
ALTER TABLE settings ADD COLUMN enable_custom_questions INTEGER DEFAULT 1;
```

### 3.5 Navigation Changes

Update `src/navigation/MainTabs.tsx`:

```typescript
export type MainTabParamList = {
  Alarms: undefined;
  MyQuestions: undefined;  // Replace Settings
};

// In Tab.Navigator:
<Tab.Screen 
  name="MyQuestions" 
  component={MyQuestionsScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="help-circle" size={size} color={color} />
    ),
    title: "My Questions",
  }}
/>
```

### 3.6 MyQuestionsScreen UI

**List View:**
- Header with title "My Questions"
- List of existing questions with preview
- Each item shows: question text (truncated), option count
- Swipe to delete or edit button
- "Add Question" FAB (disabled when 10 questions reached)

**Add/Edit Modal:**
- Question input (multi-line, char counter 0/80)
- Dynamic options list (2-4 items)
  - Each option: text input + remove button (if > 2 options)
  - "Add Option" button (if < 4 options)
- Correct answer selector (dropdown/chips from valid options)
- Save button (disabled until all valid)

### 3.7 Task Generation Integration

Update `generateTasks()` in `src/services/tasks/taskEngine.ts`:

```typescript
export function generateTasks(
  count: number,
  taskTypes: AlarmTaskType[],
  includeReflection: boolean = false,
  customQuestions: CustomQuestion[] = []
): Task[] {
  const tasks: Task[] = [];
  // ... existing logic
  
  // Include custom questions if enabled and available
  if (customQuestions.length > 0) {
    const shuffledCustom = [...customQuestions].sort(() => Math.random() - 0.5);
    const customToUse = shuffledCustom.slice(0, Math.min(2, customQuestions.length));
    
    for (const cq of customToUse) {
      tasks.push({
        id: `custom_${cq.id}_${Date.now()}`,
        type: "math", // Use math type for custom questions
        question: cq.question,
        answer: cq.correctAnswer,
        options: [...cq.options].sort(() => Math.random() - 0.5),
      });
    }
  }
  
  return tasks;
}
```

### 3.8 Validation Rules

- Question: Required, max 80 chars
- Options: Min 2, max 4, each required, max 20 chars
- Options must be unique (no duplicates)
- Correct answer: Must be one of the provided options
- Max questions: 10 (enforced in UI)

---

## 4. Integration with Existing Flow

### 4.1 Alarm Ringing Flow

1. User dismisses notification → `AlarmRingingScreen`
2. `useEffect` generates tasks:
   - Load settings (task types, reflection enabled, custom questions)
   - Generate task list with:
     - Regular tasks (math/color/shape based on settings)
     - Custom questions (if enabled)
     - Reflection task (if enabled, always last)
3. User completes tasks sequentially
4. After all tasks → navigate to QuoteScreen

### 4.2 Task Count Consideration

If task count is set to 4 and reflection is enabled:
- 3 regular tasks + 1 reflection task = 4 total
- OR 2 regular + 1 custom + 1 reflection

---

## 5. Testing Checklist

### Reflection Task
- [ ] Reflection appears as last task when enabled
- [ ] Empty text is rejected, any non-empty text is accepted
- [ ] Multiple reflection questions rotate correctly
- [ ] Setting toggle disables/enables reflection
- [ ] Responses saved to database
- [ ] Reflections screen shows past reflections

### Four New Mini Tasks
- [ ] icon_match: Grid displays, user selects matching icons
- [ ] position_tap: Colored grid, user taps correct position
- [ ] order_tap: Numbered shapes, user taps in sequence
- [ ] count_objects: Scattered shapes, user enters correct count

### Custom Questions
- [ ] Can add question with 2-4 options
- [ ] Validation prevents duplicate options
- [ ] Max 10 questions enforced
- [ ] Questions appear in task rotation
- [ ] Edit/Delete works correctly
- [ ] Correct answer validation works

---

## 6. Migration Notes

### Settings Database Migration

Add to `src/data/db/sqlite.ts`:

```typescript
// Check and add new columns
const settingsColumns = await database.getAllAsync<{ name: string }>(
  "PRAGMA table_info(settings)"
);
const columnNames = settingsColumns.map(c => c.name);

if (!columnNames.includes("enable_reflection")) {
  await database.execAsync(`ALTER TABLE settings ADD COLUMN enable_reflection INTEGER DEFAULT 1`);
}

if (!columnNames.includes("custom_questions")) {
  await database.execAsync(`ALTER TABLE settings ADD COLUMN custom_questions TEXT DEFAULT '[]'`);
}

if (!columnNames.includes("enable_custom_questions")) {
  await database.execAsync(`ALTER TABLE settings ADD COLUMN enable_custom_questions INTEGER DEFAULT 1`);
}

// Create reflections table for V2.0
await database.execAsync(`
  CREATE TABLE IF NOT EXISTS reflections (
    id TEXT PRIMARY KEY,
    alarm_id TEXT NOT NULL,
    question TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (alarm_id) REFERENCES alarms(id) ON DELETE CASCADE
  );
`);
```

---

## 7. UI/UX Guidelines

### Reflection Input
- Large multi-line text area
- Minimum 3 lines visible
- Soft keyboard: default with return key for new lines
- Submit button disabled when empty

### Question Form
- Character counters visible for all inputs
- Options animate when added/removed
- Correct answer selector updates dynamically as options change
- Visual feedback for validation errors

---

## Appendix: Implementation Order

### Phase 1: Core Types & Storage
1. Update types (AlarmTaskType, Task, AppSettings, CustomQuestion)
2. Database migrations (new columns + reflections table)
3. Update settings repository to handle new fields

### Phase 2: Task Engine
1. Add 4 new task generators (icon_match, position_tap, order_tap, count_objects)
2. Add generateReflectionTask()
3. Update generateTasks() with reflection & custom questions logic
4. Update validateAnswer() for reflection type

### Phase 3: My Questions Screen
1. Create MyQuestionsScreen folder structure (screen, styles, helpers)
2. Build list view with CRUD operations
3. Update MainTabs navigation (2 tabs: Alarms | My Questions)

### Phase 4: Reflection Features
1. Add reflection UI to AlarmRingingScreen
2. Create ReflectionsScreen inside Settings
3. Create reflectionRepository

### Phase 5: Integration & Testing
1. Update AlarmRingingScreen to load settings and generate tasks
2. Update alarm form task type selector (multi-select checkboxes)
3. Full flow testing

---

## 8. Future Enhancements (Post-V2)

- AI-generated reflection questions based on time/day
- Reflection response analytics (word cloud, trends)
- Share reflection responses
- Import/export custom questions (JSON/CSV)
- Question categories/tags
- Difficulty levels for custom questions

---

## Related Documents

- `docs/product/features.md` - Original V2.0 ideas
- `docs/specs/04-functional-specs.md` - Task engine architecture
- `docs/specs/03-screen-specs.md` - Screen patterns
- `logs/decisionLogs.md` - Decision records for V2.0 features
