# Sources and status

Prepared for the requested Thinkin’ Rocks workshop. Campaign status rechecked on 14 October 2026; earlier platform sources checked on 11 October 2026. Speaker notes identify sources for each slide. The visual identity and original images come from the user's local SensWear projects.

| Source | Used for |
|---|---|
| https://luma.com/tr-senswear | Event identity, location and inclusive audience |
| https://sens-wear.com/ | Public platform positioning and collaborations |
| https://sens-wear.com/about/ | Founder names and expertise |
| https://github.com/Sens-Wear | Open platform repositories and scope |
| https://github.com/Sens-Wear/hardware | Hardware access and module architecture |
| https://github.com/Sens-Wear/firmware | Zephyr firmware and device capabilities |
| https://github.com/Sens-Wear/python-sdk | Current Python API and data semantics |
| https://github.com/Sens-Wear/typescript-sdk | React Native client integration |
| https://github.com/Sens-Wear/web-bluetooth-sdk | Browser client integration |
| https://github.com/Sens-Wear/mobile-app | Mobile views, capabilities and CSV export |
| https://app.sens-wear.com/ | Browser application destination |
| https://www.crowdsupply.com/sensera-technologies/senswear-wearable-dev-kit | Campaign state and hardware specifications |
| https://developer.chrome.com/docs/capabilities/bluetooth | Browser/OS support and secure context requirements |
| https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/DefaultWebBluetoothGuardSetting | Edge Web Bluetooth platform support |
| https://revealjs.com/auto-animate/ | Auto-Animate behavior |
| https://revealjs.com/speaker-view/ | Speaker notes and local server behavior |

Local evidence:

- `ai-enabled-wearable-technology`: source photos and course teaching concepts. Legacy toy BLE/CSV examples were not used as current API contracts.
- `SensWear\Deck`: supplied brand design, team photos, platform narrative and proposed cloud roadmap. Funding-dependent dates and financial projections were excluded from workshop slides.
- `SensWear\SDKs\Python`: SDK 0.4.0 API and data types.
- `SensWear\WebApp`: README and current sensor views, CSV export and telemetry behavior.
- `SensWear mobile-app source`: `app/imu/index.tsx`, `app/ppg/index.tsx`, and `components/CsvShareButton.tsx` establish the native mobile capture and Share CSV behavior.

Status distinctions:

- Hardware/firmware/SDKs/apps are current project capabilities, subject to the selected module and firmware build.
- Cloud deployment and managed AI pipelines are roadmap items, not workshop prerequisites or delivered services.
- Crowd Supply said **Coming Soon** on the check date; the deck makes no purchase, price or delivery promise.
- Google Play package `com.senswear.app` was verified in `SensWear mobile-app source\app.json` and the Android build configuration. Official installation availability could not be checked. The presenter should confirm access before the event.
- The CTO appears as Hüseyin Yiğitler on the company site and as Yusein Ali on Crowd Supply and the existing local deck. The workshop uses Hüseyin Yiğitler consistently.

Photo and font provenance is in `assets-manifest.md`. All original PCB details remain unchanged.

## Revised strategic vision

The 5–10-year vision and enterprise examples come directly from Dariush Salami’s workshop revision request. The thesis is that AI-assisted hardware design may become more like software development, and a well-documented open platform could become a reusable foundation for those designs. More adoption could create demand for optional specialist products. This is presented as a bet, not a guaranteed market outcome or an OpenAI/Anthropic partnership.

Potential paid products are a wearable-optimized chip, continuous blood-pressure estimation algorithms, and PPG analogue-front-end configuration/optimization. They are future R&D directions. The core designs and software remain free and open; physical hardware is separately sold.

QR targets:

- https://www.crowdsupply.com/sensera-technologies/senswear-wearable-dev-kit
- https://play.google.com/store/apps/details?id=com.senswear.app

The QR codes use standard error correction M and four-module quiet zones. An independent pixel decoder verified both payloads and Reed–Solomon checks. The vector and raster versions match module by module.

## PPG / temperature revision — 14 October 2026

The cost model is an explicitly illustrative scenario constructed for the workshop, not sourced empirical savings. Its assumptions and scope are visible on slides 2–3 and fully specified in README.md. The 5–10-year AI design vision and optional enterprise products remain user-provided strategic hypotheses.

The AI enabler slide synthesizes these primary sources:

- AlexNet, https://proceedings.neurips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks.pdf — GPU compute, large datasets and publicly available implementation.
- ImageNet, https://www.image-net.org/about.php — a dataset supporting visual-recognition research.
- PyTorch Foundation, https://pytorch.org/blog/PyTorchfoundation/ — open-source collaboration and reusable tools.
- SensWear platform paper, https://arxiv.org/abs/2609.35777 — closed consumer devices, reconfigurability and raw wearable-data access. The slide does not claim AI is absent from health.

Event demo: https://pypi.org/project/senswear-heartrate/0.1.0/ was supplied by the user. The page was not retrievable in this session. Commands, GUI, CSV behavior and estimates were verified from the local version 0.1.0 source and matching release wheel at `SensWear\Usecases\HeartRate`. See TECHNICAL-NOTES.md for file-level detail and wheel hash. The simulator was run to capture the actual app screenshot; it is not measured participant data.

Current Python SDK 0.4.0 was verified against local source and wheel metadata. Current WebApp and `SensWear mobile-app source` source establish PPG/Temperature views and export behavior. Source inspection found the newer PPG sampling-rate/timestamp issue; the former unqualified 200 samples/s claim has been removed.

The implemented SensWear stack is MIT-licensed; third-party dependencies retain their own licenses. The cloud row is explicitly unimplemented. No cloud service is required for the workshop. The official Crowd Supply page confirms MIT access and Coming Soon status as checked on 14 October 2026.
