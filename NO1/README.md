# Wearables in sync

A 10-minute Reveal.js guest talk by Dariush Salami, SensWear, for **Thinkin’ Rocks: Nerd Out III, 20 October 2026**.

## Present

**Double-click `START-PRESENTATION.cmd`.** It starts a local Node.js server and opens the deck in your browser. There are no packages to install. Keep its terminal open while presenting. The server only accepts connections from this computer.

Alternatively, run `node server.cjs` from this folder. The default address is `http://127.0.0.1:8123`; if that port is occupied, the server selects a free port and prints its address.

You can also open `index.html` directly. The slides, images, fonts and interactive demos work offline. Reveal.js speaker view requires the local server. Internet is needed only when following external references or opening the Crowd Supply campaign.

- **Arrow keys / Space:** advance. **Left arrow:** previous.
- **F:** full screen. **S:** speaker notes, next slide and timer. Allow the popup if prompted.
- **Esc:** overview. **B:** black screen.
- **? button:** controls. Sliders support mouse, touch and keyboard.
- The closing QR remains visible on the final slide. The deck does not loop or auto-advance.

`speaker-notes.html` is a separate readable rehearsal script. `presentation.pdf` is a static backup. Its demos show representative states and do not respond to input.

## Running order

| Slide | Topic | Time | Running time |
|---|---|---:|---:|
| 1 | What if your wearables shared a clock? | 0:35 | 0:35 |
| 2 | Three devices. One body. | 0:50 | 1:25 |
| 3 | One heartbeat. Two arrival times. | 1:05 | 2:30 |
| 4 | The effect of clock error | 1:05 | 3:35 |
| 5 | Arterial stiffness and wave speed | 1:00 | 4:35 |
| 6 | Health research possibilities | 1:10 | 5:45 |
| 7 | What acquisition-time synchronization needs | 1:00 | 6:45 |
| 8 | SensWear as an open experimental platform | 1:10 | 7:55 |
| 9 | A concrete first experiment | 1:05 | 9:00 |
| 10 | Invitation and Crowd Supply QR | 1:00 | 10:00 |

## Demo cues

**Slide 4:** Start at +10 ms: the measured delay is 50 ms and estimated PWV is 4.0 m/s. Move to −10 ms: 30 ms and 6.7 m/s. Click **Synchronize clocks**: 40 ms and 5.0 m/s. The assumed 0.20 m path and all signals are illustrative. The button models ideal correction, not a live hardware connection.

**Slide 5:** Increase relative wall stiffness, then click **Replay wave**. Four times the effective stiffness gives twice the speed in this fixed-pressure, fixed-geometry tube model. The animation is 50× slower than the numerical scenario. **Pause motion** freezes it. Reduced-motion preferences pause the animation by default.

## Content boundaries

- The campaign was **Coming Soon** when checked on 16 October 2026. The closing call to action is to follow it, with no price or shipping promise.
- SensWear provides open hardware, firmware and access to raw sensor streams. This talk proposes precise synchronization between devices as a research experiment. It does not claim a validated current millisecond alignment specification.
- PWV relates to arterial stiffness under measurement conditions. It does not isolate intrinsic elasticity or establish cuffless blood pressure by itself.
- Consumer ring, watch and earbud raw-data access is not assumed. Ear physiological sensing refers to research hearables.
- All plots are synthetic teaching examples. The anatomy-style hero is an AI-generated concept illustration. Product photos and the exploded render are from SensWear materials. Z-Anatomy models and Blender were not used.

Scientific references, source mapping, asset credits and technical caveats are in `sources.html` and `SOURCES.md`. Image-generation provenance is in `image-generation.md`. Reveal.js 5.2.1 and its MIT license are bundled locally in `vendor/`. Manrope and its OFL license are in `assets/`.

## Editing

- `index.html`: slide text and speaker notes.
- `styles.css`: typography, colors and layout.
- `deck.js`: the two interactive teaching models and charts.
- `assets/`: local imagery, logo, font and campaign QR.
- `sources.html`: readable technical appendix and references.

All visible company branding uses **SensWear**. Keep the entire folder together when copying the deck to another computer.
