# Version 2.0 Spec - Reflection Task & Custom Questions

## Overview

Extend the TaskAlarm task engine with two new features:
1. **Reflection Task** - Open-ended questions with no right/wrong answer
2. **Custom User Questions** - Users can create their own MCQ questions

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
type AlarmTaskType = "math" | "color" | "shape" | "mixed" | "reflection";

// 2. Add to Task type in src/stores/types.ts
export type Task = {
  id: string;
  type: "math" | "color" | "shape" | "reflection";
  question: string;
  answer: string | number;
  options?: string[];
  visualData?: TaskVisualData[];
  // For reflection: no answer validation needed
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
  includeReflection: boolean = false
): Task[] {
  const tasks: Task[] = [];
  const regularCount = includeReflection ? count - 1 : count;
  
  // Generate regular tasks (math/color/shape/mixed)
  for (let i = 0; i < regularCount; i++) {
    tasks.push(safeGenerateTask(getRandomTaskType(taskTypes), i));
  }
  
  // Add reflection as last task if enabled
  if (includeReflection) {
    tasks.push(generateReflectionTask(regularCount));
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
  enableReflectionTask: boolean; // default: true
};
```

Add toggle in Settings screen to enable/disable reflection tasks.

### 1.6 Storage (Optional Enhancement)

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

---

## 2. Custom User Questions

### 2.1 Concept
Allow users to create their own multiple-choice questions with custom options and correct answers.

### 2.2 Requirements

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

### 2.3 Data Model

```typescript
// src/constants/types/settings.ts
type CustomQuestion = {
  id: string;
  question: string;        // max 120 chars
  options: string[];     // 2-4 items, max 30 chars each
  correctAnswer: string; // must be one of options
};

// Update AppSettings
type AppSettings = {
  // ... existing settings
  customQuestions: CustomQuestion[]; // max 10 items
  enableCustomQuestions: boolean;      // default: true
};
```

### 2.4 Database Schema

Add to settings table:

```sql
-- In src/data/db/sqlite.ts migration
ALTER TABLE settings ADD COLUMN custom_questions TEXT DEFAULT '[]';
ALTER TABLE settings ADD COLUMN enable_custom_questions INTEGER DEFAULT 1;
```

### 2.5 Navigation Changes

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

### 2.6 MyQuestionsScreen UI

**List View:**
- Header with title "My Questions"
- List of existing questions with preview
- Each item shows: question text (truncated), option count
- Swipe to delete or edit button
- "Add Question" FAB (disabled when 10 questions reached)

**Add/Edit Modal:**
- Question input (multi-line, char counter 0/120)
- Dynamic options list (2-4 items)
  - Each option: text input + remove button (if > 2 options)
  - "Add Option" button (if < 4 options)
- Correct answer selector (dropdown/chips from valid options)
- Save button (disabled until all valid)

### 2.7 Task Generation Integration

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

### 2.8 Validation Rules

- Question: Required, max 120 chars
- Options: Min 2, max 4, each required, max 30 chars
- Options must be unique (no duplicates)
- Correct answer: Must be one of the provided options
- Max questions: 10 (enforced in UI)

---

## 3. Integration with Existing Flow

### 3.1 Alarm Ringing Flow

1. User dismisses notification → `AlarmRingingScreen`
2. `useEffect` generates tasks:
   - Load settings (task types, reflection enabled, custom questions)
   - Generate task list with:
     - Regular tasks (math/color/shape based on settings)
     - Custom questions (if enabled)
     - Reflection task (if enabled, always last)
3. User completes tasks sequentially
4. After all tasks → navigate to QuoteScreen

### 3.2 Task Count Consideration

If task count is set to 4 and reflection is enabled:
- 3 regular tasks + 1 reflection task = 4 total
- OR 2 regular + 1 custom + 1 reflection

---

## 4. Testing Checklist

### Reflection Task
- [ ] Reflection appears as last task when enabled
- [ ] Empty text is rejected, any non-empty text is accepted
- [ ] Multiple reflection questions rotate correctly
- [ ] Setting toggle disables/enables reflection
- [ ] Responses saved to database (if implemented)

### Custom Questions
- [ ] Can add question with 2-4 options
- [ ] Validation prevents duplicate options
- [ ] Max 10 questions enforced
- [ ] Questions appear in task rotation
- [ ] Edit/Delete works correctly
- [ ] Correct answer validation works

---

## 5. Migration Notes

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
```

---

## 6. UI/UX Guidelines

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

## 7. Future Enhancements (Post-V2)

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
