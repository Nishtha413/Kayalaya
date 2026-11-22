# Person 3 — Pose Analysis, Scoring & Feedback

This folder is the single documentation/data home for Person 3. No authentication, onboarding or backend progress-lock behavior was changed.

## Files

- `selected_poses.md`: authoritative seed pose identifiers and landmarks
- `reference_angles.md`: numerical ranges and evidence labels
- `angle_calculation.md`: geometry and quality gating
- `scoring_method.md`: reproducible score formula
- `realtime_feedback.md`: feedback priorities and limits
- `weekly_assessment.md`: seven-day aggregation and server lock
- `pose_reference_data.json`: machine-readable seed-based reference rules
- `journal_justification.md`: evidence-to-design mapping
- `references.bib`: verified publication
- `source_verification.md`: full-text audit and gaps

## Code outside this folder

- `src/pose/person3.ts`: pure reusable angle, scoring, smoothing and weekly functions.
- `src/pose/person3.test.mjs`: runnable Node assertions.
- Existing `src/pose/usePoseFeedback.ts`: live native module hook **not replaced/wired to new evaluator**.
- Existing `src/data/poseRules.ts`: provisional frontend guesses (not authoritative).
- `backend/app/seed/seed_data.json`: source of truth for pose list and configured backend angles.
- `backend/app/api/routes/progress.py`: server-controlled day completion and final test lock.

## Run tests

From repository root: `node --experimental-strip-types src/pose/person3.test.mjs` (Node 22+).

## Integration contract

Read pose IDs/ranges from `GET /api/poses`, map backend `pose_name`/`client_id` to the current pose; use the native MediaPipe landmark callback; convert landmark names to camelCase; run `evaluate()` with expert-approved rules; show score only if status is evaluable; submit `POST /api/progress/practice-attempt` only for a valid completed session and assigned day. The current native hook has **not yet been migrated**; its provisional guesses must not be mistaken for validated rules. Expo Go does not support the existing custom native MediaPipe module without a development build.

## Open decisions

Obtain approved reference angles for seven unconfigured poses, calibrate all rules including Mountain, decide whether to report a weekly pass/fail, and determine whether the backend should record duration/valid-frame counts.
