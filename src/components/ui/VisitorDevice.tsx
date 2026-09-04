"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import {
  detectDeviceInfo,
  deviceLabelFor,
  getPcLock,
  releaseNonPcLock,
  savePcLock,
  type DeviceKind,
} from "@/lib/deviceDetect";

// Visitor device line: PC → Monitor icon + OS name, mobile/tablet → phone icon + browser name.
// First PC detection is locked to localStorage (adityahq_device_lock) with
// first-seen + visit history — later loads reuse it, so UA spoofing
// (devtools device emulation) can never change displayed data.
// Mobile/tablet is never locked: always detected live.

const KIND_ICON = {
  pc: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
} as const;

function timeout(ms: number): Promise<null> {
  return new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
}

export default function VisitorDevice() {
  const [kind, setKind] = useState<DeviceKind | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Drop any stale non-pc device data first (mobile is always re-captured fresh).
        releaseNonPcLock();
        // Locked PC history wins over any fresh detection.
        const lock = getPcLock();
        if (lock) {
          savePcLock({ deviceLabel: lock.deviceLabel, browserName: lock.browserName }, true);
          if (!cancelled) {
            setKind("pc");
            setLabel(lock.deviceLabel);
          }
          return;
        }
        const info = await Promise.race([detectDeviceInfo(), timeout(4000)]);
        if (cancelled) return;
        if (!info) {
          setFailed(true);
          return;
        }
        if (info.kind === "pc") {
          // First PC visit: snapshot device + browser for all future loads.
          savePcLock(
            { deviceLabel: deviceLabelFor(info), browserName: info.browserName },
            true
          );
        }
        setKind(info.kind);
        setLabel(deviceLabelFor(info));
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return <span className="font-mono text-xs text-zinc-500">Unknown device</span>;
  }

  if (!kind || !label) {
    return <span className="font-mono text-xs text-zinc-500">Detecting device…</span>;
  }

  const Icon = KIND_ICON[kind];

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
      <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
      {label}
    </span>
  );
}
