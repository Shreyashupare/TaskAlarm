# TaskAlarm — Agent Guide

Instructions for AI agents working in this repository. Full references: `docs/standards/coding-standards.md`, `docs/process/git-workflow.md`.

## Project context

- GitHub: `Shreyashupare/TaskAlarm` — issues use `gh` CLI (auth with `gh auth login`).

- React Native (Expo) + TypeScript alarm app; local SQLite, Zustand stores.
- Specs: `docs/specs/`. V4.0: `docs/specs/09-version4.0.md`, `docs/specs/10-version4.0-technical.md`.
- Ship small working increments; avoid scope creep and drive-by refactors.
- **V4.0:** Implement motivational sentences before Night Guide. **Do not start v4.0 code until the user confirms.**

---

## Coding standards

### Simplicity and structure

- Small modules, single responsibility; clear code over clever code.
- Reuse components and utilities; keep business logic out of UI when possible.
- No duplicate logic across screens/services.

### Naming

| Kind | Convention |
|------|------------|
| Components, types | `PascalCase` |
| Variables, functions | `camelCase` |
| Constants | `SCREAMING_SNAKE_CASE` |

Prefer clear names over short names.

### Constants and strings

- No magic numbers in business logic — extract to named constants (e.g. `TASK_COUNT_LIMIT`, `MOTIVATIONAL_SENTENCE_DELAY_MS`).
- No hardcoded user-facing strings in components/services — use constants/maps (labels, errors, prompts).
- Global constants: `src/constants/AppConstants.ts`. Feature-local: `src/constants/` subfolders or screen `helpers/constants.ts`.
- Night Guide **UI label only:** `NIGHT_GUIDE_TITLE` in `src/constants/nightGuideConstants.ts` (code uses `NightGuide*` everywhere else).

### Types

- Use `type`/`interface` for data contracts; shared domain models in `src/types/` or `src/constants/types/` (match existing code).
- Classes only when behavior/stateful modeling is needed.
- **Never** define types and implementation in the same file — use co-located `types.ts` or shared types folders.
- Explicit return types on public service/store methods.

### Screen and component folders

Each screen/component gets its own PascalCase folder:

```
ComponentName/
├── ComponentName.tsx   # logic only
├── styles.ts
└── helpers/
    ├── constants.ts
    └── utils.ts
```

- Screens: `src/screens/<feature>/...`
- Shared UI: `src/components/ui/` or `src/components/`
- Shared utils: `src/utils/`

### Theme, logging, imports

- Colors, spacing, typography from centralized theme — no hardcoded theme values in screens.
- Logs: only where needed; levels `debug` | `info` | `warn` | `error`; default runtime level `error` via central config; never log secrets/PII.
- Comments: only for non-obvious logic — explain **why**, not what.
- Imports: relative paths (`../`, `./`); **no** path aliases (`@/`).

### MVP rule

Refactor only when duplication or complexity is real. Match existing patterns in surrounding code.

---

## Git workflow

### Issue creation (bug report / feature request)

**Always use the `gh` CLI** to create issues directly on GitHub:

```bash
gh issue create --title "<title>" --body "<description>"
```

- Use the `--label` flag to tag appropriately (`bug`, `enhancement`, `documentation`).
- Include root cause analysis, expected vs actual behavior, affected code paths, and reproduction steps in the body.

### Branch strategy for new work

Before writing any code for a new feature or bugfix:

1. Create a branch from `main` with the naming pattern `<TSKALRM-00x>-bug/feature/chore-<short-title>` — e.g., `TSKALRM-005-chore-github-workflow-setup`, `TSKALRM-006-bug-repeating-alarms-fix`.
2. Push the branch to origin.
3. Create a **draft PR** early (mark as "Draft") to signal work in progress.
4. Implement the smallest useful change; keep commits clean.
5. When ready, mark the PR as "Ready for review" and request review.

### PR workflow

