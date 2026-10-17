# SensWear × Thinkin' Rocks — PPG + temperature workshop

29 Reveal.js slides: the original cover and 15 slides for the introduction and vision, 8 hands-on slides, and 5 optional references. The running example is raw PPG and body/sensor temperature, followed by heart-rate and SpO₂ estimation in the event demo. There are no agenda durations on slides.

## Open

Open the hosted presentation at https://presentations.sens-wear.com/WS1/ or use this folder locally. Keep `index.html`, `styles.css`, `revision.css`, `ppg.css`, `deck.js`, `assets`, `examples` and `vendor` together. This folder contains the complete presentation.

Double-click `START.cmd`, or run `npm start` and open **http://127.0.0.1:8765**. Node.js is required for the included server; no npm installation is needed. If the browser starts before the server is ready, refresh it.

You can also open `index.html` directly. Reveal.js, fonts and images are bundled for offline presentation. The speaker window works best through the local server. App downloads, external links and Python package installation need internet access.

| Control | Action |
|---|---|
| Right / Space | Next reveal or slide |
| Left | Previous reveal or slide |
| S | Speaker notes |
| O / Esc | Slide overview |
| F | Fullscreen |
| B | Blackout |
| Chapter breadcrumb | Jump to a section |

`/#/kit` opens the hands-on section. `?static` shows all fragments without animation. `?print-pdf` uses Reveal.js print layout; print from Chromium in landscape with backgrounds enabled. Presenter shortcuts appear at bottom left on hover.

## New sequence

| New slide(s) | Content | Previous slide(s) |
|---|---|---|
| 1 | Original cover, unchanged except chapter links | 1 |
| 2–3 | Bespoke-build cost/time; SensWear reuse comparison | New |
| 4–6 | Platform, form factor, modules | 5–7 |
| 7 | Layered stack and the people who use each layer | New |
| 8 | Team | 14 |
| 9 | Hardware, open science and data as AI enablers | New |
| 10–16 | The bet, AI design, foundation, adoption, enterprise, roadmap, campaign | 15–21 |
| 17–19 | Kit and hardware setup | 24–26 |
| 20 | Four client routes, including the event demo | 27 |
| 21–23 | Android, Python SDK, browser | 28–30 |
| 24 | PPG/temperature capture and derived estimates | 31, rewritten |
| 25–29 | Troubleshooting and references | 37–41 |

Previous slides 22–23 and 32–36 are removed. Earlier introductory content is consolidated into the requested shorter sequence. The breadcrumb reads **Why / SensWear / The bet / Build / Reference**.

## Presenting the estimate

The cost comparison on slides 2–3 uses one **illustrative engineering scenario**, not a measured benchmark or a published SensWear price. The shared milestone is an on-body prototype recording raw PPG and local skin temperature over BLE to CSV in a simple reference form factor.

| Assumption | Bespoke stack | Reusing SensWear |
|---|---:|---:|
| Engineering hours | 800 | 16 |
| Assumed loaded rate | €80/hour | €80/hour |
| Hardware/build allowance | €6,000 | €500–€1,500 illustrative kit/module budget |
| Modelled total | €70,000 | €1,780–€2,780 (≈€1.8–2.8k) |
| Elapsed working time | 12 weeks | 2 days |

The custom engineering breakdown is electronics/PCB 240 h, firmware/BLE 240 h, client integration/testing 120 h, enclosure 80 h and system checks/rework 120 h. The build allowance is three PCB builds at €1,500 plus €1,500 for enclosure/parts. Two engineers work in parallel across 12 weeks with overlapping fabrication. This is a bespoke full-stack scenario; a simpler development-board solution can cost much less.

The SensWear route assumes an experienced engineer, a compatible kit already in hand, supported firmware, an existing client and usable enclosure/fixture. Its 16 h covers setup 4 h, capture 2 h, fixture 4 h and checks/documentation 6 h. The €500–€1,500 kit/module budget range is an illustrative modelling input, **not announced SensWear pricing**. Labour is 16 h × €80 = €1,280. The total is €1,780–€2,780 (approximately €1.8–2.8k). Dividing €70,000 by the range endpoints gives approximately 25–39× lower modelled cost; the time-to-prototype ratio remains 30× in this scenario. They are not universal performance promises. Faster prototyping can shorten the path to market; no 30× Time To Market claim is made. Product engineering, clinical validation, certification and production are outside both estimates.

## Before the workshop

