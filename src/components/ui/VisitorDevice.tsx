"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import {
  detectDeviceInfo,
  deviceLabelFor,
  getPcLock,
  releaseNonPcLock,
  savePcLock,
  type DeviceKind,
} from "@/lib/deviceDetect";

// Visitor device line: PC → Monitor icon + OS name, mobile/tablet → phone/tablet icon + "surfing on <browser>".
// On mobile, one line below: the resolved phone marketing name from the
// browser-reported model (exact lookup against Google's Play supported-device
// catalog), or "Mobile device" when the browser doesn't expose/map a model —
// no confidence percentages, no "Exact model detected" claims.
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

export default function VisitorDevice({ active = true }: { active?: boolean }) {
  const [kind, setKind] = useState<DeviceKind | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [phoneLabel, setPhoneLabel] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!active) return;
    const run = async () => {
      try {
        // Drop any stale non-pc device data first (mobile is always re-captured fresh).
        releaseNonPcLock();
        // Phone-name state resets before detection starts (mobile is re-resolved live).
        setPhoneLabel(null);
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
        // Phone name resolution runs only for mobile, and the lookup module is
        // dynamically imported so the generated catalog bundle is only ever
        // downloaded by mobile visitors (PC/tablet never fetch it).
        if (info.kind === "mobile") {
          try {
            const { getPhoneDisplayLabel } = await import("@/lib/phoneModel");
            const phoneDisplay = getPhoneDisplayLabel(info);
            if (!cancelled) setPhoneLabel(phoneDisplay);
          } catch {
            // Honest fallback if the dataset module fails to load for any reason.
            if (!cancelled) setPhoneLabel("Mobile device");
          }
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (failed) {
    return <span className="animate-fade-rise font-mono text-xs text-zinc-500">Unknown device</span>;
  }

  if (!kind || !label) {
    return (
      <span className="inline-flex items-center gap-1.5" aria-hidden="true">
        <span className="block h-3.5 w-3.5 rounded bg-zinc-800" />
        <Skeleton className="w-28" />
      </span>
    );
  }

  const Icon = KIND_ICON[kind];
  const isMobile = kind === "mobile";

  return (
    <span className="flex flex-col gap-1.5">
      <span className="animate-fade-rise inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
        <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
        {label}
      </span>
      {isMobile &&
        (phoneLabel === null ? (
          <Skeleton className="ml-5 w-20" />
        ) : (
          <span className="animate-fade-rise ml-5 font-mono text-xs text-zinc-500">{phoneLabel}</span>
        ))}
    </span>
  );
}
