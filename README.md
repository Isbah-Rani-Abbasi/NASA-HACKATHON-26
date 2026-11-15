# CHRONO-OUTPOST: Rewrite the Mission

A kid-friendly (ages 7–12+) space survival game for the **2026 NASA Space Apps Challenge**.
Players travel back to two real NASA missions that went wrong (**Apollo 13** and **Mars Polar Lander**),
fly through a space storm, survive a crash landing, and run a habitat on the Moon or Mars.
They solve emergencies built from **real NASA DONKI space-weather data** and **NASA OSDR biology facts**
by making smart **resource trade-offs**, and rewrite history.

> The 7-minute judge pitch and demo script are in [PITCH.md](PITCH.md).

## Quick start

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

| Script            | What it does               |
| ----------------- | -------------------------- |
| `npm run dev`     | Start the dev server       |
| `npm run build`   | Production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint`    | Lint with oxlint           |

## Game flow

1. **`/`: Landing.**
   - **CHRONO** (left) has cute astronauts hanging from strings; **OUTPOST** (right) has the mission intro.
   - Astro-Bot (an astronaut riding a rocket) gives a short welcome that can be skipped.
   - Clicking a feature pill makes Astro-Bot explain that feature.
   - **🚀 LAUNCH MISSION** goes to the Sector Hub.
2. **`/sectors`: Sector Hub.**
   - Choose **Mission on Moon** (16.6% gravity, no atmosphere) or **Mission on Mars** (38% gravity, thin CO₂ air, comms delay).
3. **`/moon` and `/mars`: Mission boards.**
   - The active mission card shows the real history and a **LAUNCH MISSION** button.
   - Locked "Coming Soon" missions sit beside it.
   - **Ask Astro-Bot: what should I do?** plays a mission briefing on request.
4. **`/cockpit/:missionId`: Cockpit storm dodge (15 seconds).**
   - First-person sci-fi cockpit with an overhead switch panel, struts, and a console with LEDs, throttle levers, radar and telemetry.
   - Steer with the arrow keys / WASD or by dragging with the mouse or a finger.
   - Moon: flaming meteoroids. Mars: solar-flare plasma bolts labelled with a real DONKI flare.
   - The stage ends with a scripted **engine overload**, a shockwave, an explosion and a crash landing.
   - **Hull integrity carries over**: a stronger hull means a healthier crew at the outpost.
5. **`/outpost/:missionId`: Habitat survival.**
   - **Landing intro:** Astro-Bot explains the 5 rooms, the 10-battery trade-off, surprise events and how to win. It can be skipped, and the first event waits until it closes.
   - **5-room animated cutaway** sharing one **10-unit zero-sum power grid**. Each room holds 0–5 cells, set with − / + buttons on the room cards or inside the cutaway:
     - Tier 5 Life Support Bay (oxygen and heat)
     - Tier 4 Radiation Shield Dome
     - Tier 3 Solar & Reactor Bay
     - Tier 2 NASA OSDR Space Garden
     - Tier 1 Earth Return Lab (Moon) / Comms & Science Lab (Mars), which drives Mission Progress
   - **Unexpected Events:** 5 per mission (10 in total), **shuffled into a new order every mission and every retry**. One arrives each Sol with a full-screen alarm, a siren, and an animation for its type: falling flare rays, creeping frost, a dust storm, a shadow sweep, wilting food or radar pings.
   - **5-second decision timer.** When it runs out, the timer shows "NEED HELP?".
   - **🚀 Ask Astro-Bot: what should I do?** Astro-Bot flies in only when asked. It names the room to boost and the rooms to cut (glowing ▲ BOOST / ▼ CUT) and explains the science behind it.
   - **EXECUTE SOL is always enabled.**
     - Correct trade-offs play a success animation and add Mission Progress.
     - Wrong ones play a consequence animation and explain *why* in kid-friendly STEM terms.
     - Each Sol ends with a **NASA Historical Log** comparing the choice with the real 1970 / 1999 mission.
   - The next event arrives by itself after 15 seconds. It can be paused, or started now with **NEXT SOL NOW**.
   - **🔬 Inspect Real NASA Data** opens a drawer with:
     - the DONKI event ID, flare class or CME speed, time and a link to the official record
     - the OSDR metrics, plus a "Why This Matters" note
   - **Victory:** Mission Progress reaches 100% with Life Support above 0. Confetti, an animated Apollo splashdown or Mars lander transmission, a collectible mission patch, and *Real NASA History vs. Your Rewritten Mission*.
   - **Failure:** Life Support or Crew Health hits 0, or 8 Sols run out. Astro-Bot gives a tip and offers **RETRY MISSION**.

### Navigation

- **Home** (custom command-base icon) appears on every page except active missions.
- **← Back to Sector Hub** sits in the top bar on the Moon and Mars boards.
- **🚪 Exit Mission** appears in the Cockpit and Outpost and asks before leaving (Mission Select or Home).
- The **Sound On / Muted** toggle is always available. All sounds are generated live with the Web Audio API.

### Unexpected Events

| Apollo 13 (Moon) | Room to boost | Mars Polar Lander (Mars) | Room to boost |
| --- | --- | --- | --- |
| 🧊 Oxygen Tank #2 Rupture & Deep Freeze | Life Support 5/5 | 🌪️ Global Martian Dust Storm | Reactor 4/5 |
| ☀️ NASA DONKI X2.2 Solar Flare | Shield 4/5 | ☢️ NASA DONKI SEP Particle Storm | Shield 4/5 |
| 🌑 Lunar Eclipse Shadow | Reactor 4/5 | 🥶 Polar Sub-Zero Night (−80 °C) | Life Support 5/5 |
| 🥬 OSDR Crew Calorie Drop | Garden 4/5 | 🌱 OSDR Hydroponic Nutrient Cycle | Garden 4/5 |
| 🚀 Trans-Earth Injection Burn | Return Lab 4/5 | 📡 Orbital Relay Uplink Window | Science Lab 4/5 |

A player who makes every trade-off correctly usually wins in about 5 Sols. Mistakes stretch the mission up to 8 Sols, and after the first 5 the events repeat in a new shuffled round.

## Project structure

```
src/
  App.jsx                     Routes + persistent backdrop + top bar
  components/
    SpaceBackdrop.jsx         Animated canvas: stars, nebulae, meteors, lunar/Martian scenes, Sun radar
    LandingPlanets.jsx        Drifting stylized planets on the landing page
    HangingFigures.jsx        Line-art astronauts hanging from strings under CHRONO
    RocketMascot.jsx          Astro-Bot rocket mascot + typewriter dialogue (Next/Skip, spotlight, dock mode)
    TopBar.jsx                Logo, Home, Back to Sector Hub, Exit Mission, Mute/Unmute
    PlanetGlobe.jsx           Rotating planet canvas for the sector cards
    EarthSticker.jsx          Illustrated sticker-style Earth (used on the Apollo trajectory map and victory screen)
    OutpostScene.jsx          Interactive 5-room habitat cutaway (frost, forcefield, cables, garden, lab)
    EventAlarm.jsx            Full-screen incoming-event alarm with per-event animations
    MissionAchievedWindow.jsx Victory animation: Apollo splashdown / Mars lander transmitting
    MissionPatch.jsx          Collectible "History Rewritten" patch
  pages/                      Landing, Sectors, MissionBriefing, Cockpit, Outpost
  services/
    apiClient.js              Axios instance (VITE_API_BASE_URL) for a future Express backend
    spaceWeatherService.js    DONKI FLR/CME/SEP fetch, offline fallback, per-event DONKI record picker
  utils/
    soundEffects.js           Web Audio synth: clicks, beeps, whoosh, alarm, explosion, fanfare
    planetRenderer.js         2.5D rotating planet renderer for canvas
    outpostSimulation.js      Pure game rules: 10-unit grid, events, consequences (backend-portable)
  data/
    missions.json             Mission config, themes, briefings, history rewrite text, patches
    donki_fallback.json       Real DONKI records from the May 2024 (Gannon) solar storms
    mission_events.json       Unexpected Events per mission: alarms, hints, science notes, NASA historical logs
    osdr_biology.json         NASA OSDR plant (VEG-05 / Veggie) and crew physiology facts