- Identify each kit so attendees select the right Bluetooth device. Use one client per kit.
- Check the fitted sensors and firmware. The current PPG board used by the event app also carries the MAX30208 temperature sensor; older course images can show a different revision.
- Fit modules and flex cables while unpowered. Demonstrate connector orientation with the actual kit.
- Rehearse live PPG and temperature capture. A temperature indication can take a full scheduled interval to arrive.
- Test Google Play access from an attendee account. The Android package is verified from source, but store availability was not independently installed in this session.
- Crowd Supply still said **Coming Soon** on 14 October 2026. Recheck before presenting; no launch date, price or delivery promise is included.
- Keep live observations separate from simulated signals. The deck's event-app screenshot is explicitly labelled simulated.

## Four client routes

**Android:** scan the QR code, connect the assigned kit and open PPG or Temperature. The feature view automatically captures data. Use the top-right **Share CSV** icon before leaving the view. Feature logs retain the latest 20,000 rows and are cleared when leaving that route. The current app enables a 60-second temperature interval if the schedule is disabled; otherwise it preserves the existing interval.

**Python SDK:** run from the extracted presentation folder with Python 3.10+ and a BLE adapter:

```sh
python -m pip install -r examples/requirements.txt
python examples/record.py --scan
python examples/record.py --address "DEVICE_ID" --label rest --sync-clock
```

The supplied recorder defaults to 75 seconds and requests a 60-second temperature interval. Each run creates a unique folder containing `ppg.csv`, `temperature.csv` and `manifest.json`. Use a different `--label` for changed contact. It records raw signals, original device timestamps and separate host arrival timestamps; it does not calculate HR/SpO₂. The optional clock write is not precise synchronization. The script restores prior settings and reports missing data. SDK is pinned to `senswear==0.4.0`.

**Browser:** open https://app.sens-wear.com/ in a supported Chrome/Edge environment. Connect the kit and open PPG or Temperature. For temperature set **Interval in seconds** to 60 and choose **Apply interval**. Use **Pause → Clear recording → Resume**, then **Pause → Export CSV**. Capture is view-specific; use Python or the event demo for ongoing PPG and temperature together. Export before reconnecting, reloading or closing. Current feature logs cap at 50,000 rows. Supported route: Chrome/Edge on Windows/macOS; Chrome on Android/ChromeOS. Prefer Python on Linux. Safari/Firefox/iOS browsers are not supported for this Web Bluetooth route.

**Event demo — senswear-heartrate 0.1.0:** https://pypi.org/project/senswear-heartrate/0.1.0/

```sh
python -m pip install "senswear-heartrate[gui]==0.1.0"
python -m senswear_heartrate --list-devices
python -m senswear_heartrate --device "DEVICE_ID"
```

The plain `python -m senswear_heartrate` launch is also supported. Use `--simulate` for synthetic data. The app shows raw red/IR/green PPG, a processed pulse waveform, temperature, estimated HR and uncalibrated SpO₂. Use **Record CSV** to start/stop capture. **Pause display** freezes plots only; analysis and recording continue. Export files are `<prefix>_ppg.csv`,`<prefix>_temperature.csv` and `<prefix>_metrics.csv`. A fixed `--record PREFIX` is overwritten on reuse, so use a new prefix per clip or let the app generate one. Explicitly label synthetic recordings yourself.

## Signal interpretation

Start with steady contact, save a clip, then gently change contact and save another. Watch raw signals and quality before discussing derived values. The event app reports experimental HR and **uncalibrated SpO₂**; these are not medical measurements. Temperature is local sensor/skin temperature, not validated core-body temperature.

Do not assume 200 samples/s from older firmware documentation. The current event-app source reports about 25 delivered PPG samples/s/channel on its tested firmware 0.1.0 and a batch timestamp mismatch. Its processing repairs batch timing for analysis; original PPG CSV timestamps remain unmodified. The raw workshop recorder also preserves them. Actual rate and behavior depend on the firmware. See `TECHNICAL-NOTES.md` for exact fields and source details.

## Editing and verification

Edit `index.html` for slide text/notes,`ppg.css` for this revision's layouts,`styles.css`/`revision.css` for shared styles and `deck.js` for Reveal behavior. Original PCB imagery is untouched. Reduced-motion preferences are respected. The campaign and Android QR codes are clickable and bundled locally.

Structural checks cover slide order/count, internal links, local resources, notes and the removal of gesture examples. QR payloads were independently decoded and checked. The Python recorder passed syntax/help and mocked capture/error/cleanup checks; no physical Bluetooth capture was available in this session. The previous 28-slide PPG deck was rendered at 1600 x 900 in QtWebEngine/Chromium and visually inspected. The restored original cover and cost comparison were rendered and inspected in the current 29-slide deck. No overflow, clipped elements, broken images or JavaScript errors were detected in these checks. The updated ring captions also received a targeted recheck.
