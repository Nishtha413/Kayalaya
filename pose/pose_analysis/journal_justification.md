# Journal-based justification and evidence boundaries

| Design choice | Evidence and exact location | Supports | Does not establish |
|---|---|---|---|
| Landmark-based angle features | Borthakur et al. 2023, §3.1–3.3, Table 2 | Keypoints and 2D angle features for yoga pose classification | Kayalaya-specific angles or clinical correctness |
| Camera perspective warning | Borthakur et al. 2023, §3.3 | x/y joint angles vary with camera angle; z may help | Viewpoint invariance for Kayalaya |
| Real-time feedback motivation | Borthakur et al. 2023, abstract and §1 | Motivates real-time computer-vision feedback | Validates Kayalaya message text or thresholds |
| Pose scoring formula | Project engineering design | Transparent, repeatable scoring | A published/validated 0–100 posture accuracy metric |
| EMA and feedback prioritization | Project engineering design | Practical UI stability proposal | Journal-validated EMA alpha or dwell time |
| Weekly aggregation | Project engineering design, constrained by backend | Reproducible seven-day reporting | Medical or psychometric weekly validity |

Thoutam et al. (2022) was supplied as a starting reference but its full text could not be verified in this session; do not cite it as verified support until independently inspected.
