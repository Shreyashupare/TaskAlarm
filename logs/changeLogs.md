# Change Logs

This file is updated at commit time only.

## Entry template

### YYYY-MM-DD HH:MM:SS Z - <commit-or-ticket>

- What was done:
- Files/areas changed:
- Commit id: `<to-be-added>`
- Notes:

---

### 2026-04-18 21:15:00 IST - version-3.0-final

- What was done: Final polish - Added Terms & Conditions and Contact. Documentation aligned with final implementation.
- Files/areas changed: 
- Commit id: `558a036`
- Notes: App is feature-complete and stable. All features working as expected.

---

### 2026-04-16 00:50:00 IST - TSKALRM-001

- What was done: Fixed 10+ UI/UX bugs including AlarmFormScreen theming, time format 12h display, minutes vibration fix, ringtone per alarm, task selector real-time updates, color/shape visual tasks, QuoteScreen navigation, database migration order, header spacing, gesture handling on locked screens.
- Files/areas changed: `src/screens/alarms/AlarmFormScreen/`, `src/screens/settings/SettingsScreen/`, `src/screens/ringing/AlarmRingingScreen/`, `src/screens/ringing/QuoteScreen/`, `src/data/db/sqlite.ts`, `src/services/tasks/taskEngine.ts`, `src/navigation/RootStack.tsx`, `src/stores/types.ts`, `src/components/ui/TopHeader.tsx`.
- Commit id: `505e4a3`
- Branch: `TSKALRM-001`
- Notes: Most critical UI fixes completed. Color/shape tasks now render visual elements instead of text.

---

### 2026-04-14 18:00:00 IST - TSKALRM-001

- What was done: Downgraded Expo SDK from 55 to 54 due to compatibility issues with Expo Go App for testing.
- Files/areas changed: `package.json`, `package-lock.json`, `app.json`, `android/`, `ios/`.
- Commit id: `0a82219`
- Branch: `TSKALRM-001`
- Notes: App is working but significant issues.

---

### 2026-04-13 15:30:00 IST - main

- What was done: Initial MVP release with core alarm functionality - alarm list, create/edit, scheduling, ringing with tasks, quotes.
- Files/areas changed: All `src/` directories, navigation, stores, services, database, screens.
- Commit id: `6c76514`
- Branch: `main`
- Notes: **Known issues in this commit**: App not starting. These were fixed in later commits.

---

### 2026-04-10 20:14:43 IST - pre-implementation-setup

- What was done: Initialized Expo TypeScript app baseline and added Husky pre-commit checks.
- Files/areas changed: `App.tsx`, `app.json`, `babel.config.js`, `tsconfig.json`, `package.json`, `.husky/pre-commit`, `docs/`, `logs/`, `meta/ai/`.
- Commit id: `6ae617d`
- Notes: Pre-commit now runs `typecheck` and `test:ci`; changelog format updated to include date and time.

### 2026-04-10 - spec-docs

- What was done: Created technical project documentation.
- Files/areas created: `specs/`.


### 2026-04-09 - docs-setup

- What was done: Created project documentation.
- Files/areas created: `docs/`, `logs/`, `meta/ai/`, `README.md`, `.gitignore`.

