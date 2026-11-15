# CHRONO-OUTPOST: Rewrite the Mission
### NASA Space Apps Challenge 2026: Pitch & Demo Guide (7 minutes)

---

## 1. The one-line pitch

> **CHRONO-OUTPOST is a space survival game for kids aged 7–12+. Players travel back in time to two real NASA missions that went wrong (Apollo 13 and Mars Polar Lander), use real NASA space-weather and biology data to make engineering trade-offs, and rewrite history.**

---

## 2. The thought behind it (why we built this)

1. **NASA's greatest lessons came from failures.** Apollo 13 is called a "successful failure" because the whole world watched engineers solve problems live. Kids rarely get to *feel* what that pressure is like.
2. **Most space-science content for kids is passive.** Kids read facts and watch videos. We wanted them to **make decisions and see the consequences**, the way flight controllers do.
3. **Real data, not made-up numbers.** Every crisis in the game comes from a real record in **NASA DONKI**, the space-weather database run by NASA's Community Coordinated Modeling Center at Goddard. It also uses facts from **NASA OSDR** (Open Science Data Repository) about plant growth and astronaut health.
4. **Trade-offs are the heart of engineering.** In real spacecraft, power, oxygen and mass are limited. We made the core mechanic a **10-unit power grid**: to boost one room you *must* cut another. Kids learn priorities, not just facts.
5. **Mistakes are allowed.** The "Execute Sol" button is always enabled. A wrong choice plays a consequence animation and explains *why* in kid-friendly STEM terms. That's how NASA learns, and it's how kids learn.

---

## 3. The real NASA stories we used

### Apollo 13: "The Lunar Lifeboat" (April 1970)
- **Crew:** Jim Lovell, Jack Swigert, Fred Haise. Launched **April 11, 1970**.
- **What went wrong:** about **56 hours** into the flight (April 13), **Oxygen Tank 2 exploded** in the Service Module. They lost most of their oxygen and power, and the Moon landing was cancelled.
- **How they survived:**
  - The crew moved into the **Lunar Module "Aquarius"** and used it as a lifeboat.
  - Engineers on the ground invented a **square-to-round CO₂ filter adapter** (the "mailbox") from duct tape, plastic bags, hoses and a flight-plan cover.
  - The cabin cooled to about **3 °C (38 °F)**, water was rationed to about **6 oz per person per day**, and the crew lost **31.5 lb (14 kg)** between them.
- **Record:** looping around the far side of the Moon, they reached **400,171 km** from Earth, still the farthest humans have ever travelled.
- **Ending:** splashdown in the **Pacific Ocean on April 17, 1970**. Everyone survived, but **no Moon science was done**.
- **In our game:** the player gets the chance to finish the mission and complete the science Apollo 13 never could.

### Mars Polar Lander: "The Red Storm" (1999)
- **Launched January 3, 1999** to study water ice near Mars' south pole.
- **What went wrong:** contact was lost on **December 3, 1999**, during the final descent, and no signal ever came back.
- **Most likely cause:** when the landing legs snapped open, the jolt was mistaken for touchdown, so the computer **shut off the engine too early**, while the lander was still high above the surface.
- **Same year:** **Mars Climate Orbiter**, meant to help relay the lander's data, was lost on **September 23, 1999** because one team used **imperial units (pound-force)** and another used **metric (newtons)**.
- **What NASA learned:** the **Phoenix lander** reached the Martian polar region safely in **2008** and confirmed water ice in the soil.
- **In our game:** the player stabilizes the lander, survives the polar night, and transmits the ice-core science home.

> **Honesty note for judges:** Neither mission was actually hit by a solar storm. The real failures were an oxygen tank and a software/sensor problem. **We add real space weather as the game's challenge**, and the "Real NASA History" panels in the game always tell the true story. We say this openly because accuracy matters to us.

