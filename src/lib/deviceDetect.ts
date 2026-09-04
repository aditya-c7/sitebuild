// Shared visitor device/browser detection + PC first-visit lock.
// Single source of truth for VisitorDevice + VisitorBrowser so both rows
// can never disagree (e.g. devtools device emulation changing the UA).
// Pure helpers are exported for headless testing (no DOM access in them).

export type DeviceKind = "pc" | "mobile" | "tablet";

export interface DeviceSnapshot {
  kind: DeviceKind;
  os: string;
  browserName: string;
  browserVersion: string;
}

export interface PcLock {
  kind: "pc";
  deviceLabel: string;
  browserName: string;
  firstSeen: string;
  visits: number;
}

// Bumped whenever detection logic changes: old snapshots are abandoned and
// every visitor re-captures once with the current detector. This is the
// client-side "flush everyone's device info" — remote browsers can't be
// wiped directly, but the stale key is never read again (and is deleted
// on sight by releaseNonPcLock below).
export const PC_LOCK_KEY = "adityahq_device_lock_v2";
const LEGACY_LOCK_KEYS = ["adityahq_device_lock"];

export interface UADataBrand {
  brand: string;
  version: string;
}

export interface UADataValues {
  platform?: string;
  platformVersion?: string;
  mobile?: boolean;
  model?: string;
  fullVersionList?: UADataBrand[];
}

interface NavigatorWithUAData extends Navigator {
  userAgentData?: {
    mobile?: boolean;
    platform?: string;
    getHighEntropyValues?: (hints: string[]) => Promise<UADataValues>;
  };
  brave?: { isBrave?: () => Promise<boolean> };
}

export function trimVersion(v: string): string {
  return v.split(".").slice(0, 3).join(".");
}

function touchPoints(): number {
  try {
    return typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0;
  } catch {
    return 0;
  }
}

// True only for coarse-pointer (finger-driven) primary input.
// Touch ALONE never implies mobile — touchscreen laptops report touch points
// with a fine (mouse) pointer, so both conditions are required together.
function coarsePointer(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches
    );
  } catch {
    return false;
  }
}

// Viewport width in CSS px (0 = unknown, never used as a signal).
// Cross-check for phones with stripped UAs: a finger-driven device at
// <=767px horizontal width is a phone, never a desktop.
function viewportWidth(): number {
  try {
    if (typeof window !== "undefined" && typeof window.innerWidth === "number") {
      return window.innerWidth;
    }
    return 0;
  } catch {
    return 0;
  }
}

// Touch detection with a fallback for broken in-app WebViews that report
// maxTouchPoints: 0 while still firing touch events.
function hasTouch(): boolean {
  if (touchPoints() > 0) return true;
  try {
    return typeof window !== "undefined" && "ontouchstart" in window;
  } catch {
    return false;
  }
}

// Deprecated but still present everywhere: phones/handhelds report ARM
// ("Linux armv8l", "Linux aarch64"), real desktop Linux reports x86_64.
function navPlatform(): string {
  try {
    const p = typeof navigator !== "undefined" ? navigator.platform : "";
    return typeof p === "string" ? p : "";
  } catch {
    return "";
  }
}

