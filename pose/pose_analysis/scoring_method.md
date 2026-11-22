# Scoring specification

For joint i with measured angle θ and accepted range [L,U], deviation `e=max(L−θ,0,θ−U)`. With tolerance T>0, `s_i=100×max(0,1−e/(2T))`. With positive weights w, `pose_score=Σ(w_i s_i)/Σ(w_i)` over **valid** joints only, but report a numeric score only when coverage `Σ(valid w)/Σ(all w) >= 1.0` (default). Missing landmarks therefore **never earn points** or receive an automatic 100.

Status: `unavailable` if no rules or insufficient coverage; `correct` only if every measured joint lies inside its range and score >= 85; otherwise `adjust`. 85 is a project UI threshold, not a validated clinical boundary. Pose-recognition confidence is not posture accuracy; `confidenceCoverage` is a separate completeness proxy, not model confidence.

Illustrative example (not research): range 80–100°, tolerance 10°, angle 105° → error 5° → joint score 75. A second joint with score 100 and equal weights gives pose score 87.5, but status remains `adjust` because the first joint is outside range.

All scoring choices are engineering decisions requiring instructor/expert approval and inter-rater evaluation.