### The real space-weather data: the May 2024 "Gannon" solar storms
- Our built-in data is **real NASA DONKI records from May 2024**, the strongest geomagnetic storm to hit Earth in about 20 years.
- It includes **X-class flares up to X8.7**, **coronal mass ejections up to 2,678 km/s**, and **solar energetic particle (SEP) storms**.
- When online, the game pulls **live** DONKI events from the last 45 days. When offline, it automatically uses the May 2024 archive, so the demo **never breaks**.

---

## 4. How the game works (what judges will see)

| Stage | Page | What happens | What kids learn |
|---|---|---|---|
| 1 | **Landing** | CHRONO-OUTPOST title, hanging astronauts, Astro-Bot (rocket mascot) welcome | Mission framing |
| 2 | **Sector Hub** | Choose **Moon** (16.6% gravity, no air) or **Mars** (38% gravity, thin CO₂ air, comms delay) | Planetary differences |
| 3 | **Mission Board** | Mission briefing with the real history; locked "coming soon" missions | Historical context |
| 4 | **Cockpit** | 15-second first-person dodge through meteoroids (Moon) or solar-flare plasma labelled with a real DONKI flare (Mars). Ends with an engine explosion and crash landing | Hazards in space; your hull strength carries over |
| 5 | **Habitat Outpost** | Animated 5-room cutaway. Each Sol an alarm announces a real NASA-data crisis; you reroute **10 power units** between rooms and press **EXECUTE SOL** | Priorities, trade-offs, cause and effect |
| 6 | **Victory / Retry** | Apollo splashdown or Mars lander transmitting, a collectible mission patch, and **"Real NASA History vs. Your Rewritten Mission"** | Reflection |

### The 5 habitat rooms (highest priority to lowest)
1. **Tier 5: Life Support Bay** (oxygen and heat). If it hits 0%, the mission fails.
2. **Tier 4: Radiation Shield Dome**: a forcefield against solar flares and particle storms.
3. **Tier 3: Solar & Reactor Bay**: keeps power flowing. Neglect it and you get a brownout with fewer units.
4. **Tier 2: NASA OSDR Space Garden**: VEG-05 / Veggie-style red and blue grow-lights feed the crew.
5. **Tier 1: Earth Return Lab (Moon) / Comms & Science Lab (Mars)**: drives **Mission Progress** to 100% to win.

### The 10 Unexpected Events (each tied to real data)

| Apollo 13 | Correct move | Mars Polar Lander | Correct move |
|---|---|---|---|
| 🧊 Oxygen Tank #2 Rupture & Deep Freeze | Life Support **5/5** | 🌪️ Global Martian Dust Storm | Reactor **4/5** |
| ☀️ NASA DONKI **X2.2** Solar Flare (real flare, May 9 2024) | Shield **4/5** | ☢️ NASA DONKI SEP Particle Storm | Shield **4/5** |
| 🌑 Lunar Eclipse Shadow | Reactor **4/5** | 🥶 Polar Sub-Zero Night (−80 °C) | Life Support **5/5** |
| 🥬 OSDR Crew Calorie Drop | Garden **4/5** | 🌱 OSDR Hydroponic Nutrient Cycle | Garden **4/5** |
| 🚀 Trans-Earth Injection Burn | Return Lab **4/5** | 📡 Orbital Relay Uplink Window | Science Lab **4/5** |

**Demo tip:** to boost a room you must first press **−** on others. A safe pattern is to give the target room what it needs, keep **2 in Life Support**, and spread the rest.

### Features to point out during the demo
- **Full-screen event alarm** with a siren and an animation that matches the event: falling flare rays, creeping frost, a dust storm, a shadow sweep, wilting food or radar pings.
- **5-second decision timer.**
- **🚀 "Ask Astro-Bot: what should I do?"** The mascot flies in only when asked, with the hint and a **"🧠 Why? Learn the science"** explanation.
- **Live cause and effect in the cutaway:** frost and shivering astronauts when Life Support is low, the cyan forcefield deflecting flare rays, energy pulses along power cables, lettuce growing under pink grow-lights, the Moon-to-Earth trajectory map or the "Comms Delay: 14 min" dish.
- **📜 NASA Historical Log** after every Sol, comparing the player's decision with what really happened.
- **🔬 Inspect Real NASA Data** drawer: the exact DONKI event ID, flare class or CME speed, the time, location on the Sun, a link to the official record, OSDR metrics, and "Why This Matters".

