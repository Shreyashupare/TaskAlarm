# Version 4.0 Spec - Night Guide & Reflection Extension

## Overview

Extend TaskAlarm with:
1. **Reflection extension (ship first)** — motivational sentences after the morning reflection task
2. **Night Guide (ship second)** — bottom-tab bedtime routine with optional tasks, night reflection, and history

**Technical implementation:** `docs/specs/10-version4.0-technical.md`

**Implementation order (mandatory):**
1. Motivational sentences (Phases 1–2 in §8)
2. Night Guide (Phases 3–7)

Do not start Night Guide UI/scheduling until motivational sentences are integrated and tested in the alarm flow.

## Product naming (Night Guide)

Working name in specs/code: **Night Guide** (`NightGuide`). Pick a user-facing tab label before release:

| Option | Tab label | Notes |
|--------|-----------|--------|
| **Wind Down** | Wind Down | **Recommended** — clear bedtime intent, friendly tone |
| Bedtime | Bedtime | Short, literal |
| Night Routine | Night Routine | Descriptive; longer label |
| Night Guide | Night Guide | Current placeholder |

Internal types, routes, and DB names stay `NightGuide*`. User-visible label: `NIGHT_GUIDE_TITLE` in `src/constants/nightGuideConstants.ts` only.

## Navigation Structure

- **3 tabs**: Alarms | My Questions | Night Guide (or chosen label from table above)
- **Settings** (gear, any tab): app preferences only — theme, morning reflection toggle, motivational sentences, TTS. **No global “enable Night Guide” switch.**
- **Reflections** (Settings): morning reflection history only — **no** motivational-sentence history (not required for v4.0)
- **Night Guide tab**: list/create/edit guides (time, repeat, sound, optional tasks). History/calendar accessed from this tab (see §2.13)

---

## 1. Reflection Extension with Motivational Sentences

### 1.1 Concept

Extend the existing reflection task to include Part 2: 3-5 motivational sentences that users must read sequentially with a delay between each.

### 1.2 Requirements

- **Gating:** Part 2 runs only when **both** `enableReflection` and `enableMotivationalSentences` are on. If reflection is off, motivational sentences do not appear.
- **Part 1:** Existing reflection question (no right/wrong answer, any text accepted)
- **Part 2:** **3–5** motivational sentences (random count in that range), one at a time
- Sentences randomly selected from pool (start with ~20; expand toward 100–200 over time)
- Each sentence must be marked as "read" by tapping
- After marking one as read, **2.5 s** delay (`MOTIVATIONAL_SENTENCE_DELAY_MS = 2500`) before the next sentence is enabled
- No skip — all sentences required to proceed
- Title: "Read Out Loud"
- Optional text-to-speech via Settings (`enableTextToSpeech`, default off)
- No progress indicator required
- Always after reflection in `AlarmRingingScreen`, before quote screen
- **No** storage/history of which sentences were read (morning Reflections screen unchanged)

### 1.3 Content

**Motivational Sentences Pool** (initial set, expandable):
- I'm the best.
- I can do it alone.
- God is always with me.
- I am a winner.
- Today is my day.
- I believe in myself.
- Every challenge makes me stronger.
- I am capable of achieving anything.
- My potential is limitless.
- I choose happiness and success.
- I am in control of my destiny.
- Today I will shine.
- I am grateful for this moment.
- I embrace new opportunities.
- I am worthy of love and respect.
- I trust my instincts.
- I am creating my future.
- I am focused and determined.
- I radiate positivity.
- I am unstoppable.

*Note: This is an initial set of 20 sentences. The pool should be expanded to 100-200 sentences over time.*

### 1.4 User Interface

**Motivational Sentences Reader Screen:**
- Title: "Read Out Loud" (centered, prominent)
- Current sentence displayed in large, readable text
- "Mark as Read" button below each sentence
- Button disabled when not the current sentence's turn
- Visual feedback when sentence is marked as read (checkmark, color change)
- Optional: Text-to-speech icon button to read sentence aloud
- Smooth transitions between sentences

**Flow:**
1. Display first sentence with "Mark as Read" button enabled
2. User taps "Mark as Read"
3. Sentence marked as complete, button disabled
4. After 2.5 second delay, next sentence's button becomes enabled
5. Repeat until all sentences completed
6. Proceed to next screen/step

### 1.5 Text-to-Speech

- Use platform's built-in text-to-speech capability (expo-speech for Expo)
- Default: disabled
- User can enable via Settings toggle: "Enable text-to-speech for motivational sentences"
- When enabled, each sentence is read aloud when displayed

---

## 2. Night Guide Feature

### 2.1 Concept

