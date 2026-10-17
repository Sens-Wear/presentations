# Wearables in sync — sources and technical notes

Dariush Salami · SensWear · Thinkin’ Rocks: Nerd Out III · 20 October 2026.

Public product information checked **16 October 2026**. A formatted companion is available in [sources.html](sources.html). The deck explores a research direction; it does not report a completed SensWear clinical study or demonstrated precise multi-device synchronization.

## Slide map

| Slide | Subject | Evidence or provenance |
|---|---|---|
| 1 | What if your wearables shared a clock? | Event listing [13]; AI concept-image record below. |
| 2 | Three devices. One body. | Research in-ear sensing [5]. Consumer sensor and raw-data access are conditional. |
| 3 | One heartbeat. Two arrival times. | Multi-site acquisition and short-distance timing [1]. The waveforms and 0.20 m / 40 ms example are synthetic. |
| 4 | 10 milliseconds can change the answer | Original arithmetic; see the clock model below. No hardware is connected. |
| 5 | Stiffer arteries carry a faster wave | Ideal tube scaling; physiological interpretation [3, 4]. |
| 6 | New insights live in the relationships | Regional PPG study [6], research hearables [5], synchronized multi-sensor dataset [1]. Recovery/context framing is a research proposal. |
| 7 | A shared clock starts at the sensor | Timestamp placement and offset/drift compensation [7, 8]; physiological timing requirements [1]. |
| 8 | SensWear makes the experiment buildable | Official hardware/firmware [10], current SDK contract [11]. |
| 9 | The first experiment: two sites, one pulse | Proposed workflow; PAT/PTT distinction [2] and separate BP validation [9]. |
| 10 | What would you measure together? | Official Crowd Supply campaign [12], real user-provided product photograph. |

## Technical appendix

### Pulse timing and route

**PTT** is pulse-wave transit time between arterial sites. **PWV = arterial path length / PTT.** It describes pressure-wave propagation, not blood-cell velocity. Use comparable waveform upstrokes; waveform shape and reflections can alter peak timing. [1]

**PAT = PEP + PTT** under a consistent timing convention. An ECG event precedes mechanical ejection, so ECG-to-peripheral-pulse time includes pre-ejection period (PEP). It is not pure vascular transit. The cited PAT/PTT comparison is an animal experiment, not human wearable validation. [2]

Ear and finger lie on separate arterial branches. Ear–finger delay is a difference in arrival times from a common origin, not direct propagation along an ear-to-finger vessel. A wrist–finger experiment needs appropriate same-side placement, an arterial route and a defensible path estimate. Straight-line sensor separation is not automatically arterial path length. These are geometric assumptions to test in the proposed experiment.

### What stiffness means

Wrist–finger timing concerns the selected peripheral segment. It is not a measurement of central aortic stiffness. PWV can support research into stiffness-related changes under comparable conditions, but pressure, smooth-muscle tone, wall thickness, diameter and measurement site also influence the result. PWV alone does not isolate intrinsic material elasticity or Young’s modulus. [3, 4]

### Timing and the error budget

An illustrative clock transformation is `t_shared = a × t_local + b`: offset is corrected by `b`, and clock-rate mismatch by `a`. Repeated observations are needed because clocks continue to drift. FTSP is a primary example of wireless timestamping and drift compensation; SharkTooth specifically addresses BLE body-sensor synchronization. Their implementation results are not SensWear performance guarantees. [7, 8]

The useful quantity is end-to-end timing uncertainty. It includes acquisition timing, sampling interval, oscillator drift, timestamp generation, FIFO buffering, filter delays, packet loss, placement, motion and waveform detection. A timestamp at phone arrival contains transport and queue delays. At 100 Hz, samples are 10 ms apart; interpolation may refine feature timing under suitable assumptions but does not guarantee accuracy. [1]

### Cuffless BP requires separate calibration and validation

The demo has no universal conversion from wave speed to mmHg. A BP-estimation algorithm needs its own model, calibration strategy, independent reference measurements and testing across intended users, conditions and time since calibration. Liu et al. evaluated smartwatch methods under calibration-based and calibration-free strategies; the population and strategy affected performance. That study does not validate SensWear or the proposed network. [9]

### Consumer devices and SensWear today

