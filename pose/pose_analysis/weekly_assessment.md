# Weekly assessment and backend compatibility

The existing seed defines seven program days; it is **not** a separate weekly exam schedule. Use the poses assigned to each day from `GET /api/program/days`, not a new sequence. Backend `GET /api/progress/status` defines completion as ≥1 recorded attempt for each assigned `(day_number,pose_id)`; final test unlocks only when all days are complete. Person 3 must not bypass that server decision.

`src/pose/person3.ts` `weeklySummary()` aggregates valid recorded attempts in a rolling 7×24-hour window: mean score = arithmetic average of valid 0–100 attempts; pose means by numeric pose ID; completed attempts count; unique UTC dates practiced; missed UTC dates = 7−unique dates; improvement = second-half mean minus first-half mean (percentage points), null if either half has no attempts. `practiceSeconds` is null unless duration values are provided. These are project-defined metrics, **not** a validated clinical weekly score.

Backend `GET /api/progress/history` returns pose_id, day_number, accuracy_score, created_at; **does not expose duration, valid-frame counts, model confidence, or weekly pass status**. Hence duration and valid-frame quality cannot be reconstructed from current API. The client must not fabricate them. Store per-frame quality locally or propose a minimal reviewed backend extension.

No separate weekly pass threshold is defined in the repository. Options for team approval: (A) reporting only, without pass/fail; (B) add an explicitly approved score threshold and server validation. Existing final-test lock remains unchanged.
