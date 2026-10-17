"""Record raw PPG + temperature from a SensWear workshop kit.

python record.py --scan
python record.py --address DEVICE_ID --label rest --duration 75 --sync-clock

Python 3.10+. Install: python -m pip install -r requirements.txt
A 60-second temperature schedule is requested and its previous setting restored.
--sync-clock explicitly writes host UTC once; precise synchronization is not implied.
Raw firmware timestamps are preserved, including any firmware batching anomalies.
No heart-rate or SpO2 estimate is computed by this recorder.
"""

import argparse
import asyncio
import csv
import json
import sys
import time
from contextlib import ExitStack
from datetime import datetime, timezone
from importlib.metadata import PackageNotFoundError, version
from pathlib import Path

from senswear import SenswearClient


def utc_now():
    return datetime.now(timezone.utc).isoformat(timespec="microseconds")


async def record(args):
    if args.scan:
        devices = await SenswearClient.discover(timeout=8.0)
        for item in devices:
            print(f"{item.name}\t{item.address}")
        if not devices:
            print("No SensWear found. Check power, Bluetooth, permissions, and other connected clients.")
        return

    destination = Path(args.output) / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S_%fZ")
    destination.mkdir(parents=True, exist_ok=False)
    started_ns = time.monotonic_ns()
    counts = {"ppg_red": 0, "ppg_ir": 0, "ppg_green": 0, "temperature": 0}
    try:
        sdk_version = version("senswear")
    except PackageNotFoundError:
        sdk_version = "unknown (source checkout)"
    manifest = {
        "sdk_version": sdk_version,
        "requested_device_id": args.address,
        "label": args.label,
        "requested_duration_s": args.duration,
        "started_at_host_utc": utc_now(),
        "status": "starting",
        "timestamp_semantics": {
            "host_received_at_utc": "Host wall-clock UTC when the decoded callback runs; not acquisition time.",
            "host_elapsed_ns": "Monotonic host elapsed nanoseconds since recorder setup; arrival diagnostic.",
            "device_timestamp_ms": "PPG integer firmware timestamp as received; no repair or resampling is applied.",
            "device_timestamp_utc": "Temperature device timestamp from the Health Thermometer indication, if present; normally whole-second UTC.",
            "caution": "Firmware 0.1.0 has a reported PPG batch-timing/rate mismatch. Preserve both timelines and inspect the recording; do not infer a uniform sample rate from within-batch timestamps alone.",
        },
        "clock": {
            "set_to_host_utc_requested": args.sync_clock,
            "set_to_host_utc_succeeded": False,
            "note": "The device clock may be stale unless checked or set. A one-time write does not establish precise synchronization or align sampling phases.",
        },
        "streams": {
            "ppg": {"unit": "raw 18-bit ADC counts", "channels": ["red", "ir", "green"], "rate": "firmware-dependent; not assumed or configured by this script"},
            "temperature": {"unit": "degrees Celsius", "requested_interval_s": args.temperature_interval, "first_reading": "may take one full measurement interval"},
        },
        "row_counts": counts,
        "events": [],
        "warnings": [],
        "cleanup_errors": [],
    }
    manifest_path = destination / "manifest.json"

    def save_manifest():
        manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    def arrival():
        return [utc_now(), time.monotonic_ns() - started_ns]

    save_manifest()
    try:
        with ExitStack() as files:
            def writer(name, fields):
                handle = files.enter_context((destination / name).open("w", newline="", encoding="utf-8"))
                output = csv.writer(handle)
                output.writerow(["host_received_at_utc", "host_elapsed_ns", *fields, "label"])
                return output

            ppg = writer("ppg.csv", ["device_timestamp_ms", "channel", "value_raw_adc"])
            temperature = writer("temperature.csv", ["device_timestamp_utc", "temperature_c", "temperature_type", "flags"])

            def on_ppg(channel):
                def receive(sample):
                    ppg.writerow([*arrival(), sample.timestamp_ms, channel, sample.value, args.label])
                    counts[f"ppg_{channel}"] += 1
                return receive

            def on_temperature(sample):
                device_time = sample.timestamp.isoformat() if sample.timestamp is not None else ""
                sensor_type = int(sample.temperature_type) if sample.temperature_type is not None else ""
                temperature.writerow([*arrival(), device_time, sample.temperature_c, sensor_type, sample.flags, args.label])
                counts["temperature"] += 1
                print(f"Temperature: {sample.temperature_c:.3f} C")

            async with SenswearClient(args.address, timeout=20.0) as device:
                manifest["connected_device_id"] = device.address
                try:
                    info = await device.device_info.read()
                    manifest["firmware_version"] = info.firmware_version
                    manifest["compiled_capabilities"] = {
                        "shield_mask": info.capabilities.shield_mask,
                        "feature_mask": info.capabilities.feature_mask,
                        "note": "Build flags do not prove physical attachment or successful initialization.",
                    }
                except Exception as error:
                    manifest["metadata_read_error"] = f"{type(error).__name__}: {error}"
                if args.sync_clock:
                    await device.time.set(datetime.now(timezone.utc))
                    manifest["clock"]["set_to_host_utc_succeeded"] = True
                    manifest["clock"]["set_completed_at_host_utc"] = utc_now()

                ppg_was_enabled = await device.ppg.sampling_enabled()
                old_irq = await device.ppg.per_sample_irq_enabled()
                old_temperature_interval = await device.temperature.read_measurement_interval()
                manifest["previous_configuration"] = {"ppg_enabled": ppg_was_enabled, "per_sample_irq": old_irq, "temperature_interval_s": old_temperature_interval}
                try:
                    await device.temperature.subscribe(on_temperature)
                    await device.temperature.set_measurement_interval(args.temperature_interval)
                    manifest["streams"]["temperature"]["applied_interval_s"] = await device.temperature.read_measurement_interval()
                    await device.ppg.subscribe_red(on_ppg("red"))
                    await device.ppg.subscribe_ir(on_ppg("ir"))
                    await device.ppg.subscribe_green(on_ppg("green"))
                    await device.ppg.set_sampling_enabled(False)
                    await device.ppg.set_sampling_enabled(True)
                    manifest["status"] = "recording"
                    manifest["recording_started_at_host_utc"] = utc_now()
                    save_manifest()
                    print(f"Recording raw PPG + temperature to {destination}")
                    print(f"Temperature may take {args.temperature_interval} seconds to arrive.")
                    deadline = asyncio.get_running_loop().time() + args.duration
                    await asyncio.sleep(min(3.0, args.duration))
                    if sum(counts[f"ppg_{c}"] for c in ("red", "ir", "green")) == 0 and args.duration > 3:
                        # Workaround documented in senswear-heartrate 0.1.0 for a sensor
                        # that does not wake after a plain stop/start. Preserve the prior
                        # IRQ setting and record that this interruption occurred.
                        manifest["events"].append({"at_host_utc": utc_now(), "event": "PPG startup recovery: briefly toggle IRQ cadence, then restore"})
                        print("No PPG yet; retrying acquisition with the documented IRQ-cadence toggle.")
                        await device.ppg.set_sampling_enabled(False)
                        await device.ppg.set_per_sample_irq_enabled(True)
                        await device.ppg.set_sampling_enabled(True)
                        await asyncio.sleep(0.5)
                        await device.ppg.set_sampling_enabled(False)
                        await device.ppg.set_per_sample_irq_enabled(old_irq)
                        await device.ppg.set_sampling_enabled(True)
                    await asyncio.sleep(max(0, deadline - asyncio.get_running_loop().time()))
                    if not device.is_connected:
                        raise RuntimeError("Device disconnected; received rows remain saved.")
                    if any(counts[f"ppg_{ch}"] == 0 for ch in ("red", "ir", "green")):
                        raise RuntimeError("At least one PPG channel had no samples; check contact, attachment, firmware and power.")
                    if counts["temperature"] == 0:
                        note = "No temperature indication received; recording may be shorter than the measurement interval. Check temperature support and retry a longer clip."
                        manifest["warnings"].append(note)
                        print(note, file=sys.stderr)
                    manifest["status"] = "completed_with_warnings" if manifest["warnings"] else "completed"
                finally:
                    actions = [
                        ("stop PPG", lambda: device.ppg.set_sampling_enabled(False)),
                        ("restore PPG IRQ cadence", lambda: device.ppg.set_per_sample_irq_enabled(old_irq)),
                        ("unsubscribe PPG", device.ppg.unsubscribe_all),
                        ("unsubscribe temperature", device.temperature.unsubscribe),
                        ("restore temperature interval", lambda: device.temperature.set_measurement_interval(old_temperature_interval)),
                        ("restore PPG sampling", lambda: device.ppg.set_sampling_enabled(ppg_was_enabled)),
                    ]
                    for label, action in actions:
                        try:
                            await action()
                        except Exception as error:
                            manifest["cleanup_errors"].append(f"{label}: {type(error).__name__}: {error}")
    except BaseException as error:
        manifest["status"] = "interrupted" if isinstance(error, (KeyboardInterrupt, asyncio.CancelledError)) else "failed"
        manifest["error"] = f"{type(error).__name__}: {error}"
        raise
    finally:
        manifest["finished_at_host_utc"] = utc_now()
        save_manifest()
        print(f"Files: {destination}")
        print("Received rows:", ", ".join(f"{key}={value}" for key, value in counts.items()))
        for error in manifest["cleanup_errors"]:
            print("Cleanup:", error, file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--scan", action="store_true", help="List SensWear devices and exit")
    parser.add_argument("--address", help="Assigned address/platform ID returned by --scan")
    parser.add_argument("--duration", type=float, default=75.0, help="Clip duration in seconds (default 75)")
    parser.add_argument("--label", default="unlabelled", help="Condition label included in every row")
    parser.add_argument("--temperature-interval", type=int, default=60, metavar="SECONDS", help="Whole-minute interval in seconds (default 60; previous setting restored)")
    parser.add_argument("--sync-clock", action="store_true", help="Explicitly write host UTC to the device RTC before subscribing")
    parser.add_argument("--output", default="recordings")
    args = parser.parse_args()
    if not args.scan and not args.address:
        parser.error("Run --scan, then provide --address for your assigned kit.")
    if not 0 < args.duration <= 300:
        parser.error("--duration must be greater than 0 and at most 300 seconds for this short-clip example")
    if args.temperature_interval < 60 or args.temperature_interval > 65520 or args.temperature_interval % 60:
        parser.error("--temperature-interval must be 60 to 65520 seconds in whole-minute multiples")
    try:
        asyncio.run(record(args))
    except KeyboardInterrupt:
        print("Interrupted. Received rows were retained.")
    except Exception as error:
        print(f"Recording failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