The proposed ring/watch/earbud network assumes appropriate sensors, raw waveforms and trustworthy acquisition timing. It does not assume arbitrary consumer-brand interoperability, access to raw optical signals, or physiological measurement by every AirPod or earbud. The ear physiology example is a research earpiece. [5]

The SensWear SDK documents microsecond timestamp fields for IMU/touch, millisecond interpolated PPG timestamps and effective PPG sampling at 200 samples/s/channel. Its Bluetooth Current Time Service uses whole-second UTC values; `fractions256` currently reports/writes zero. Timestamp resolution is not clock accuracy. No validated millisecond cross-device synchronization is established by these interfaces. SensWear is a research/prototyping platform; precise network synchronization is the proposed next experiment. [10, 11]

## Synthetic demonstration models

No human recordings, clinical data or measured SensWear performance are plotted. All waveforms and diagrams are original SVG teaching graphics generated by `deck.js`.

### Clock-offset demo

Assumed arterial path: `L = 0.20 m`. True transit: `40 ms`. True speed: `5.0 m/s`.

`v_est = 0.20 / ((40 + offset_ms) / 1000)`

| Finger clock offset | Apparent transit | Estimated PWV | Relative error |
|---|---:|---:|---:|
| −10 ms | 30 ms | 6.67 m/s | +33.3% |
| 0 ms | 40 ms | 5.00 m/s | 0% |
| +10 ms | 50 ms | 4.00 m/s | −20.0% |

The slider spans −20 to +20 ms. Positive offset labels the finger event too late. The body and waveform shape stay unchanged. The synchronization button sets the modeled error to zero; it does not perform real synchronization. Noise, morphology changes, processing and path errors are intentionally omitted. The numerical values are not health thresholds.

### Relative-stiffness demo

`v(k) = 5 × sqrt(k) m/s`

`PTT(k) = 200 / v(k) ms`

Here `k` is an assumed effective wall-stiffness ratio, with fixed geometry, fluid density and operating pressure. The square-root dependence follows ideal Moens–Korteweg scaling. [3, 4]

| Relative stiffness k | Speed | Transit across 0.20 m |
|---:|---:|---:|
| 1.00 | 5.0 m/s | 40.0 ms |
| 2.25 | 7.5 m/s | 26.7 ms |
| 4.00 | 10.0 m/s | 20.0 ms |

The animated expansion is a schematic cue, not a solved pressure–diameter model. The visible wave is slowed 50×. Real arteries are nonlinear; this model is not fitted to a person. The moving dot is a pressure disturbance, not flowing blood.

## Primary references and official sources

