# NASA Space Apps 2026: Submission Form Answers (copy & paste)

> ⏰ **Deadline: Sunday 15 November 2026, 11:59 PM. Submission is final.**
> Replace everything in `[square brackets]` before submitting.

---

## Before you fill the form (to-do list)

1. **Fill in the team details on slide 1** of `CHRONO-OUTPOST_Slides.pptx`: team name, all member names, and the exact challenge title. Then add the game and code links on slide 7.
2. **Upload the slides** (`submission/CHRONO-OUTPOST_Slides.pptx`) to **Google Drive**. Click Share, choose "Anyone with the link can view", and copy the link. This is your **Project Demo** link.
3. **Put the code on GitHub** as a **public** repository. `node_modules` and `dist` are already excluded by `.gitignore`.
4. **Publish the game online** so judges can play it without installing anything. For example, connect the GitHub repo to **Vercel** or **Netlify** with build command `npm run build` and output folder `dist`. The game link (or the GitHub link) is your **Final Project** link.
5. **Test every link in a private/incognito window.** Each must open with no login or permission request.
6. On the website: profile icon → **My Team** → **Project** tab → **Edit** → turn **Lock ON** → paste the answers below → **Save Progress** often.
7. Tick **Terms and Conditions** and **all work is original**, click **Submit for Judging**, and check that the **confirmation banner** appears.

---

## Project Name
**CHRONO-OUTPOST: Rewrite the Mission**

---

## High-Level Project Summary
CHRONO-OUTPOST is a browser game for children aged 7–12 that turns two famous NASA missions that went wrong, Apollo 13 (1970) and Mars Polar Lander (1999), into missions kids can rescue. Players fly through a space storm, crash-land, and then keep a 5-room habitat alive while real space emergencies strike. Each emergency is built from real NASA DONKI space-weather records (solar flares, coronal mass ejections and particle storms) and NASA biology research. With only 10 power units to share, kids must make smart resource trade-offs to survive each problem. After every decision, the game compares their choice with what really happened. It teaches engineering priorities, cause and effect, and real space science, and shows kids that failure is how NASA learns.

---

## Link to Project Demo
`[Public Google Drive link to CHRONO-OUTPOST_Slides.pptx: 7 slides]`

## Link to Final Project
Play the game: https://nasa-hackathon-26.vercel.app
Source code: https://github.com/Isbah-Rani-Abbasi/NASA-HACKATHON-26

---

## Detailed Project Description

**What it does**
CHRONO-OUTPOST lets kids aged 7–12 travel back in time to two real NASA missions that went wrong and rescue them by managing limited resources wisely.

**How it works (game flow)**
1. **Launch:** a friendly mascot, Astro-Bot (an astronaut riding a rocket), welcomes the player.
2. **Pick a world:** the Moon (Apollo 13) or Mars (Mars Polar Lander), with real facts about gravity, air and communication delay.
3. **Mission briefing:** the real history of the mission and what went wrong.
4. **Cockpit storm (15 seconds):** the player steers through meteoroids (Moon) or solar-flare plasma (Mars) labelled with a real NASA DONKI flare. The engine then fails and they crash-land. How well they flew decides how healthy their crew is later.
5. **Habitat survival (the main game):**
   - Astro-Bot explains the goal (this can be skipped).
   - The habitat has 5 rooms in priority order: Life Support (air and heat), Radiation Shield, Power, Space Garden, and the Science Lab.
   - There are only **10 power batteries** to share between them. To boost one room, the player must cut another.
   - Every day ("Sol") an alarm rings and an unexpected event hits: an oxygen tank rupture, a real X-class solar flare, a dust storm, a −80 °C polar night, crew hunger, and more. The order is shuffled every game.
   - The player reroutes power and presses EXECUTE SOL.
   - **Right trade-off:** a success animation plays (the shield deflects flare rays, frost melts, plants grow) and Mission Progress rises.
   - **Wrong trade-off:** the player sees the consequence and a simple science explanation of why it happened.
   - After every Sol, a "NASA Historical Log" compares the player's choice with the real 1970 or 1999 events.
   - "Ask Astro-Bot: what should I do?" gives a hint plus the science behind it.
   - "Inspect Real NASA Data" shows the exact NASA record behind each event.
6. **Victory:** at 100% Mission Progress the Apollo capsule splashes down (or the Mars lander transmits its science home). The player earns a mission patch and sees "Real NASA History vs. Your Rewritten Mission". If they fail, Astro-Bot gives a tip and they can retry.

**Benefits**
- Teaches **resource trade-offs and priorities**, the core of real engineering, through play.
- Shows **cause and effect** visually: every decision has a visible result.
- Introduces **real space science**: space weather, radiation shielding, growing food in space, and staying warm and breathing on other worlds.
- Builds a **healthy view of failure**: mistakes are safe, explained, and lead to learning, just as NASA learned from Apollo 13 and Mars Polar Lander.
- **Accessible:** runs in any web browser with no install. It works offline using a built-in archive of real NASA data, so it suits classrooms with poor internet.

