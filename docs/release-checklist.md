# Shanks Math — release checklist

## Before freeze

- Confirm all published lessons pass `npm run check`.
- Confirm every generated lesson is marked `AI-бета`.
- Confirm every textbook trajectory references existing canonical topics.
- Confirm no textbook text, exercises, scans, ISBNs, or page numbers were invented or copied.
- Confirm Supabase public URL and anon key are configured outside the repository.
- Confirm Row Level Security is enabled for every user-owned table.

## Critical user journeys

- New user: account → name → grade → math → textbook → current topic.
- “I do not know my textbook” reaches the universal route.
- Returning user resumes the exact topic, mode, and stable step.
- Refreshing the page does not lose progress.
- Signing in on a second device restores cloud progress.
- Changing textbook preserves canonical topic progress.
- Reporting a beta-content error creates an event.
- Subject voting accepts at most the supported number of choices.

## Device matrix

- Android Chrome, narrow viewport and slow network.
- iOS Safari / installed PWA where available.
- Desktop Chrome and Edge.
- Keyboard-only onboarding and visible focus.
- Reduced-motion preference.

## Production

1. Run `npm run check`.
2. Verify the GitHub Pages source uses the `Deploy Pages` workflow.
3. Deploy from `master` only after CI passes.
4. Open the production URL in a clean browser profile.
5. Compare cache-busting versions with the deployed files.
6. Complete one real lesson and verify Supabase rows belong to the signed-in user.

## Rollback

1. In GitHub Actions, select the last known-good `Deploy Pages` run.
2. Re-run its deploy job, or revert the release commit with a new commit.
3. Do not rewrite `master` history.
4. Preserve database migrations; roll application code back without dropping user data.
5. Record the incident, affected release, and recovery time.
