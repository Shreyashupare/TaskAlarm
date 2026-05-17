
### 2026-05-17 - Repeating alarms not rescheduling after completion (TSKALRM-004)

- Decision: Call `rescheduleAlarm()` in `handleStop` when a repeating alarm completes.
- Why: `handleStop` in `AlarmRingingScreen` never rescheduled the next occurrence for repeating alarms (those with `weekdays` configured). The Night Guide equivalent (`rescheduleNightGuide`) was correctly called in `NightGuideActiveScreen`. This was a missing call, not a deeper logic issue.
- Alternatives: Reschedule inside `stopRinging()` in the store (less direct, mixes concerns).

### 2026-05-17 - Night Guide partial completion & history checklist mismatch (TSKALRM-006)

- Decision: Implement per-task tracking for Night Guide occurrences + before-time partial completion.
- Why: Two bugs: (A) Tasks partially completed before scheduled time couldn't be revisited because handleTasksDone immediately set status to "completed". (B) History read-only view showed all tasks strikethrough because TaskChecklist used `completedCount` (integer) instead of actual completed task IDs.
- Changes:
  - Added `completedTaskIds: string[]` to `NightGuideOccurrence` type + DB migration
  - Updated `TaskChecklist` to accept `completedTaskIds` prop and pass IDs back via `onComplete`
  - Updated `NightGuideActiveScreen` to save occurrence as `pending` (not `completed`) when before scheduled time, restoring task IDs on re-entry
  - Updated `updateOccurrenceStatus` to persist completedTaskIds
  - Updated list screen to show task count badge for partial completions
- Alternatives: Storing only percentage (loses per-task identity); computed task field in DB (over-engineered for MVP).
- Follow-up: After this fix, `graceDeadlineAt` should be used to auto-transition pending → missed at 09:00 IST next day.

- Follow-up: Push branch, create draft PR once network available.
# Decision Logs

Track important decisions in lightweight format.

## Entry template

### YYYY-MM-DD - Decision title

- Decision:
- Why:
- Alternatives:
- Follow-up:

---

### 2026-05-16 - V4.0 spec clarifications (pre-implementation)

- Decision: Lock v4.0 behavior before coding — motivational sentences first, then Night Guide; no global Night Guide toggle; IST grace window; one guide enabled per weekday.
- Why: Resolves review ambiguities and matches product intent.
- Key rules:
  - **Order:** Motivational sentences → Night Guide (update 2026-05-14 follow-ups below).
  - **Motivational:** Requires `enableReflection` + `enableMotivationalSentences`; 3–5 sentences; 2.5 s delay; no sentence history.
  - **Night Guide tab:** Always in bottom nav (like Alarms / My Questions); config in tab, not Settings feature flag.
  - **One enabled per weekday:** Enabling a guide disables others sharing any repeat day.
  - **One-time:** Auto-disable after occurrence; no reschedule.
  - **Grace:** Pending until **09:00 IST** next calendar day; in-app pending card; then red if tasks configured and incomplete.
  - **Calendar:** Green = completed (with tasks); Red = missed after grace; Gray = unscheduled or guide has **no tasks**.
  - **Naming:** Recommend **Wind Down** for UI; code stays `NightGuide` until renamed.
  - **History:** Night Guide history screen (calendar + summaries), separate from morning Reflections.
- Alternatives: Global enableNightGuide toggle (rejected); motivational history in Reflections (rejected).
- Follow-up: Product owner confirms tab name and gives **go** to implement. Specs: `09-version4.0.md`, `10-version4.0-technical.md`.

---

### 2026-05-14 - Night Guide Feature

- Decision: Add new "Night Guide" bottom tab with notification-based bedtime routine including task checklist and night-specific reflection.
- Why: Users need a structured bedtime routine to wind down and prepare for the next day, complementing the morning alarm routine.
- Requirements:
  - New bottom nav tab: "Night Guide" (Alarms | My Questions | Night Guide)
  - Night Guide triggers notification (not alarm) at scheduled time
  - Notification sound (gentle, different from alarm sound)
  - On tap: Navigate to Night Guide screen with up to 2 sections:
    1. Task Checklist (optional): User-configurable bedtime tasks
    2. Night Reflection: Different questions/sentences
  - End with "Good Night" message
  - Same scheduling logic as alarms (time, date, repeat)
  - Separate NightGuide type but reuse components/logic where possible
  - Task completion history tracking:
    - Show percentage completion for each day
    - Calendar view: green for completed days, red for incomplete
    - No notification for days without scheduled night guide
    - Only show task list if tasks were configured