1. Branch from `main` with the naming pattern `<TSKALRM-00x>-bug/feature/chore-<short-title>`.
2. Push early, create a draft PR.
3. Implement and commit with conventional prefixes.
4. Update `logs/implementation-tracker.md`, `logs/changeLogs.md`, and `logs/decisionLogs.md` as appropriate.
5. Convert draft PR → ready PR when complete.
6. Merge only after review approval.

### Branches

`<TSKALRM-00x>-bug/feature/chore-<short-title>` — e.g. `TSKALRM-001-bug-alarm-list-crash`, `TSKALRM-002-feature-dark-mode`.

### Commits

Prefix with type and short result:

- `feature: …`
- `bugfix: …`
- `improvement: …`
- `docs: …`
- `chore: …`

Only commit when the user explicitly asks.

### Working process

1. Clarify ticket/scope.
2. Implement the smallest useful change.
3. Test core behavior.
4. Update docs and logs when behavior changes (see below).
5. Commit with a clear message.

### Self-review / PR checklist

- Scope matches ticket; no unrelated edits.
- Simple, modular, readable; reused shared logic.
- No stray hardcoded numbers/strings or theme values.
- Types/contracts correct; alarm/task/quote flows match specs and fallbacks.
- Tests/manual checks for changed areas.
- Decision log, changelog, and implementation tracker updated when appropriate.

---

## Project logs (required maintenance)

Update these when making meaningful changes — not for trivial typo-only edits.

### Decision log — `logs/decisionLogs.md`

Use for architectural or product decisions (new features, trade-offs, rejected alternatives).

**When:** New feature direction, non-obvious technical choice, or spec-level change.

**Template** (append at top, after the template block):

```markdown
### YYYY-MM-DD - Decision title

- Decision:
- Why:
- Alternatives:
- Follow-up:
```

### Change log — `logs/changeLogs.md`

**When:** At commit time (user-requested commits), or when summarizing a completed chunk of work.

**Template:**

```markdown
### YYYY-MM-DD HH:MM:SS Z - <commit-or-ticket>

- What was done:
- Files/areas changed:
- Commit id: `<hash>`
- Notes:
```

Include branch name when relevant. This file is the audit trail of what shipped.

### Implementation tracker — `logs/implementation-tracker.md`

**When:** Starting, progressing, or finishing tracked work (features, phases, platform checks).

**Status markers:**

- `[ ]` not started
- `[-]` in progress
- `[x]` done

Add new sections/phases for new specs (e.g. V4.0 in `docs/specs/`). Mark items done only when actually complete.

---

## Agent workflow summary

| Step | Action |
|------|--------|
| Before coding | Read relevant `docs/specs/` and existing code patterns |
| V4.0 | Motivational sentences first; confirm with user before any implementation |
| While coding | Follow folder structure, constants, types, theme rules |
| After meaningful work | Update `implementation-tracker.md`; add decision entry if needed |
| On commit (when asked) | Update `changeLogs.md` with commit id and summary |
| Before finishing | Run self-review checklist; avoid editing markdown the user did not ask for unless logs/docs are part of the task |

---

### Issue triage workflow (CI)

`.github/workflows/issue-management.yml` auto-labels new issues:
- Contains `bug` / `fail` / `does not` → label `bug`
- Contains `feature` / `request` / `enhancement` → label `enhancement`
- Contains `crash` / `blocker` → label `priority-critical`
- Contains `repeat` / `alarm fail` / `not ring` → label `priority-high`

`.github/workflows/ci.yml` runs on PRs to `main`:
- TypeScript type checking
- ESLint linting
- Dependency installation

## Quick links

| Resource | Path |
|----------|------|
| Coding standards (full) | `docs/standards/coding-standards.md` |
| Git workflow (full) | `docs/process/git-workflow.md` |
| V4.0 product spec | `docs/specs/09-version4.0.md` |
| V4.0 technical spec | `docs/specs/10-version4.0-technical.md` |
| Decision logs | `logs/decisionLogs.md` |
| Change logs | `logs/changeLogs.md` |
| Implementation tracker | `logs/implementation-tracker.md` |
| Architecture | `docs/specs/01-architecture.md` |
| CI workflows | `.github/workflows/` |
| Bug issues | `docs/issues/` |
