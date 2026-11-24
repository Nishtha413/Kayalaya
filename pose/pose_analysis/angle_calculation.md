# Joint angle calculation

Implementation: `src/pose/person3.ts`, `jointAngle()`. For A–B–C, vertex B, define `u=A−B`, `v=C−B`. Calculate `θ=acos(clamp((u·v)/(|u||v|),−1,1)) ×180/π`. This returns 0–180 degrees. Default uses image x/y coordinates; 3D is optional only if all z values share a coherent coordinate system. Reject missing/nonfinite coordinates, visibility below 0.5, and vectors with norm < 1e−8.

Left/right are separately named. Mirroring requires an explicit side-swap decision for asymmetric poses; it is not automatically inferred. 2D projected angles depend on camera viewpoint; a frontal or oblique camera may distort a side-view bend. `smooth(previous,current,alpha=0.3)` provides an optional exponential moving average; reset on tracking loss or pose change.

Source: Borthakur et al. (2023), §3.3 (angle extraction and camera-angle limitation). The paper’s displayed vector directions differ from the vertex-oriented vectors used here; our formula explicitly measures the interior angle at B.