1. Mehrgardt P, Khushi M, Poon S, Withana A. **Pulse Transit Time PPG Dataset, version 1.1.0.** PhysioNet, 2022. DOI: 10.13026/jpan-6n92. [Dataset and methods](https://physionet.org/content/pulse-transit-time-ppg/1.1.0/). Cited for research context; no data are redistributed or plotted.
2. Zhang G, Gao M, Xu D, Olivier NB, Mukkamala R. **Pulse arrival time is not an adequate surrogate for pulse transit time as a marker of blood pressure.** Journal of Applied Physiology 111:1681–1686, 2011. DOI: 10.1152/japplphysiol.00980.2011. [Publisher article](https://journals.physiology.org/doi/full/10.1152/japplphysiol.00980.2011) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/21960657/).
3. Steppan et al. **Seeking a blood pressure-independent measure of vascular properties.** Hypertension Research 39:27–38, 2016. DOI: 10.1038/hr.2015.109. [Publisher article](https://www.nature.com/articles/hr2015109).
4. Hermeling et al. **Noninvasive Assessment of Arterial Stiffness Should Discriminate Between Systolic and Diastolic Pressure Ranges.** Hypertension 55:124–130, 2010. DOI: 10.1161/HYPERTENSIONAHA.109.143867. [Publisher PDF](https://www.ahajournals.org/doi/pdf/10.1161/HYPERTENSIONAHA.109.143867) · [PubMed](https://pubmed.ncbi.nlm.nih.gov/19933922/).
5. Goverdovsky et al. **Hearables: Multimodal physiological in-ear sensing.** Scientific Reports 7:6948, 2017. DOI: 10.1038/s41598-017-06925-2. [Publisher article](https://www.nature.com/articles/s41598-017-06925-2) · [Open full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC5537365/).
6. Bentham M, Stansby G, Allen J. **Innovative Multi-Site Photoplethysmography Analysis for Quantifying Pulse Amplitude and Timing Variability Characteristics in Peripheral Arterial Disease.** Diseases 6:81, 2018. [Open primary article](https://pmc.ncbi.nlm.nih.gov/articles/PMC6165367/). A regional pilot study; not a diagnostic validation of the proposed network.
7. Maróti M, Kusy B, Simon G, Lédeczi Á. **The Flooding Time Synchronization Protocol.** Vanderbilt University technical report ISIS-04-501, 2004. [Institutional full-text PDF](https://www.isis.vanderbilt.edu/sites/isis.vanderbilt.edu/files/bibcite_files/Maroti_M_2_12_2004_The_Floodi_0.pdf).
8. Landra N, Demarchi D, Motto Ros P. **SharkTooth: A Scalable Real-Time Algorithm for BLE-Based Wireless Body Sensor Networks Synchronization.** IEEE Internet of Things Journal, 2025. DOI: 10.1109/JIOT.2025.3602162. [Institutional publication record and manuscript](https://iris.polito.it/handle/11583/3002564). Further reading; no implementation is included in this deck.
9. Liu et al. **Cuffless Blood Pressure Measurement Using Smartwatches: A Large-Scale Validation Study.** IEEE Journal of Biomedical and Health Informatics 27:4216–4227, 2023. DOI: 10.1109/JBHI.2023.3278168. [Publisher article](https://doi.org/10.1109/JBHI.2023.3278168) · [Primary abstract](https://pubmed.ncbi.nlm.nih.gov/37204948/).
10. **SensWear official platform.** [Website](https://sens-wear.com/) · [Organization and research-use notice](https://github.com/Sens-Wear) · [Hardware](https://github.com/Sens-Wear/hardware) · [Firmware](https://github.com/Sens-Wear/firmware). Checked 16 October 2026.
11. **SensWear Python SDK documentation.** [RTC synchronization](https://github.com/Sens-Wear/python-sdk#device-time-and-rtc-synchronization) · [PPG contract](https://github.com/Sens-Wear/python-sdk#ppg). Checked 16 October 2026.
12. **SensWear Wearable Dev Kit — Crowd Supply.** [Official campaign and QR destination](https://www.crowdsupply.com/sensera-technologies/senswear-wearable-dev-kit). **Coming Soon** on 16 October 2026. Use “Follow SensWear,” not an implication that funding, purchasing or shipping has begun.
13. **Thinkin’ Rocks: Nerd Out III.** [Luma listing](https://luma.com/tr-nerdout-III). 20 October 2026, Espoo. The event requests 10–12-minute talks with short Q&A; this deck is paced for ten minutes.

## Asset provenance and licenses

| Asset | Origin and use |
|---|---|
| `assets/body-network-hero.png` | AI concept illustration produced with the built-in image generation tool on 16 October 2026. Generic devices and artistic anatomy; no actual interoperability or physiological accuracy claimed. Cyan arcs are data links. Exact prompt and record: [image-generation.md](image-generation.md). |
| `assets/exploded-ring.jpg` | Existing user-provided SensWear product render reused from local workshop assets; not generated for this talk. Credit: SensWear. |
| `assets/hero-kit.jpg` | Existing user-provided SensWear photograph reused from local workshop assets. Shows an actual ring, flexible main board and debugger. Credit: SensWear. |
| `assets/senswear-logo.svg` | Official asset from the [SensWear website](https://sens-wear.com/wp-content/uploads/2026/06/SensWear-Logo.svg). Brand rights remain with SensWear. |
| `assets/qr-crowd-supply.png` | Reused from the existing workshop asset set. Payload is the campaign URL in reference 12. The workshop source record documents prior independent decoding and Reed–Solomon checks. |
| SVG teaching diagrams | Original code-generated waveforms, tube animation and transport timeline in `deck.js`. Synthetic data only. |
| `assets/Manrope.ttf` | Copyright 2018 The Manrope Project Authors. [Original project](https://github.com/sharanda/manrope). Local license: [Manrope-OFL.txt](assets/Manrope-OFL.txt), SIL Open Font License 1.1. |
| Reveal.js in `vendor/` | [Official Reveal.js project](https://revealjs.com/), MIT license. |

**No Z-Anatomy models were used. No Blender anatomy render or rendered video was produced for this version.** The artery motion is a browser animation. References remain with their authors and publishers; citation does not imply endorsement.
