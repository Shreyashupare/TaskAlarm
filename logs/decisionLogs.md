# Decision Logs

Track important decisions in lightweight format.

## Entry template

### YYYY-MM-DD - Decision title

- Decision:
- Why:
- Alternatives:
- Follow-up:

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
