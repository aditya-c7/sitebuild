"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import {
  detectDeviceInfo,
  deviceLabelFor,
  getPcLock,
  releaseNonPcLock,
  savePcLock,
} from "@/lib/deviceDetect";

// "surfing on <browser>" line. Reads the shared PC first-visit lock, so it
// can never disagree with the device row above it. Mobile/tablet stays live.

function timeout(ms: number): Promise<null> {
  return new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
}

export default function VisitorBrowser() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        // Drop any stale non-pc device data first (mobile is always re-captured fresh).
        releaseNonPcLock();
        // Locked PC history wins over any fresh detection.
        const lock = getPcLock();
        if (lock) {
          if (!cancelled) setName(lock.browserName);
          return;
        }
        const info = await Promise.race([detectDeviceInfo(), timeout(4000)]);
        if (cancelled) return;
        if (!info) {
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
        setName(info.browserName);
      } catch {
        if (!cancelled) setName("Unknown");
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (name === null) {
    return <span className="font-mono text-xs text-zinc-500">Detecting browser…</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
      <Globe className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
      {name === "Unknown" ? "surfing on an unknown browser" : `surfing on ${name}`}
    </span>
  );
}
