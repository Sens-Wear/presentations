# Technical notes: PPG + temperature workshop (14 October 2026)

## Raw-data exercise

`examples/record.py` now records red/IR/green raw PPG and temperature by default, with no IMU dependency. It preserves `--scan`, `--address`, `--label`, `--duration`, `--sync-clock` and `--output`. A unique clip directory contains `ppg.csv`, `temperature.csv` and `manifest.json`.

Recommended commands from the deck folder:

```sh
python -m pip install -r examples/requirements.txt
python examples/record.py --scan
python examples/record.py --address "DEVICE_ID" --label rest --duration 75 --sync-clock
```

SDK pin is `senswear==0.4.0`, verified against local package metadata/source. Temperature is indication-only: subscribe, set interval in whole-minute multiples (60 seconds by default), and allow a full interval for the first result. Previous PPG sampling, IRQ cadence and temperature interval are restored on cleanup. If PPG remains silent after three seconds, the recorder performs the IRQ-cadence recovery documented in the heart-rate application's source and records the event in its manifest.

PPG CSV columns: `host_received_at_utc,host_elapsed_ns,device_timestamp_ms,channel,value_raw_adc,label`.
Temperature CSV columns: `host_received_at_utc,host_elapsed_ns,device_timestamp_utc,temperature_c,temperature_type,flags,label`.

The recorder preserves raw firmware timestamps without correcting them. Host arrival timing is a separate diagnostic. It computes neither heart rate nor SpO2. The explicit clock-write flag does not imply precise synchronization. Hardware behavior still needs a device rehearsal.

## Fourth client: senswear-heartrate 0.1.0

The local release package is at `SensWear\Usecases\HeartRate`. `pyproject.toml` names version 0.1.0 and the CLI `senswear-heartrate = senswear_heartrate.app:main`. All source modules exactly match the locally built wheel `dist/senswear_heartrate-0.1.0-py3-none-any.whl` (SHA256 `3c141250e50adba249028131118c87f34ad02ffa9f0d224d347d10b617b88ac5`). The PyPI project URL was supplied by the user; web retrieval could not open it in this session. Package contents and commands are verified from local primary source and wheel metadata, not from a live pip install.

```sh
python -m pip install "senswear-heartrate[gui]==0.1.0"
python -m senswear_heartrate --list-devices
python -m senswear_heartrate --device "DEVICE_ID"
```

The module launch avoids PATH issues with console scripts. Use `--simulate` for the explicitly synthetic fallback. `--no-gui` runs in a terminal and needs only the base package. Both need Python 3.10+. Bleak supports Windows, macOS and Linux; README says the application was exercised on Windows 11.

Features: three raw PPG channels; derived filtered pulse waveform; estimated HR; uncalibrated SpO2 estimate; perfusion index; temperature readings and trend; firmware/battery/rate display; reconnect. HR defaults to green, waveform to IR. Temperature default cadence is one minute; the first reading may take a minute. The application writes host UTC to the device RTC by default (`--no-time-sync` disables). The PPG preset `senswear_nrf54l15_cpuapp_ppg` also enables temperature because this PPG board carries MAX30208. Phrase as sensor temperature, not a validated core-body temperature reading.

Exact controls: **Pause display** (changes to **Resume display**), **Record CSV** (toggle; uncheck to stop), **Reconnect**. Pausing display does not stop acquisition, analysis or CSV recording.

Record from launch with `--record` (default unique timestamp prefix) or `--record recordings/rest_01`. For synthetic data, use an explicitly synthetic prefix; the recorder does not automatically annotate synthetic CSVs. A fixed prefix is overwritten on a later run, so use a new prefix per capture.

Three files:

- `<prefix>_ppg.csv`: `timestamp_ms,channel,value`; original integer firmware timestamps and raw ADC counts, one row per received channel notification.
- `<prefix>_temperature.csv`: `received_at_utc,device_time_utc,temperature_c`.
- `<prefix>_metrics.csv`: includes status/quality, estimated HR, uncalibrated SpO2, ratio-of-ratios, perfusion index, estimated sample rate, beat count and max gap.

The application queues disk writes in a background thread, flushes about once per second, and closes on stop/exit. No fixed row cap in this recorder. Buffer/plot history is separate from the CSV. Raw PPG CSV does not include a host arrival timestamp. Its original firmware timeline is distinct from the timing repair used by host processing for derived metrics.

