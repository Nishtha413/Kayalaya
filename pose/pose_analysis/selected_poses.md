# Selected poses and landmarks

Authoritative pose identifiers from `backend/app/seed/seed_data.json` (not generated numeric database IDs, which vary by database).

| Backend pose_name | Frontend client_id | Display name | Required joints currently configured in backend |
|---|---|---|---|
| `tadasana` | `mountain` | Mountain Pose | `left_hip_knee_ankle`, `right_hip_knee_ankle`, `left_shoulder_hip_knee`, `right_shoulder_hip_knee` |
| `vrikshasana` | `tree` | Tree Pose | None configured |
| `adho_mukha_svanasana` | `downward-dog` | Downward-Facing Dog | None configured |
| `virabhadrasana_ii` | `warrior-2` | Warrior II | None configured |
| `trikonasana` | `triangle` | Triangle Pose | None configured |
| `bhujangasana` | `cobra` | Cobra Pose | None configured |
| `balasana` | `childs` | Child's Pose | None configured |
| `utkatasana` | `chair` | Chair Pose | None configured |

For Mountain, the required landmarks are left/right shoulder, hip, knee and ankle as applicable to the four configured triplets. MediaPipe Pose exposes 33 landmarks; frontend rules use camelCase (`leftHip`, `leftKnee`, `leftAnkle`, `leftShoulder`, etc.). For other poses, backend-required landmarks cannot yet be declared because their backend angle lists are empty. `src/data/poseRules.ts` has provisional joint triplets for seven poses, but no Chair entry; these are candidate rules, not authoritative calibrated references.

Missing, low-visibility (<0.5), nonfinite, or degenerate triplets are invalid. If required coverage is incomplete, the assessment returns `unavailable` with no numeric score. Front/back, side, mirrored, and occluded views must be validated separately.
