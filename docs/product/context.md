# Product Context

## Purpose

People set alarms but often snooze or stop quickly while half-awake. `TaskAlarm` solves this by requiring short interactive tasks before stop is unlocked.

## MVP meaning

`MVP` (Minimum Viable Product) here means the smallest useful app that solves the snooze/instant-stop problem reliably.

## Core promise

- Alarm does not stop immediately.
- User solves `x` tasks.
- Stop button unlocks after completion.
- Snooze is allowed only after completion (MVP policy).
- Show a random quote after successful stop.
- Users are motivated for next goals of the day and no more sleepy.

## Product principles

- Keep it simple.
- Keep it lightweight.
- Keep the UI clean and fast.
- Keep features purposeful.

## MVP scope

- Alarm create/edit/delete.
- Weekday repeat.
- Alarm on/off toggle.
- Ringing screen with task-gated dismissal.
- Task types: math, color, shape, mixed (random).
- Task count range: `3` to `10` (default `4`).
- Quote display after alarm stop.

## Optional task extensions (post-MVP or V1.1)

- Icon match.
- Position tap.
- Order tap.
- Count objects.

## Future-ready but simple

- Modular and reusable components.
- No duplicate business logic.
- Theme must be controlled from a single source (central theme config).
