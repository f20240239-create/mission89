
## v1.1.1 — ASCEND Brand Identity
- Replaced the legacy green M89 icon with the approved dark blue-purple ASCEND emblem.
- Added complete PWA icon sizes, maskable icon, favicon, splash branding and header branding.
- Updated service-worker cache to deploy the new visual identity without resetting user data.
## v1.1.0 — Adaptive Training

ASCEND can now modify workouts without losing the purpose of the program. Exercise substitutions are ranked by movement pattern, primary muscle, difficulty and available equipment. Changes can be applied for today only or saved permanently to the weekday routine. Existing data is migrated in place; no reset is required.

# ASCEND v1.0 — Daily Driver

This is the first build intended for real daily use.

## Training Intelligence
- Detailed per-set load and rep logging.
- Automatic next-session progressive-overload targets.
- Estimated one-rep-max history and PR-range detection.
- Plateau detection after repeated exposures without measurable progress.
- Conservative variety suggestions rather than random forced exercise changes.
- Exercise notes for form, pain, machine settings and technique cues.
- Seven-day muscle-volume analysis.
- Complete-training action synchronizes the daily workout objective.

## Mess Allocation Engine
- Select the foods currently available in the college mess.
- Receive practical quantities in katoris, serving spoons, glasses, rotis and pieces.
- Allocation uses remaining calories and protein, hunger level and workout timing.
- Mess utensil calibration is stored locally.
- Estimated meals can be logged directly into the daily check-in.
- Recommendations show remaining calories and protein after the proposed plate.

## Data Integrity
- Training sessions, mess profile and meal history are included in export/import backups.
- Storage schema upgraded to version 5 without deleting previous check-ins.
- Service-worker cache upgraded to ASCEND v1.0.0.

## Important
Mess meals cannot be measured perfectly without a scale. ASCEND deliberately labels these values as estimates. Use the same utensils consistently and recalibrate if your mess changes its serving tools.

ASCEND is local-first. Export a backup regularly, especially before clearing browser data or changing devices.

## v1.1.0 — Performance-Gated Overload

Progression is now earned by performance rather than scheduled by time. ASCEND keeps the current load while total clean reps improve, recommends a load increase only after all prescribed sets reach the top of the rep range, and does not lower the target after one weak session.