A new bedtime routine feature that triggers notifications (not alarms) at scheduled times, guiding users through a checklist and night reflection before sleep.

### 2.2 Requirements

- **Bottom nav tab** (3rd tab): same pattern as Alarms and My Questions — always available, no feature flag
- Configure **per guide** in the tab: time, weekday repeat (same model as alarms), label, gentle notification sound, optional task checklist (0–10)
- **No** global Settings toggle to enable/disable Night Guide
- Triggers a **notification** (not alarm) at scheduled time; gentle sound, separate channel
- On tap (or via pending slot in app — §2.12): Night Guide active flow
- **One enabled guide per weekday:** user may create many guides (e.g. three for Monday with different tasks), but **only one** may be `enabled` for any given weekday. Enabling a guide auto-disables other guides that share any of its repeat days.
- **One-time guides:** `weekdays` empty = one-time; after that occurrence fires, guide **auto-disables** (no reschedule)
- **Repeating guides:** reschedule after completion using shared scheduling logic
- Active flow sections:
  1. **Task checklist** (only if tasks configured for that guide)
  2. **Night reflection** (after checklist — user may continue with tasks complete or incomplete)
  3. **Good Night** screen → dismiss to home; persist completion
- History/calendar similar in spirit to morning **Reflections** in Settings, but scoped to Night Guide tab (§2.13)

### 2.3 Data Structure

**Night Guide:**
- Unique identifier
- Scheduled time (HH:MM format)
- Repeat days (weekdays, or one-time)
- Enabled/disabled status
- Label/name
- Notification sound settings
- Optional task checklist (0-10 tasks)
- Creation and update timestamps

**Night Guide Task:**
- Unique identifier
- Task text (e.g., "Brush teeth")
- Display order
- Associated night guide

**Night Reflection:**
- Unique identifier
- Associated night guide
- Question asked
- User's response
- Task completion percentage (0-100%)
- Timestamp

### 2.4 Storage

Three new data entities:
1. Night guides (scheduled bedtime routines)
2. Night guide tasks (optional checklist items)
3. Night reflections (user responses and completion data)

All data stored locally with appropriate relationships and cascade deletion.

### 2.5 Night Reflection Questions

**Night-specific reflection questions** (initial set):
- What did you accomplish today?
- What are you grateful for today?
- What did you learn today?
- How did you make someone's day better?
- What's one thing you want to improve tomorrow?
- I did great today.
- I'm proud of myself.
- I'm ready for tomorrow.
- Today was a good day.
- I forgive myself for any mistakes.
- I release today's worries.
- I am at peace.
- I deserve a good rest.
- Tomorrow is a fresh start.

*Note: Separate from morning reflection questions, focused on closure and positivity.*

### 2.6 Scheduling

