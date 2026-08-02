# Mission 89 v1.2 — Initialization Protocol

## Added
- Missions no longer begin automatically when the app is installed or opened.
- New pre-start System screen with an explicit **Initialize Mission** action.
- Existing automatic/legacy start dates are ignored until the user deliberately starts.
- Settings now includes Mission Control for starting or returning to pre-start without deleting logs.
- Navigation is locked to Dashboard and Settings until the mission is initialized.
- Initial purple-blue System visual direction introduced.

## Migration
Users upgrading from v1.1 will see **Mission Awaiting Start**, even if the old build had already counted days. Press Initialize Mission only when ready; that date becomes Mission Day 1.