```

All illustrations are hand-built animated SVG or canvas. The game uses no image or audio files.

## Space weather data

- Live events come from `https://ccmc.gsfc.nasa.gov/DONKI-API/get/{FLR|CME|SEP}` over the last 45 days.
- If the request fails, times out, or returns too few events, the game uses
  `src/data/donki_fallback.json`, which holds actual DONKI records for May 1–31, 2024 (X-class flares up to X8.7,
  CMEs up to 2,678 km/s, and SEP events). The game works fully offline.
- Events show a **LIVE DONKI** or **DONKI ARCHIVE · MAY 2024** badge and link to each official DONKI record.

## Biology data

`src/data/osdr_biology.json` collects NASA plant and crew-health facts: Veggie and VEG-05, CO₂, thermal limits,
nutrition, and radiation dose measured by Curiosity's RAD instrument. Values that are game settings rather than
published measurements are labelled "game setting" (for example the 400 µmol/m²/s grow-light level and the −80 °C polar night).

## Configuration

Copy `.env.example` to `.env` to override:

- `VITE_API_BASE_URL`: the base URL for a future Node/Express backend (used by `apiClient`).
- `VITE_DONKI_BASE_URL`: an alternative DONKI endpoint.

## History notes

The "Real NASA History" panels are factual. The space-weather challenges are a game twist:
Apollo 13's real problem was an oxygen tank explosion, and Mars Polar Lander was most likely lost when its engine shut off too early during descent.
Neither failure was caused by a solar storm.
