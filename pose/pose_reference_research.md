# Pose reference research and evidence audit

This document distinguishes **repository values** from published evidence. The seed contains numerical ranges only for Mountain Pose. The other seven poses are intentionally unset; do not silently assign clinical authority to guessed angles.

| Pose | Joint | Seed range | Evidence status |
|---|---|---|---|
| Mountain Pose | left_hip_knee_ankle | 168–180° | Project-defined; not validated by a cited paper |
| Mountain Pose | right_hip_knee_ankle | 168–180° | Project-defined; not validated by a cited paper |
| Mountain Pose | left_shoulder_hip_knee | 170–180° | Project-defined; not validated by a cited paper |
| Mountain Pose | right_shoulder_hip_knee | 170–180° | Project-defined; not validated by a cited paper |
| Tree Pose | Not configured | None | Project-defined; not validated by a cited paper |
| Downward-Facing Dog | Not configured | None | Project-defined; not validated by a cited paper |
| Warrior II | Not configured | None | Project-defined; not validated by a cited paper |
| Triangle Pose | Not configured | None | Project-defined; not validated by a cited paper |
| Cobra Pose | Not configured | None | Project-defined; not validated by a cited paper |
| Child's Pose | Not configured | None | Project-defined; not validated by a cited paper |
| Chair Pose | Not configured | None | Project-defined; not validated by a cited paper |

## Measurement

For landmarks A–B–C, let u=A−B and v=C−B. Angle at B is acos(clamp((u·v)/(|u||v|),−1,1)) × 180/π. Missing, non-finite, low-visibility or degenerate vectors yield null, not 100%.

## Scoring

For each observed joint, deviation d=max(min−angle,0,angle−max). Joint score = 100×max(0,1−d/(2×max(1,tolerance))). Overall score is the mean of *observed* joints; coverage = observed / required. The pose is marked correct only when all required joints are visible and in range. A missing joint must prevent a correct decision. Scores are engineering metrics, not medical diagnoses.

## Feedback

Use the highest deviation to prioritize a correction. Temporal smoothing should use exponential moving averages of angles and hysteresis on correctness; do not infer depth from a single 2D view.

## Weekly assessment

Weekly mean = sum of scores from the preceding seven days / number of attempts. Per-pose averages use the same method grouped by pose. Missed practice days count dates with no recorded attempts. The current backend history lacks practice duration, so accurate server-backed total practice minutes cannot be computed without a compatible migration.

## Calibration and evidence limitations

No peer-reviewed numerical ranges have been verified for these eight poses in this deliverable. For each pose, collect multiple instructor-approved reference videos from frontal and lateral views; annotate visible joints; estimate the distribution of 2D angles and define initial bounds from inter-rater-agreed measurements; validate against held-out users and camera placements. Record expert identities/qualifications, camera conditions, sample sizes, measurement uncertainty, and range provenance. Existing project-defined thresholds should not be described as published norms.

## Relevant foundational references (not sources of pose-specific numerical ranges)

- Lugaresi, C., et al. (2019). *MediaPipe: A Framework for Building Perception Pipelines*. arXiv:1906.08172. https://arxiv.org/abs/1906.08172 — perception framework, not pose angle norms.
- Bazarevsky, V., et al. (2020). *BlazePose: On-device Real-time Body Pose tracking*. arXiv:2006.10204. https://arxiv.org/abs/2006.10204 — landmark tracking, not yoga-specific normative angles.

These are research preprints, not journal-validated pose-angle references. No DOI is asserted.
