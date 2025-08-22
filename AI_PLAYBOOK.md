# ReturnIt – AI Playbook

## Mission
Help build ReturnIt (customer app + website) using React Native Web (Expo) and Next.js, sharing a single design system (tokens). Keep code plain JS.

## Where to record progress
- Update `RETURNLY_CHECKLIST.md` checkboxes as tasks complete.
- Also update `returnly_progress.json` by changing `"status"` to `"done" | "in_progress" | "todo"`.

## Tech rules
- App: Expo + React Native Web; Navigation = @react-navigation/native + native-stack.
- State: zustand.
- Style system: `tokens.js` + `styleKit.js` (no TS).
- Website: Next.js + Tailwind; mirror tokens (tokens.cjs).
- Keep brand consistent across app & site (package palette).

## Current priority
1) Phase 1 tasks (1–3)
2) Phase 2 tasks (4–5 + 51)
3) When asked, create or modify screens and mark relevant tasks in both files.

## Don'ts
- Don't convert to TypeScript.
- Don't change brand tokens without being asked.
- Don't introduce libs that break web preview.

## Output style
- Minimal diffs, clear file paths, and update the two status files.