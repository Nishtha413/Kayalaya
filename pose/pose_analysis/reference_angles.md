# Reference angles and evidence

**Only four numerical ranges exist in the authoritative backend seed, all for Mountain Pose.** No verified paper has been shown to publish these exact numbers. The backend seed is a project configuration, not a scholarly source.

| Pose | Joint | A → B → C (vertex B) | Range (degrees) | Tolerance (degrees) | Evidence |
|---|---|---|---|---|---|
| tadasana | left_hip_knee_ankle | leftHip → leftKnee → leftAnkle | 168–180 | 5 | Backend seed; project-defined, **not journal validated** |
| tadasana | right_hip_knee_ankle | rightHip → rightKnee → rightAnkle | 168–180 | 5 | Backend seed; project-defined, **not journal validated** |
| tadasana | left_shoulder_hip_knee | leftShoulder → leftHip → leftKnee | 170–180 | 5 | Backend seed; project-defined, **not journal validated** |
| tadasana | right_shoulder_hip_knee | rightShoulder → rightHip → rightKnee | 170–180 | 5 | Backend seed; project-defined, **not journal validated** |

The remaining seven backend poses have **no numerical angle ranges**. Frontend `src/data/poseRules.ts` contains provisional guesses for seven poses (including Mountain) but lacks Chair. Do not treat those guesses as published measurements or silently merge them into backend seed.

Calibration proposal: obtain multiple expert-approved demonstrations per pose, camera viewpoint and side; collect high-confidence landmark angles, use robust quantiles (e.g., 10th–90th percentile) as candidate limits, and evaluate against held-out expert ratings. Approve thresholds only after agreement and documented validation.

Borthakur et al. (2023), §3.3/Table 2 supports using joint-angle features, **not** these Mountain numerical limits. <https://www.mdpi.com/2227-9032/11/24/3133>
