# Mission 89

A complete, installable Progressive Web App for a 20-day personal transformation — built with plain HTML, CSS, and JavaScript. No backend, no build step, no dependencies. Every byte of your data stays on your device in `localStorage`.

## Folder structure

```
mission89/
├── index.html            Single-page app shell (all views live here)
├── manifest.json          PWA manifest (name, icons, theme)
├── service-worker.js       Offline cache-first app shell
├── css/
│   └── style.css          Full design system (tokens, components, animations)
├── js/
│   ├── storage.js          localStorage data layer
│   ├── utils.js            dates, scoring, streaks, formatting
│   ├── workoutData.js      the 7-day workout split
│   ├── dashboard.js        Home tab
│   ├── checkin.js          Daily Check-in tab
│   ├── workout.js          Train tab
│   ├── nutrition.js        Fuel tab
│   ├── progress.js         Progress tab (chart, stats, history)
│   ├── calendar.js         Calendar tab
│   ├── photos.js           Progress Photos tab
│   ├── coach.js            Coach tab (on-device rule-based feedback)
│   ├── settings.js         Settings tab (targets, export/import, reset)
│   └── app.js              Navigation + init controller
└── icons/                  Generated app icons (all required PWA sizes)
```

## Running it

Any static file server works — the app has no backend.

```bash
cd mission89
python3 -m http.server 8080
# open http://localhost:8080
```

Or just open `index.html` directly in a browser (some browsers restrict service workers on `file://`, so a local server is recommended for testing offline mode and installability).

To deploy for real: upload the whole `mission89/` folder as-is to any static host (Netlify, Vercel, GitHub Pages, S3, your own server). No build step required.

## Installing on your phone

1. Host the folder somewhere reachable over HTTPS (required for service workers/installability outside `localhost`).
2. Open the URL in Safari (iOS) or Chrome (Android).
3. iOS: Share → "Add to Home Screen." Android: Chrome will prompt "Install app," or use the menu → "Install app."
4. Launch it from your home screen — it opens full-screen, works offline, and keeps all your data.

## How your data is stored

Everything lives in `localStorage` under a few keys (`m89_settings`, `m89_checkins`, `m89_photos`, `m89_workout_log`, `m89_meta`). Nothing is sent anywhere. Use **Settings → Export data** regularly to save a JSON backup, and **Settings → Import backup** to restore it (e.g. after clearing browser data or switching devices).

## Customizing your targets

Open **Settings** to edit your goal weight, mission length, daily calorie/protein/water/step/sleep targets. The workout split (Push/Pull/Legs+Abs/Upper/Lower+Shoulders/Arms+Abs/Active Recovery) is defined in `js/workoutData.js` if you want to change exercises, sets, or reps.

## Notes on the Coach tab

The coach gives feedback generated entirely on-device from rules applied to your logged numbers (no AI API, no network call) — it compares today's check-in against your targets and recent weight trend and surfaces what's working and what to fix.