export function parseBrowser(
  ua: string,
  fullList?: UADataBrand[]
): { name: string; version: string } {
  // High-entropy client hints first (most accurate where available).
  if (fullList && fullList.length > 0) {
    const pick = (n: string) => fullList.find((b) => b.brand === n);
    const edge = pick("Microsoft Edge");
    if (edge) return { name: "Edge", version: trimVersion(edge.version) };
    const opera = pick("Opera");
    if (opera) return { name: "Opera", version: trimVersion(opera.version) };
    const samsung = fullList.find((b) => /samsung/i.test(b.brand));
    if (samsung) return { name: "Samsung Internet", version: trimVersion(samsung.version) };
    const chrome = pick("Google Chrome") || pick("Chromium");
    if (chrome) {
      return {
        name: chrome.brand === "Chromium" ? "Chromium" : "Chrome",
        version: trimVersion(chrome.version),
      };
    }
  }
  // In-app browsers first — they embed Chrome/Safari tokens.
  if (/Instagram/.test(ua)) return { name: "Instagram", version: "" };
  if (/FBAN\/|FBAV\/|FB_IOS|FBIOS/.test(ua)) return { name: "Facebook", version: "" };
  if (/TikTok|musical_ly/i.test(ua)) return { name: "TikTok", version: "" };
  if (/Snapchat/.test(ua)) return { name: "Snapchat", version: "" };
  if (/LinkedInApp/.test(ua)) return { name: "LinkedIn", version: "" };
  if (/MicroMessenger/.test(ua)) return { name: "WeChat", version: "" };
  if (/\bLine\//.test(ua)) return { name: "Line", version: "" };
  if (/Twitter for|TwitterAndroid|Twitter for iPhone/.test(ua)) return { name: "X (Twitter)", version: "" };
  if (/Reddit/.test(ua)) return { name: "Reddit", version: "" };
  if (/Pinterest/.test(ua)) return { name: "Pinterest", version: "" };
  // Niche browsers before Chrome — they embed its token too.
  let m: RegExpMatchArray | null;
  if ((m = ua.match(/Vivaldi\/([\d.]+)/))) return { name: "Vivaldi", version: trimVersion(m[1]) };
  if ((m = ua.match(/YaBrowser\/([\d.]+)/))) return { name: "Yandex", version: trimVersion(m[1]) };
  if ((m = ua.match(/UC ?Browser\/([\d.]+)/))) return { name: "UC Browser", version: trimVersion(m[1]) };
  if ((m = ua.match(/DuckDuckGo\/(\d+)/))) return { name: "DuckDuckGo", version: trimVersion(m[1]) };
  if ((m = ua.match(/\bArc\/([\d.]+)/))) return { name: "Arc", version: trimVersion(m[1]) };
  if ((m = ua.match(/QQBrowser(Lite)?\/([\d.]+)/))) return { name: "QQ Browser", version: trimVersion(m[2]) };
  if (/360(SE|EE)/.test(ua)) return { name: "360 Browser", version: "" };
  if ((m = ua.match(/HuaweiBrowser\/([\d.]+)/))) return { name: "Huawei Browser", version: trimVersion(m[1]) };
  if ((m = ua.match(/MiuiBrowser\/([\d.]+)/))) return { name: "MIUI Browser", version: trimVersion(m[1]) };
  if ((m = ua.match(/Whale\/([\d.]+)/))) return { name: "Whale", version: trimVersion(m[1]) };
  if ((m = ua.match(/LibreWolf\/([\d.]+)/))) return { name: "LibreWolf", version: trimVersion(m[1]) };
  if ((m = ua.match(/Waterfox\/([\d.]+)/))) return { name: "Waterfox", version: trimVersion(m[1]) };
  // Major browsers.
  if ((m = ua.match(/SamsungBrowser\/([\d.]+)/))) return { name: "Samsung Internet", version: trimVersion(m[1]) };
  if ((m = ua.match(/\bOPR\/([\d.]+)/))) return { name: "Opera", version: trimVersion(m[1]) };
  if (/\bOpera\b/.test(ua)) return { name: "Opera", version: "" };
  if ((m = ua.match(/\bEdg(e|A|iOS)?\/([\d.]+)/))) return { name: "Edge", version: trimVersion(m[2]) };
  if ((m = ua.match(/EdgiOS\/([\d.]+)/))) return { name: "Edge", version: trimVersion(m[1]) };
  if ((m = ua.match(/FxiOS\/([\d.]+)/))) return { name: "Firefox", version: trimVersion(m[1]) };
  if ((m = ua.match(/Firefox\/([\d.]+)/))) return { name: "Firefox", version: trimVersion(m[1]) };
  if ((m = ua.match(/CriOS\/([\d.]+)/))) return { name: "Chrome", version: trimVersion(m[1]) };
  if ((m = ua.match(/OPiOS\/([\d.]+)/))) return { name: "Opera", version: trimVersion(m[1]) };
  if (/Chrome\//.test(ua) && /Safari\//.test(ua)) {
    m = ua.match(/Chrome\/([\d.]+)/);
    return { name: "Chrome", version: m ? trimVersion(m[1]) : "" };
  }
  if (/Safari\//.test(ua)) {
    m = ua.match(/Version\/([\d.]+)/);
    return { name: "Safari", version: m ? trimVersion(m[1]) : "" };
  }
  return { name: "Unknown", version: "" };
}

export function parseOS(ua: string, platform?: string, platformVersion?: string): string {
  // LinkedIn / in-app WebView fix: every Android UA contains the word "Linux"
  // ("Mozilla/5.0 (Linux; Android 14; …)"). Android is therefore checked
  // FIRST and unconditionally — "Linux" may only win when Android is absent,
  // which is what keeps real desktop-Linux detection intact.
  if (platform === "Android" || /Android/.test(ua)) {
    if (platformVersion) return `Android ${trimVersion(platformVersion)}`;
    const m = ua.match(/Android ([\d.]+)/);
    return m ? `Android ${trimVersion(m[1])}` : "Android";
  }
  if (platform === "Windows" || /Windows NT/.test(ua)) {
    const majorV = parseInt(platformVersion || "", 10);
    if (Number.isFinite(majorV) && majorV > 0) {
      return majorV >= 13 ? "Windows 11" : "Windows 10";
    }
    return "Windows";
  }
  if (platform === "macOS" || (/Macintosh/.test(ua) && !/iPhone|iPad|iPod/.test(ua))) {
    // iPad in desktop mode reports Macintosh — detect via touch points
    if (/Macintosh/.test(ua) && touchPoints() > 1 && !platform) {
      const m = ua.match(/Version\/([\d.]+)/);
      return m ? `iPadOS ${trimVersion(m[1])}` : "iPadOS";
    }
    if (platformVersion) return `macOS ${trimVersion(platformVersion)}`;
    const m = ua.match(/Mac OS X ([\d_]+)/);
    return m ? `macOS ${m[1].replace(/_/g, ".")}` : "macOS";
  }
  if (platform === "iOS" || /iPhone|iPad|iPod/.test(ua)) {
    const m = ua.match(/OS ([\d_]+) like Mac OS X/);
    return m ? `iOS ${m[1].replace(/_/g, ".")}` : "iOS";
  }
  if (platform === "Chrome OS" || /CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}

export function deviceKind(ua: string, mobileHint?: boolean): DeviceKind {
  // Explicit tablet token always wins (covers iPad, incl. in-app browsers on iPad).
  if (/iPad/.test(ua)) return "tablet";
  // LinkedIn in-app browser strips mobile tokens on some Android builds — force mobile.
  if (/LinkedInApp/.test(ua)) return "mobile";
  // UA Client Hints are authoritative when present.
  if (mobileHint === true) return "mobile";
  // Finger-driven hardware: phones (narrow viewport) vs tablets (wide).
  // Touch ALONE never counts — touchscreen laptops report touch points with
  // a fine (mouse) pointer, so coarse is required alongside it.
  if (hasTouch() && coarsePointer()) {
    const w = viewportWidth();
    return w > 0 && w <= 767 ? "mobile" : "tablet";
  }
  if (/Tablet/.test(ua)) return "tablet";
  if (/Android/.test(ua)) {
    // Phones show Mobile tokens or run in a WebView (`; wv)`); an Android UA
    // with neither signal is most likely a tablet.
    if (/Mobi|Mobile/.test(ua) || /;\s*wv[;)]/.test(ua)) return "mobile";
    return "tablet";
  }
  // Any other embedded WebView with a stripped UA — desktop browsers never send `wv`.
  if (/;\s*wv[;)]/.test(ua)) return "mobile";
  if (/Macintosh/.test(ua) && touchPoints() > 1) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone|Mobile/.test(ua)) return "mobile";
  // Last resort for fully stripped UAs: bare "Linux" (no Android/CrOS tokens)
  // on ARM hardware is a phone/handheld — real desktop Linux is x86_64.
  // Touchscreen ARM laptops are vanishingly rare; this never fires for them
  // unless they also hide every other signal.
  if (/Linux/.test(ua) && !/Android|CrOS/.test(ua) && /arm|aarch64/i.test(navPlatform())) {
    return "mobile";
  }
  return "pc";
}

