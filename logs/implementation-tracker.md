# Implementation Tracker

Simple checklist to track what is done and what is pending.

## Status legend

- `[ ]` not started
- `[-]` in progress
- `[x]` done

## Product

- [x] Define product purpose and MVP scope
- [x] Define user flow and screens
- [x] Define coding and testing standards
- [x] Create technical documentation
- [ ] Build alarm list screen
- [ ] Build create/edit alarm screen
- [ ] Build alarm scheduling integration
- [ ] Build ringing screen with task lock
- [ ] Build optional mini-task templates
- [ ] Build quote-after-stop flow

## Technical docs progress

- [x] Step 1: Architecture spec
- [x] Step 2: Packages and setup spec
- [x] Step 3: Screen-wise detailed spec
- [x] Step 4: Functional/service spec
- [x] Step 5: Theme design system spec
- [x] Step 6: Scenarios and edge cases
- [x] Step 7: Testing and acceptance spec

## Task engine

- [ ] Math task generator
- [ ] Color task generator
- [ ] Shape task generator
- [ ] Mixed mode selector
- [ ] Task progress and unlock logic
- [ ] Use AI for random task ?

## Platform checks

- [ ] Android exact alarm permission flow
- [ ] iOS sound limitations handling
- [ ] Basic background/foreground behavior testing

## Development checklist (start implementation)

- [ ] Create project skeleton folders from `docs/specs/01-architecture.md`.
- [ ] Install baseline dependencies from `docs/specs/02-packages-and-setup.md`.
- [ ] Configure navigation shell (root stack + bottom tabs).
- [ ] Set up SQLite schema and repositories (`alarms`, `settings`, `quotes`).
- [ ] Implement Zustand stores (`useAlarmStore`, `useSettingsStore`, `useRingingStore`).
- [ ] Implement theme tokens/provider and `useThemeTokens()` hook.
- [ ] Build reusable UI primitives (`AppButton`, `AppSwitch`, `FormSection`, `TopHeader`).
- [ ] Build Alarm List + Create/Edit screens.
- [ ] Implement scheduler service + reconcile-on-launch flow.
- [ ] Build ringing session with task gating and audio loop.
- [ ] Build quote-after-stop screen with fallback quote behavior.
- [ ] Run MVP scenario checks from `docs/specs/06-scenarios-and-edge-cases.md`.