- Alternatives:
  1. Use same alarm type with flag (less clear separation)
  2. No task list, only reflection (less comprehensive)
- Follow-up: Spec in `docs/specs/09-version4.0.md`. **Implement after motivational sentences** (see 2026-05-16 entry).

---

### 2026-05-14 - Reflection Extension with Motivational Sentences

- Decision: Extend reflection feature to include Part 2 with 3-5 motivational sentences that must be read sequentially with a delay between each.
- Why: Enhances the morning reflection experience by adding positive affirmations that users actively engage with, creating a stronger motivational impact.
- Requirements:
  - Part 1: Existing reflection question (no right/wrong answer)
  - Part 2: 3-5 motivational sentences displayed sequentially
  - Sentences randomly selected from pool of 100-200 affirmations
  - Each sentence must be marked as "read" by clicking
  - After marking one as read, 2-3 second delay before next is enabled
  - No skip option - must complete all sentences
  - Title: "Read Out Loud"
  - Text-to-speech using expo-speech (lightweight)
  - No progress indicator required
- Alternatives:
  1. Display all sentences at once (less engaging)
  2. Allow skipping (reduces commitment)
- Follow-up: **Implement before Night Guide** (see 2026-05-16 entry). Spec: `docs/specs/09-version4.0.md` §1.

---

### 2026-04-16 - Reflection Task Engine (No Right/Wrong)

- Decision: Add a new task type "reflection" that asks open-ended questions with no correct answer - any text input is accepted.
- Why: Users benefit from morning reflection prompts to set intention for the day. This creates a mindfulness moment before dismissing the alarm.
- Requirements:
  - Always appears as the LAST task in the sequence (not mixed with other tasks)
  - Pre-defined question list: "What's your goal for today?", "What do you want to achieve in life?", "Are you on the right track?", "What are you grateful for?"
  - Any non-empty text input is considered "correct" and allows proceeding
  - Optional: Save reflection responses to local storage for user review
- Alternatives:
  1. AI-generated reflection questions (Post-MVP - requires API)
  2. Time-based questions (morning vs evening specific)
- Follow-up: Implement after current bug fixes, add user preference to enable/disable reflections.

---

### 2026-04-16 - Custom User Questions Feature

- Decision: Allow users to create their own questions in Settings under "My Questions" section.
- Why: Users may want personal motivation questions (e.g., "Did you drink water?", "Have you called mom?") that are specific to their routine.
- Requirements:
  - UI in Settings: "My Questions" card that opens management modal
  - Each question has: Question text (max 120 chars), 2-4 options (max 30 chars each), Correct answer selection
  - Storage: Save to settings table as JSON array
  - Task generation: Include user questions in the pool when "mixed" or "custom" task type selected
  - Limit: Max 10 custom questions, max 4 options per question
  - Edit/Delete capabilities for each question
- UI Layout:
  - List view with question preview
  - Add button → Modal with form: Question input, dynamic options inputs (+/- buttons), correct answer dropdown
  - Validation: All fields required, min 2 options, distinct option values
- Alternatives:
  1. Import from CSV/Excel (too complex for MVP)
  2. AI generation based on user profile (Post-MVP)
- Follow-up: Design the UI mockup before implementation.

---

### 2026-04-12 - V2.0 Question Engine Approach

- Decision: Evaluate AI-generated questions vs custom Excel upload vs hybrid.
- Why: Enhance task variety questions with user preferences and difficulty levels with percentage mix of user's custom questions and App generated task questions; add progressive hint system. 
- Alternatives:
  1. AI-powered MCQ with cost considerations
  2. Excel upload (question, 4 options, correct answer, hint1/hint2/hint3)
- Follow-up: Finalize approach post-MVP.

---

### 2026-04-09 - Purpose-first MVP

- Decision: Keep MVP minimal. Set up an alarm with stop unlocked only after task completion.
- Why: Solves core user problem without feature overload.
- Follow-up: Add advanced gamification after MVP.
