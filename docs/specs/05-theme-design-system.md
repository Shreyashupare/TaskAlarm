# 05 Theme Design System

## Goal

Define a centralized, reusable design system so theme changes happen from one place only.

## Theme principles

- Keep UI clean and minimal.
- Use strong readability in both themes.
- Prefer neutral surfaces with selective accent usage.
- Avoid hardcoded per-screen colors.

## Theme modes

- `light`
- `dark`
- `system` (maps to OS preference)

## Color direction (as selected)

## Light theme

- Primary base: white.
- Secondary base: black shade.
- Accent: very limited, subtle usage only.

## Dark theme

- Primary base: black/grey shades.
- Secondary base: white shade.
- Accent: very faint sky-blue (subtle, not dominant).

## Token structure

Use semantic tokens instead of raw color literals in components.

## Core semantic tokens

- `bg.app`
- `bg.surface`
- `bg.surfaceElevated`
- `text.primary`
- `text.secondary`
- `text.inverse`
- `border.default`
- `border.subtle`
- `icon.primary`
- `icon.secondary`
- `action.primaryBg`
- `action.primaryText`
- `action.secondaryBg`
- `action.secondaryText`
- `action.dangerBg`
- `action.dangerText`
- `state.success`
- `state.warning`
- `state.error`
- `accent.softSky`

## Suggested token values (initial)

## Light

- `bg.app`: `#FFFFFF`
- `bg.surface`: `#F7F7F8`
- `bg.surfaceElevated`: `#FFFFFF`
- `text.primary`: `#111111`
- `text.secondary`: `#4A4A4A`
- `text.inverse`: `#FFFFFF`
- `border.default`: `#E4E4E7`
- `border.subtle`: `#F0F0F2`
- `icon.primary`: `#111111`
- `icon.secondary`: `#5A5A60`
- `action.primaryBg`: `#111111`
- `action.primaryText`: `#FFFFFF`
- `action.secondaryBg`: `#F1F1F3`
- `action.secondaryText`: `#111111`
- `action.dangerBg`: `#D14343`
- `action.dangerText`: `#FFFFFF`
- `state.success`: `#1F8A4C`
- `state.warning`: `#C27A00`
- `state.error`: `#C73434`
- `accent.softSky`: `#EAF4FF`

## Dark

- `bg.app`: `#121212`
- `bg.surface`: `#1B1C1E`
- `bg.surfaceElevated`: `#232428`
- `text.primary`: `#F5F5F5`
- `text.secondary`: `#C8C8CC`
- `text.inverse`: `#111111`
- `border.default`: `#313236`
- `border.subtle`: `#28292C`
- `icon.primary`: `#F5F5F5`
- `icon.secondary`: `#C8C8CC`
- `action.primaryBg`: `#F5F5F5`
- `action.primaryText`: `#111111`
- `action.secondaryBg`: `#2B2C30`
- `action.secondaryText`: `#F5F5F5`
- `action.dangerBg`: `#E06666`
- `action.dangerText`: `#111111`
- `state.success`: `#46B873`
- `state.warning`: `#E0A13A`
- `state.error`: `#F07A7A`
- `accent.softSky`: `#1E2A36`

## Typography tokens

- `font.family.base`: system default
- `font.size.xs`: 12
- `font.size.sm`: 14
- `font.size.md`: 16
- `font.size.lg`: 20
- `font.size.xl`: 28
- `font.weight.regular`: 400
- `font.weight.medium`: 500
- `font.weight.semibold`: 600
- `font.weight.bold`: 700
- `lineHeight.tight`: 1.2
- `lineHeight.normal`: 1.4

## Spacing tokens

- `space.0`: 0
- `space.1`: 4
- `space.2`: 8
- `space.3`: 12
- `space.4`: 16
- `space.5`: 20
- `space.6`: 24
- `space.8`: 32
- `space.10`: 40

## Radius tokens

- `radius.sm`: 8
- `radius.md`: 12
- `radius.lg`: 16
- `radius.xl`: 20
- `radius.full`: 999

## Shadow/elevation tokens

- `elevation.none`
- `elevation.sm`
- `elevation.md`
- `elevation.lg`

Use minimal elevation; prefer contrast and spacing first.

## Component token mapping

## Buttons

- Primary button uses:
  - `action.primaryBg`
  - `action.primaryText`
- Secondary button uses:
  - `action.secondaryBg`
  - `action.secondaryText`
- Danger button uses:
  - `action.dangerBg`
  - `action.dangerText`

## Cards

- Background: `bg.surface` / `bg.surfaceElevated`
- Border: `border.default`
- Title text: `text.primary`
- Subtitle text: `text.secondary`

## Inputs

- Background: `bg.surface`
- Border default: `border.default`
- Border focus: `accent.softSky` + stronger contrast outline
- Text: `text.primary`
- Placeholder: `text.secondary`

## Toggles/switches

- Off track: `border.default`
- On track: `accent.softSky` with contrasting thumb

## Theme implementation requirements

- All colors must come from theme tokens.
- No hex usage directly inside screen/component files.
- Theme selection stored centrally in settings store.
- Shared `useThemeTokens()` hook should expose all tokens.

## Accessibility requirements

- Ensure readable contrast for text and controls.
- Do not rely on color alone for task correctness.
- Keep accent usage subtle but visible in both themes.

## Future-safe extension

- Additional themes can be added by extending same token contract.
- New components must map to semantic tokens, not fixed values.
