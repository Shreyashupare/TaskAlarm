# Coding Standards

## Keep it simple

- Prefer small modules with single responsibility.
- Avoid over-engineering in MVP.
- Choose clear code over clever code.

## Reuse and modularity

- Reuse components and utility functions.
- Keep business logic out of UI components when possible.
- Avoid duplicate logic across screens/services.

## Naming conventions

- Components and types: `PascalCase`.
- Variables and functions: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE`.
- Use clear names over short names.

## Constants and literals

- Do not use hardcoded numbers in business logic.
- Extract repeated numeric values to named constants (examples: `TASK_COUNT_LIMIT`, `AUDIO_START_TIMEOUT_MS`).
- Do not use hardcoded user-facing strings directly in components/services.
- Keep reusable strings in constants/maps (examples: labels, error messages, task prompts, enum-to-label maps).
- Keep constants close to domain usage (global constants for shared values, feature constants for local values).

## Types and models

- Use `type`/`interface` for data contracts passed across layers.
- Define shared domain models in `src/types/`.
- Use classes only when behavior/stateful object modeling is actually needed.
- Prefer explicit return types for public service/store methods.

## Logging standards

- Add logs only where required for debugging, reliability, or error tracing.
- Do not add noisy logs in simple/obvious flows.
- Use log levels consistently: `debug`, `info`, `warn`, `error`.
- Default runtime level must be controlled from a common constant:
  - `LOG_LEVEL_ENABLED = 'error'`
- For debugging sessions, temporarily raise level (example: `debug`) through the same centralized config.
- Do not log secrets, personal data, or sensitive payloads.

## Theme architecture

- Keep colors, spacing, and typography in one centralized theme module.
- Do not hardcode theme values across screens.
- Theme changes should come from a single source.

## Comment policy

- Add comments only when logic is truly complex.
- Explain why, not what.
- Do not add comments for obvious code.

## MVP engineering rule

- Ship small working increments.
- Refactor only when duplication or complexity becomes real.
