# Real-time feedback rules

Implementation: `src/pose/person3.ts` `evaluate()` and `smooth()`. For each joint, angle below min → `below` message; above max → `above` message; within range → no correction. Rank violations by normalized deviation `error/tolerance`; display **only the highest-priority** correction to avoid contradictory simultaneous messages. Missing/low-confidence required landmarks supersede corrections with “Move your full body into the camera view.”

Suggested Mountain rule messages (require expert wording review): knee below minimum → “Straighten your left/right leg gently”; shoulder–hip–knee below minimum → “Stand tall and align your torso.” The opposite direction should use a neutral “Ease the joint angle slightly,” not an instruction to hyperextend. For the other seven poses, specific threshold-triggered messages remain pending backend rule calibration; provisional frontend messages exist in `src/data/poseRules.ts`.

For live UI, smooth angle estimates with EMA α=0.3 and hold a new feedback message for e.g. 3 consecutive valid frames before switching. The EMA helper is implemented; a frame-count hysteresis controller has **not** been wired to the live hook. Avoid injury-prevention or medical claims.
