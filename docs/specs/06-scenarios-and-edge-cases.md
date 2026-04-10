# 06 Scenarios And Edge Cases

## Goal

Define expected app behavior for runtime edge cases so alarm reliability remains strong.

## Severity levels

- `P0`: must handle before MVP release.
- `P1`: should handle in MVP if low-to-medium effort.
- `P2`: can be post-MVP.

## A) Alarm reliability scenarios

## 1. App in background when alarm triggers (`P0`)

### Expected behavior

- Alarm notification/trigger fires at scheduled time.
- User tap on notification opens ringing screen directly.
- Ringing session starts with task flow and audio.

### Fallback

- If deep-link open fails, open app root then route to ringing session immediately.

## 2. Device locked when alarm triggers (`P0`)

### Expected behavior

- Alarm event is visible and actionable from lock screen.
- On unlock/open, app lands in ringing flow.

### Fallback

- If full-screen intent behavior is restricted, show high-priority notification and force route to ringing screen on open.

## 3. Multiple alarms at same time (`P1`)

### Expected behavior

- Resolve one active ringing session at a time.
- Queue additional due alarms in memory/store.

### Policy

- First triggered alarm starts session.
- Remaining due alarms become `queued`.
- After stop of current session, next queued alarm starts.

## 4. Multiple alarms within short interval (`P1`)

### Expected behavior

- If second alarm becomes due during active session, queue it.
- Show small message after first completion: "Next alarm ready."

## B) Permission and platform scenarios

## 5. Exact alarm permission denied (Android) (`P0`)

### Expected behavior

- Show clear warning in settings and alarm form.
- Allow saving alarm but mark as reduced reliability.
- Provide one-tap "Open system settings" action.

### Fallback

- Schedule best-effort trigger and log permission state for diagnostics.

## 6. Permission revoked after alarms already saved (`P1`)

### Expected behavior

- Detect state on app launch and scheduler reconcile.
- Mark affected alarms with warning badge.

## C) App lifecycle scenarios

## 7. App process killed before alarm (`P0`)

### Expected behavior

- Triggers still fire from OS schedule.
- On app restart, reconcile all enabled alarms.

## 8. Device reboot (`P0`)

### Expected behavior

- Reboot receiver/reconcile flow restores all enabled alarm schedules.

### Fallback

- If restore fails, show in-app warning and one-tap "repair schedules".

## 9. App updated to new version (`P1`)

### Expected behavior

- DB migrations run safely.
- Existing alarms remain valid and rescheduled if needed.

## D) Time/date scenarios

## 10. Timezone changes (`P1`)

### Expected behavior

- Recompute next trigger times on app foreground/app launch.
- Maintain weekday intent in new timezone.

## 11. DST transition (`P1`)

### Expected behavior

- Handle skipped/duplicated local times safely.
- Use next valid local occurrence policy.

## 12. Manual clock change by user (`P1`)

### Expected behavior

- Detect significant time drift at app resume.
- Trigger reconcile flow and refresh next alarm labels.

## E) Audio and sound scenarios

## 13. Custom sound file missing/unreadable (`P0`)

### Expected behavior

- Fallback to default bundled alarm sound.
- Show non-blocking warning in alarm detail/settings.

## 14. Audio start fails on ringing (`P0`)

### Expected behavior

- Retry once quickly.
- If still failing, fallback to alternate default sound channel.

## 15. User volume very low or muted (`P2`)

### Expected behavior

- Show hint in ringing screen: "Volume is low."

## F) Task session scenarios

## 16. Task generation failure (`P0`)

### Expected behavior

- Retry task generation.
- If retry fails, load safe fallback task type (`math`).

## 17. Invalid answer payload (`P1`)

### Expected behavior

- Ignore invalid payload.
- Keep same task and show short feedback.

## 18. User leaves ringing screen (`P0`)

### Expected behavior

- Prevent normal back navigation during active session.
- Returning to app should reopen ringing session until completion.

## 19. App crashes mid-session (`P1`)

### Expected behavior

- Persist minimal session snapshot.
- Recover with safe policy:
  - either restart session from task 1
  - or resume from last confirmed completed count (choose one policy in implementation)

## G) Data scenarios

## 20. SQLite read/write failure (`P0`)

### Expected behavior

- Fail gracefully with user-safe message.
- Do not crash app.
- Retry where safe; provide "try again" action.

## 21. Corrupt/invalid alarm record (`P1`)

### Expected behavior

- Skip invalid record during list render/reconcile.
- Log issue and continue loading valid records.

## H) Quote scenarios

## 22. Quote source empty (`P0`)

### Expected behavior

- Return default hardcoded quote.
- Continue post-stop flow without interruption.

## 23. Quote retrieval error (`P1`)

### Expected behavior

- Use fallback quote and avoid blocking completion screen.

## I) UX and accessibility scenarios

## 24. Color recognition limitations (`P1`)

### Expected behavior

- Color tasks include text labels and/or icon markers.
- Do not rely on color alone.

## 25. Very small screens (`P1`)

### Expected behavior

- Task UI remains usable without clipped controls.
- Allow scrolling for non-critical sections.

## Mandatory MVP scenario checklist

- [ ] Background trigger works.
- [ ] Lock-screen trigger flow works.
- [ ] Reboot restore works.
- [ ] App-killed behavior is verified.
- [ ] Permission denied path is handled.
- [ ] Custom sound fallback works.
- [ ] Task fallback works on generation failure.
- [ ] Quote fallback works when source is unavailable.