**Our goals**
Make NASA history and science hands-on for young learners, give teachers a 10–15 minute classroom activity, and grow it into more missions (e.g. Artemis base building), a teacher dashboard, and more languages.

**Tools used**
React, Vite, Tailwind CSS, Motion (animation), React Router, Axios, lucide-react icons, canvas-confetti, the HTML5 Canvas and SVG for all illustrations, the Web Audio API for all sound effects (generated in code, no audio files), and Google Fonts (Orbitron, Nunito, Press Start 2P). The slide deck was built with PptxGenJS.

---

## NASA Data
- **NASA CCMC DONKI (Space Weather Database Of Notifications, Knowledge, Information)**, https://ccmc.gsfc.nasa.gov/DONKI-API/
  - We use the **FLR (solar flare), CME (coronal mass ejection) and SEP (solar energetic particle)** endpoints.
  - When online, the game fetches live events from the last 45 days.
  - It also bundles real DONKI records from the **May 2024 solar storms** (X-class flares up to X8.7, CMEs up to 2,678 km/s, and SEP events) so it works offline.
  - Each in-game emergency is tied to a real DONKI record. Players can open the record's ID, flare class or CME speed, time, and a link to NASA's official page.
  - Example: the "X2.2 Solar Flare" event uses the real X2.2 flare from 9 May 2024.
- **NASA biological and physical science research (NASA Open Science Data Repository, https://osdr.nasa.gov, and related NASA publications)**
  - Facts about the **Veggie** plant-growth system and the **VEG-05** experiment on the ISS (red and blue LED grow-lights; the first space-grown lettuce eaten in 2015).
  - Facts on crew nutrition, CO₂ removal and cabin temperature limits.
  - **Curiosity RAD** radiation measurements: about 0.67 mSv/day on Mars and about 1.8 mSv/day during the cruise to Mars.
  - These facts drive the Space Garden, Life Support and Shield events and their explanations.
- **NASA mission history:** Apollo 13 (1970) and Mars Polar Lander / Mars Climate Orbiter (1999), from NASA's mission records and review board findings. They are used for the briefings, the "NASA Historical Log" after each decision, and the final history comparison.

*Note on accuracy: neither real mission was caused by a solar storm. Space weather is the game's challenge, and the in-game history panels always tell the true story. Two values are clearly labelled "game settings" rather than measurements: a 400 µmol/m²/s grow-light level and a −80 °C polar night.*

---

## Space Agency Partner and Other Data
- **NASA:** DONKI API and data (as above); OSDR / NASA life-science research facts; NASA mission history for Apollo 13, Mars Polar Lander and Mars Climate Orbiter; Curiosity RAD findings.
- **No other space agencies' data** was used.
- **Open-source software (MIT or similar licences):** React, React DOM, React Router, Vite, Tailwind CSS, Motion, Axios, lucide-react, canvas-confetti, oxlint, PptxGenJS, sharp.
- **Fonts:** Orbitron, Nunito, Press Start 2P (Google Fonts, SIL Open Font License).
- **Slide icons:** Font Awesome icons via react-icons (Font Awesome Free, CC BY 4.0).
- **Images:** all game illustrations (astronauts, mascot, planets, Earth, habitat, cockpit) were drawn in code as SVG or Canvas. No photos or third-party images are used. No NASA logos, insignia or official mission patches are used; the in-game patches are our own designs.
- **Audio:** all sounds are generated in code with the Web Audio API; no recorded audio is used.
- `[Add anything else your team used, e.g. reference images or websites]`

---

## Use of AI
- **Claude (Anthropic), through Claude Code**, was used to:
  - help write most of the game's code (React components, game rules, NASA DONKI data service)
  - create the SVG/Canvas illustrations and animations in code
  - generate the sound effects in code
  - organise the NASA data files and draft in-game text
  - build the slide deck and draft this submission text
- Our team created the concept, chose the NASA missions and learning goals, designed the game flow and visual style (including reference artwork for the look we wanted), directed and reviewed all AI output, tested the game, and checked the facts.
- Screenshots of the game in our slides carry a visible **"AI-generated"** label, as required.
- `[Add any other AI tools your team used, e.g. ChatGPT or Gemini for brainstorming, and what for]`

---

## Final compliance checklist
- [ ] Everything is in English
- [ ] Slides: 7 or fewer, including team name, member names, challenge, project images, user experience and NASA data ✅
- [ ] All links open in an incognito window with no login
- [ ] No NASA logos, flags or official mission insignia
- [ ] AI use disclosed, and AI-generated images watermarked ✅
- [ ] No personal details (birthdays, addresses) and no names or images of anyone under 18
- [ ] Terms ticked, originality ticked, **Submit for Judging** clicked, confirmation banner seen
