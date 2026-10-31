"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import {
  detectDeviceInfo,
  deviceLabelFor,
  getPcLock,
  releaseNonPcLock,
  savePcLock,
  type DeviceKind,
  type DeviceSnapshot,
} from "@/lib/deviceDetect";
import {
  createDoubleTapGate,
  DeviceRevealState,
  onDeviceReveal,
} from "@/lib/easterEgg";

// Visitor device row: PC → Monitor icon + OS name, mobile/tablet → phone/tablet
// icon + "surfing on <browser>".
// EASTER EGG: the resolved phone name is NOT shown by default. It only appears
// after the visitor double-taps "surfing on <browser>" (this row) or the
// "You're visiting from …" row: a skeleton shimmers for 2s in front of the
// "surfing on …" text, then the marketing name shows inline, separated by "-"
// (e.g. "surfing on Chrome - Galaxy S23 Ultra 5G"; "surfing on Chrome - Mobile
// device" when the browser doesn't expose/map a model). PC/tablet rows NEVER change.
// First PC detection is locked to localStorage (adityahq_device_lock) with
// first-seen + visit history — later loads reuse it, so UA spoofing
// (devtools device emulation) can never change displayed data.

const KIND_ICON = {
  pc: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
} as const;

const REVEAL_SHIMMER_MS = 2000;

function timeout(ms: number): Promise<null> {
  return new Promise<null>((resolve) => setTimeout(() => resolve(null), ms));
}

export default function VisitorDevice({ active = true }: { active?: boolean }) {
  const [kind, setKind] = useState<DeviceKind | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  // Easter-egg state. phoneName stays null until the visitor actually triggers
  // the reveal — so the 4.4MB generated catalog bundle is only ever fetched by
  // visitors who find the egg (dynamically imported at resolve time).
  const [revealState, setRevealState] = useState<DeviceRevealState>("hidden");
  const [shimmerDone, setShimmerDone] = useState(false);
  const [phoneName, setPhoneName] = useState<string | null>(null);

  const snapshotRef = useRef<DeviceSnapshot | null>(null);
  const kindRef = useRef<DeviceKind | null>(null);
  const revealStateRef = useRef<DeviceRevealState>("hidden");
  const shimmerTimerRef = useRef<number | null>(null);
  const phoneResolvingRef = useRef(false);
  const tapGateRef = useRef<() => boolean>(createDoubleTapGate());
  const attemptRevealRef = useRef<() => void>(() => {});

  const setReveal = (next: DeviceRevealState) => {
    revealStateRef.current = next;
    setRevealState(next);
  };

  // Resolves the reported model against the generated catalog. Only called for
  // kind === "mobile". Falls back to the honest "Mobile device" label on any
  // failure — never a fabricated name.
  const resolvePhoneName = async () => {
    if (phoneResolvingRef.current) return;
    const info = snapshotRef.current;
    if (!info) return;
    phoneResolvingRef.current = true;
    try {
      const { getPhoneDisplayLabel } = await import("@/lib/phoneModel");
      setPhoneName(getPhoneDisplayLabel(info));
    } catch {
      setPhoneName("Mobile device");
    } finally {
      phoneResolvingRef.current = false;
    }
  };

  // Called by the double-tap gates. Mobile only, every time (re-tapping during
  // the shimmer restarts the 2s shimmer — the egg replays, data never changes).
  attemptRevealRef.current = () => {
    if (kindRef.current !== "mobile") return; // PC/tablet: nothing ever reveals.
    if (shimmerTimerRef.current !== null) clearTimeout(shimmerTimerRef.current);
    setPhoneName(null);
    setShimmerDone(false);
    setReveal("revealing");
    void resolvePhoneName();
    shimmerTimerRef.current = window.setTimeout(() => {
      shimmerTimerRef.current = null;
      setShimmerDone(true);
    }, REVEAL_SHIMMER_MS);
  };

  useEffect(() => {
    let cancelled = false;
    if (!active) return;

    // Fresh mount: egg starts hidden again (it never persists).
    if (shimmerTimerRef.current !== null) clearTimeout(shimmerTimerRef.current);
    setReveal("hidden");
    setShimmerDone(false);
    setPhoneName(null);
    snapshotRef.current = null;
    kindRef.current = null;

    const run = async () => {
      try {
        // Drop any stale non-pc device data first (mobile is always re-captured fresh).
        releaseNonPcLock();
        // Locked PC history wins over any fresh detection.
        const lock = getPcLock();
        if (lock) {
          savePcLock({ deviceLabel: lock.deviceLabel, browserName: lock.browserName }, true);
          if (!cancelled) {
            kindRef.current = "pc";
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
        snapshotRef.current = info;
        kindRef.current = info.kind;
        if (info.kind === "pc") {
          // First PC visit: snapshot device + browser for all future loads.
          savePcLock(
            { deviceLabel: deviceLabelFor(info), browserName: info.browserName },
            true
          );
        }
        setKind(info.kind);
        setLabel(deviceLabelFor(info));
        // Visitor found the egg before detection finished — resolve now.
        if (revealStateRef.current !== "hidden" && info.kind === "mobile") {
          void resolvePhoneName();
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };
    run();

    // The "You're visiting from <location>" row also triggers the egg.
    const unsubscribe = onDeviceReveal(() => attemptRevealRef.current());

    return () => {
      cancelled = true;
      unsubscribe();
      if (shimmerTimerRef.current !== null) {
        clearTimeout(shimmerTimerRef.current);
        shimmerTimerRef.current = null;
      }
    };
  }, [active]);

  // Reveal only when BOTH the 2s shimmer elapsed and the name resolved —
  // a slow dataset import keeps the skeleton shimmering instead of lying.
  useEffect(() => {
    if (shimmerDone && phoneName !== null && revealState === "revealing") {
      setReveal("revealed");
    }
  }, [shimmerDone, phoneName, revealState]);

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

  // PC / tablet: exactly as before — icon + label, nothing to reveal.
  if (kind !== "mobile") {
    return (
      <span className="animate-fade-rise inline-flex items-center gap-1.5 font-mono text-xs text-zinc-400">
        <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
        {label}
      </span>
    );
  }

  // Mobile row: double-tap target. Default view is IDENTICAL to pre-egg:
  // icon + "surfing on <browser>". The name (with "-" separator) or the
  // shimmer-only skeleton appear just in front of that untouched text.
  return (
    <span
      className="animate-fade-rise inline-flex select-none items-center gap-1.5 font-mono text-xs text-zinc-400"
      onClick={() => {
        if (tapGateRef.current()) attemptRevealRef.current();
      }}
    >
      <Icon className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
      {revealState === "revealing" || (revealState === "revealed" && phoneName === null) ? (
        <Skeleton className="w-24 shrink-0" />
      ) : null}
      <span>
        {label}
        {revealState === "revealed" && phoneName !== null ? ` - ${phoneName}` : ""}
      </span>
    </span>
  );
}
