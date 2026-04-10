# Git Workflow

## Branch naming

Use:

- `ticketId-<feature>`

Examples:

- `ALRM-01_alarmList`

## Commit format

Use:

- `feature: <short result>`
- `bugfix: <short result>`
- `improvement: <short result>`
- `docs: <short result>`
- `chore: <short result>`

## Working process

1. Clarify ticket scope.
2. Implement smallest useful change.
3. Test core behavior.
4. Update docs when needed.
5. Commit with clear message.

## Review standards

Check these during self-review and PR review:

- Scope: change matches ticket and avoids unrelated modifications.
- Simplicity: no over-engineering; code remains modular and readable.
- Reuse: no duplicated logic; shared logic moved to reusable modules.
- Constants: no hardcoded numbers/strings where constants or mappings are expected.
- Types: data contracts use proper `type`/`interface` (or class where truly needed).
- Theme: no hardcoded colors/spacing; use centralized theme tokens.
- Reliability: alarm/task/quote flows follow spec behavior and fallback rules.
- Tests: required unit/integration/manual checks are covered for changed areas.
- Docs: relevant docs and tracker/changelog are updated when behavior changes.
