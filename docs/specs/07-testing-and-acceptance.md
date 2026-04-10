# 07 Testing And Acceptance

## Goal

Define practical test coverage and release acceptance for a reliable MVP.

## Testing strategy

- Keep tests focused on core logic and critical user flows.
- Prioritize alarm reliability over cosmetic behavior.
- Combine unit tests + integration checks + manual scenario verification.

## 1) Unit test scope (must-have)

## Task engine

- Generates valid tasks for each type.
- Mixed mode produces allowed types only.
- Answer validation correctness for all task types.
- Session task count equals required count.

## Alarm scheduler logic

- Next trigger calculation by weekday/time.
- Disabled alarms are not scheduled.
- Reschedule on update works correctly.
- Duplicate schedule prevention logic.

## Validators

- Alarm form validation (time, weekdays, task range).
- Settings validation (theme/task defaults/snooze policy).
- Sound validation fallback rules.

## Quote service

- Random quote fetch from local source.
- Fallback quote when source empty/fails.

## 2) Integration test scope (recommended)

- Create alarm -> schedule -> appears in list.
- Edit alarm -> reschedule -> updated list state.
- Toggle alarm off -> trigger canceled.
- Trigger event -> ringing session starts.
- Task completion unlocks stop only after required count.
- Stop -> quote screen appears.

## 3) Manual platform test matrix

## Android

- Alarm fires when app is foreground.
- Alarm fires when app is background.
- Alarm flow from lock screen.
- Exact alarm permission denied path.
- Permission granted after denial path.
- Reboot recovery (enabled alarms restored).

## iOS

- Alarm fires in foreground/background conditions supported by local trigger flow.
- Lock/unlock transition into ringing screen.
- Sound fallback behavior when custom file not available.
- Reopen app and reconcile schedules.

## Cross-platform

- Theme switch (`light`/`dark`/`system`) updates all screens.
- All task types remain usable and readable.
- Quote appears after stop.

## 4) Scenario regression checklist

Before each MVP release candidate:

- [ ] Background trigger verified.
- [ ] Lock-screen flow verified.
- [ ] App-killed behavior verified.
- [ ] Reboot restore verified.
- [ ] Permission denied fallback verified.
- [ ] Custom sound fallback verified.
- [ ] Task generation fallback verified.
- [ ] Quote fallback verified.
- [ ] No direct stop before required tasks.

## 5) Performance and stability checks

- Alarm list rendering remains smooth with multiple alarms.
- Ringing screen transition should be fast and stable.
- No memory leaks from audio sessions.
- No repeated duplicate scheduling on app resume.

## 6) Release acceptance criteria (MVP gate)

## Functional gates

- All must-have product features implemented.
- Core flows pass on at least one Android device and one iOS device.
- No P0 scenario unresolved.

## Quality gates

- Unit tests for core logic pass.
- Critical integration flows pass.
- Manual regression checklist complete.

## Documentation gates

- Specs updated for implemented behavior.
- `logs/changeLogs.md` updated at commit/release points.
- `logs/implementation-tracker.md` reflects current status.

## 7) Defect severity policy

- `Blocker`: prevents alarm reliability or stop-gating core behavior.
- `High`: major flow broken with workaround.
- `Medium`: partial feature issue, core flow intact.
- `Low`: UI polish/minor mismatch.

Release rule:

- No `Blocker` or `High` defects open for MVP release.