---

## 5. THE 7-MINUTE PITCH SCRIPT (with live demo)

> Before you start, have the game open on the **Landing page** in full screen with **sound on**. Practise the Outpost moves using the table above.

### 0:00 – 0:40 | Hook (Speaker 1)
> "**'Houston, we've had a problem.'** In April 1970, an oxygen tank exploded on Apollo 13, 200,000 miles from home. In 1999, Mars Polar Lander went silent seconds from touching down. Two of NASA's most famous failures.
> What if a 10-year-old could go back in time, sit in mission control, and **rewrite those missions** using **real NASA data**?
> This is **CHRONO-OUTPOST: Rewrite the Mission**."

### 0:40 – 1:20 | The idea (Speaker 1)
> "NASA's greatest lessons came from failures, but kids usually just *read* about them. We wanted them to **make the decisions**.
> Our game is built on three ideas: **real NASA data** (DONKI space weather and OSDR biology), **real engineering trade-offs**, and **mistakes are allowed**, because that's how NASA learns."

### 1:20 – 2:00 | Landing → Sector → Mission board (Speaker 2, demo)
- On **Landing**, point at Astro-Bot and the feature pills, then click **🚀 LAUNCH MISSION**.
- On the **Sector Hub**: "Kids choose the Moon, with 16.6% gravity and no air, or Mars, with 38% gravity, thin CO₂ air and a comms delay."
- Click **ENTER LUNAR SECTOR**, then show the **Apollo 13** briefing with its real history. Click **LAUNCH MISSION**.

### 2:00 – 2:50 | Cockpit (Speaker 2, demo)
> "Stage one: the storm. Kids steer with the keyboard or by touch to dodge meteoroids for 15 seconds. **Your hull strength carries over** and keeps your crew healthier later."
- Let it end: **WARNING: MAIN ENGINE OVERLOAD!**, then the explosion and crash landing.
> "Just like Apollo 13, something goes wrong that you can't avoid. Now you have to survive."

### 2:50 – 5:20 | Habitat Outpost: the core (Speaker 2 drives, Speaker 3 explains)
1. **Alarm fires automatically.**
   > "Every Sol a real crisis hits. This is Oxygen Tank #2, the actual Apollo 13 failure. The alarm animation matches the event."
2. **The trade-off.**
   > "Here's the key mechanic: only **10 power units** for 5 rooms. To boost Life Support to 5, I have to cut the Shield and the Lab."
   - Press **−** on Shield and Lab, then **+** on Life Support. Point at the frost melting, the green O₂ bubbles and the astronauts cheering.
3. **Ask Astro-Bot.**
   > "If a kid is stuck, they tap **Ask Astro-Bot**. The mascot only shows up when asked. It says what to do **and explains the science**."
4. **Execute Sol**, then the **NASA Historical Log**.
   > "Every decision is compared with what really happened in 1970."
5. **Next event: the X2.2 Solar Flare.**
   > "This flare is a **real NASA DONKI record** from the May 2024 Gannon storm."
   - Open **🔬 Inspect Real NASA Data** and show the event ID, flare class, time and the link to NASA's record.
   - **Make a mistake on purpose:** leave the Shield low and execute.
   > "Wrong choice: radiation leaks in and the crew takes damage. The game explains **why**: radiation damages body cells, so astronauts shelter behind shielding. Mistakes teach."

