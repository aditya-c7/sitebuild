"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import {
  detectDeviceInfo,
  deviceLabelFor,
  getPcLock,
  releaseNonPcLock,
  savePcLock,
  type DeviceKind,
} from "@/lib/deviceDetect";

// "surfing on <browser>" line — desktop only. On mobile/tablet the device row
// already shows this text, so this row hides itself to avoid duplication.
// PC rendering is unchanged.

function timeout(ms: number): Promise<null> {
  return new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
}

export default function VisitorBrowser({ active = true }: { active?: boolean }) {
  const [kind, setKind] = useState<DeviceKind | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!active) return;
    const run = async () => {
      try {
        // Drop any stale non-pc device data first (mobile is always re-captured fresh).
        releaseNonPcLock();
        // Locked PC history wins over any fresh detection.
        const lock = getPcLock();
        if (lock) {
          if (!cancelled) {
            setKind("pc");
            setName(lock.browserName);
          }
          return;
        }
        const info = await Promise.race([detectDeviceInfo(), timeout(4000)]);
        if (cancelled) return;
        if (!info) {
          setKind("pc");
          setName("Unknown");
          return;
        }
        if (info.kind === "pc") {
          // First PC visit: snapshot for all future loads (no visit bump here —
          // VisitorDevice owns the visit counter to avoid double counting).
          savePcLock(
            { deviceLabel: deviceLabelFor(info), browserName: info.browserName },
            false
          );
        }
        setKind(info.kind);
        setName(info.browserName);
      } catch {
        if (!cancelled) {
          setKind("pc");
          setName("Unknown");
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [active]);

  if (name === null || kind === null) {
    return (
      <span className="inline-flex items-center gap-1.5" aria-hidden="true">
        <span className="block h-3.5 w-3.5 rounded bg-zinc-800" />
        <Skeleton className="w-32" />
      </span>
    );
  }

  // Mobile/tablet already show this in the device row — stay hidden.
  if (kind !== "pc") return null;

  return (
    <span className="animate-fade-rise inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
      <Globe className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
      {name === "Unknown" ? "surfing on an unknown browser" : `surfing on ${name}`}
    </span>
  );
}
