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