## Important sampling correction

The current heart-rate README records a hardware finding on firmware 0.1.0: the requested 3200 Hz/16 average configuration is incompatible with three LED slots at the pulse width, causing a fallback to 400/16, about **25 delivered samples per second per channel**. Firmware nevertheless stamps within each batch at 5 ms intervals. The app's `repair_batch_timestamps()` infers batch timing from firmware batch anchors for processing; original raw CSV values/timestamps remain unchanged.

Therefore remove unqualified claims of 200 Hz/sps from the workshop. Use **“Sampling and delivery depend on firmware; check the observed rate and timestamps.”** In notes, qualify the 25 sps result as the tested firmware behavior rather than a universal hardware limit. Neither one burst's timestamp spacing nor the live chart refresh rate alone establishes sample frequency.

HR and SpO2 are host-derived estimates. SpO2 uses a generic ratio-of-ratios polynomial with no device-specific calibration. Concise label: **“Research estimates · uncalibrated SpO2”**. The displayed pulse trace is processed optical PPG, not a direct arterial pressure measurement. Quality states include settling, tracking, no contact, motion, noisy, dropouts and saturated; show stable contact before interpreting estimates.

## Existing client slides

- Android PPG and Temperature views auto-record while open. Tap top-right share icon (**Share CSV**) and save before leaving that feature route. Latest 20,000 records per visit; leaving clears the feature log. Do not copy web Pause/Resume controls onto these mobile views.
- Browser PPG: **Connect device → PPG → Pause / Clear recording / Resume → Pause → Export CSV**. Temperature has an interval control in whole minutes; receive readings then export. Browser feature logs survive switching views in the current session, but subscriptions stop on view changes. For simultaneously retaining ongoing PPG and temperature subscriptions use the provided Python recorder or heart-rate application.
- Browser max 50,000 rows per module/session; export before reload/new connection/close. Chrome/Edge on Windows/macOS; Chrome Android/ChromeOS. Prefer Python on Linux rather than relying on experimental browser flags.
- Python raw recorder: direct controlled acquisition with separate device/arrival timestamps and manifest. Heart-rate app: demonstration of host processing built on that same SDK.

## Primary sources examined

- Heart-rate `README.md`, `pyproject.toml`, `app.py`, `engine.py`, `buffers.py`, `processing.py`, `recorder.py`, `gui.py`, and wheel METADATA under the local path above.
- `SensWear\SDKs\Python\src\senswear\modules\temperature.py`: `subscribe`, `set_measurement_interval`, `read_measurement_interval`, `unsubscribe`. Whole-minute intervals from 0 through 65,520 seconds; zero disables scheduling in the SDK (different from the heart-rate CLI, where --temperature-interval 0 keeps the device setting).
- Existing verified web/mobile behavior in their local source and READMEs.

## Verification and no-data behavior

The revised recorder passed AST syntax, CLI help, and mock callback/CSV checks for complete capture, absent temperature, and absent PPG. Checks validated exact PPG integer timestamps, separate arrival timestamps, channel counts, manifest output and restoration of the prior sampling/IRQ/temperature interval. The mock driver used immediate awaitables and no real BLE connection or OS event loop; physical acquisition remains untested. Local SDK source and 0.4.0 wheel METADATA verify the pin (an older editable virtual-environment distribution reports 0.3.0, so do not use that environment's metadata as the release pin).

Missing temperature produces an explicit stderr warning and manifest status `completed_with_warnings`, preserving the PPG clip and empty temperature CSV. Missing any PPG channel produces an error and `failed` manifest; when all channels are silent the recorder first logs and tries the documented IRQ-cadence recovery. A disconnect is also an explicit failure. Data received before an error remains saved.

Deck wording corrections: exported temperature is always Celsius (`temperature_c`) in the workshop recorder and mobile/web CSV. Web UI can display Fahrenheit, but this does not change CSV units. Current Python SDK temperature timestamps are timezone-aware UTC datetimes if the optional date/time is present; the wire structure itself has no zone field. Browser scheduling controls are **Interval in seconds** and **Apply interval**; set 60 for the exercise. Mobile temperature automatically selects60 seconds only when the existing interval is0; otherwise it retains the configured interval. A minimal Python excerpt should subscribe to temperature, call `set_measurement_interval(60)`, restart PPG with False/True and wait75 seconds, with a note that the complete helper restores prior states.
