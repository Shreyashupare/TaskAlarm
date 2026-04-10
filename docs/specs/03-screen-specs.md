# 03 Screen Specs

## Goal

Define detailed screen-wise layout and control behavior with a clean, minimal UI.

## Global layout rules

- Use consistent horizontal padding on all screens.
- Keep one primary action per screen.
- Place destructive actions away from primary actions.
- Use large tap targets for alarm-time interactions.
- Keep visual hierarchy simple: header -> content -> primary action.

## 1) Alarm List Screen

## Purpose

Show all alarms and allow fast enable/disable, edit, and delete.

## Structure (top to bottom)

1. **Header row**
   - Left: app title `TaskAlarm`.
   - Right: settings icon button.
2. **Subheader**
   - Small helper text (example: "Wake up by solving").
3. **Alarm list content**
   - Scrollable list of alarm cards.
   - Empty-state card when no alarms exist.
4. **Floating primary button**
   - Bottom-right: `+ New Alarm`.

## Alarm card layout

- Row 1:
  - Left: time text (large).
  - Right: enable/disable toggle.
- Row 2:
  - Left: weekdays compact pills (`M T W T F S S`).
  - Right: sound label.
- Row 3:
  - Left: alarm label (optional, muted text).
  - Right: edit icon button, delete icon button.

## Behaviors

- Toggle changes state immediately with visual feedback.
- Delete asks confirmation modal.
- Card tap opens edit screen.
- If disabled, card opacity is reduced but readable.

## 2) Create/Edit Alarm Screen

## Purpose

Capture alarm details with minimal steps.

## Structure (top to bottom)

1. **Header**
   - Back button (left).
   - Title (`Create Alarm` or `Edit Alarm`).
2. **Time block**
   - Prominent time picker section near top.
3. **Repeat block**
   - Weekday selector row.
4. **Sound block**
   - Default sound dropdown.
   - Optional custom sound selector button.
   - Preview sound action.
5. **Task block**
   - Task type segmented selector.
   - Task count stepper (`-` count `+`) with min/max helper text.
6. **Advanced block (collapsed by default)**
   - Label input.
   - Vibration toggle.
7. **Bottom sticky action**
   - Full-width `Save Alarm` button.

## Behaviors

- Validate on save and show inline field-level errors.
- Task count hard limits: `3..10`.
- Custom sound selection falls back to default if invalid file.
- Edit mode preloads existing alarm values.

## 3) Alarm Ringing Screen

## Purpose

Force task completion before stop becomes available.

## Structure (top to bottom)

1. **Top zone**
   - Current time (large).
   - Alarm label (if available).
2. **Progress zone**
   - Progress text (`Task 2 of 4`).
   - Thin progress bar.
3. **Task zone (main focus)**
   - Task prompt card.
   - Interactive answer area (buttons/grid/input based on task type).
4. **Bottom zone**
   - Disabled stop button until completion.
   - Snooze (only if policy allows; in this plan: after completion only).

## Behaviors

- Start audio loop immediately when screen appears.
- Do not render stop as active until required tasks complete.
- Incorrect answer shows quick error feedback and stays on current task.
- Correct answer advances to next task with subtle transition.
- After final task, enable stop button and reveal optional snooze.

## Task interaction layouts

- `math`: 2x2 options grid (large buttons).
- `color`: 2x2 colored tiles with accessible labels.
- `shape`: 2x2 shape tiles/icons.
- `icon_match`: 2x2 icon buttons.
- `position_tap`: 3x3 grid; prompt says target cell.
- `order_tap`: numbered tiles with sequence feedback.
- `count_objects`: object canvas + multiple-choice answers.

## 4) Quote Screen (Post Stop)

## Purpose

Provide a short positive completion moment after alarm stop.

## Structure (top to bottom)

1. **Success icon**
2. **Title** (`You did it`)
3. **Quote card**
   - Quote text centered.
   - Author (optional).
4. **Actions**
   - Primary: `Done`.
   - Optional secondary: `Share` (future scope).

## Behaviors

- Quote is selected randomly from local source.
- `Done` returns to Alarm List.

## 5) Settings Screen

## Purpose

Control defaults and app-level behavior.

## Structure (top to bottom)

1. **Header**
   - Back button + title.
2. **Task defaults section**
   - Default task mode selector.
   - Default task count selector.
3. **Alarm behavior section**
   - Snooze policy (after completion only for MVP).
   - Vibration default toggle.
4. **Appearance section**
   - Theme selector (`Light`, `Dark`, `System`).
5. **About section**
   - App version text.

## Behaviors

- Changes save immediately.
- Show small inline confirmation for changed settings.

## Shared component requirements

- `AppButton`: variants (`primary`, `secondary`, `danger`, `disabled`).
- `AppSwitch`: consistent toggle control.
- `FormSection`: reusable titled section wrapper.
- `TaskCard`: shared shell for all task templates.
- `TopHeader`: reusable screen header with optional actions.

## Accessibility and usability baseline

- Touch targets should be comfortably tappable.
- Color tasks must include text/label cues (not color only).
- Maintain strong contrast in both themes.
- Avoid overloaded screens; use collapse sections when optional.