**Notification System:**
- Separate notification channel for night guides
- Lower importance than alarms (won't wake user from deep sleep)
- Gentle sound and vibration pattern
- Does not bypass Do Not Disturb mode
- Same scheduling logic as alarms (time, weekdays, repeat)
- On notification tap: navigate to Night Guide active screen

### 2.7 Navigation

**Bottom Navigation:**
- 3 tabs: Alarms | My Questions | Night Guide
- Night Guide icon: moon/moon-outline
- Night Guide tab leads to list of configured night guides

**Screen Flow:**
1. Night Guide List → Create/Edit Night Guide
2. Notification tap → Night Guide Active Screen
3. Night Guide Active → Good Night Screen
4. Good Night → Home

### 2.8 Screens

**Night Guide List Screen:**
- List of configured night guides
- Each item shows: time, label, repeat days, enabled status
- "Add Night Guide" button
- Tap to edit, swipe to delete
- Completion history summary (e.g., "5/7 nights completed this week")

**Night Guide Form Screen:**
- Time picker
- Weekday selector (same as alarm form)
- Label input
- Sound selector (gentle notification sounds)
- Task checklist editor (optional):
  - Add task input
  - List of tasks with reorder/delete
  - Maximum 10 tasks
  - Can leave empty (no tasks)
- Save/Cancel buttons

**Night Guide Active Screen** (triggered by notification):
- Header: Night guide label or "Night Guide"
- Section 1: Task Checklist (only if tasks configured)
  - List of tasks with checkboxes
  - Mark as complete/incomplete
  - "Continue" button (can proceed even if tasks incomplete)
- Section 2: Night Reflection
  - Night-specific question
  - Text input for response
  - "Continue" button
- Section 3: Good Night Screen
  - Display motivational night message
  - "Sleep Well" button to dismiss

**Night Guide History Screen** (see §2.13):
- Month calendar + week/month summaries
- Entry: header control on Night Guide list (e.g. "History")

### 2.9 Completion History

**Per occurrence** (when user finishes Good Night or saves session):
- Calendar date (**IST**, `Asia/Kolkata`)
- `nightGuideId`
- Task completion % (0–100) if checklist exists; reflection response
- Status: `completed` | `pending` | `missed`

**Calendar cell colors** (for days with a **scheduled** enabled guide that has **≥1 task**):
| Color | Meaning |
|-------|---------|
| **Green** | Session completed (reached Good Night); show task % on tap |
| **Red** | Scheduled, grace window ended (§2.12), not completed |
| **Gray** | No guide scheduled that day **or** scheduled guide has **zero tasks** (reflection-only; no task % on calendar) |

Reflection-only guides still run and save to history list/detail; calendar cells stay **gray** for those days.

**Summaries:** weekly "X/7", monthly "X/30" (count green days with tasks only).

**No nag notifications** for missed nights — red state and in-app pending slot only.

### 2.10 Settings (global)

**Morning / alarm (unchanged location):**
- `enableReflection` (existing)
- `enableMotivationalSentences` (new; only applies when reflection is on)
- `enableTextToSpeech` for motivational sentences (new)

**Not in Settings:** Night Guide on/off, night guide time, or task lists — those live in the **Night Guide tab** (form screen).

### 2.11 One enabled guide per weekday

- User can create multiple guides for the same weekday (different tasks/times).
- Turning **on** guide A for Monday disables any other **enabled** guide that includes Monday in `weekdays`.
- UI: enabling a conflicting guide shows which others were disabled (toast or inline message).
- List screen shows `enabled` per guide; at most one enabled per weekday in the union of schedules.

### 2.12 Grace period & pending slots (IST)

**Timezone:** All “calendar day” and grace deadlines use **IST** (`Asia/Kolkata`).

**Grace deadline:** **09:00 IST** on the **calendar day after** the scheduled occurrence.

**Behavior:**
- At scheduled time, create a **pending** occurrence (even if notification is dismissed/swiped).
- Until **09:00 IST next calendar day**, user can complete the routine from the **Night Guide tab** (prominent pending card: label, time, “Continue routine”).
- After 09:00 IST next day, if still not completed and the guide had **tasks** → calendar **red**; occurrence → `missed`.
- No extra notification after the initial gentle reminder.

### 2.13 Night Guide history UX (calendar)

Mirror the clarity of **Reflections** (grouped list) but optimized for completion tracking:

**Month view (default):**
- Grid for current month (swipe prev/next month)
- Cell colors per §2.9; tap cell → bottom sheet: date, guide label, task %, reflection snippet, status

**Week strip / summary:**
- Above calendar: "This week: X/7" for task-tracked completions

**Month summary:**
- Below calendar or header: "This month: X/30"

**List fallback (optional tab or toggle):**
- Chronological sessions (like Reflections), grouped by date

**Scope:** Last 30 days default for stats; calendar can navigate further if data exists

---

## 3. Shared Components

### 3.1 Scheduling Logic

Extract common scheduling logic to be shared between alarms and night guides:
- Calculate next trigger time based on current time and repeat schedule
- Format weekday display
- Handle one-time vs recurring schedules

### 3.2 Reflection Component

Reusable reflection input component:
- Question display
- Multi-line text input
- Submit button
- Used in both morning alarm flow and night guide flow

### 3.3 Task Checklist Component

Reusable task checklist component:
- Display tasks with checkboxes
- Toggle completion status
- Add/remove/reorder tasks (editor mode)
- Used in night guide form and active screens

---

## 4. User Flows

### 4.1 Morning Alarm Flow (Updated)

1. Alarm triggers → User dismisses notification
2. User completes regular tasks (math, color, shape, etc.)
3. Reflection question appears if `enableReflection`
4. User answers reflection question
5. **NEW:** Motivational sentences if `enableReflection` **and** `enableMotivationalSentences`
6. User reads 3–5 sentences sequentially (2.5 s between each)
7. Quote screen → dismiss alarm

### 4.2 Night Guide Flow

1. Scheduled time → gentle notification + **pending** occurrence (IST date)
2. User opens via notification **or** Night Guide tab pending card (until 09:00 IST next day)
3. Task checklist if tasks configured (may continue incomplete)
4. Night reflection question
5. Good Night screen → home
6. Occurrence → `completed`; save task % + reflection
7. If repeating → reschedule; if one-time → **auto-disable** guide
8. After grace deadline without completion (guide had tasks) → `missed`, calendar **red**

---

## 5. Testing Checklist

### Reflection Extension
- [ ] Motivational sentences appear after reflection question
- [ ] Sentences displayed one at a time
- [ ] "Mark as Read" button works correctly
- [ ] 2.5 second delay between sentences
- [ ] Motivational sentences only when enableReflection and enableMotivationalSentences
- [ ] Random count 3–5 sentences
- [ ] No skip option enforced
- [ ] All sentences must be completed to proceed
- [ ] Random sentence selection works
- [ ] Text-to-speech works (if implemented)
- [ ] Settings toggle enables/disables feature

### Night Guide
- [ ] Night Guide tab appears in bottom nav
- [ ] NightGuideListScreen displays configured guides
- [ ] NightGuideFormScreen creates/edit guides correctly
- [ ] Task checklist editor works (add/reorder/delete)
- [ ] Notification triggers at scheduled time
- [ ] Notification sound is gentle (not alarm sound)
- [ ] Tapping notification navigates to NightGuideActiveScreen
- [ ] Task checklist works in active screen
- [ ] Night reflection question appears
- [ ] Night reflection response saved
- [ ] "Good Night" message displays
- [ ] Task completion history tracked
- [ ] Repeating night guides reschedule correctly
- [ ] One-time guide auto-disables after fire
- [ ] Only one guide enabled per weekday (conflict disables others)
- [ ] Pending slot in tab until 09:00 IST next day
- [ ] Red after grace; gray when no tasks on guide
- [ ] History calendar month/week summaries

### Shared Components
- [ ] ReflectionInput component works in both contexts
- [ ] TaskChecklist component works in both contexts
- [ ] Scheduling logic works for both alarms and night guides

---

## 6. Migration

**Data Migration:**
- Create three new tables for night guides, tasks, and reflections
- Add two new settings columns for motivational sentences and text-to-speech
- Existing data remains unchanged

**Technical details:** See `docs/specs/10-version4.0-technical.md`

---

## 7. UI/UX Guidelines

### Motivational Sentences Reader
- Large, readable text for sentences
- Clear "Mark as Read" button
- Disabled state visually obvious (grayed out)
- Smooth transitions between sentences
- Optional: Play icon for text-to-speech

### Night Guide Screens
- Calming color scheme (darker tones for night)
- Gentle animations
- Clear progress indication (optional)
- Task checklist with clear checkboxes
- Night reflection input similar to morning reflection
- "Good Night" screen with soothing message

### Notification
- Different sound from alarm (gentle, not jarring)
- Clear title: "Night Guide"
- Body: "Time for your bedtime routine"
- No ongoing notification (user can dismiss)

---

## 8. Implementation Phases

**Order:** Complete Phase 2 before Phase 3+. Phase 1 migrations may land early, but Night Guide features must not ship before motivational sentences.

### Phase 1: Data Structure & Storage
- Models: night guides, tasks, reflections, **occurrences** (pending/completed/missed)
- Content pools (motivational sentences, night reflection questions)
- Migrations + repositories + IST date helpers
- `reconcileNightGuides()` on app launch (see technical spec)

### Phase 2: Motivational Sentences (ship first)
- Create motivational sentences reader component
- Implement sequential display with delay
- Integrate text-to-speech (using expo-speech)
- Add to morning alarm flow
- Add settings toggles

### Phase 3: Night Guide Scheduling
- Extract shared scheduling logic
- Implement night guide notification system
- Set up separate notification channel
- Handle notification tap navigation

### Phase 4: Night Guide Screens
- Create night guide list screen
- Create night guide form screen
- Create night guide active screen
- Create good night screen
- Create history screen with calendar view

### Phase 5: Navigation
- Add Night Guide tab to bottom navigation
- Add new screens to navigation stack
- Test all navigation flows

### Phase 6: Shared Components
- Extract reusable reflection component
- Extract reusable task checklist component
- Extract scheduling utilities
- Weekday enable conflict helper (`setNightGuideEnabled`)

### Phase 7: Testing & Polish
- Test all user flows
- Fix bugs
- Verify completion history tracking
- Update documentation
- Version bump to 4.0.0

**Technical implementation details:** See `docs/specs/10-version4.0-technical.md`

---

## 9. Future Enhancements (Post-V4)

- AI-generated motivational sentences based on user mood
- Night guide analytics (sleep patterns, task completion trends)
- Integration with sleep tracking apps
- Morning-night reflection comparison
- Custom motivational sentences (user-created)
- Night guide themes (calming, energizing, etc.)
- Wake-up time suggestion based on night guide completion
- Streak tracking and gamification

---

## Related Documents

- `docs/specs/10-version4.0-technical.md` - Technical implementation details
- `docs/specs/08-version2.0.md` - V2.0 Extended Task Engine
- `docs/specs/04-functional-specs.md` - Task engine architecture
- `docs/specs/03-screen-specs.md` - Screen patterns
- `logs/decisionLogs.md` - Decision records for V4.0 features