### 5:20 – 6:00 | Victory and Mars (Speaker 3)
> "Reach 100% Mission Progress and the crew splashes down in the Pacific. Kids unlock a mission patch and see **Real NASA History vs. Their Rewritten Mission**."
> "The **Mars** campaign uses five different events: a global dust storm, an SEP particle storm during the **14-minute comms blackout**, a −80 °C polar night, a hydroponic garden cycle, and a relay-satellite uplink window. It connects to the real **Mars Climate Orbiter units mix-up**."
*(If time allows, show a pre-recorded clip or a screenshot of the victory screen instead of playing to the end live.)*

### 6:00 – 6:40 | How we built it (Speaker 4)
> "It's a **React web app**, so it runs on any school computer or tablet with no install.
> - **Live NASA DONKI API**, with an **offline fallback** of real May 2024 data, so it works in any classroom.
> - Every illustration is **hand-built animated SVG**, and every sound is **generated by code**: no image or audio files.
> - The game rules are kept separate from the screens, so a backend for teachers, leaderboards and progress tracking can plug in later."

### 6:40 – 7:00 | Impact and close (Speaker 1)
> "CHRONO-OUTPOST teaches **space weather, life support, plant science and engineering priorities** through play, with real NASA data and real NASA history.
> Next: more missions, like **Artemis Base Alpha** and **Olympus Mons**, a teacher dashboard, and multiplayer mission control.
> NASA turned failures into lessons. **We let kids do the same.** Thank you!"

---

## 6. Demo-day checklist
- [ ] Laptop charged, browser in **full screen**, zoom 100%, **sound on** (test the speakers).
- [ ] Run `npm run dev` beforehand, or a production build with `npm run build` then `npm run preview`.
- [ ] Open the game on the **Landing page**. The Astro-Bot intro typing is a nice opener.
- [ ] Know the correct moves (table in section 4) so the demo flows.
- [ ] **Wi-Fi fails?** No problem: the game switches to the built-in May 2024 data automatically ("ARCHIVE" badge).
- [ ] Assign who talks and who clicks. Rehearse to **6:45** to leave a buffer.
- [ ] Have a **backup screen recording** of a full run, including the victory screen.

---

## 7. Likely judge questions & answers

**Q: Did solar storms really cause these failures?**
No. Apollo 13 was an oxygen tank explosion, and Mars Polar Lander was most likely an early engine shutdown. Space weather is our game challenge, and it's real data. The game's "Real NASA History" panels always tell the true story.

**Q: Where exactly does the data come from?**
NASA CCMC **DONKI** API (solar flares, CMEs, SEP storms), live or from a bundled archive of real May 2024 records with their official event IDs and links. Biology facts come from NASA research on **Veggie/VEG-05** plant growth, crew nutrition, CO₂ and thermal limits, and radiation measured by **Curiosity's RAD** instrument (about 0.67 mSv/day on the Martian surface).

**Q: What is made up?**
The game mechanics: the power numbers, the event-to-room rules, and two game settings we label clearly (the 400 µmol/m²/s grow-light level and the −80 °C polar night temperature).

**Q: Why is it good for learning?**
Kids learn by doing: prioritizing (Tier 5 → Tier 1), cause and effect (visible consequences), reading real data (the Inspect drawer), and reflecting (the Historical Log after every decision). Mistakes are safe and explained.

**Q: Who is it for and how would schools use it?**
Ages 7–12+. It runs in any browser with no install and works offline. A classroom session could be one mission (about 10–15 minutes) followed by a discussion of the real history.

**Q: What would you build next?**
More missions (the locked Artemis and Olympus Mons cards), a teacher dashboard, saved progress through the backend we prepared for, more languages, and accessibility options.

---

## 8. Key numbers to remember
- **2** real missions, **10** unexpected events, **5** habitat rooms, **10** power units, **15-second** cockpit stage, **8** Sols maximum.
- **400,171 km**: Apollo 13's distance record.
- **May 2024**: the strongest geomagnetic storm in about 20 years, the source of our offline data.
- **X8.7**: the biggest flare in our data. **2,678 km/s**: the fastest CME.
- **14 minutes**: the Earth–Mars comms delay in the game. The real one-way delay ranges from about 4 to 24 minutes.