export function deviceLabelFor(info: DeviceSnapshot): string {
  if (info.kind === "pc") return info.os;
  const versionSuffix = info.browserVersion ? ` ${info.browserVersion}` : "";
  return `${info.browserName}${versionSuffix}`;
}

export async function detectDeviceInfo(): Promise<DeviceSnapshot> {
  const ua = navigator.userAgent;
  const nav = navigator as NavigatorWithUAData;

  let platform: string | undefined;
  let platformVersion: string | undefined;
  let mobileHint: boolean | undefined;
  let fullList: UADataBrand[] | undefined;

  try {
    const getValues = nav.userAgentData?.getHighEntropyValues;
    if (typeof getValues === "function") {
      const values = await Promise.race([
        getValues.call(nav.userAgentData, ["platform", "platformVersion", "mobile", "model", "fullVersionList"]),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);
      if (values) {
        platform = values.platform;
        platformVersion = values.platformVersion;
        mobileHint = values.mobile;
        fullList = values.fullVersionList;
      }
    }
  } catch {
    // fall back to UA-string parsing below
  }

  const browser = parseBrowser(ua, fullList);
  try {
    if (typeof nav.brave?.isBrave === "function" && (await nav.brave.isBrave())) {
      browser.name = "Brave";
    }
  } catch {
    // keep UA-based name
  }

  const kind = deviceKind(ua, mobileHint);
  return { kind, os: parseOS(ua, platform, platformVersion), browserName: browser.name, browserVersion: browser.version };
}

// --- PC first-visit lock (localStorage, client-side history) ---
// Written on the FIRST pc detection only. Later loads reuse it, so UA
// spoofing (devtools device emulation) can never change displayed data.
// Original first-visit values are immutable; only `visits` increments.

export function getPcLock(): PcLock | null {
  try {
    const raw = localStorage.getItem(PC_LOCK_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<PcLock>;
    if (
      data &&
      data.kind === "pc" &&
      typeof data.deviceLabel === "string" &&
      typeof data.browserName === "string"
    ) {
      return {
        kind: "pc",
        deviceLabel: data.deviceLabel,
        browserName: data.browserName,
        firstSeen: typeof data.firstSeen === "string" ? data.firstSeen : new Date(0).toISOString(),
        visits: typeof data.visits === "number" ? data.visits : 0,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function savePcLock(
  input: { deviceLabel: string; browserName: string },
  bumpVisits: boolean
): PcLock | null {
  try {
    const existing = getPcLock();
    const lock: PcLock = existing
      ? { ...existing, visits: bumpVisits ? existing.visits + 1 : existing.visits }
      : {
          kind: "pc",
          deviceLabel: input.deviceLabel,
          browserName: input.browserName,
          firstSeen: new Date().toISOString(),
          visits: 1,
        };
    localStorage.setItem(PC_LOCK_KEY, JSON.stringify(lock));
    return lock;
  } catch {
    return null;
  }
}

// Mobile hygiene: releases any stored device data that is NOT a valid pc
// snapshot (corrupt entries or legacy non-pc writes) so mobile sessions never
// retain stale device info — it is re-captured fresh on every visit instead.
// A valid pc lock is always preserved (devtools spoofing must not erase it).
// Returns true when something was cleared.
export function releaseNonPcLock(): boolean {
  try {
    let cleared = false;
    // Flush snapshots written by older detector versions.
    for (const key of LEGACY_LOCK_KEYS) {
      if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        cleared = true;
      }
    }
    const raw = localStorage.getItem(PC_LOCK_KEY);
    if (!raw) return cleared;
    if (getPcLock() !== null) return cleared;
    localStorage.removeItem(PC_LOCK_KEY);
    return true;
  } catch {
    return false;
  }
}
