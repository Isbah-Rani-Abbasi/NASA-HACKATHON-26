# CHRONO-OUTPOST: Rewrite the Mission

A kid-friendly (ages 7–12+) space survival game for the **2026 NASA Space Apps Challenge**.
Players fly through a space storm, survive a crash landing, and run an outpost on the Moon or Mars
using **real NASA DONKI space weather alerts**, turning famous NASA setbacks into wins.

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Script            | What it does              |
| ----------------- | ------------------------- |
| `npm run dev`     | Start the dev server      |
| `npm run build`   | Production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint`    | Lint with oxlint          |

## Game flow

1. **`/`: Landing.** Astro-Bot's 3-step intro (or Skip Intro), then **MOVE TO COMPETITION →**.
2. **`/sectors`: Sector hub.** Choose *Mission on Moon* or *Mission on Mars*.
3. **`/moon` and `/mars`: Briefings.** Active mission card plus locked "Coming Soon" missions.
4. **`/cockpit/:missionId`: Cockpit dodge game.** 15 seconds, steered with Arrow/WASD keys or mouse/touch drag.
   - Moon: flaming meteoroids. Mars: solar-flare plasma bolts labelled with a real DONKI flare.
   - Ends with a scripted engine overload, a shockwave, an explosion and a crash landing.
   - **Hull integrity carries over**: a stronger hull means healthier crew at the outpost.
5. **`/outpost/:missionId`: Habitat survival.** An animated 5-room habitat cutaway shares one **10-unit zero-sum power grid**:
   - Tier 5 Life Support Bay · Tier 4 Radiation Shield Dome · Tier 3 Solar & Reactor Bay · Tier 2 NASA OSDR Space Garden · Tier 1 Earth Return Lab (Moon) / Comms & Science Lab (Mars)
   - Each room holds 0–5 cells, set with − / + buttons on the room cards or inside the cutaway itself.
   - Every Sol brings a mission-specific **Unexpected Event** (oxygen tank rupture, X2.2 flare, dust storm, SEP storm...) built from real DONKI records and OSDR biology facts.
   - **EXECUTE SOL is always enabled.** Correct trade-offs play a success animation and add Mission Progress; wrong ones play a consequence animation and explain why in kid-friendly STEM terms. Each Sol ends with a **NASA Historical Log** comparing the choice with the real 1970 / 1999 mission.
   - **Astro-Bot co-pilot:** if the player hasn't solved the event within 5 seconds, or boosts the wrong room, a hint appears and the rooms glow ▲ BOOST / ▼ CUT.
   - **🔬 Inspect Real NASA Data** opens a drawer with the DONKI event ID, flare class or CME speed, and the OSDR metrics behind the Sol.
   - **Events arrive automatically.** Each one opens with a full-screen alarm and siren, and an animation for its type: falling flare rays, creeping frost, a dust storm, a shadow sweep, wilting food or radar pings. After each Sol's report, the next event arrives by itself after 15 seconds (it can be paused, or skipped with NEXT SOL NOW).
   - **🤖 Ask Astro-Bot** is available on every event. It says which room to boost and which to cut, and explains the science behind it.
   - **Victory:** Mission Progress reaches 100% with Life Support above 0. You get confetti, an animated Apollo splashdown or Mars lander transmission, a mission patch, and *Real NASA History vs. Your Rewritten Mission*.
   - **Failure:** Life Support or Crew Health hits 0, or 8 Sols run out. Astro-Bot gives a tip and offers **RETRY MISSION**.

## Project structure

```
src/
  App.jsx                     Routes + persistent backdrop + top bar
  components/
    SpaceBackdrop.jsx         60fps canvas: stars, nebulae, planets, meteors (variants per page)
    AstroBotMascot.jsx        Robot SVG, typewriter speech bubble, Next/Skip, Spotlight guide mode
    TopBar.jsx                Logo, breadcrumb, global Mute/Unmute
    PlanetGlobe.jsx           Rotating planet canvas for sector cards
    OutpostScene.jsx          Interactive 5-room habitat cutaway (frost, forcefield, cables, garden, lab)
    EventAlarm.jsx            Full-screen incoming-event alarm with per-event animations
    MissionAchievedWindow.jsx Victory animation: Apollo splashdown / Mars lander transmitting
    MissionPatch.jsx          Collectible "History Rewritten" patch
  pages/                      Landing, Sectors, MissionBriefing, Cockpit, Outpost
  services/
    apiClient.js              Axios instance (VITE_API_BASE_URL) for a future Express backend
    spaceWeatherService.js    DONKI FLR/CME/SEP fetch + offline fallback + Sol forecast builder
  utils/
    soundEffects.js           Web Audio synth: clicks, beeps, whoosh, alarm, explosion, fanfare
    planetRenderer.js         2.5D rotating planet renderer for canvas
    outpostSimulation.js      Pure game rules: 10-unit grid, events, consequences (backend-portable)
  data/
    missions.json             Mission config, starting subsystems, themes, history rewrite text
    donki_fallback.json       Real DONKI records from the May 2024 (Gannon) solar storms
    mission_events.json       Unexpected Events per mission, hints and NASA historical logs
    osdr_biology.json         NASA OSDR plant (VEG-05 / Veggie) and crew physiology facts
```

## Space weather data

- Live events come from `https://ccmc.gsfc.nasa.gov/DONKI-API/get/{FLR|CME|SEP}` over the last 45 days.
- If the request fails, times out, or returns too few events, the game uses
  `src/data/donki_fallback.json`, which holds actual DONKI records for May 1–31, 2024 (X-class flares up to X8.7,
  CMEs up to 2,678 km/s, and SEP events). The game works fully offline.
- The alert card shows a **LIVE FEED** or **ARCHIVE · MAY 2024 STORMS** badge and links to each DONKI record.

## Biology data

`src/data/osdr_biology.json` collects NASA plant and crew-health facts: Veggie and VEG-05, CO₂, thermal limits,
nutrition, and radiation dose measured by Curiosity's RAD instrument. Values that are game settings rather than
published measurements are labelled "game setting" (for example the 400 µmol/m²/s grow-light level and the −80 °C polar night).

## Configuration

Copy `.env.example` to `.env` to override:

- `VITE_API_BASE_URL`: the base URL for your future Node/Express backend (used by `apiClient`).
- `VITE_DONKI_BASE_URL`: an alternative DONKI endpoint.

## History notes

The "Real NASA History" panels are factual. The space-weather challenges are a game twist:
Apollo 13's real problem was an oxygen tank explosion, and Mars Polar Lander was most likely lost when its engine shut off too early during descent.
Neither failure was caused by a solar storm.
